# Security architecture (as found in the code, 2026-10-28)

Everything here was read from the repository. Items marked **unverified** depend on Neon-hosted services I cannot inspect.

## Trust boundaries
```
Browser (React SPA)
  |-- /neon-auth/*  --> Netlify rewrite --> Neon Auth (managed Better Auth, hosted by Neon)   [cookie session, first-party]
  |-- Authorization: Bearer <JWT, 15 min> --> Neon Function "api" (Hono) --> Postgres (Neon)
                                                        |--> Gemini (server-side key)
```
- The browser never talks to Postgres. All data access is through the `api` function.
- Local-first: workouts live in `localStorage` and are queued for upload. This data is not encrypted at rest on the device (normal for a web app).

## Authentication
| Topic | What the code does | Status |
|---|---|---|
| Sign-up / sign-in / reset / Google | `@neondatabase/neon-js` auth client → `/neon-auth` (Neon Auth). The app contains no password handling. | Server behaviour **unverified** (Neon-hosted) |
| Session | Neon Auth cookie on our own origin (first-party). The SDK exchanges it for a short-lived JWT | Cookie flags **unverified** (set by Neon) |
| API token | JWT (EdDSA, 15 min) sent as `Authorization: Bearer`; kept in memory only (`neonClient.js`), never in storage | Verified by reading |
| JWT check | `functions/lib/auth.ts`: signature against JWKS, `algorithms: ['EdDSA']`, issuer must equal the auth origin, expiry enforced, `sub` must be a UUID | Verified by tests SEC-AUTH-004/005/006 |
| No audience check | Tokens are accepted by issuer only. Acceptable while the issuer is private to this project | Risk noted |
| Sign-out | Calls Neon sign-out, clears device data (history, queue, draft, clock, profile, routines) | Verified by e2e (mocked auth) |
| Google | Flag `VITE_GOOGLE_AUTH`; `false` in `.env.example`; local `.env` has `true` (intentional, per owner). Provider setup lives in the Neon console | Redirect/state handling **unverified** |

## Authorization
- Model: **every query filters by the verified `user.id`**; no role system, no admin API. There is no RLS; ownership is enforced in `functions/app.ts` with a second line of defence in CHECK/FK constraints.
- Workout writes: `INSERT ... ON CONFLICT (id) DO UPDATE ... WHERE workouts.user_id = $2`. An id owned by someone else updates nothing → 404 + rollback.
- Profile writes: whitelist (`PROFILE_FIELDS` in `validate.ts`); `is_pro_member`, `id`, `email` cannot be written.
- Database role: the function connects with `DATABASE_URL`; the role's privileges are **unverified** (Neon console not inspected). If it is the owner role, any future SQL injection would be total. All SQL is parameterised today.

## Input handling
All request bodies pass through `validate.ts` (types, ranges, lengths, enums, array sizes, date window); unknown fields are dropped; `readJson` rejects oversize bodies (400). Coach input is rebuilt field by field (`sanitizeCoachRequest`); MIME allow-list; max 3 images, 30k chars.

## Output and browser protections
- React escapes all text; no `dangerouslySetInnerHTML`, `eval` or `innerHTML` in `src` (searched).
- Netlify headers: CSP (`script-src 'self'`, no `unsafe-eval`, fonts self-hosted since this audit), HSTS, nosniff, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy. Live headers **unverified** (dev server only).
- CORS: allow-list of configured origins + localhost; no credentials header.
- CSRF: the API uses a Bearer header, not cookies, so cross-site requests carry no credentials.

## Secrets
- Server-only: `DATABASE_URL`, `GEMINI_API_KEY`, `NEON_REALTIME_SECRET` (Neon env). Vite exposes only `VITE_`, `NEON_AUTH_BASE_URL`, `NEON_FUNCTION_`, `NEON_REALTIME_URL`.
- Gemini key is sent in the `x-goog-api-key` header to Google, never in a URL, never to the browser.
- Only `web/.env.example` is tracked. No secret-shaped strings are committed (scan in SEC-CONFIG-001).

## Abuse controls
- Coach: 30 requests per hour per user id, **in memory per function instance** (resets on restart, not shared across instances). This is an accepted beta shortcut and is recorded as a risk, not as secure.
- No rate limiting on the other API routes (they need a valid JWT).
- Login throttling is Neon Auth's responsibility (**unverified**).

## Unknowns
Neon Auth server version and hardening, cookie flags, email verification setting, DB role privileges, backups/retention policy, whether the auth server is already patched for the advisories in the final report.
