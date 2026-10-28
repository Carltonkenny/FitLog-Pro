# Final security report

**Date:** 2026-10-28. **Scope:** the repository (React app, `api` function, schema, config). **Not in scope or not reachable:** the Neon-hosted auth server, Google OAuth, the Neon console, the deployed Netlify site.

## Decision
| Area | Outcome | Why |
|---|---|---|
| API layer (authorization, validation, injection, errors, CORS, secrets in the repo) | **CONDITIONAL PASS** | Verified with 45+ tests against real Postgres and real JWT verification. Conditions below |
| Authentication, sessions, password reset, Google sign-in | **INCONCLUSIVE** | These run on Neon's servers. I could not test them without creating accounts on your live project, so they are untested, not "secure" |
| Overall | **CONDITIONAL PASS, not "secure"** | A limited audit that found no exploitable hole in the code we own is not proof the application is secure |

Conditions to lift the conditions: (1) settle the `better-auth` advisory with Neon before enabling Google; (2) run the blocked auth tests on a test tenant; (3) confirm the database role is least-privilege; (4) check live headers on the deployed site.

## Confirmed findings
| ID | Severity | Finding | Status |
|---|---|---|---|
| DEF-S03 | **High (exposure unverified)** | `npm audit` reports `better-auth` 1.7.6 (pulled in by `@neondatabase/neon-js`) with **critical** GHSA-965c-763c-88jm (OAuth state usable as a magic link to sign in as another user) and **high** GHSA-r4xp-prcw-77qf (OAuth proxy). Both are fixed in 1.7.7. These flaws are in the **server** half of the library; our browser bundle contains only the client. The server that matters is the Neon-hosted one, whose version I cannot see. No upstream fix is available through the SDK today | **Open.** Ask Neon which better-auth version your auth tenant runs; keep Google sign-in off until confirmed. Do not "fix" by overriding the client version; it would not change the server |
| DEF-S01 | Low | The coach 429 had no `Retry-After` header | **Fixed** with the real wait in seconds, tests SEC-RATE-003/007 |
| DEF-S07 | Low | Error logs could print a connection string with its password if a driver put one in a message | **Fixed**: credentials are masked before logging; test SEC-ERR-001 now really checks it (it used to be unable to fail) |
| DEF-S02 | Low | The coach limiter map grew with every distinct user and never shrank | **Fixed** (idle entries pruned), test SEC-RATE-006 |
| DEF-D03 | Medium | A valid token for a deleted account gave a 500 instead of 401 | **Fixed**, test DB-WORKOUT-006 |
| DEF-S04 | Low | Sign-up with an existing email says so (account enumeration). Common design, but note it | Documented (message comes from Neon Auth) |
| DEF-S05 | Info | No audience (`aud`) check on the JWT; issuer only | Documented |
| DEF-S06 | Info | Request size is checked after the body is buffered, so a huge body still costs memory first. Platform limits apply before this | Documented, untested |

## Residual risks (decisions, not fixes)
- **Coach rate limit is per function instance** and resets on restart. This is the agreed beta shortcut. Impact: Gemini cost only. It is a risk, not a control that "works everywhere".
- **No limits on other API routes.** They need a valid token, so exposure is low.
- **Local data is plain text in the browser**, as for any local-first web app.
- **DB role privileges unknown.** If the function uses the owner role, any future injection flaw would be total. Today all SQL is parameterised.

## What was verified (real execution this session)
| Check | Result |
|---|---|
| 401 on all 7 protected routes with no token, malformed headers, unknown tokens; no SQL runs | Passed |
| Real JWT checks: valid, expired, wrong issuer, wrong key, unknown kid, non-UUID sub, `alg: none`, HS256 key confusion, tampered payload | All rejected / accepted correctly |
| Cross-user read, write, overwrite, forged `user_id`/ids in the body, `is_pro_member`, identity fields | Blocked; data unchanged in the database |
| SQL injection strings in text, ids, `limit`; path tricks | Stored as text or rejected; schema intact |
| 22 field-validation cases + malformed JSON, empty/oversize bodies, profile limits | 400 with no write and no internal detail |
| Error responses on database failure | Generic `{error: "server-error"}`; no SQL, hostnames or secrets |
| CORS: allowed, disallowed, look-alike origins, null origin | Correct; no credentials header |
| `/health` with the database down | 200, no SQL |
| Coach limit at 30, 31st blocked, other user unaffected, spoofed `X-Forwarded-For` ignored, key never in URL/response | Passed |
| Secrets: no key-shaped strings in tracked files; only `.env.example` tracked with placeholders; Vite prefixes safe; no source maps; CSP has no `unsafe-eval` and no third-party script/font hosts | Passed |
| XSS payloads in titles, search, names, coach replies | Rendered as text (Playwright suite, 129 tests) |

## Test execution summary
| | Count |
|---|---|
| Security cases written | 46 |
| Automated | 38 |
| Executed and passed | 37 (1 of them against a mocked auth server only) |
| Failed | 1 (`SEC-DEP-001`, the dependency advisory) |
| Blocked (need a Neon test tenant, Google test app or deployed site) | 7 |
| Reviewed manually | 1 (CSRF design) |
| **Real database tests** | the unit/integration suite runs on **PGlite, a real PostgreSQL engine**, not on Neon |
| **Real authentication tests** | JWT verification is real. Neon Auth sign-up/sign-in/reset/Google are **mocked or not run** |

Also still green: 54 earlier unit/API tests and 129 Playwright tests (mocked backend).

## Not checked
Neon Auth's own rate limits, cookie flags, email verification, password policy, Google redirect/state handling, backups, CI secrets, Netlify account settings, live headers, penetration testing of the deployed site, denial-of-service load.

## Progress tracker (unfinished)
1. Ask Neon for the better-auth server version (DEF-S03).
2. Create an authorised Neon test branch and test auth tenant, then run SEC-AUTH-101/103/104/105/106 and DB-CONCURRENCY-101.
3. Verify the function's DB role is least-privilege (DB-NEON-001).
4. Check live headers after deploy (SEC-HDR-001).
