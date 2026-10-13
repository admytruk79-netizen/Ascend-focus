# ASCEND Focus community

The repository contains a community API and a connected React interface. It has not
been deployed. The UI checks same-origin `/api/health` and service identity before
enabling account screens. If unavailable, the UI labels itself offline and offers
local circle drafts only.

## Run locally

Requires Node 24+ (built-in SQLite). No extra backend packages are needed.

```sh
npm install
npm run typecheck
npm test
npm run build
```

Run `npm run server` in one terminal and `npm run dev` in another. Open
`http://localhost:5173`; Vite forwards `/api` to port 3001. The default allowed origin
is exactly `http://localhost:5173`. For the built app, run
`APP_ORIGIN=http://localhost:3001 npm run server` and open that origin. Supply
environment values to the process; `.env.example` is not loaded automatically.

The first user creates a real account; there are no seeded practitioners or default
credentials. Provide a username, password and display name; confirm adulthood (18+)
and the community rules. Circle descriptions are discoverable only when the owner
chooses that visibility. All discussions require approved membership.

## Implemented flow and permissions

1. Registration/sign-in creates a server session. Passwords use salted scrypt;
   random session tokens are stored only as SHA-256 hashes. Cookies are HttpOnly,
   SameSite=Strict and scoped to `/api`. Production cookies require HTTPS.
2. Circle creation validates consent and limits, gets ownership from the session,
   and atomically creates an owner membership. Idempotency keys prevent duplicate
   creation when retrying from the same form.
3. Members request discoverable-circle access or use private, single-use, 24-hour
   invitations. Invitations create pending membership, not immediate access.
4. Owners/moderators approve requests. Only owners assign/demote moderators or delete
   circles. Moderators cannot alter owners, elevate themselves or act in other
   circles. Bans prevent access/rejoining; implicit unbanning is denied.
5. Members publish plain-text discussions, delete their own posts, report content and
   block accounts. Neither the API nor the UI reads the device-local journal.
6. Circle moderators review reports without reporter identities, hide content and
   ban members with audited reasons. They can review blocked/hidden circle content;
   ordinary members cannot. Reports are hidden from ordinary members.
7. Members can leave. Owners must delete their circles before leaving or deleting
   their account. Password-confirmed account deletion revokes all sessions, removes
   memberships/blocks and replaces authored text with removal notices. Moderation
   records remain with deleted actors anonymized.

Every API route checks current database membership. SQLite is private server storage,
not a client-exposed database: no browser database credential or direct table API
exists. Bodies reject unexpected fields. Mutations require the configured Origin
and a custom header; there is no cross-origin CORS grant. JSON size limits, persistent
write/auth/post/report rate limits, parameterized SQL and restrictive headers are
enabled. Untrusted proxy headers are ignored.

## Persistence and deployment

Default storage is `data/community.sqlite`, with WAL and foreign keys. Data files are
excluded from Git and use owner-only permissions. Deploy a single Node process on a
persistent volume, not stateless/serverless hosting or independent SQLite replicas.

```sh
NODE_ENV=production APP_ORIGIN=https://focus.example.org \
COMMUNITY_DB=/persistent/ascend-focus/community.sqlite \
HOST=0.0.0.0 PORT=3001 npm run server
```

Replace the example with the actual origin. Build `dist` before startup. Terminate
TLS at a reverse proxy serving the web app and API from the same HTTPS origin, with
connection/request-size limits. Never expose the database directory. Production
configuration rejects an HTTP origin. Use SQLite online backups, or stop the process
before copying; do not copy the main file alone during WAL writes. Maintain encrypted
backups with explicit retention and deletion policies.

## Tests

- `npm run test:backend`: ten integration tests exercise the actual handler and SQLite
  without TCP sockets.
- `npm run test:backend:http`: the same suite using actual HTTP sockets. CI runs it;
  local sandbox socket binds are denied.
- `npm run test:community`: three dependency-free draft and validation tests.
- `npm test`: Vitest catalog/component/API tests plus dependency-free suites.
- `npm run typecheck` and `npm run build`: web verification.

Backend assertions cover authentication/consent/CSRF, hashed credentials, session
expiry/revocation, ownership forgery, atomic rollback, idempotency, private visibility,
pending membership isolation, invitation expiry/reuse, moderator scope, reporter
privacy, bans, blocks, deletion, persistence, body limits and auth throttling.
Execution results are reported separately; test code alone is not a passed run.

## Remaining capabilities

No password recovery, email verification, MFA, platform-wide moderation console,
realtime push, ownership transfer or account export endpoint is implemented. Lists
are capped at 100 circles/posts/reports and 200 members; there is no pagination yet.
The UI uses manual refresh. Age is self-attested. Behind a shared proxy IP, the
additional IP limit applies collectively; configure a trusted edge limiter before
scaling while retaining per-account limits.

Paired scheduling and blinded experiments remain explicitly unavailable. Membership
is not pairing consent. Independent commitments, server-only hidden targets,
withdrawal, reveal rules, chance baselines and inclusion of missed/abandoned trials
require separate implementation. Telepathy is not scientifically established.
