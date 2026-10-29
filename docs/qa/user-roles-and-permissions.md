# User roles and permissions

There is **no admin role and no role-based access control** in the web app. Access is decided by one question: is the caller signed in as themselves? (Neon project owners can use the Neon console, which is outside this app and not tested here.)

## Roles
| Role | How it arises | Notes |
|---|---|---|
| Anonymous visitor | Not signed in | Can only see the landing page and open the auth dialog |
| Signed-in user | Neon Auth session cookie plus a short-lived JWT for the API | Owns exactly their own data |
| Guest (dev only) | `VITE_SKIP_AUTH=true` under `npm run dev` | No session, so the API rejects calls; everything local works. Ignored in production builds |
| Local-only mode | No Neon settings at all | Fake device-only session; development use. A production build refuses to start in this state |

## Access rules
| Capability | Anonymous | Signed-in user | Guest (dev) |
|---|---|---|---|
| See `/` | yes | yes | yes |
| Open `/app`, `/onboarding` | no (redirected to `/` plus sign-in dialog) | yes | yes |
| Log workouts, routines, settings (device storage) | no | yes | yes |
| Upload / download own workouts, profile, records | no (401) | own rows only | no (401, token missing) |
| Use the AI coach | no (401) | yes, 30 requests per hour per user (best effort) | no ("Sign in to use the AI coach") |
| Read or change another user's data | no | **no**: every query is filtered by the verified user id; overwriting another user's workout id returns 404 | n/a |
| Set `is_pro_member`, user id, or any non-allowlisted column | no | **no**: the API ignores them | n/a |
| Live updates | no | own rows only (sealed queries filtered by user id) | no |

## Authentication requirements
- Sign-up: name, valid email, password of 8 or more characters (client rule); the server's own password rules also apply.
- Email verification: **not required** in the current Neon Auth setting (a deliberate choice for the friends beta).
- Sessions: Neon Auth cookie on the app's own origin (first-party). API calls carry `Authorization: Bearer <JWT>`; JWTs expire after 15 minutes and are refreshed automatically once on a 401.
- Sign-out clears device data (history, records, queue, profile, routines and memory) after warning about unsynced workouts.

## How access is verified in these tests
- **UI guard:** automated (`AUTH-GUARD-*`).
- **Server enforcement:** automated against a live Postgres in `web/tests/integration/api.neon.test.js` (forged, expired, wrong-issuer and non-UUID tokens; cross-user read and overwrite; protected fields). The Playwright suite does not re-test the server because it mocks it.
- **Not verified:** real token issuance and expiry from Neon Auth end to end, permission changes during a live session (the app has no permission changes), locked or disabled accounts (Neon Auth setting, not exposed in the app).
