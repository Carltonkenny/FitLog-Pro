# Defect report

Found while building and running the Playwright suite (see `execution-report.md`). Each defect has a test that reproduces it; those tests are written as expected failures (`test.fail`, tagged `[DEF-xxx]`) so the suite stays green while the defect is open, and turns red the day someone fixes it (Playwright reports an unexpected pass). **Nothing in the app was changed to make a test pass.**

Severity uses plain meanings. **Critical**: a main feature does not work for everyone. **High**: a main feature is broken for a group of users or data is lost. **Medium**: wrong behaviour users will notice. **Low**: polish or accessibility detail.

> **Status 2026-10-28: all 11 defects fixed in the code and re-tested.** The final full run (127 tests, 0 failed, 0 skipped) is in `results/with-fix.json`; the pre-fix run is `results/baseline.json`. The sections below describe the defects as found. Their tests are now normal tests. DEF-007 and DEF-006/008 are verified against a **mocked** auth server only; one real sign-up is still needed. Also fixed after the first report: colour contrast on all screens (grey text raised from zinc-500 to zinc-400), plate-calculator label contrast, and a keyboard-unreachable scrolling sidebar, found by the new axe-core audit (6 pages, 0 violations).

| ID | Severity | Confidence | One line |
|---|---|---|---|
| DEF-007 | Critical (suspected) | High under the mock; **not yet confirmed on the real service** | Signed-in users probably get no API token, so sync, profile and the coach all fail with "unauthorized" |
| DEF-008 | High | Confirmed (fails in the browser before any network call) | "Forgot password" never sends the request |
| DEF-001 | High | Confirmed | A workout in progress is lost when the page refreshes |
| DEF-010 | Medium | Confirmed | On a 412 px phone the Finish Workout button runs off the right edge |
| DEF-003 | Medium | Confirmed | Next-session weights are prefilled from sets you planned but never did |
| DEF-004 | Medium | Confirmed | The "Rest timer chime" switch has no accessible name |
| DEF-002 | Low | Confirmed | Weight column header says "kg" when the unit is pounds |
| DEF-011 | Low | Confirmed | Weight and reps stepper buttons are 36 x 40 px, under the 44 px minimum |
| DEF-005 | Low | Confirmed | The picker's Add button does not announce "Added" |
| DEF-009 | Low | Confirmed | The plate calculator's bar choice is shown by colour only |
| DEF-006 | Low | Confirmed under the mock; unconfirmed on the real service | Friendly sign-in error messages never appear; raw server text is shown |

---

## DEF-007 — No API token once a session is cached (suspected critical)
- **Where:** `web/src/lib/neonClient.js`, `accessToken()` (reads `data.token`).
- **What I saw:** After the app has called `getSession()` (it does, on every start), `authClient.token()` answers from the SDK's session cache and returns `{ data: { session: { token }, user } }` instead of `{ data: { token } }`. The app only looks at `data.token`, finds nothing, and `api()` throws `unauthorized` without sending any request. A fresh client with an empty cache does call `/token` and works, which is why this is easy to miss.
- **Effect if it also happens on the real service:** every signed-in call fails: profile fetch (returning users on a new device are sent to onboarding again), workout upload (workouts stay "Waiting to sync"), the AI coach ("Sign in to use the AI coach"), and live updates. Local logging keeps working, so nothing crashes, which hides it.
- **Evidence:** `TC-SYNC-TOKEN-001` (expected failure on the baseline run). With a temporary one-line fix the 17 tests blocked by this all passed (see `execution-report.md`).
- **How sure am I?** The SDK behaviour is real (I read the SDK source and reproduced it in the browser). The auth server in my test is a **mock**, so I cannot promise the real Neon Auth session response triggers the same cache path. One real sign-in by the owner settles it: after signing in, check whether Settings shows "All workouts synced" after finishing a workout.
- **Suggested fix (not applied; this touches auth, so it needs your OK):** in `accessToken()`, use `const jwt = data?.token ?? data?.session?.token;` and use `jwt` in the three places `data.token` is used. It is safe in both shapes.

