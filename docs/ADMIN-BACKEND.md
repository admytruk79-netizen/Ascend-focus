# Admin backend

Tap the ASCEND logo inside the app to open administration. The first delivery edits existing exercise titles, durations, instructions and source context. It does not add user or community management.

Authentication uses Neon Managed Better Auth. Only the verified email configured as ADMIN_EMAIL receives editing rights. New accounts do not receive admin access merely by registering. Passwords are handled by the managed auth provider. Application bearer sessions stay in memory on the device, expire after eight hours, and are revalidated against managed auth on every admin request.

The Node API runs on Render and stores published catalog revisions, audit snapshots and server sessions in Lakebase Postgres via Neon. DATABASE_URL, NEON_AUTH_BASE_URL, ADMIN_EMAIL and ALLOWED_ORIGINS are server environment variables. Never put database credentials or authentication secrets in VITE variables or the APK.

The bundled catalog remains the offline fallback. Successful online updates are cached on the device. Private journal entries are not uploaded. Publication uses optimistic revision checks and an audit trail; a conflicting edit must be reloaded before publication.

Development verification covers anonymous admin denial, origin restrictions, verified-owner authorization, catalog validation and preservation of attribution fields. First-owner email delivery, login and publishing still need verification with the account owner.

A free Render service can take time to wake up after inactivity. Display loading errors without blocking offline practice.

