import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { readFileSync, existsSync, mkdirSync, statSync, chmodSync } from 'node:fs';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const derive = promisify(scrypt);
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const TERMS = '2026-10-10';
const hash = value => createHash('sha256').update(value).digest('hex');
const iso = () => new Date().toISOString();
const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const fail = (status, message) => { throw new HttpError(status, message); };
function text(value, min, max, label) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) fail(400, `${label} must be between ${min} and ${max} characters.`);
  return value.trim();
}
function fields(body, allowed) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !allowed.includes(key))) fail(400, 'Unexpected request fields.');
}
function password(value) {
  if (typeof value !== 'string' || value.length < 12 || value.length > 128 || Buffer.byteLength(value) > 512) fail(400, 'Use a password between 12 and 128 characters.');
  return value;
}
async function passwordHash(value, salt = randomBytes(16).toString('hex')) {
  const key = await derive(value, salt, 64, { N: 16384, r: 8, p: 1 });
  return `${salt}:${key.toString('hex')}`;
}
async function matches(value, stored) {
  const [salt, expected] = stored.split(':');
  const actual = await passwordHash(value, salt);
  return timingSafeEqual(Buffer.from(actual.split(':')[1], 'hex'), Buffer.from(expected, 'hex'));
}
async function bodyOf(req) {
  if ((req.headers['content-type'] ?? '').split(';')[0] !== 'application/json') fail(415, 'Send JSON.');
  const chunks = []; let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > 16_384) fail(413, 'Request too large.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { fail(400, 'Invalid JSON.'); }
}

