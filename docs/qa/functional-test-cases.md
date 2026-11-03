# Functional test cases

Generated from `web/scripts/qa-cases.mjs` (the registry) joined with the saved Playwright results. Do not edit by hand; run `npm run qa:docs` in `web`.

152 cases. Machine-readable copy: `functional-test-cases.json`.

**How to read it:** *Automation* says whether a Playwright test exists. *Baseline* is the observed result against the unmodified app. *After fixes* is the final full run after the defects were fixed. `defect-confirmed` means the test is written to expect the defect and the defect was observed.

## Landing page

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-LAND-SEO-001 | Page has a title, a description and a language | positive | P2 |  | automated | passed | passed |  |
| TC-LAND-NAV-001 | Primary navigation lists five sections | positive | P2 |  | automated | passed | passed |  |
| TC-LAND-NAV-002 | Pricing link jumps to the pricing section | positive | P2 |  | automated | passed | passed |  |
| TC-LAND-NAV-003 | First Tab stop is the skip link | positive | P1 |  | automated | passed | passed |  |
| TC-LAND-HERO-001 | Hero preview sets can be ticked and unticked | positive | P3 |  | automated | passed | passed |  |
| TC-LAND-CALC-001 | Plate calculator steppers change total weight | positive | P2 | BR-05 | automated | passed | passed |  |
| TC-LAND-CALC-002 | Reps slider and bar choice are operable | positive | P3 |  | automated | passed | passed |  |
| TC-LAND-A11Y-001 | Chosen bar weight is exposed to assistive technology | a11y | P2 |  | automated | defect-confirmed | passed | DEF-009 |
| TC-LAND-ANAT-001 | Choosing a muscle updates the anatomy explorer | positive | P3 |  | automated | passed | passed |  |
| TC-LAND-FAQ-001 | A FAQ item opens and closes | positive | P3 |  | automated | passed | passed |  |
| TC-LAND-CTA-001 | Start free opens the sign-up dialog | positive | P0 |  | automated | passed | passed |  |
| TC-LAND-404-001 | Unknown path shows the landing page | negative | P2 |  | automated | passed | passed |  |
| TC-LAND-HDR-001 | Exactly one h1 | positive | P3 |  | automated | passed | passed |  |

<details><summary>Steps and expected results</summary>

**TC-LAND-SEO-001** (Anonymous visitor; /)
- Steps: Open / → Read title, meta description, html lang
- Expected: Title contains FitLog; description 20+ chars; lang=en
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LAND-NAV-001** (Anonymous visitor; /)
- Steps: Open / → Read the Primary navigation
- Expected: How it works, AI coach, Tools, Pricing, FAQ links visible
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LAND-NAV-002** (Anonymous visitor; /)
- Steps: Open / → Click Pricing
- Expected: URL ends #pricing; Pricing heading is in the viewport
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LAND-NAV-003** (Anonymous visitor; /)
- Steps: Open / → Press Tab
- Expected: Skip to main content is focused and targets #main
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LAND-HERO-001** (Anonymous visitor; /)
- Steps: Open / → Check set 3 → Uncheck set 3
- Expected: Checkbox state follows the clicks
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LAND-CALC-001** (Anonymous visitor; /)
- Steps: Open / → Click +2.5 → Click -5
- Expected: Slider reads 102.5 then 97.5
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LAND-CALC-002** (Anonymous visitor; /)
- Steps: Open / → Set reps to 10 → Click Technique (15 kg)
- Expected: Reps slider reads 10; bar choice accepts the click
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LAND-A11Y-001** (Anonymous visitor; /)
- Steps: Open / → Click Technique (15 kg) → Read aria-pressed
- Expected: aria-pressed=true on the chosen bar
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LAND-ANAT-001** (Anonymous visitor; /)
- Steps: Open / → Click Back in Tools
- Expected: The region heading changes
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LAND-FAQ-001** (Anonymous visitor; /)
- Steps: Open / → Click the first FAQ summary twice
- Expected: Open then closed
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LAND-CTA-001** (Anonymous visitor; /)
- Steps: Open / → Click Start free
- Expected: A dialog with the name field appears
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LAND-404-001** (Anonymous visitor; /)
- Steps: Open /this-page-does-not-exist
- Expected: The landing h1 is shown, no error
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LAND-HDR-001** (Anonymous visitor; /)
- Steps: Open / → Count h1
- Expected: 1
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

</details>

