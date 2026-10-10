PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  terms_version TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_account ON sessions(account_id);
CREATE TABLE IF NOT EXISTS circles (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 3 AND 80),
  description TEXT NOT NULL CHECK(length(description) BETWEEN 20 AND 1000),
  visibility TEXT NOT NULL CHECK(visibility IN ('private','discoverable')),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS memberships (
  circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('owner','moderator','member')),
  state TEXT NOT NULL CHECK(state IN ('pending','active','banned')),
  PRIMARY KEY(circle_id,account_id)
);
CREATE INDEX IF NOT EXISTS memberships_account ON memberships(account_id);
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 4000),
  hidden INTEGER NOT NULL DEFAULT 0 CHECK(hidden IN (0,1)),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS posts_circle ON posts(circle_id,created_at);
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK(length(reason) BETWEEN 5 AND 1000),
  state TEXT NOT NULL DEFAULT 'open' CHECK(state IN ('open','resolved')),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reports_circle ON reports(circle_id,state);
CREATE TABLE IF NOT EXISTS blocks (
  blocker_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  blocked_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  CHECK(blocker_id <> blocked_id),
  PRIMARY KEY(blocker_id,blocked_id)
);
CREATE TABLE IF NOT EXISTS invitations (
  token_hash TEXT PRIMARY KEY,
  circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  accepted_at TEXT
);
CREATE TABLE IF NOT EXISTS creation_keys (
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  request_key TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  PRIMARY KEY(account_id,request_key)
);
CREATE TABLE IF NOT EXISTS moderation_actions (
  id TEXT PRIMARY KEY,
  circle_id TEXT NOT NULL,
  actor_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  target_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
