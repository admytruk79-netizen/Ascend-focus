import { Readable } from 'node:stream';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCommunityServer } from './app.mjs';

const origin = 'http://localhost:5173';
const pass = 'a-strong-test-password-123';
// Exercise the real handler and database without requiring a sandbox TCP grant.
// Set ASCEND_HTTP_TESTS=1 to run the exact assertions through actual HTTP sockets.
async function inject(handler, path, options) {
  const req = Readable.from(options.body ? [Buffer.from(options.body)] : []);
  req.url = path; req.method = options.method;
  req.headers = Object.fromEntries(Object.entries(options.headers).map(([k, v]) => [k.toLowerCase(), v]));
  req.socket = { remoteAddress: '127.0.0.1' };
  const headers = new Headers(); let status = 200; let data;
  const res = {
    setHeader(key, value) { headers.set(key, value); },
    writeHead(value, values = {}) { status = value; for (const [k, v] of Object.entries(values)) headers.set(k, v); },
    end(value) { data = value; },
  };
  await handler(req, res);
  return { status, headers, json: async () => JSON.parse(data) };
}

async function fixture(t, options = {}) {
  const app = createCommunityServer({ origin, ...options });
  const network = process.env.ASCEND_HTTP_TESTS === '1';
  if (network) await new Promise((resolve, reject) => { app.server.once('error', reject); app.server.listen(0, '127.0.0.1', resolve); });
  t.after(() => network ? app.close() : app.db.close());
  const base = network ? `http://127.0.0.1:${app.server.address().port}` : origin;
  async function request(path, { method = 'GET', body, cookie, headers = {} } = {}) {
    const options = { method, headers: { ...(method !== 'GET' ? { origin, 'x-ascend-request': '1', 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...headers }, body: body === undefined && method === 'GET' ? undefined : JSON.stringify(body ?? {}) };
    const response = network ? await fetch(base + path, options) : await inject(app.handler, path, options);
    const json = await response.json();
    return { status: response.status, body: json, cookie: response.headers.get('set-cookie')?.split(';')[0], headers: response.headers };
  }
  async function register(name) {
    const result = await request('/api/auth/register', { method: 'POST', body: { username: name, displayName: name, password: pass, adultAccepted: true, rulesAccepted: true } });
    assert.equal(result.status, 201, JSON.stringify(result.body));
    return { id: result.body.user.id, cookie: result.cookie };
  }
  async function circle(owner, visibility = 'discoverable', overrides = {}) {
    const result = await request('/api/circles', { method: 'POST', cookie: owner.cookie, headers: { 'idempotency-key': randomUUID() }, body: { name: 'Daily focus', description: 'A circle for voluntary attention practice.', visibility, rulesAccepted: true, ...overrides } });
    assert.equal(result.status, 201, JSON.stringify(result.body));
    return result.body.circle;
  }
  async function join(owner, member, id) {
    assert.equal((await request(`/api/circles/${id}/join`, { method: 'POST', cookie: member.cookie })).status, 201);
    assert.equal((await request(`/api/circles/${id}/members/${member.id}`, { method: 'PATCH', cookie: owner.cookie, body: { action: 'approve', reason: 'Agreed to circle rules' } })).status, 200);
  }
  return { ...app, request, register, circle, join };
}

test('authentication, consent, password hashing, sessions and CSRF', async t => {
  const f = await fixture(t);
  assert.equal((await f.request('/api/circles')).status, 401);
  const bad = { username: 'adult', displayName: 'Adult', password: pass, adultAccepted: false, rulesAccepted: true };
  assert.equal((await f.request('/api/auth/register', { method: 'POST', body: bad })).status, 400);
  const owner = await f.register('owner');
  assert.equal((await f.request('/api/auth/session', { cookie: owner.cookie })).body.user.id, owner.id);
  const row = f.db.prepare('SELECT password_hash FROM accounts WHERE id=?').get(owner.id);
  assert.notEqual(row.password_hash, pass);
  assert.equal(f.db.prepare('SELECT token_hash FROM sessions WHERE account_id=?').get(owner.id).token_hash.length, 64);
  assert.equal((await f.request('/api/auth/login', { method: 'POST', body: { username: 'owner', password: 'wrong-password-long' } })).status, 401);
  const login = await f.request('/api/auth/login', { method: 'POST', body: { username: 'owner', password: pass } });
  assert.equal(login.status, 200);
  assert.match(login.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  assert.equal((await f.request('/api/auth/logout', { method: 'POST', cookie: owner.cookie, headers: { origin: 'https://attacker.example' } })).status, 403);
  assert.equal((await f.request('/api/auth/logout', { method: 'POST', cookie: login.cookie })).status, 200);
  assert.equal((await f.request('/api/auth/session', { cookie: login.cookie })).status, 401);
  f.db.prepare('UPDATE sessions SET expires_at=0 WHERE account_id=?').run(owner.id);
  assert.equal((await f.request('/api/auth/session', { cookie: owner.cookie })).status, 401);
});

test('circle creation is atomic, idempotent and cannot assign client ownership', async t => {
  const f = await fixture(t);
  const owner = await f.register('owner');
  const headers = { 'idempotency-key': randomUUID() };
  const body = { name: 'Focus circle', description: 'Consensual daily attention practice.', visibility: 'private', rulesAccepted: true };
  const first = await f.request('/api/circles', { method: 'POST', cookie: owner.cookie, body, headers });
  assert.equal(first.status, 201);
  assert.deepEqual(first.body.circle.membership, { role: 'owner', state: 'active' });
  const retry = await f.request('/api/circles', { method: 'POST', cookie: owner.cookie, body, headers });
  assert.equal(retry.status, 200);
  assert.equal(retry.body.circle.id, first.body.circle.id);
  assert.equal(f.db.prepare('SELECT count(*) AS count FROM circles').get().count, 1);
  assert.equal((await f.request('/api/circles', { method: 'POST', cookie: owner.cookie, body: { ...body, name: 'Other circle' }, headers })).status, 409);
  assert.equal((await f.request('/api/circles', { method: 'POST', cookie: owner.cookie, body: { ...body, ownerId: 'attacker' }, headers })).status, 400);
});

test('private invitations are single use and discussions require approved membership', async t => {
  const f = await fixture(t);
  const owner = await f.register('owner'); const member = await f.register('member'); const stranger = await f.register('stranger');
  const c = await f.circle(owner, 'private');
  assert.equal((await f.request('/api/circles', { cookie: stranger.cookie })).body.circles.length, 0);
  assert.equal((await f.request(`/api/circles/${c.id}/posts`, { cookie: stranger.cookie })).status, 403);
  assert.equal((await f.request(`/api/circles/${c.id}/join`, { method: 'POST', cookie: stranger.cookie })).status, 403);
  const invite = await f.request(`/api/circles/${c.id}/invitations`, { method: 'POST', cookie: owner.cookie });
  assert.equal(invite.status, 201);
  const accepted = await f.request('/api/invitations/accept', { method: 'POST', cookie: member.cookie, body: { token: invite.body.token } });
  assert.equal(accepted.status, 200);
  assert.equal((await f.request('/api/invitations/accept', { method: 'POST', cookie: stranger.cookie, body: { token: invite.body.token } })).status, 400);
  assert.equal((await f.request(`/api/circles/${c.id}/posts`, { cookie: member.cookie })).status, 403);
  assert.equal((await f.request(`/api/circles/${c.id}/members/${member.id}`, { method: 'PATCH', cookie: member.cookie, body: { action: 'approve', reason: 'Self approval attempt' } })).status, 403);
  await f.request(`/api/circles/${c.id}/members/${member.id}`, { method: 'PATCH', cookie: owner.cookie, body: { action: 'approve', reason: 'Accepted circle rules' } });
  const post = await f.request(`/api/circles/${c.id}/posts`, { method: 'POST', cookie: member.cookie, body: { body: 'My voluntary practice reflection.' } });
  assert.equal(post.status, 201);
  assert.equal((await f.request(`/api/circles/${c.id}/posts`, { cookie: owner.cookie })).body.posts.length, 1);
  assert.equal((await f.request(`/api/circles/${c.id}/posts`, { method: 'POST', cookie: member.cookie, body: { body: 'Forged', authorId: owner.id } })).status, 400);
});

test('moderation stays inside circle, hides reports from members and bans access', async t => {
  const f = await fixture(t);
  const owner = await f.register('owner'); const member = await f.register('member'); const moderator = await f.register('moderator');
  const c = await f.circle(owner); await f.join(owner, member, c.id); await f.join(owner, moderator, c.id);
  await f.request(`/api/circles/${c.id}/members/${moderator.id}`, { method: 'PATCH', cookie: owner.cookie, body: { action: 'promote', reason: 'Trusted circle moderator' } });
  const post = await f.request(`/api/circles/${c.id}/posts`, { method: 'POST', cookie: owner.cookie, body: { body: 'Review this practice discussion.' } });
  assert.equal((await f.request(`/api/circles/${c.id}/posts/${post.body.id}/report`, { method: 'POST', cookie: member.cookie, body: { reason: 'Please review this content.' } })).status, 201);
  assert.equal((await f.request(`/api/circles/${c.id}/reports`, { cookie: member.cookie })).status, 403);
  const reports = await f.request(`/api/circles/${c.id}/reports`, { cookie: moderator.cookie });
  assert.equal(reports.body.reports.length, 1);
  assert.equal('reporter_id' in reports.body.reports[0], false);
  assert.equal((await f.request(`/api/circles/${c.id}/posts/${post.body.id}/hide`, { method: 'POST', cookie: member.cookie, body: { reason: 'Unauthorized hide attempt.' } })).status, 403);
  assert.equal((await f.request(`/api/circles/${c.id}/posts/${post.body.id}/hide`, { method: 'POST', cookie: moderator.cookie, body: { reason: 'Removed during review.' } })).status, 200);
  assert.equal((await f.request(`/api/circles/${c.id}/posts`, { cookie: member.cookie })).body.posts.length, 0);
  assert.equal((await f.request(`/api/circles/${c.id}/reports/${reports.body.reports[0].id}/resolve`, { method: 'POST', cookie: moderator.cookie, body: { reason: 'Content hidden after review.' } })).status, 200);
  assert.equal((await f.request(`/api/circles/${c.id}/reports`, { cookie: moderator.cookie })).body.reports.length, 0);
  assert.equal((await f.request(`/api/circles/${c.id}/members/${owner.id}`, { method: 'PATCH', cookie: moderator.cookie, body: { action: 'ban', reason: 'Attempt to ban owner.' } })).status, 403);
  const other = await f.circle(owner);
  assert.equal((await f.request(`/api/circles/${other.id}/reports`, { cookie: moderator.cookie })).status, 403);
  assert.equal((await f.request(`/api/circles/${c.id}/members/${member.id}`, { method: 'PATCH', cookie: moderator.cookie, body: { action: 'ban', reason: 'Repeated circle rule violations.' } })).status, 200);
  assert.equal((await f.request(`/api/circles/${c.id}/posts`, { cookie: member.cookie })).status, 403);
  assert.equal((await f.request(`/api/circles/${c.id}/join`, { method: 'POST', cookie: member.cookie })).status, 409);
  assert.ok(f.db.prepare('SELECT count(*) AS count FROM moderation_actions').get().count >= 4);
});

test('blocking hides posts both ways; account deletion revokes all sessions', async t => {
  const f = await fixture(t);
  const owner = await f.register('owner'); const one = await f.register('one'); const two = await f.register('two');
  const c = await f.circle(owner); await f.join(owner, one, c.id); await f.join(owner, two, c.id);
  await f.request(`/api/circles/${c.id}/posts`, { method: 'POST', cookie: one.cookie, body: { body: 'A private group message.' } });
  await f.request(`/api/circles/${c.id}/posts`, { method: 'POST', cookie: two.cookie, body: { body: 'Another private message.' } });
  assert.equal((await f.request(`/api/blocks/${two.id}`, { method: 'POST', cookie: one.cookie })).status, 200);
  assert.equal((await f.request(`/api/circles/${c.id}/posts`, { cookie: one.cookie })).body.posts.length, 1);
  assert.equal((await f.request(`/api/circles/${c.id}/posts`, { cookie: two.cookie })).body.posts.length, 1);
  assert.equal((await f.request('/api/account', { method: 'DELETE', cookie: owner.cookie, body: { password: pass } })).status, 409);
  assert.equal((await f.request('/api/account', { method: 'DELETE', cookie: one.cookie, body: { password: pass } })).status, 200);
  assert.equal((await f.request('/api/auth/session', { cookie: one.cookie })).status, 401);
  assert.equal(f.db.prepare('SELECT count(*) AS count FROM blocks').get().count, 0);
  const posts = (await f.request(`/api/circles/${c.id}/posts`, { cookie: owner.cookie })).body.posts;
  assert.ok(posts.some(p => p.author === 'Deleted account' && p.body === '[Removed by author]'));
});

test('durable SQLite storage survives server restart', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'ascend-community-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const database = join(dir, 'community.sqlite');
  const first = createCommunityServer({ origin, database });
  first.db.prepare('INSERT INTO accounts VALUES(?,?,?,?,?,?)').run('persisted-id', 'persisted', 'Persistent account', 'hash', '2026-10-10', new Date().toISOString());
  first.db.close();
  const second = createCommunityServer({ origin, database });
  assert.equal(second.db.prepare('SELECT username FROM accounts WHERE id=?').get('persisted-id').username, 'persisted');
  second.db.close();
});

test('production configuration rejects insecure origin', () => {
  assert.throws(() => createCommunityServer({ origin, secureCookies: true }), /HTTPS/);
});

test('expired invitations and banned membership cannot grant access', async t => {
  const f = await fixture(t);
  const owner = await f.register('owner'); const member = await f.register('member');
  const c = await f.circle(owner, 'private');
  const invite = await f.request(`/api/circles/${c.id}/invitations`, { method: 'POST', cookie: owner.cookie });
  f.db.prepare('UPDATE invitations SET expires_at=0').run();
  assert.equal((await f.request('/api/invitations/accept', { method: 'POST', cookie: member.cookie, body: { token: invite.body.token } })).status, 400);
  const current = await f.request(`/api/circles/${c.id}/invitations`, { method: 'POST', cookie: owner.cookie });
  await f.request('/api/invitations/accept', { method: 'POST', cookie: member.cookie, body: { token: current.body.token } });
  assert.equal((await f.request(`/api/circles/${c.id}/members/${member.id}`, { method: 'PATCH', cookie: owner.cookie, body: { action: 'ban', reason: 'Circle rules violation' } })).status, 200);
  assert.equal((await f.request(`/api/circles/${c.id}/members/${member.id}`, { method: 'PATCH', cookie: owner.cookie, body: { action: 'approve', reason: 'Implicit unban attempt' } })).status, 400);
  assert.equal((await f.request(`/api/circles/${c.id}/posts`, { method: 'POST', cookie: member.cookie, body: { body: 'Unauthorized discussion' } })).status, 403);
});

test('database failure rolls back circle and owner membership together', async t => {
  const f = await fixture(t, { log: () => {} });
  const owner = await f.register('owner');
  f.db.exec("CREATE TRIGGER fail_membership BEFORE INSERT ON memberships BEGIN SELECT RAISE(ABORT, 'test failure'); END;");
  const result = await f.request('/api/circles', { method: 'POST', cookie: owner.cookie, headers: { 'idempotency-key': randomUUID() }, body: { name: 'Rollback circle', description: 'An atomic creation failure test circle.', visibility: 'private', rulesAccepted: true } });
  assert.equal(result.status, 500);
  assert.equal(f.db.prepare('SELECT count(*) AS count FROM circles').get().count, 0);
  assert.equal(f.db.prepare('SELECT count(*) AS count FROM memberships').get().count, 0);
  assert.equal(f.db.prepare('SELECT count(*) AS count FROM creation_keys').get().count, 0);
});

test('malformed, oversized and cross-origin requests fail closed; auth is rate limited', async t => {
  const f = await fixture(t);
  const headers = { origin, 'x-ascend-request': '1', 'content-type': 'application/json' };
  const invalid = await inject(f.handler, '/api/auth/register', { method: 'POST', headers, body: '{bad json' });
  assert.equal(invalid.status, 400);
  const oversized = await inject(f.handler, '/api/auth/register', { method: 'POST', headers, body: JSON.stringify({ data: 'x'.repeat(17000) }) });
  assert.equal(oversized.status, 413);
  const noHeader = await f.request('/api/auth/login', { method: 'POST', headers: { 'x-ascend-request': '' }, body: { username: 'absent', password: pass } });
  assert.equal(noHeader.status, 403);
  for (let i = 0; i < 15; i++) assert.equal((await f.request('/api/auth/login', { method: 'POST', body: { username: 'absent', password: pass } })).status, 401);
  assert.equal((await f.request('/api/auth/login', { method: 'POST', body: { username: 'absent', password: pass } })).status, 429);
});