## Authentication

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-AUTH-GUARD-001 | Signed-out visitor to /app is sent to the landing page with the sign-in dialog | auth | P0 |  | automated | passed | passed |  |
| TC-AUTH-GUARD-002 | Signed-out visitor to /onboarding is sent to the landing page with the sign-in dialog | auth | P0 |  | automated | passed | passed |  |
| TC-AUTH-GUARD-003 | Signed-in user with a finished profile opens /app directly | auth | P0 |  | automated | blocked | passed |  |
| TC-AUTH-GUARD-004 | Signed-in user without a profile is sent to onboarding | auth | P0 |  | automated | blocked | passed |  |
| TC-AUTH-DLG-001 | Dialog opens focused on the first field and closes on Escape | positive | P1 |  | automated | passed | passed |  |
| TC-AUTH-DLG-002 | Google button shows when Google sign-in is enabled | positive | P2 |  | automated | passed | passed |  |
| TC-AUTH-DLG-003 | Show-password toggle reveals and hides the password | positive | P2 |  | automated | passed | passed |  |
| TC-AUTH-DLG-004 | Switching between sign-in and sign-up changes the form | positive | P2 |  | automated | passed | passed |  |
| TC-AUTH-VAL-001 | Empty sign-up shows all three errors and sends nothing | negative | P0 |  | automated | passed | passed |  |
| TC-AUTH-VAL-002 | Invalid emails (plain, a@b, space, SQL-like text) are rejected before any request | negative | P0 |  | automated | passed | passed |  |
| TC-AUTH-VAL-003 | Password boundary: 7 characters rejected, 8 accepted | boundary | P0 |  | automated | passed | passed |  |
| TC-AUTH-SIGNIN-001 | Wrong password shows an error and keeps the dialog open | negative | P0 |  | automated | passed | passed |  |
| TC-AUTH-SIGNIN-002 | Unknown email gets the same message as a wrong password | security | P1 |  | automated | passed | passed |  |
| TC-AUTH-SIGNIN-003 | Valid credentials with a finished profile open the app | positive | P0 |  | automated | blocked | passed |  |
| TC-AUTH-SIGNIN-004 | Email is matched ignoring case and surrounding spaces | boundary | P2 |  | automated | blocked | passed |  |
| TC-AUTH-SIGNIN-005 | Double-clicking Sign in sends one request | resilience | P1 |  | automated | blocked | passed |  |
| TC-AUTH-SIGNIN-006 | Unreachable auth server shows a message, not a crash | resilience | P1 |  | automated | passed | passed |  |
| TC-AUTH-MSG-001 | Wrong password shows the app's own plain message | positive | P3 |  | automated | defect-confirmed | passed | DEF-006 |
| TC-AUTH-SIGNUP-001 | New account goes to onboarding | positive | P0 |  | automated | passed | passed |  |
| TC-AUTH-SIGNUP-002 | Existing email is refused with a clear message | negative | P1 |  | automated | passed | passed |  |
| TC-AUTH-SIGNUP-003 | Markup in the name is sent as text and never executed | security | P1 |  | automated | passed | passed |  |
| TC-AUTH-RESET-001 | Forgot password sends a reset request | positive | P0 |  | automated | defect-confirmed | passed | DEF-008 |
| TC-AUTH-RESET-002 | Emailed link opens the new-password dialog and removes the token from the URL | positive | P1 |  | automated | passed | passed |  |
| TC-AUTH-RESET-003 | New password: 5 characters refused, valid one accepted | boundary | P1 |  | automated | passed | passed |  |
| TC-AUTH-RESET-004 | /reset-password without a token opens no dialog | negative | P2 |  | automated | passed | passed |  |
| TC-AUTH-OUT-001 | Sign out clears device data and returns to landing | data-integrity | P0 | BR-16 | automated | passed | passed |  |
| TC-AUTH-OUT-002 | Declining the unsynced-workout warning keeps data and session | data-integrity | P0 | BR-16 | automated | passed | passed |  |
| TC-AUTH-OUT-003 | Accepting the warning signs out and clears the device | data-integrity | P0 | BR-16 | automated | passed | passed |  |
| TC-AUTH-GOOGLE-001 | Google sign-in end to end | positive | P2 |  | blocked | blocked (not run) |  |  |
| TC-AUTH-REAL-001 | Real sign-up, sign-in and reset email against Neon Auth | positive | P0 |  | blocked | blocked (not run) |  |  |
| TC-AUTH-EXP-001 | Expired token is refreshed once and the request retried | resilience | P1 |  | manual (not automated) | not run (manual) |  |  |
| TC-AUTH-LOCK-001 | Repeated failed sign-ins are throttled | security | P2 |  | blocked | blocked (not run) |  |  |

<details><summary>Steps and expected results</summary>

**TC-AUTH-GUARD-001** (Anonymous visitor; /)
- Steps: Mock no session → Open /app
- Expected: Dialog visible; path is /
- Note: Mocked auth server

**TC-AUTH-GUARD-002** (Anonymous visitor; /)
- Steps: Mock no session → Open /onboarding
- Expected: Dialog visible; path is /
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-GUARD-003** (Anonymous visitor; /)
- Steps: Mock session + completed profile → Open /app
- Expected: App shell shown; path stays /app
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-GUARD-004** (Anonymous visitor; /)
- Steps: Mock session, profile null → Open /app
- Expected: Path becomes /onboarding
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-DLG-001** (Anonymous visitor; /)
- Steps: Open / → Click Sign in → Press Escape
- Expected: Email field focused; dialog closes
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-DLG-002** (Anonymous visitor; /)
- Steps: Open dialog with VITE_GOOGLE_AUTH=true
- Expected: Continue with Google button visible
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-DLG-003** (Anonymous visitor; /)
- Steps: Type password → Click show password
- Expected: Input type changes password to text
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-DLG-004** (Anonymous visitor; /)
- Steps: Open sign-in → Switch to create account
- Expected: Name field appears
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-VAL-001** (Anonymous visitor; /)
- Steps: Open sign-up → Submit empty
- Expected: Name, email and password errors; no sign-up request
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-VAL-002** (Anonymous visitor; /)
- Steps: Enter bad email + good password → Submit
- Expected: Email error; no sign-in request
- Test data: plain | a@b | "a b@c.com" | "' OR 1=1 --"
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-VAL-003** (Anonymous visitor; /)
- Steps: Sign up with 7 chars → Submit → Change to 8 → Submit
- Expected: Error at 7; account created at 8
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-SIGNIN-001** (Anonymous visitor; /)
- Steps: Sign in with wrong password
- Expected: Error text mentions invalid email or password; dialog stays
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-SIGNIN-002** (Anonymous visitor; /)
- Steps: Sign in with an unknown email
- Expected: Same message (no account enumeration)
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-SIGNIN-003** (Anonymous visitor; /)
- Steps: Sign in with valid credentials
- Expected: Path becomes /app
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-SIGNIN-004** (Anonymous visitor; /)
- Steps: Sign in with "  ANA@Example.com "
- Expected: Signs in
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-SIGNIN-005** (Anonymous visitor; /)
- Steps: Double-click Sign in
- Expected: Exactly one sign-in request
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-SIGNIN-006** (Anonymous visitor; /)
- Steps: Abort the sign-in request → Submit
- Expected: An error message is shown in the dialog
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-MSG-001** (Anonymous visitor; /)
- Steps: Sign in with wrong password
- Expected: Email or password is incorrect.
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-SIGNUP-001** (Anonymous visitor; /)
- Steps: Sign up with valid details
- Expected: Path becomes /onboarding
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-SIGNUP-002** (Anonymous visitor; /)
- Steps: Sign up with an existing email
- Expected: Message says the user already exists
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-SIGNUP-003** (Anonymous visitor; /)
- Steps: Sign up with an <img onerror> name
- Expected: No script runs; name stored as text
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-RESET-001** (Anonymous visitor; /)
- Steps: Open forgot → Enter email → Send reset link
- Expected: Request reaches the server; no client error
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-RESET-002** (Anonymous visitor; /)
- Steps: Open /reset-password?token=...
- Expected: Reset dialog visible; URL is / without the token
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-RESET-003** (Anonymous visitor; /)
- Steps: Open reset link → Enter short → Submit → Enter valid → Submit
- Expected: Error then success notice
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-RESET-004** (Anonymous visitor; /)
- Steps: Open /reset-password
- Expected: No dialog
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-OUT-001** (Anonymous visitor; /)
- Steps: Signed in with history → Settings → Sign out
- Expected: Landing page; history key removed; session ended
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-OUT-002** (Anonymous visitor; /)
- Steps: Seed an unsynced workout → Sign out → Decline
- Expected: Still on /app; history intact
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-OUT-003** (Anonymous visitor; /)
- Steps: Seed an unsynced workout → Sign out → Accept
- Expected: Landing; history cleared
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-AUTH-GOOGLE-001** (Anonymous visitor; /)
- Steps: Click Continue with Google → Complete provider flow
- Expected: Signed in
- Note: Needs a real Google provider and consent; not automatable without an account

