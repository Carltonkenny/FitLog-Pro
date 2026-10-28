# Tests

Everything that tests FitLog Pro lives here, grouped by what it proves. Run commands from the `web` folder.

```
tests/
├── unit/          Pure logic, no network and no database. Fast.                       39 tests
├── security/      The API's security: tokens, ownership, validation, abuse, config.   36 tests
├── database/      Schema rules, transactions, retries, bulk insert (real PostgreSQL). 33 tests (1 blocked)
├── integration/   Talks to the REAL Neon project. Opt-in only.                        15 tests
├── e2e/           Playwright, real browser, mocked backend. Specs + fixtures.        136 tests
├── helpers/       Shared set-up (PGlite database, API harness)
└── runner/        Node loader so plain Node can import the app's source files
```

## Commands
| Command | What runs | Touches Neon? |
|---|---|---|
| `npm test` | unit + security + database (108 tests) | No |
| `npm run test:unit` / `test:security` / `test:database` | one group | No |
| `npm run test:e2e` | all browser tests (starts two dev servers itself) | No (backend is mocked) |
| `npm run test:live` | `tests/integration` against the real Neon project | **Yes**: uses a throw-away schema that it drops; needs `.env` |
| `npm run test:all` | `npm test` then `test:e2e` | No |
| `npm run qa:docs` / `node scripts/sec-docs.mjs` | rebuild the QA and security/database case documents from test results | No |

## What is real and what is mocked
| Group | Database | Sign-in |
|---|---|---|
| unit | none | none |
| security, database | **real PostgreSQL engine (PGlite, in memory)**, loaded with `neon/schema.sql` | JWT checks are real (jose, local key); other tests use a fixed token table |
| e2e | none (API is mocked inside the browser) | mocked |
| integration | real Neon | real JWT verification, no real sign-up |

Nothing here creates an account on Neon Auth or tests Google sign-in. See `docs/security/final-security-report.md`.

## Map: what each file covers
### unit/
| File | Covers |
|---|---|
| `domain.test.js` | Set counting, volume, Epley 1RM, PR rules, kg/lb, streaks, row mapping to and from the API |
| `domain-and-sync.test.js` | Sync queue rules, merge of local and cloud data |
| `companion.test.js` | Coach reply parsing, action safety, mood, recommender, plan parsing |
| `sync-and-clock.test.js` | Session stopwatch (incl. restore after refresh), routine/memory merge, date clamping, weekly stats |

### security/
| File | Covers (IDs) |
|---|---|
| `authentication.test.js` | 401 everywhere without a token, malformed headers, forged/expired/alg-confused tokens (SEC-AUTH-*) |
| `authorization.test.js` | Cross-user read/write blocked, protected profile fields, realtime scope (SEC-AUTHZ-*) |
| `input-validation.test.js` | SQL injection strings, bad types, ranges, dates, sizes, XSS text (SEC-INJECT-*, SEC-VALID-*) |
| `hardening.test.js` | Error leakage, CORS, `/health` without SQL, coach rate limit, secrets in git, headers, bundle (SEC-ERR/CORS/HEALTH/RATE/CONFIG-*) |

### database/
| File | Covers (IDs) |
|---|---|
| `schema.test.js` | Keys, indexes, CHECK ranges, NOT NULL, foreign keys, trigger, cascade deletion (DB-SCHEMA-*, DB-DELETE-*) |
| `workouts.test.js` | Save/rollback, retries (idempotent), bulk `unnest` insert, set order round trip, list query, query plans (DB-WORKOUT-*, DB-BULK-*, DB-TXN-*, DB-PERF-*). `DB-CONCURRENCY-001` is skipped on purpose: it needs a real multi-connection database |

### e2e/ (Playwright)
Three projects: **guest** (no sign-in, port 5180), **auth** (sign-in required, port 5181), **phone** (Pixel 7). File name decides the project: `*.guest.spec.ts`, `*.auth.spec.ts`, `*.phone.spec.ts`.
| File | Covers |
|---|---|
| `landing.guest.spec.ts` | Landing page, calculator, FAQ, SEO basics |
| `onboarding.guest.spec.ts` | Four-step onboarding and its limits |
| `workout.guest.spec.ts` | Logging sets, rest timer, PRs, units, clock, refresh persistence |
| `screens.guest.spec.ts` | Explorer, picker, history, progress, settings, routines |
| `resilience.guest.spec.ts` | History paging, draft and clock restore/expiry |
| `axe.guest.spec.ts` | Accessibility audit (axe-core WCAG A/AA) on 6 screens |
| `auth.auth.spec.ts` | Route guard, sign-in/up, validation, reset, sign-out |
| `companion-sync.auth.spec.ts` | AI companion (mocked coach), upload queue (offline, 4xx, 5xx, overlap), sign-out warning |
| `chunk-retry.auth.spec.ts` | App recovers when a deploy removed the old app files |
| `responsive.phone.spec.ts` | Phone layout, overflow, tap size, 130% text |
| `fixtures/` | `mockBackend.ts` (fake auth + API), `app.ts` (helpers), `data.ts` (seed data) |

### integration/ (opt-in)
`api.neon.test.js`: the API code on the real database in a scratch schema, real JWT verification and Gemini mock. `services.neon.test.js`: live checks of Neon services and Gemini; skipped when settings are missing.

## Conventions
- A test name starts with its ID (`SEC-AUTHZ-001`, `TC-WRK-FIN-001`). IDs map to `docs/security`, `docs/database` and `docs/qa`.
- No retries and no fixed sleeps. The one deliberate fixed wait is in `chunk-retry.auth.spec.ts` (proving a reload loop does not happen needs elapsed time).
- Known gaps are written as tests that pin today's behaviour and say so in the name (`KNOWN GAP`), so a fix turns them red on purpose.
