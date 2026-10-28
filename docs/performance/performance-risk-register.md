# Performance risk register

Status: **Fixed** (changed and re-measured or re-tested), **Open** (not changed), **Unverified** (suspected, not measured).

| ID | Risk | Evidence | Status |
|---|---|---|---|
| R1 | History tab rendered every saved workout. With 500 workouts, switching to History took **859 ms** and the next tab switch 648 ms; worst interaction **520 ms** (INP "poor" is over 500 ms) | Measured on the production build, desktop, no throttling | **Fixed.** Pages of 30 with "Show more". Now 116 ms / 96 ms / worst 88 ms |
| R2 | Render-blocking Google Fonts CSS (13 font weights from 3 families). On a throttled phone it sits on the critical path to first paint | Read from `index.html`; not isolated in a test | **Fixed.** 3 self-hosted variable fonts (Fontsource, OFL-1.1). Phone app LCP 3140 → 2636 ms |
| R3 | One 545 kB bundle for everyone (landing visitors downloaded the whole app) | Build output | **Fixed.** Lazy chunks; landing transfer 176 → 130 kB |
| R4 | Workout upload made one DB call per set (40 sets = 40 round trips) | Code; the new test and live API test prove it still stores the same rows | **Fixed.** One `unnest` insert. Latency gain not timed against Neon |
| R5 | Public `/health` ran a DB query; a bot could keep a scale-to-zero database awake | Code | **Fixed.** No query |
| R6 | Upload queue overwritten while an upload is in flight (data loss, not speed) | Code + new test `TC-SYNC-RACE-001` | **Fixed** |
| R7 | Coach rate limit is in-memory per function instance | Code | **Open, accepted** at beta size |
| R8 | Coach request body can be 6 MB (photos) and is fully buffered before the size check | Code | **Open.** Platform body limits apply first; not tested |
| R9 | Mobile LCP on the app was 3.1 s median (now 2.6 s after R2) (4x CPU, Fast 4G), over the 2.5 s "good" line, with a wide spread (2.6 to 8.1 s) | Lab, 7 runs | **Open.** Fonts (R2) and the 380 kB shared chunk are the likely causes; not proven |
| R10 | Lab TBT on throttled phone landing: median 253 ms, range 90 to 991 ms (high variance) | Lab, 7 runs | **Open.** Needs a profile to find the long task |
| R11 | Per-card scan of history in `getLastSessionForExercise` on every render | Code; complete-set stays 99 to 143 ms at 500 workouts | **Open, low** |
| R12 | No real-user monitoring, no CI performance budget | Inventory | **Open** |
| R13 | API under concurrent load, connection pool sizing, p95/p99 latency | Not measured | **Unverified** |