**TC-AUTH-REAL-001** (Anonymous visitor; /)
- Steps: Sign up once → Receive nothing (no verification) → Sign in on a second browser
- Expected: Works end to end
- Note: No test accounts may be created by automation; owner to run once manually

**TC-AUTH-EXP-001** (Anonymous visitor; /)
- Steps: Return 401 once from the API → Observe retry
- Expected: One refresh, then success
- Depends on: DEF-007

**TC-AUTH-LOCK-001** (Anonymous visitor; /)
- Steps: Submit 10 wrong passwords
- Expected: Rate-limit message
- Note: Server-side policy of Neon Auth; not run against the real service

</details>

## Onboarding

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-ONB-FLOW-001 | Four steps complete and open the app with a saved profile | positive | P0 |  | automated | passed | passed |  |
| TC-ONB-SKIP-001 | Skip for now opens the app | positive | P1 |  | automated | passed | passed |  |
| TC-ONB-BACK-001 | Back is disabled on step 1 and returns to the previous step | positive | P2 |  | automated | passed | passed |  |
| TC-ONB-A11Y-001 | Heading takes focus on each new step | a11y | P2 |  | automated | passed | passed |  |
| TC-ONB-A11Y-002 | Progress bar reports its position | a11y | P3 |  | automated | passed | passed |  |
| TC-ONB-BND-001 | Body weight boundaries: 300 ok, 301 / -5 / 0 block Finish | boundary | P1 |  | automated | passed | passed |  |
| TC-ONB-BND-002 | All body numbers are optional | positive | P2 |  | automated | passed | passed |  |

<details><summary>Steps and expected results</summary>

**TC-ONB-FLOW-001** (Guest (dev) / signed-in user; /onboarding)
- Steps: Pick goal, experience, split → Enter weight → Finish and start
- Expected: Path /app; fitlog_profile.onboarding_completed=true
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-ONB-SKIP-001** (Guest (dev) / signed-in user; /onboarding)
- Steps: Click Skip for now
- Expected: Path /app
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-ONB-BACK-001** (Guest (dev) / signed-in user; /onboarding)
- Steps: Observe Back → Continue → Back
- Expected: Disabled then step 2 then step 1
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-ONB-A11Y-001** (Guest (dev) / signed-in user; /onboarding)
- Steps: Continue to step 2
- Expected: h1 is focused
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-ONB-A11Y-002** (Guest (dev) / signed-in user; /onboarding)
- Steps: Open /onboarding
- Expected: progressbar named Onboarding progress
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-ONB-BND-001** (Guest (dev) / signed-in user; /onboarding)
- Steps: Go to step 4 → Enter value
- Expected: Finish enabled only for 300
- Test data: 300, 301, -5, 0
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-ONB-BND-002** (Guest (dev) / signed-in user; /onboarding)
- Steps: Go to step 4 → Leave blank
- Expected: Finish enabled
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

</details>

