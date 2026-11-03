# Coverage gaps and recommendations

Updated 2026-10-28, after all defects DEF-001..011 were fixed. Test map: `web/tests/README.md`.

## What the test suites are, and are not
- **Browser suite (Playwright, Edge):** drives the real front end on a local dev server. The Neon Auth server and the API are **mocked** inside the browser (`web/tests/e2e/fixtures/mockBackend.ts`). Fast and repeatable; it never touches a real account, database or Gemini key.
- **Security and database suites:** run the real API code on a real PostgreSQL engine (PGlite). They do not touch Neon.
- **Neither proves the deployed product works.** The mock is my model of the server, not the server.

## Where the evidence files are
The raw Playwright result files (`docs/qa/results/*.json`) are large and **not committed**; the reports in this folder were generated from them. Rebuild with `cd web && npm run test:e2e && cp e2e-results/results.json ../docs/qa/results/with-fix.json && npm run qa:docs`. The pre-fix baseline run (`baseline.json`) cannot be rebuilt without checking out the commit before the fixes; the numbers from it are quoted in `execution-report.md`.

## Gaps (what has no automated proof)
| Gap | Why | Risk |
|---|---|---|
| Real sign-up, sign-in, reset email, Google OAuth | No test accounts may be created by automation; Google needs a real provider | **High** |
| True parallel writes, DB role privileges, real latency | Need an isolated Neon branch | Medium |
| Deployed headers (CSP etc.), Netlify rewrite for `/neon-auth` | Only exist on Netlify | Medium |
| Service worker and offline start | Production builds only; **audit finding: the worker caches `/neon-auth` responses (unfixed, see `docs/security/final-security-report.md` and the latest audit)** | Medium-High |
| Firefox and Safari | Only Edge was available | Medium (iPhone Safari matters most) |
| Real AI coach answers, photo limits | Needs deployed function and key | Medium |
| Screen-reader pass | Axe finds only part of the problems | Medium |
| Process death mid-set, locale decimals (`42,5`), DST | Manual cases written, not run | Medium |
| Loading a routine over completed sets, 30-routine cap | Manual cases written, not run | Low |

## Recommendations, in order
1. **Do one real sign-up yourself, then finish a workout** and check Settings says "All workouts synced". It settles whether the real auth server behaves like the mock (DEF-007 and DEF-008 were fixed against the mock).
2. **Ask Neon which better-auth server version your auth tenant runs** (critical advisory GHSA-965c-763c-88jm) before enabling Google sign-in.
3. **Fix the service worker caching `/neon-auth`** (one line) and add a test against `vite preview`.
4. **Create a Neon test branch** and point `npm run test:live` and CI at it; then run the blocked concurrency and role-privilege tests.
5. **Run the suites in CI**: `npm ci`, `npx playwright install msedge`, `npm test`, `npm run test:e2e`. Keep retries at zero.
6. **Add a staging smoke job** against the deployed site (landing renders, `/health` ok, headers present, `/app` redirects when signed out).
7. Add Sentry or similar for real-user errors and Web Vitals.

## Known limits of the suites themselves
- The browser tests share one Vite dev server (slow on a OneDrive path), so they run with 2 workers and no retries. A real timing race was fixed instead of hidden.
- Waits use Playwright's auto-waiting and `expect.poll`. There is one deliberate fixed wait (`chunk-retry.auth.spec.ts`, proving a reload loop does not happen).
- Locators use roles and accessible names, so renaming a button label breaks a test on purpose.