## DEF-008 — Forgot password never sends the request
- **Where:** `web/src/lib/neonClient.js`, `AuthService.resetPassword()` calls `request.call(authClient, {...})`.
- **What I saw:** Submitting the form shows "Failed to execute 'fetch' on 'Window': '[object Promise]' is not a valid HTTP method." The SDK client is a proxy; re-binding `this` with `.call()` breaks its path building, so it sends a stray request to `/fetch-options/method/to-upper-case` and then fails.
- **Effect:** nobody can reset a password. This fails inside the browser before the server is involved, so it is not an artefact of the mock.
- **Evidence:** `TC-AUTH-RESET-001` (expected failure).
- **Suggested fix:** call `authClient.requestPasswordReset({ email, redirectTo })` directly (fall back to `forgetPassword` with a normal call, not `.call()`).

## DEF-001 — Workout in progress is lost on refresh
- **What I saw:** Complete a set, reload the page: the set is no longer completed. The in-progress workout (sets, weights, edits) lives only in React state; only *finished* workouts are saved.
- **Effect:** an accidental refresh, a phone browser reclaiming the tab, or a crash loses the session. This is the product's core promise (`AGENTS.md` §6 says to save on every set completion).
- **Evidence:** `TC-WRK-REFRESH-001`; manual follow-up `TC-WRK-PERSIST-002`.
- **Suggested fix:** write the draft workout to `localStorage` on each change and restore it on load (clear it on Finish).

## DEF-010 — Finish Workout runs off the screen on phones
- **What I saw:** At 412 px the header's button group ends at x = 443, so the page scrolls sideways by 31 px and the **Finish** button is partly clipped. Same at 130% text size.
- **Evidence:** `TC-RESP-OVF-001`, `TC-RESP-SCALE-001`.
- **Suggested fix:** let the header wrap or shrink (hide the Studio/Mobile toggle on phones).

## DEF-003 — Prefill uses sets you never did
- **What I saw:** Complete only set 2 (40 kg x 10) of a four-set exercise whose set 4 is planned at 42.5 kg x 8. After finishing, the next session pre-fills every set with 42.5 kg x 8. The saved workout includes uncompleted sets, and "last session" takes the heaviest of all of them.
- **Effect:** wrong "last session" and progression targets.
- **Evidence:** `TC-WRK-LAST-001`. Fix: ignore sets that are not completed in `getLastSessionForExercise`.

## DEF-004 — Chime switch has no name
- The Settings switch for "Rest timer chime" has no accessible name (Vibration has one). Screen readers hear just "switch". Evidence `TC-SET-A11Y-001`.

## DEF-002 — "Weight (kg)" header in pound mode
- `ExerciseCard.jsx:89` hard-codes `Weight (kg)`. The inputs show pounds, which is confusing and wrong. Evidence `TC-WRK-LB-002`.

## DEF-011 — Small stepper buttons
- Increase weight and Decrease reps measured 36 x 40 px on a Pixel 7 emulation (the set tick, the tab buttons and the Buddy button passed at 44 px or more). The AGENTS.md rule is 48 dp. Evidence `TC-RESP-TAP-001`.

## DEF-005 / DEF-009 — State not announced
- Picker Add button keeps `aria-label="Add <name>"` after adding. Plate calculator bar buttons show the chosen bar with colour only. Both break "do not convey state by colour alone". Evidence `TC-PICK-A11Y-001`, `TC-LAND-A11Y-001`.

## DEF-006 — Friendly sign-in errors never show
- `friendlyAuthError()` maps server codes to plain messages, but the SDK throws instead of returning `{ error }`, so the mapper is skipped and users see "Invalid email or password" / "User already exists". Readable, but the code in `friendlyAuthError` is effectively dead for these paths. Evidence `TC-AUTH-MSG-001`.

---

## Things I checked that were fine
Clamping (weight 1000, reps 200, no negatives), zero-rep and bodyweight rules, PR tie handling, Epley figures, kg/lb conversion, rest timer controls, XSS attempts in search, workout titles, sign-up names and coach replies (all shown as text), corrupt storage, double-click Finish and double-click Sign in, auth guard redirects, export, routine save/delete, and the sign-out unsynced-data warning.