## Active workout

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-WRK-FINISH-001 | Finish is disabled until a set is completed | negative | P0 | BR-03 | automated | passed | passed |  |
| TC-WRK-SET-001 | Completing and undoing a set updates total lifted | positive | P0 | BR-02 | automated | passed | passed |  |
| TC-WRK-SET-002 | Completing a set starts the rest timer; +30s extends; Skip dismisses | positive | P1 | BR-09 | automated | passed | passed |  |
| TC-WRK-SET-003 | A set with 0 reps does not count | boundary | P0 | BR-01 | automated | passed | passed |  |
| TC-WRK-SET-004 | A bodyweight (0 kg) set with reps counts | boundary | P0 | BR-01 | automated | passed | passed |  |
| TC-WRK-BND-001 | Weight above 1000 kg is clamped | boundary | P1 | BR-04 | automated | passed | passed |  |
| TC-WRK-BND-002 | Reps above 200 are clamped | boundary | P1 | BR-04 | automated | passed | passed |  |
| TC-WRK-BND-003 | Negative weight is not accepted | negative | P1 | BR-04 | automated | passed | passed |  |
| TC-WRK-BND-004 | Steppers: weight +2.5, reps -1 | positive | P1 |  | automated | passed | passed |  |
| TC-WRK-ADD-001 | Add Set appends a row | positive | P1 |  | automated | passed | passed |  |
| TC-WRK-REM-001 | Remove drops the exercise | positive | P1 |  | automated | passed | passed |  |
| TC-WRK-NAME-001 | Edited workout name is saved with the workout | data-integrity | P1 |  | automated | passed | passed |  |
| TC-WRK-FIN-001 | Finish shows the summary, saves one workout and a first PR | positive | P0 | BR-06 | automated | passed | passed |  |
| TC-WRK-FIN-002 | Next workout starts with nothing completed | data-integrity | P1 |  | automated | passed | passed |  |
| TC-WRK-FIN-003 | Double-clicking Finish saves once | resilience | P0 |  | automated | passed | passed |  |
| TC-WRK-PR-001 | Repeating the identical best set is a tie, not a record | boundary | P0 | BR-06 | automated | passed | passed |  |
| TC-WRK-LAST-001 | Only completed sets feed the next-session prefill | data-integrity | P2 |  | automated | defect-confirmed | passed | DEF-003 |
| TC-WRK-LB-001 | In pounds, 40 kg shows as 88.2 | positive | P1 | BR-07 | automated | passed | passed |  |
| TC-WRK-LB-002 | Weight column header says lb in pound mode | positive | P2 | BR-07 | automated | defect-confirmed | passed | DEF-002 |
| TC-WRK-TIMER-001 | Session clock runs and pauses (fake clock) | positive | P1 |  | automated | passed | passed |  |
| TC-WRK-REFRESH-001 | Completed set survives a page refresh | resilience | P0 | BR-17 | automated | defect-confirmed | passed | DEF-001 |
| TC-WRK-REFRESH-002 | Session clock keeps elapsed time after a refresh and returns paused | resilience | P1 | BR-08 | automated | not executed | passed |  |
| TC-WRK-PERSIST-002 | Process death mid-workout keeps the logged sets | resilience | P0 | BR-17 | manual (not automated) | not run (manual) |  | DEF-001 |
| TC-WRK-LOC-001 | Comma decimal "42,5" is read as 42.5 | boundary | P2 |  | manual (not automated) | not run (manual) |  |  |
| TC-WRK-PERF-001 | Workout screen stays responsive with 500 saved workouts | resilience | P2 |  | manual (not automated) | not run (manual) |  |  |
| TC-WRK-DST-001 | Streak and "day" at midnight and DST | boundary | P1 | BR-10 | manual (not automated) | not run (manual) |  |  |
| TC-WRK-DRAFT-001 | An unfinished workout from an hour ago is restored | resilience | P1 | BR-17 | automated | not executed | passed |  |
| TC-WRK-DRAFT-002 | A draft older than 12 hours is ignored | resilience | P1 | BR-17 | automated | not executed | passed |  |
| TC-WRK-DRAFT-003 | A session clock older than 12 hours is ignored | resilience | P2 | BR-17 | automated | not executed | passed |  |
| TC-WRK-DRAFT-004 | Opening the app does not refresh the draft timestamp | resilience | P2 | BR-17 | automated | not executed | passed |  |

<details><summary>Steps and expected results</summary>

**TC-WRK-FINISH-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Open /app → Observe Finish → Complete set 2
- Expected: Disabled then enabled
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-SET-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Complete set 2 (40x10) → Undo
- Expected: 400 kg total lifted, then 0 kg; aria-pressed follows
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-SET-002** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Complete a set → +30s → Skip
- Expected: Rest bar shows; seconds rise by about 30; bar hides
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-SET-003** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Set reps 0 → Complete set
- Expected: 0 kg total; Finish stays disabled
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-SET-004** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Set weight 0 → Complete set
- Expected: Finish enabled; 0 kg total
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-BND-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Type 5000 in weight → Blur
- Expected: 1000
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-BND-002** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Type 999 in reps → Blur
- Expected: 200
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-BND-003** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Type -5 in weight → Blur
- Expected: Value is 0 or more
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-BND-004** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Click Increase weight → Decrease reps
- Expected: 42.5 and 9
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-ADD-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Click Add Set
- Expected: Row count +1
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-REM-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Click Remove exercise
- Expected: Heading gone
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-NAME-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Rename → Complete a set → Finish
- Expected: History title equals the new name
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-FIN-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Complete set → Finish
- Expected: Dialog with volume, duration and PR list; 1 stored workout; History tab opens on close
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-FIN-002** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Finish → Go back to Workout
- Expected: Finish disabled
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-FIN-003** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Complete a set → Double-click Finish
- Expected: 1 stored workout
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-PR-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Finish with set 4 → Next session set 2 is prefilled the same → Finish
- Expected: No "New Personal Records Broken"
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-LAST-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Complete set 2 only → Finish → Open Workout
- Expected: Set 2 prefilled with 40 kg (the done set)
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-LB-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Set unit lb → Open Workout
- Expected: Weight input 88.2
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-LB-002** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Set unit lb → Read column header
- Expected: Header contains lb
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-TIMER-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Start → Advance 5 s → Pause → Advance 5 s
- Expected: 00:05 and stays 00:05
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-REFRESH-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Complete a set → Reload
- Expected: Set still completed
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-REFRESH-002** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Start clock → Advance 65 s → Reload
- Expected: About 01:0x shown; Start/Resume offered
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-PERSIST-002** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Complete sets → Kill the tab → Reopen
- Expected: Sets restored

**TC-WRK-LOC-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Type 42,5 in weight
- Expected: Value 42.5
- Note: Not run: locale input behaviour not yet probed

**TC-WRK-PERF-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Seed 500 workouts → Open app → Complete a set
- Expected: Interaction under 100 ms

