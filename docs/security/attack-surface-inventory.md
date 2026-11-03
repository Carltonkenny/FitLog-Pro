# Attack surface inventory

## API (`web/functions/app.ts`)
| Route | Auth | Reads / writes | Notes |
|---|---|---|---|
| `GET /health` | none | nothing (no SQL) | Public. Not a readiness check. A separate authenticated or internal readiness check is still needed if DB monitoring is required |
| `GET /me` | JWT | profile of caller; creates the row on first call | A valid token for a deleted account now returns 401 |
| `PUT /me` | JWT | whitelisted profile columns; `routines` (<90k chars), `coach_memory` (<18k) | Dynamic column list comes from the whitelist only |
| `GET /workouts?limit` | JWT | caller's workouts + sets (2 queries) | limit 1..500, default 200 |
| `PUT /workouts/:id` | JWT | transaction: profile, workout, sets, records | Body ≤ 400 kB; ≤ 500 sets; ≤ 50 records |
| `GET /records` | JWT | caller's records (≤ 1000) | |
| `POST /coach` | JWT | no DB; calls Gemini | Body ≤ 6 MB; 30/hour/user; MIME allow-list |
| `POST /realtime/seal` | JWT | returns sealed live queries for the caller's id | 503 if not configured |
| CORS preflight | none | none | |

## Browser surface
- Pages: `/`, `/onboarding`, `/app`, `/reset-password?token=` (token read from the URL, then removed from the address bar).
- Inputs that reach storage or the network: auth form, onboarding numbers, workout fields, workout title, routine names, exercise search, coach chat text and photos, settings.
- Browser storage keys: `fitlog_workout_history`, `fitlog_prs`, `fitlog_sync_queue`, `fitlog_workout_draft`, `fitlog_workout_clock`, `fitlog_profile`, `fitlog_settings`, `fitlog_userdata(_base)`, `fitlog_session` (local-only mode). No tokens or passwords are stored.
- Third parties: none at runtime besides Neon (auth/API/realtime) and, via the API, Gemini. Fonts are self-hosted.

## Out-of-repo surfaces (not audited)
Neon Auth endpoints under `/neon-auth/*`, Google OAuth consent and callback, Neon console, Netlify account, GitHub repo access, Gemini account.

## What an attacker could try, and the control
| Attack | Control | Evidence |
|---|---|---|
| Read/write another user's workout | `user_id` filter + `ON CONFLICT ... WHERE user_id` | SEC-AUTHZ-001/002/003 (real Postgres) |
| Become pro / change identity via profile | field whitelist | SEC-AUTHZ-004 |
| SQL injection via ids, limit, text | parameterised queries, UUID check, clamps | SEC-INJECT-001/002/003 |
| Stored XSS via titles/names | React escaping, JSON-only API | SEC-VALID-005 + e2e XSS tests |
| Forged / expired / alg-confused JWT | EdDSA-only, issuer, expiry, UUID `sub` | SEC-AUTH-004 |
| Abuse the AI coach (cost) | 30/hour/user, input caps | SEC-RATE-002/004 (per-instance only) |
| Steal the Gemini key | server-side only, header not URL | SEC-RATE-005, SEC-CONFIG-006 |
| Keep the DB awake / run up cost via public URL | `/health` has no SQL | SEC-HEALTH-001 |
| Large-body memory pressure | size caps (checked after buffering) | SEC-VALID-002 |
| Dependency exploit | audit | SEC-DEP-001 (open) |
