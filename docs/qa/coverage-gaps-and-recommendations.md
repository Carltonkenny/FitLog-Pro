# Coverage gaps and recommendations

## What this suite is, and is not
- **It is** a browser suite (Playwright, Microsoft Edge) that drives the real front end on a local dev server. The Neon Auth server and the API function are **mocked** inside the browser (`web/e2e/fixtures/mockBackend.ts`), so the tests are fast, repeatable and never touch a real account, database or Gemini key.
- **It is not** proof the deployed product works. The mock matches how the SDK behaves as far as I could read and reproduce it, but it is my model of the server, not the server.

## Gaps (what has no automated proof)
| Gap | Why | Risk |
|---|---|---|
| Real sign-up, sign-in, reset email, Google OAuth | No test accounts may be created by automation; Google needs a real provider | **High.** DEF-007 and DEF-008 live exactly here |
| Cross-user isolation on the real API | Covered by `web/test/api.test.js` against a live database, which I did not run (it writes to the real Neon project) | Medium: it passed when last run, but is not part of this report |
| Realtime updates between two devices | Needs the Neon Realtime service | Low-Medium |
| Deployed headers (CSP, nosniff), Netlify rewrite for `/neon-auth` | Only exist on Netlify, not on the dev server | Medium |
| Service worker and offline start | Registers only in production builds | Medium for a "works in the gym with bad signal" product |
| Firefox and Safari | Only Edge was available | Medium: iPhone Safari is the browser the cookie design targets |
| Real AI coach answers, photo attach limits | Needs deployed function and key; photo upload is manual | Medium |
| Accessibility beyond what I scripted | No axe-core (new dependency, needs approval); no screen-reader pass | Medium |
| Process death mid-set, locale decimals (`42,5`), 500-workout performance, DST | Manual cases written, not run | Medium |
| Loading a routine over completed sets, 30-routine cap | Manual cases written, not run | Low |

## Recommendations, in order
1. **Do one real sign-up yourself, then finish a workout.** This is the cheapest way to settle DEF-007. If the workout stays "Waiting to sync", apply the one-line fix in `defect-report.md` and redeploy.
2. **Fix DEF-008** (forgot password) before inviting testers. Two lines.
3. **Fix DEF-001** (save the workout draft as you go). This is the one most likely to anger a tester mid-workout.
4. **Fix DEF-010** (Finish button off-screen on phones), then DEF-003, DEF-004, DEF-002, DEF-011.
5. **Run the suite in CI** (GitHub Action: `npm ci`, `npx playwright install msedge`, `npm run e2e`) and keep `web/test` (unit/API tests) in the same pipeline. Keep retries at zero.
6. **Add a staging smoke job** that runs 5 read-only checks against the deployed Netlify URL (landing renders, `/health` returns ok, headers present, `/app` redirects when signed out). That closes the header and rewrite gap without needing accounts.
7. **Add axe-core** (`@axe-core/playwright`, MIT, actively maintained) to the existing screens for automated contrast and ARIA checks. It is a new dependency, so it needs your approval.
8. **Turn the expected-failure tests into normal tests** as each defect is fixed: delete `test.fail` on that test. Playwright will tell you when a defect is fixed, because the test will start "passing unexpectedly".

## Known limits of the suite itself
- Several tests share the dev server and a mocked network; they are independent (each gets a new browser context and clean storage) but all four workers load one Vite dev server on a OneDrive path, which made some runs slow. I removed one real race (the fake-clock timer test waited too early) rather than adding retries.
- Timing assertions use Playwright's auto-waiting and `expect.poll`; there are no fixed sleeps in the specs.
- Locators use roles and accessible names (the same things a screen reader uses), so renaming a button's label will break a test. That is intentional: it forces a conscious change.