**TC-WRK-DST-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Workout at 23:59 and 00:01 local; across a DST change
- Expected: Streak counts calendar days correctly
- Note: Covered at unit level in web/test/domain.test.js (run outside Playwright)

**TC-WRK-DRAFT-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Seed a 1 h old draft → Open /app
- Expected: Draft exercise shown
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-DRAFT-002** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Seed a 13 h old draft → Open /app
- Expected: Starter session shown
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-DRAFT-003** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Seed a 13 h old clock → Open /app
- Expected: Clock reads 00:00
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-WRK-DRAFT-004** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Seed a draft → Open /app → Read savedAt
- Expected: Unchanged
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

</details>

## Routines

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-RTN-SAVE-001 | A routine can be saved, listed and deleted (with confirm) | positive | P1 | BR-14 | automated | passed | passed |  |
| TC-RTN-LIMIT-001 | Routine cap of 30 and 20 exercises each | boundary | P2 | BR-14 | manual (not automated) | not run (manual) |  |  |
| TC-RTN-LOAD-001 | Loading a routine asks before replacing completed sets | data-integrity | P1 |  | manual (not automated) | not run (manual) |  |  |

<details><summary>Steps and expected results</summary>

**TC-RTN-SAVE-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Save as routine → Name → Save → Delete → Confirm
- Expected: Chip appears then disappears
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-RTN-LIMIT-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Save 31 routines
- Expected: Oldest or new is refused per rule

**TC-RTN-LOAD-001** (Guest (dev) / signed-in user; /app (Workout tab))
- Steps: Complete a set → Load routine
- Expected: Confirm dialog appears

</details>

## Exercise picker

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-PICK-ADD-001 | Add marks the row Added; Done puts it in the workout | positive | P0 |  | automated | passed | passed |  |
| TC-PICK-A11Y-001 | Add button announces the Added state | a11y | P2 |  | automated | defect-confirmed | passed | DEF-005 |
| TC-PICK-FAV-001 | Favorite star toggles and is stored | positive | P2 | BR-13 | automated | passed | passed |  |
| TC-PICK-FILTER-001 | Chest chip reduces the count below 106 | positive | P2 |  | automated | passed | passed |  |
| TC-PICK-SEARCH-001 | Searching narrows the list to Results | positive | P2 |  | automated | passed | passed |  |
| TC-PICK-ESC-001 | Escape closes the picker | a11y | P2 |  | automated | passed | passed |  |

<details><summary>Steps and expected results</summary>

**TC-PICK-ADD-001** (Guest (dev) / signed-in user; /app (modal))
- Steps: Open picker → Add → Done
- Expected: Exercise heading appears in the workout
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-PICK-A11Y-001** (Guest (dev) / signed-in user; /app (modal))
- Steps: Add an exercise → Read the button name
- Expected: Name includes Added
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-PICK-FAV-001** (Guest (dev) / signed-in user; /app (modal))
- Steps: Press the star
- Expected: aria-pressed true; stored in fitlog_userdata
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-PICK-FILTER-001** (Guest (dev) / signed-in user; /app (modal))
- Steps: Click Chest
- Expected: All exercises count changes
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-PICK-SEARCH-001** (Guest (dev) / signed-in user; /app (modal))
- Steps: Search "face pull"
- Expected: Heading becomes Results (n)
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-PICK-ESC-001** (Guest (dev) / signed-in user; /app (modal))
- Steps: Open picker → Escape
- Expected: Dialog hidden
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

</details>

## Exercise explorer

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-LIB-COUNT-001 | Library reports 106 movements | positive | P2 |  | automated | passed | passed |  |
| TC-LIB-FILTER-001 | Choosing Back replaces the chest results | positive | P2 |  | automated | passed | passed |  |
| TC-LIB-SEARCH-001 | Searching by name finds the exercise | positive | P1 |  | automated | passed | passed |  |
| TC-LIB-SEARCH-002 | No match shows nothing to add | negative | P2 |  | automated | passed | passed |  |
| TC-LIB-SEARCH-003 | Markup in search never runs | security | P1 |  | automated | passed | passed |  |
| TC-LIB-EQ-001 | Bodyweight pill narrows results | positive | P2 |  | automated | passed | passed |  |
| TC-LIB-ADD-001 | Adding from the explorer puts it in today's workout | positive | P1 |  | automated | passed | passed |  |

<details><summary>Steps and expected results</summary>

**TC-LIB-COUNT-001** (Guest (dev) / signed-in user; /app (Explorer tab))
- Steps: Open Explorer
- Expected: Heading says 106 movements
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LIB-FILTER-001** (Guest (dev) / signed-in user; /app (Explorer tab))
- Steps: Click Back
- Expected: Chest-only exercise disappears
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LIB-SEARCH-001** (Guest (dev) / signed-in user; /app (Explorer tab))
- Steps: Search "face pull"
- Expected: A Face Pull heading shows
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LIB-SEARCH-002** (Guest (dev) / signed-in user; /app (Explorer tab))
- Steps: Search "zzqqxx"
- Expected: No add buttons
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LIB-SEARCH-003** (Guest (dev) / signed-in user; /app (Explorer tab))
- Steps: Search an <img onerror> string
- Expected: No script runs
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LIB-EQ-001** (Guest (dev) / signed-in user; /app (Explorer tab))
- Steps: Click Bodyweight
- Expected: Incline Push-Up shown; Incline Dumbbell Press hidden
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-LIB-ADD-001** (Guest (dev) / signed-in user; /app (Explorer tab))
- Steps: Add to Current Session → Open Workout
- Expected: Heading present
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

</details>