export function createCommunityServer({ database = ':memory:', origin = 'http://localhost:5173', secureCookies = false, staticDirectory, log = console.error } = {}) {
  const parsedOrigin = new URL(origin);
  if (parsedOrigin.origin !== origin || !['http:', 'https:'].includes(parsedOrigin.protocol)) throw new Error('APP_ORIGIN must be a single HTTP(S) origin.');
  if (secureCookies && parsedOrigin.protocol !== 'https:') throw new Error('Production requires an HTTPS APP_ORIGIN.');
  if (database !== ':memory:') mkdirSync(dirname(resolve(database)), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(database);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  db.exec(schema);
  if (database !== ':memory:') for (const file of [database, `${database}-wal`, `${database}-shm`]) if (existsSync(file)) chmodSync(file, 0o600);
  const get = (sql, ...args) => db.prepare(sql).get(...args);
  const all = (sql, ...args) => db.prepare(sql).all(...args);
  const run = (sql, ...args) => db.prepare(sql).run(...args);
  const transaction = fn => {
    db.exec('BEGIN IMMEDIATE');
    try { const result = fn(); db.exec('COMMIT'); return result; }
    catch (error) { db.exec('ROLLBACK'); throw error; }
  };
  const dummy = passwordHash('unavailable-account-password');
  function rate(key, limit, interval) {
    const now = Date.now();
    run('DELETE FROM rate_limits WHERE reset_at < ?', now);
    const current = get('SELECT count FROM rate_limits WHERE key = ?', key);
    if (current && current.count >= limit) fail(429, 'Too many requests. Try again later.');
    run('INSERT INTO rate_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1', key, now + interval);
  }
  function user(req) {
    const token = (req.headers.cookie ?? '').split(';').map(part => part.trim()).find(part => part.startsWith('ascend_session='))?.slice(15);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) fail(401, 'Sign in to continue.');
    const account = get('SELECT a.id,a.username,a.display_name FROM accounts a JOIN sessions s ON s.account_id=a.id WHERE s.token_hash=? AND s.expires_at>?', hash(token), Date.now());
    if (!account) fail(401, 'Sign in to continue.');
    return account;
  }
  const publicUser = account => ({ id: account.id, username: account.username, displayName: account.display_name });
  function session(account, res) {
    const token = randomBytes(32).toString('hex');
    run('DELETE FROM sessions WHERE expires_at <= ?', Date.now());
    run('INSERT INTO sessions VALUES(?,?,?)', hash(token), account.id, Date.now() + SESSION_MS);
    res.setHeader('Set-Cookie', `ascend_session=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${SESSION_MS / 1000}${secureCookies ? '; Secure' : ''}`);
    return { user: publicUser(account) };
  }
  function membership(circleId, accountId, moderation = false) {
    const row = get('SELECT role,state FROM memberships WHERE circle_id=? AND account_id=?', circleId, accountId);
    if (!row || row.state !== 'active') fail(403, 'Active circle membership is required.');
    if (moderation && !['owner', 'moderator'].includes(row.role)) fail(403, 'Circle moderator permission is required.');
    return row;
  }
  function circle(circleId) {
    const row = get('SELECT * FROM circles WHERE id=?', circleId);
    if (!row) fail(404, 'Circle not found.');
    return row;
  }
  const circleView = (row, accountId) => {
    const member = get('SELECT role,state FROM memberships WHERE circle_id=? AND account_id=?', row.id, accountId);
    return { id: row.id, name: row.name, description: row.description, visibility: row.visibility, createdAt: row.created_at, membership: member ?? null };
  };
  const blocked = (a, b) => Boolean(a && b && get('SELECT 1 FROM blocks WHERE (blocker_id=? AND blocked_id=?) OR (blocker_id=? AND blocked_id=?)', a, b, b, a));
  const audit = (circleId, actor, target, action, reason) => run('INSERT INTO moderation_actions VALUES(?,?,?,?,?,?,?)', randomUUID(), circleId, actor, target, action, reason, iso());
  function send(res, status, value) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(value));
  }

  async function api(req, res, url) {
    const method = req.method;
    const path = url.pathname;
    if (method === 'GET' && path === '/api/health') return send(res, 200, { status: 'connected', service: 'ascend-focus-community', version: 1 });
    const mutating = !['GET', 'HEAD'].includes(method);
    if (mutating) {
      if (req.headers.origin !== origin || req.headers['x-ascend-request'] !== '1') fail(403, 'Request origin rejected.');
      rate(`write:${req.socket.remoteAddress}`, 120, 60_000);
    }
    const requestBody = mutating ? await bodyOf(req) : null;
    if (path === '/api/auth/register' && method === 'POST') {
      rate(`auth:${req.socket.remoteAddress}`, 15, 15 * 60_000);
      const body = requestBody;
      fields(body, ['username', 'displayName', 'password', 'adultAccepted', 'rulesAccepted']);
      const username = text(body.username, 3, 32, 'Username').toLowerCase();
      if (!/^[a-z0-9_-]+$/.test(username)) fail(400, 'Username may contain letters, numbers, underscores and hyphens.');
      const displayName = text(body.displayName, 2, 60, 'Display name');
      if (body.adultAccepted !== true || body.rulesAccepted !== true) fail(400, 'An adult account and acceptance of community rules are required.');
      const stored = await passwordHash(password(body.password));
      const account = { id: randomUUID(), username, display_name: displayName };
      transaction(() => {
        if (get('SELECT 1 FROM accounts WHERE username=?', username)) fail(409, 'Username is unavailable.');
        run('INSERT INTO accounts VALUES(?,?,?,?,?,?)', account.id, username, displayName, stored, TERMS, iso());
      });
      return send(res, 201, session(account, res));
    }
    if (path === '/api/auth/login' && method === 'POST') {
      rate(`auth:${req.socket.remoteAddress}`, 15, 15 * 60_000);
      const body = requestBody; fields(body, ['username', 'password']);
      const username = text(body.username, 3, 32, 'Username').toLowerCase();
      const candidate = password(body.password);
      const account = get('SELECT * FROM accounts WHERE username=?', username);
      if (!(await matches(candidate, account?.password_hash ?? await dummy)) || !account) fail(401, 'Username or password is incorrect.');
      return send(res, 200, session(account, res));
    }
    const account = user(req);
    if (path === '/api/auth/session' && method === 'GET') return send(res, 200, { user: publicUser(account) });
    if (path === '/api/auth/logout' && method === 'POST') {
      fields(requestBody, []);
      const token = req.headers.cookie.split(';').map(part => part.trim()).find(part => part.startsWith('ascend_session='))?.slice(15);
      run('DELETE FROM sessions WHERE token_hash=?', hash(token));
      res.setHeader('Set-Cookie', `ascend_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0${secureCookies ? '; Secure' : ''}`);
      return send(res, 200, { ok: true });
    }
    if (path === '/api/account' && method === 'DELETE') {
      const body = requestBody; fields(body, ['password']);
      const stored = get('SELECT password_hash FROM accounts WHERE id=?', account.id);
      if (!(await matches(password(body.password), stored.password_hash))) fail(401, 'Password is incorrect.');
      if (get('SELECT 1 FROM circles WHERE owner_id=?', account.id)) fail(409, 'Delete your owned circles before deleting your account.');
      transaction(() => {
        run("UPDATE posts SET body='[Removed by author]' WHERE author_id=?", account.id);
        run('DELETE FROM accounts WHERE id=?', account.id);
      });
      res.setHeader('Set-Cookie', `ascend_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0${secureCookies ? '; Secure' : ''}`);
      return send(res, 200, { ok: true });
    }
    if (path === '/api/circles' && method === 'GET') {
      const rows = all("SELECT c.* FROM circles c WHERE c.visibility='discoverable' OR EXISTS(SELECT 1 FROM memberships m WHERE m.circle_id=c.id AND m.account_id=? AND m.state IN ('active','pending')) ORDER BY c.created_at DESC LIMIT 100", account.id);
      return send(res, 200, { circles: rows.map(row => circleView(row, account.id)) });
    }
    if (path === '/api/circles' && method === 'POST') {
      const body = requestBody; fields(body, ['name', 'description', 'visibility', 'rulesAccepted']);
      const name = text(body.name, 3, 80, 'Circle name');
      const description = text(body.description, 20, 1000, 'Description');
      if (!['private', 'discoverable'].includes(body.visibility) || body.rulesAccepted !== true) fail(400, 'Choose visibility and accept community rules.');
      const key = text(req.headers['idempotency-key'], 16, 100, 'Idempotency key');
      const payload = hash(JSON.stringify([name, description, body.visibility]));
      const result = transaction(() => {
        const prior = get('SELECT * FROM creation_keys WHERE account_id=? AND request_key=?', account.id, key);
        if (prior) {
          if (prior.payload_hash !== payload) fail(409, 'This creation key was already used for a different circle.');
          return { row: circle(prior.circle_id), status: 200 };
        }
        rate(`circle:${account.id}`, 10, 24 * 60 * 60_000);
        const id = randomUUID();
        run('INSERT INTO circles VALUES(?,?,?,?,?,?)', id, account.id, name, description, body.visibility, iso());
        run("INSERT INTO memberships VALUES(?,?,'owner','active')", id, account.id);
        run('INSERT INTO creation_keys VALUES(?,?,?,?)', account.id, key, payload, id);
        return { row: circle(id), status: 201 };
      });
      return send(res, result.status, { circle: circleView(result.row, account.id) });
    }
    if (path === '/api/blocks' && method === 'GET') {
      return send(res, 200, { blocks: all('SELECT a.id,a.display_name AS displayName FROM blocks b JOIN accounts a ON a.id=b.blocked_id WHERE b.blocker_id=?', account.id) });
    }
    const blockPath = path.match(/^\/api\/blocks\/([a-f0-9-]{36})$/);
    if (blockPath && ['POST', 'DELETE'].includes(method)) {
      fields(requestBody, []);
      const target = blockPath[1];
      if (target === account.id || !get('SELECT 1 FROM accounts WHERE id=?', target)) fail(400, 'Invalid account to block.');
      if (method === 'POST') run('INSERT OR IGNORE INTO blocks VALUES(?,?)', account.id, target);
      else run('DELETE FROM blocks WHERE blocker_id=? AND blocked_id=?', account.id, target);
      return send(res, 200, { ok: true });
    }
    if (path === '/api/invitations/accept' && method === 'POST') {
      const body = requestBody; fields(body, ['token']);
      const token = text(body.token, 64, 64, 'Invitation');
      const accepted = transaction(() => {
        const invitation = get('SELECT * FROM invitations WHERE token_hash=? AND accepted_at IS NULL AND expires_at>?', hash(token), Date.now());
        if (!invitation) fail(400, 'Invitation is invalid, expired or already used.');
        const c = circle(invitation.circle_id);
        if (blocked(account.id, c.owner_id)) fail(403, 'Invitation cannot be accepted.');
        const prior = get('SELECT state FROM memberships WHERE circle_id=? AND account_id=?', c.id, account.id);
        if (prior) fail(409, 'You already have a membership or request in this circle.');
        run("INSERT INTO memberships VALUES(?,?,'member','pending')", c.id, account.id);
        run('UPDATE invitations SET accepted_at=? WHERE token_hash=?', iso(), hash(token));
        return c;
      });
      return send(res, 200, { circle: circleView(accepted, account.id) });
    }
    const route = path.match(/^\/api\/circles\/([a-f0-9-]{36})(?:\/(.*))?$/);
    if (!route) fail(404, 'Endpoint not found.');
    const id = route[1]; const action = route[2] ?? '';
    const c = circle(id);
    if (!action && method === 'DELETE') {
      fields(requestBody, []);
      const member = membership(id, account.id, true);
      if (member.role !== 'owner') fail(403, 'Only the owner can delete a circle.');
      transaction(() => { audit(id, account.id, id, 'delete-circle', 'Owner deleted circle'); run('DELETE FROM circles WHERE id=?', id); });
      return send(res, 200, { ok: true });
    }
    if (action === 'join' && method === 'POST') {
      fields(requestBody, []);
      if (c.visibility !== 'discoverable' || blocked(account.id, c.owner_id)) fail(403, 'Use a valid private invitation to request membership.');
      if (get('SELECT 1 FROM memberships WHERE circle_id=? AND account_id=?', id, account.id)) fail(409, 'A membership or request already exists.');
      run("INSERT INTO memberships VALUES(?,?,'member','pending')", id, account.id);
      return send(res, 201, { circle: circleView(c, account.id) });
    }
    const member = membership(id, account.id);
    const moderator = ['owner', 'moderator'].includes(member.role);
    if (action === 'leave' && method === 'POST') {
      fields(requestBody, []);
      if (member.role === 'owner') fail(409, 'Delete your circle before leaving as owner.');
      run('DELETE FROM memberships WHERE circle_id=? AND account_id=?', id, account.id);
      return send(res, 200, { ok: true });
    }
    if (action === 'invitations' && method === 'POST') {
      fields(requestBody, []); membership(id, account.id, true);
      const token = randomBytes(32).toString('hex');
      run('INSERT INTO invitations VALUES(?,?,?,NULL)', hash(token), id, Date.now() + 24 * 60 * 60_000);
      return send(res, 201, { token, expiresInHours: 24 });
    }
    if (action === 'members' && method === 'GET') {
      membership(id, account.id, true);
      return send(res, 200, { members: all('SELECT a.id,a.display_name AS displayName,m.role,m.state FROM memberships m JOIN accounts a ON a.id=m.account_id WHERE m.circle_id=? ORDER BY a.display_name LIMIT 200', id) });
    }
    const memberAction = action.match(/^members\/([a-f0-9-]{36})$/);
    if (memberAction && method === 'PATCH') {
      const body = requestBody; fields(body, ['action', 'reason']); membership(id, account.id, true);
      const target = memberAction[1];
      const prior = get('SELECT role,state FROM memberships WHERE circle_id=? AND account_id=?', id, target);
      if (!prior) fail(404, 'Member not found.');
      if (target === account.id || prior.role === 'owner' || (member.role !== 'owner' && prior.role === 'moderator')) fail(403, 'This membership cannot be changed by you.');
      const reason = text(body.reason, 5, 1000, 'Reason');
      transaction(() => {
        if (body.action === 'approve' && prior.state === 'pending') run("UPDATE memberships SET state='active' WHERE circle_id=? AND account_id=?", id, target);
        else if (body.action === 'ban') run("UPDATE memberships SET state='banned' WHERE circle_id=? AND account_id=?", id, target);
        else if (body.action === 'promote' && member.role === 'owner' && prior.state === 'active') run("UPDATE memberships SET role='moderator' WHERE circle_id=? AND account_id=?", id, target);
        else if (body.action === 'demote' && member.role === 'owner' && prior.state === 'active') run("UPDATE memberships SET role='member' WHERE circle_id=? AND account_id=?", id, target);
        else fail(400, 'Invalid membership action. Bans cannot be implicitly undone.');
        audit(id, account.id, target, body.action, reason);
      });
      return send(res, 200, { ok: true });
    }
    if (action === 'posts' && method === 'GET') {
      const rows = all('SELECT p.*,a.display_name FROM posts p LEFT JOIN accounts a ON a.id=p.author_id WHERE p.circle_id=? ORDER BY p.created_at DESC,p.id DESC LIMIT 100', id);
      return send(res, 200, { posts: rows.filter(post => (moderator || !post.hidden) && (moderator || !blocked(account.id, post.author_id))).reverse().map(post => ({ id: post.id, authorId: post.author_id, author: post.display_name ?? 'Deleted account', body: post.body, hidden: Boolean(post.hidden), createdAt: post.created_at })) });
    }
    if (action === 'posts' && method === 'POST') {
      const body = requestBody; fields(body, ['body']);
      const content = text(body.body, 1, 4000, 'Post');
      rate(`post:${account.id}`, 20, 60_000);
      const postId = randomUUID();
      run('INSERT INTO posts(id,circle_id,author_id,body,created_at) VALUES(?,?,?,?,?)', postId, id, account.id, content, iso());
      return send(res, 201, { id: postId });
    }
    const postAction = action.match(/^posts\/([a-f0-9-]{36})(?:\/(report|hide))?$/);
    if (postAction) {
      const postId = postAction[1]; const op = postAction[2];
      const post = get('SELECT * FROM posts WHERE id=? AND circle_id=?', postId, id);
      if (!post) fail(404, 'Post not found.');
      if (!op && method === 'DELETE') {
        fields(requestBody, []);
        if (post.author_id !== account.id) fail(403, 'Only the author can delete this post.');
        run("UPDATE posts SET body='[Removed by author]',hidden=1 WHERE id=?", postId);
        return send(res, 200, { ok: true });
      }
      if (op === 'report' && method === 'POST') {
        const body = requestBody; fields(body, ['reason']);
        if (!moderator && (post.hidden || blocked(account.id, post.author_id))) fail(404, 'Post not found.');
        const reason = text(body.reason, 5, 1000, 'Report reason');
        rate(`report:${account.id}`, 10, 60_000);
        run('INSERT INTO reports(id,circle_id,post_id,reporter_id,reason,created_at) VALUES(?,?,?,?,?,?)', randomUUID(), id, postId, account.id, reason, iso());
        return send(res, 201, { ok: true });
      }
      if (op === 'hide' && method === 'POST') {
        const body = requestBody; fields(body, ['reason']); membership(id, account.id, true);
        const reason = text(body.reason, 5, 1000, 'Moderation reason');
        transaction(() => { run('UPDATE posts SET hidden=1 WHERE id=?', postId); audit(id, account.id, postId, 'hide-post', reason); });
        return send(res, 200, { ok: true });
      }
    }
    if (action === 'reports' && method === 'GET') {
      membership(id, account.id, true);
      return send(res, 200, { reports: all("SELECT r.id,r.post_id AS postId,r.reason,r.created_at AS createdAt,p.body FROM reports r JOIN posts p ON p.id=r.post_id WHERE r.circle_id=? AND r.state='open' ORDER BY r.created_at LIMIT 100", id) });
    }
    const reportAction = action.match(/^reports\/([a-f0-9-]{36})\/resolve$/);
    if (reportAction && method === 'POST') {
      const body = requestBody; fields(body, ['reason']); membership(id, account.id, true);
      const reason = text(body.reason, 5, 1000, 'Resolution reason');
      if (!get('SELECT 1 FROM reports WHERE id=? AND circle_id=?', reportAction[1], id)) fail(404, 'Report not found.');
      transaction(() => { run("UPDATE reports SET state='resolved' WHERE id=?", reportAction[1]); audit(id, account.id, reportAction[1], 'resolve-report', reason); });
      return send(res, 200, { ok: true });
    }
    fail(404, 'Endpoint not found.');
  }

  const handler = async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (secureCookies) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try {
      const url = new URL(req.url, origin);
      if (url.pathname.startsWith('/api/')) return await api(req, res, url);
      if (staticDirectory && ['GET', 'HEAD'].includes(req.method)) {
        const root = resolve(staticDirectory);
        const decoded = decodeURIComponent(url.pathname);
        let target = resolve(root, `.${decoded}`);
        if (!target.startsWith(root + sep) && target !== root) fail(404, 'Not found.');
        if (decoded.split('/').some(part => part.startsWith('.'))) fail(404, 'Not found.');
        if (!existsSync(target) || !statSync(target).isFile()) {
          if (extname(decoded)) fail(404, 'Not found.');
          target = resolve(root, 'index.html');
        }
        if (!existsSync(target)) fail(503, 'Web build is not available. Run npm run build.');
        const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' };
        res.writeHead(200, { 'Content-Type': mime[extname(target)] ?? 'application/octet-stream' });
        return res.end(req.method === 'HEAD' ? undefined : readFileSync(target));
      }
      fail(404, 'Not found.');
    } catch (error) {
      if (error instanceof HttpError) send(res, error.status, { error: error.message });
      else { log('Community request failed', error); send(res, 500, { error: 'Community request failed. Please try again.' }); }
    }
  };
  const server = createServer(handler);
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  return { server, db, handler, close: () => new Promise((resolveClose, reject) => { server.close(error => { db.close(); error ? reject(error) : resolveClose(); }); server.closeAllConnections(); }) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.umask(0o077);
  const production = process.env.NODE_ENV === 'production';
  if (production && !process.env.APP_ORIGIN) throw new Error('Set APP_ORIGIN to the public HTTPS origin.');
  const app = createCommunityServer({ database: process.env.COMMUNITY_DB ?? './data/community.sqlite', origin: process.env.APP_ORIGIN ?? 'http://localhost:5173', secureCookies: production, staticDirectory: './dist' });
  app.server.listen(Number(process.env.PORT ?? 3001), process.env.HOST ?? '127.0.0.1', () => console.log(`ASCEND Focus community listening on port ${process.env.PORT ?? 3001}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { void app.close().then(() => process.exit(0)); });
}