## History

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-HIST-LIST-001 | Workouts listed newest first with a pending-sync badge | positive | P1 |  | automated | passed | passed |  |
| TC-HIST-PAGE-001 | History shows 30 workouts at a time; Show more reveals the rest | boundary | P1 |  | automated | not executed | passed |  |
| TC-HIST-XSS-001 | Markup in a workout title is shown as text | security | P0 |  | automated | passed | passed |  |
| TC-HIST-CORRUPT-001 | Corrupt stored history does not crash the app | resilience | P1 |  | automated | passed | passed |  |

<details><summary>Steps and expected results</summary>

**TC-HIST-LIST-001** (Guest (dev) / signed-in user; /app (History tab))
- Steps: Seed 2 workouts → Open History
- Expected: Order Push A, Pull B; Waiting to sync badge
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-HIST-PAGE-001** (Guest (dev) / signed-in user; /app (History tab))
- Steps: Seed 45 workouts → Open History → Click Show more
- Expected: 30 cards, then 45; button gone
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-HIST-XSS-001** (Guest (dev) / signed-in user; /app (History tab))
- Steps: Seed a workout titled with <img onerror> → Open History
- Expected: Title visible as text; no script
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-HIST-CORRUPT-001** (Guest (dev) / signed-in user; /app (History tab))
- Steps: Seed invalid JSON → Open History
- Expected: Screen still renders
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

</details>

## NAV

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-NAV-CHUNK-001 | A missing app file after a deploy reloads once, then the app loads | resilience | P0 |  | automated | not executed | passed |  |
| TC-NAV-CHUNK-002 | Still missing after one retry: error screen with Reload, no loop | resilience | P1 |  | automated | not executed | passed |  |

<details><summary>Steps and expected results</summary>

**TC-NAV-CHUNK-001** (; )
- Steps: Serve the home page for the app file once → Open /app
- Expected: One reload; app loads; flag cleared
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-NAV-CHUNK-002** (; )
- Steps: Always serve the home page for the app file
- Expected: Something went wrong screen; 2 requests only
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

</details>

## Progress

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-ANA-KPI-001 | Progress totals come from logged workouts | positive | P1 | BR-02 | automated | passed | passed |  |
| TC-ANA-WEEK-001 | Weekly muscle bars count completed sets in the last 7 days | positive | P2 | BR-11 | automated | passed | passed |  |
| TC-ANA-EMPTY-001 | No workouts: empty state with a Log a workout button | positive | P2 |  | automated | passed | passed |  |

<details><summary>Steps and expected results</summary>

**TC-ANA-KPI-001** (Guest (dev) / signed-in user; /app (Progress tab))
- Steps: Seed 2 workouts → Open Progress
- Expected: All-time volume 3,600 kg; est. max 53.3 kg (Epley)
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-ANA-WEEK-001** (Guest (dev) / signed-in user; /app (Progress tab))
- Steps: Seed → Open Progress
- Expected: Chest 2 / 12 sets; progressbar present
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-ANA-EMPTY-001** (Guest (dev) / signed-in user; /app (Progress tab))
- Steps: Open Progress on a clean device
- Expected: Button visible
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

</details>

## Settings

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-SET-UNIT-001 | Switching to lb is saved and shown in the workout | positive | P1 | BR-07 | automated | passed | passed |  |
| TC-SET-REST-001 | Chosen rest time drives the rest timer | positive | P1 | BR-09 | automated | passed | passed |  |
| TC-SET-SW-001 | Vibration switch toggles and is saved | positive | P3 |  | automated | passed | passed |  |
| TC-SET-A11Y-001 | Every settings switch has an accessible name | a11y | P2 |  | automated | defect-confirmed | passed | DEF-004 |
| TC-SET-EXP-001 | Export my data downloads a parseable JSON file | data-integrity | P1 |  | automated | passed | passed |  |
| TC-SET-GUEST-001 | Guest sees the guest label and no Sign out | auth | P2 |  | automated | passed | passed |  |

<details><summary>Steps and expected results</summary>

**TC-SET-UNIT-001** (Guest (dev) / signed-in user; /app (Settings tab))
- Steps: Settings → lb → Workout
- Expected: fitlog_settings.unit=lb; 88.2 shown
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-SET-REST-001** (Guest (dev) / signed-in user; /app (Settings tab))
- Steps: Settings → 2:00 min → Complete a set
- Expected: restSeconds=120; bar shows 11x-12x s
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-SET-SW-001** (Guest (dev) / signed-in user; /app (Settings tab))
- Steps: Click Vibration
- Expected: Unchecked; haptics=false
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-SET-A11Y-001** (Guest (dev) / signed-in user; /app (Settings tab))
- Steps: Open Settings → Find the chime switch by name
- Expected: Named switch exists
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-SET-EXP-001** (Guest (dev) / signed-in user; /app (Settings tab))
- Steps: Seed → Export my data
- Expected: Download .json containing the workout
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-SET-GUEST-001** (Guest (dev) / signed-in user; /app (Settings tab))
- Steps: Open Settings as guest
- Expected: Guest on this device; no Sign out
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

</details>

## AI companion

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-COMP-OPEN-001 | Companion opens from the floating button and closes on Escape | positive | P1 |  | automated | passed | passed |  |
| TC-COMP-CHIPS-001 | Three starter prompts are offered | positive | P3 |  | automated | passed | passed |  |
| TC-COMP-REPLY-001 | Reply shown and memory note saved | positive | P1 | BR-14 | automated | blocked | passed |  |
| TC-COMP-ACT-001 | add_exercise action adds the exercise | positive | P1 | BR-18 | automated | blocked | passed |  |
| TC-COMP-ACT-002 | Unknown model actions are ignored | security | P0 | BR-18 | automated | blocked | passed |  |
| TC-COMP-ERR-001 | Busy coach shows a retry message and chat stays usable | resilience | P1 |  | automated | blocked | passed |  |
| TC-COMP-ERR-002 | Hourly limit shows its own message | resilience | P2 |  | automated | blocked | passed |  |
| TC-COMP-XSS-001 | Markup in a coach reply is shown as text | security | P0 |  | automated | blocked | passed |  |
| TC-COMP-GUARD-001 | Browser never calls Gemini or sends an API key | security | P0 |  | automated | blocked | passed |  |
| TC-COMP-PHOTO-001 | Photo attach limit of 3, EXIF stripped | boundary | P2 |  | manual (not automated) | not run (manual) |  |  |
| TC-COMP-PLAN-001 | Build my plan then Use today replaces today's workout | positive | P1 |  | manual (not automated) | not run (manual) |  |  |
| TC-COMP-MEM-001 | Memory view: edit name, remove a note, Forget all | positive | P2 | BR-14 | manual (not automated) | not run (manual) |  |  |
| TC-COMP-LIVE-001 | Real Gemini coach answers within limits | positive | P2 |  | blocked | blocked (not run) |  |  |

<details><summary>Steps and expected results</summary>

**TC-COMP-OPEN-001** (Signed-in user; /app (dialog))
- Steps: Click Buddy → Escape
- Expected: Dialog and log shown, then hidden
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-COMP-CHIPS-001** (Signed-in user; /app (dialog))
- Steps: Open Buddy
- Expected: Build my plan, What should I train today?, Review my progress
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-COMP-REPLY-001** (Signed-in user; /app (dialog))
- Steps: Mock a reply with a note → Send
- Expected: Reply visible; note stored
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-COMP-ACT-001** (Signed-in user; /app (dialog))
- Steps: Mock an add_exercise action → Send
- Expected: Exercise heading in workout
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-COMP-ACT-002** (Signed-in user; /app (dialog))
- Steps: Mock {type: delete_all_data} → Send
- Expected: Nothing changes
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-COMP-ERR-001** (Signed-in user; /app (dialog))
- Steps: Mock 503 busy → Send
- Expected: Busy message; input enabled
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-COMP-ERR-002** (Signed-in user; /app (dialog))
- Steps: Mock 429 rate-limited → Send
- Expected: Hourly limit message
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-COMP-XSS-001** (Signed-in user; /app (dialog))
- Steps: Mock an <img onerror> reply → Send
- Expected: Shown as text; no script
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-COMP-GUARD-001** (Signed-in user; /app (dialog))
- Steps: Send a message → Inspect requests
- Expected: No generativelanguage.googleapis.com or key= requests
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-COMP-PHOTO-001** (Signed-in user; /app (dialog))
- Steps: Attach 4 photos
- Expected: Only 3 accepted; re-encoded JPEG

**TC-COMP-PLAN-001** (Signed-in user; /app (dialog))
- Steps: Build my plan → Use today
- Expected: Workout replaced
- Depends on: DEF-007

**TC-COMP-MEM-001** (Signed-in user; /app (dialog))
- Steps: Open Memory → edit → forget
- Expected: Changes stored

**TC-COMP-LIVE-001** (Signed-in user; /app (dialog))
- Steps: Send a real message in a deployed environment
- Expected: Valid JSON reply
- Note: Needs the deployed function and a Gemini key; not run

</details>

## Cloud sync

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-SYNC-TOKEN-001 | A signed-in user's profile request reaches the API with a token | auth | P0 |  | automated | defect-confirmed | passed | DEF-007 |
| TC-SYNC-UP-001 | Finished workout uploads once with sets and records | data-integrity | P0 | BR-15 | automated | blocked | passed |  |
| TC-SYNC-OFF-001 | API unreachable: workout stays queued, uploads on reconnect | resilience | P0 |  | automated | blocked | passed |  |
| TC-SYNC-RACE-001 | A workout finished during another upload is still uploaded | data-integrity | P0 |  | automated | not executed | passed |  |
| TC-SYNC-4XX-001 | Permanent 400 flags the workout and stops retrying | resilience | P1 |  | automated | blocked | passed |  |
| TC-SYNC-5XX-001 | 500 keeps the workout queued and never loses it | resilience | P0 |  | automated | blocked | passed |  |
| TC-SYNC-PULL-001 | Workouts from another device appear once | data-integrity | P1 | BR-15 | automated | blocked | passed |  |
| TC-SYNC-RT-001 | Live update from another device | positive | P2 |  | blocked | blocked (not run) |  |  |
| TC-SYNC-MERGE-001 | Three-way merge of routines and memory | data-integrity | P1 | BR-15 | manual (not automated) | not run (manual) |  |  |

<details><summary>Steps and expected results</summary>

**TC-SYNC-TOKEN-001** (Signed-in user; /app)
- Steps: Mock session → Open /app
- Expected: GET /me is sent
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-SYNC-UP-001** (Signed-in user; /app)
- Steps: Finish a workout
- Expected: One PUT /workouts/<uuid>; queue empties
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-SYNC-OFF-001** (Signed-in user; /app)
- Steps: API offline → Finish → Back online
- Expected: Queue 1 then 0; history 1
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-SYNC-RACE-001** (Signed-in user; /app)
- Steps: Slow PUT 1.5 s → Finish workout A → Finish workout B while A uploads
- Expected: Two workouts stored on the server; queue empty
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-SYNC-4XX-001** (Signed-in user; /app)
- Steps: Mock 400 → Finish
- Expected: syncFailed=true; queue empty
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-SYNC-5XX-001** (Signed-in user; /app)
- Steps: Mock 500 → Finish
- Expected: Queue 1; history 1
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-SYNC-PULL-001** (Signed-in user; /app)
- Steps: Server has a workout → Sign in
- Expected: One matching card in History
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-SYNC-RT-001** (Signed-in user; /app)
- Steps: Edit on device A
- Expected: Device B updates without refresh
- Note: Needs the Neon Realtime service; not run

**TC-SYNC-MERGE-001** (Signed-in user; /app)
- Steps: Edit on two devices
- Expected: Additions kept; deletions stick
- Note: Covered at unit level in web/test/sync.test.js (run outside Playwright)

</details>

## Responsive layout

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-RESP-NAV-001 | Five tabs form a bottom bar on a phone | positive | P1 |  | automated | passed | passed |  |
| TC-RESP-OVF-001 | Workout screen does not scroll sideways on a phone | positive | P1 |  | automated | defect-confirmed | passed | DEF-010 |
| TC-RESP-OVF-002 | Landing page does not scroll sideways on a phone | positive | P2 |  | automated | passed | passed |  |
| TC-RESP-SCALE-001 | At 130% text the workout screen does not scroll sideways | a11y | P1 |  | automated | defect-confirmed | passed | DEF-010 |
| TC-RESP-DRAWER-001 | Plate Loader & Coach opens a dialog on a phone | positive | P2 |  | automated | passed | passed |  |
| TC-RESP-TAP-001 | Tap targets are at least 44 px | a11y | P2 |  | automated | defect-confirmed | passed | DEF-011 |

<details><summary>Steps and expected results</summary>

**TC-RESP-NAV-001** (Guest (dev); / and /app on a phone)
- Steps: Open /app on 412 px
- Expected: Bottom bar with 5 buttons
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-RESP-OVF-001** (Guest (dev); / and /app on a phone)
- Steps: Open /app on 412 px
- Expected: No horizontal scroll
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-RESP-OVF-002** (Guest (dev); / and /app on a phone)
- Steps: Open / on 412 px
- Expected: No horizontal scroll
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-RESP-SCALE-001** (Guest (dev); / and /app on a phone)
- Steps: Set 130% font size → Open /app
- Expected: No horizontal scroll
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-RESP-DRAWER-001** (Guest (dev); / and /app on a phone)
- Steps: Tap the button
- Expected: Dialog visible
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-RESP-TAP-001** (Guest (dev); / and /app on a phone)
- Steps: Measure set controls, tabs, Buddy button
- Expected: All 44 px or more
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

</details>

## Security

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-SEC-ISO-001 | One user cannot read or overwrite another user's data | security | P0 |  | manual (not automated) | not run (manual) |  |  |
| TC-SEC-HDR-001 | CSP and security headers on the deployed site | security | P1 |  | blocked | blocked (not run) |  |  |
| TC-SEC-SECRET-001 | No secret in the shipped bundle | security | P0 |  | manual (not automated) | not run (manual) |  |  |

<details><summary>Steps and expected results</summary>

**TC-SEC-ISO-001** (Various; n/a)
- Steps: API calls with user A token for user B ids
- Expected: 404 / empty; no leak
- Note: Covered by web/test/api.test.js against a live database (not run in this session to avoid touching the real project)

**TC-SEC-HDR-001** (Various; n/a)
- Steps: Request the deployed site headers
- Expected: CSP, nosniff, frame protections present
- Note: Headers come from netlify.toml and are absent on the dev server; needs a deployed URL

**TC-SEC-SECRET-001** (Various; n/a)
- Steps: Build → search dist for key patterns
- Expected: No DATABASE_URL, Gemini or realtime secret

</details>

## PWA and offline

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-PWA-001 | Service worker caches the app shell for offline start | resilience | P2 |  | blocked | blocked (not run) |  |  |
| TC-PWA-002 | Install prompt in Settings | positive | P3 |  | manual (not automated) | not run (manual) |  |  |

<details><summary>Steps and expected results</summary>

**TC-PWA-001** (Any; n/a)
- Steps: Build → preview → go offline → reload
- Expected: Shell loads
- Note: Service worker registers only in production builds

**TC-PWA-002** (Any; n/a)
- Steps: Open on an installable browser
- Expected: Install card shown

</details>

## Accessibility

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-A11Y-SR-001 | Screen-reader walkthrough of workout logging | a11y | P1 |  | manual (not automated) | not run (manual) |  |  |
| TC-A11Y-AXE-001 | Landing page has no axe WCAG A/AA violations | a11y | P1 |  | automated | not executed | passed |  |
| TC-A11Y-AXE-002 | Each app tab has no axe WCAG A/AA violations | a11y | P1 |  | automated | not executed | passed |  |
| TC-A11Y-KEY-001 | Whole logging flow works with keyboard only | a11y | P1 |  | manual (not automated) | not run (manual) |  |  |

<details><summary>Steps and expected results</summary>

**TC-A11Y-SR-001** (Any; various)
- Steps: Log a set with NVDA or VoiceOver
- Expected: Every control announced with name and state

**TC-A11Y-AXE-001** (Any; various)
- Steps: Open / → Run axe-core
- Expected: Zero violations
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-A11Y-AXE-002** (Any; various)
- Steps: Open each of 5 tabs → Run axe-core
- Expected: Zero violations
- Note: Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)

**TC-A11Y-KEY-001** (Any; various)
- Steps: Tab through the workout
- Expected: All controls reachable with visible focus

</details>

## BROWSER

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-BROWSER-001 | Firefox and Safari (WebKit) behaviour | positive | P2 |  | blocked | blocked (not run) |  |  |

<details><summary>Steps and expected results</summary>

**TC-BROWSER-001** (; )
- Steps: Run the suite on other engines
- Expected: Same results
- Note: Only Microsoft Edge (Chromium) is installed; other engines were not run

</details>

## Domain rules and data integrity

| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |
|---|---|---|---|---|---|---|---|---|
| TC-DATA-001 | Domain rules: volume, Epley, PR, streak, unit conversion | data-integrity | P0 | BR-02..BR-11 | manual (not automated) | not run (manual) |  |  |

<details><summary>Steps and expected results</summary>

**TC-DATA-001** (n/a; n/a (unit level))
- Steps: Run node:test domain suites
- Expected: All pass
- Note: Run separately with npm test (offline files only in this session)

</details>

