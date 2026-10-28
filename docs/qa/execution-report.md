# Execution report

All numbers below were read from Playwright's JSON output (`docs/qa/results/baseline.json`). Nothing was estimated.

## Baseline run: unmodified app
- Command: `cd web && npx playwright test`
- Playwright 1.64.1; browser: Microsoft Edge (Chromium channel); 4 workers; no retries
- Started: 2026-10-27T17:36:53.041Z; duration: 369 s
- **Expected (passed as designed): 104**, **Unexpected (failed): 0**, **Flaky: 0**, **Skipped (blocked): 17**
- Of the "expected" results, tests whose title carries a [DEF-xxx] tag are written to fail on a known defect (`test.fail`) and are reported as *defect confirmed*.

## Final run: whole suite after the fixes
- Command: `npx playwright test` (2 workers, no retries)
- Expected 129, unexpected 0, flaky 0, skipped 0; duration 342 s

## Unexpected failures (baseline)
None.

## Skipped / blocked tests (baseline)
- TC-AUTH-GUARD-003: Blocked by DEF-007 (API token not found once the session is cached)
- TC-AUTH-GUARD-004: Blocked by DEF-007 (API token not found once the session is cached)
- TC-AUTH-SIGNIN-003: Blocked by DEF-007 (API token not found once the session is cached)
- TC-AUTH-SIGNIN-004: Blocked by DEF-007 (API token not found once the session is cached)
- TC-AUTH-SIGNIN-005: Blocked by DEF-007 (API token not found once the session is cached)
- TC-COMP-REPLY-001: Blocked by DEF-007 (API token not found once the session is cached)
- TC-COMP-ACT-001: Blocked by DEF-007 (API token not found once the session is cached)
- TC-COMP-ACT-002: Blocked by DEF-007 (API token not found once the session is cached)
- TC-COMP-ERR-001: Blocked by DEF-007 (API token not found once the session is cached)
- TC-COMP-ERR-002: Blocked by DEF-007 (API token not found once the session is cached)
- TC-COMP-XSS-001: Blocked by DEF-007 (API token not found once the session is cached)
- TC-COMP-GUARD-001: Blocked by DEF-007 (API token not found once the session is cached)
- TC-SYNC-UP-001: Blocked by DEF-007 (API token not found once the session is cached)
- TC-SYNC-OFF-001: Blocked by DEF-007 (API token not found once the session is cached)
- TC-SYNC-4XX-001: Blocked by DEF-007 (API token not found once the session is cached)
- TC-SYNC-5XX-001: Blocked by DEF-007 (API token not found once the session is cached)
- TC-SYNC-PULL-001: Blocked by DEF-007 (API token not found once the session is cached)

## Defects confirmed by tests (baseline)
- TC-LAND-A11Y-001: [DEF-009] the chosen bar weight is exposed to assistive technology
- TC-PICK-A11Y-001: [DEF-005] the Add button announces the Added state
- TC-SET-A11Y-001: [DEF-004] every settings switch has an accessible name
- TC-WRK-LAST-001: [DEF-003] only completed sets feed the next session prefill
- TC-WRK-LB-002: [DEF-002] the weight column header says lb when the unit is pounds
- TC-WRK-REFRESH-001: [DEF-001] a completed set survives a page refresh
- TC-AUTH-MSG-001: [DEF-006] a wrong password shows the app own plain message
- TC-AUTH-RESET-001: [DEF-008] Forgot password sends a reset request and tells the user to check email
- TC-SYNC-TOKEN-001: [DEF-007] a signed-in user profile request reaches the API with a token
- TC-RESP-OVF-001: [DEF-010] the workout screen does not scroll sideways
- TC-RESP-SCALE-001: [DEF-010] at 130% text size the workout screen still does not scroll sideways
- TC-RESP-TAP-001: [DEF-011] the set controls and tabs are at least 44 px tall and wide

## Every executed test (baseline)

| ID | Project | Result | ms |
|---|---|---|---|
| TC-ANA-EMPTY-001 | guest | passed | 5588 |
| TC-ANA-KPI-001 | guest | passed | 5614 |
| TC-ANA-WEEK-001 | guest | passed | 5585 |
| TC-AUTH-DLG-001 | auth | passed | 4894 |
| TC-AUTH-DLG-002 | auth | passed | 5962 |
| TC-AUTH-DLG-003 | auth | passed | 3872 |
| TC-AUTH-DLG-004 | auth | passed | 4103 |
| TC-AUTH-GUARD-001 | auth | passed | 6554 |
| TC-AUTH-GUARD-002 | auth | passed | 2101 |
| TC-AUTH-GUARD-003 | auth | blocked | 483 |
| TC-AUTH-GUARD-004 | auth | blocked | 515 |
| TC-AUTH-MSG-001 | auth | defect-confirmed | 12080 |
| TC-AUTH-OUT-001 | auth | passed | 5754 |
| TC-AUTH-OUT-002 | auth | passed | 5241 |
| TC-AUTH-OUT-003 | auth | passed | 5426 |
| TC-AUTH-RESET-001 | auth | defect-confirmed | 13484 |
| TC-AUTH-RESET-002 | auth | passed | 5193 |
| TC-AUTH-RESET-003 | auth | passed | 4511 |
| TC-AUTH-RESET-004 | auth | passed | 2693 |
| TC-AUTH-SIGNIN-001 | auth | passed | 4697 |
| TC-AUTH-SIGNIN-002 | auth | passed | 4895 |
| TC-AUTH-SIGNIN-003 | auth | blocked | 543 |
| TC-AUTH-SIGNIN-004 | auth | blocked | 557 |
| TC-AUTH-SIGNIN-005 | auth | blocked | 508 |
| TC-AUTH-SIGNIN-006 | auth | passed | 3338 |
| TC-AUTH-SIGNUP-001 | auth | passed | 3217 |
| TC-AUTH-SIGNUP-002 | auth | passed | 5686 |
| TC-AUTH-SIGNUP-003 | auth | passed | 5188 |
| TC-AUTH-VAL-001 | auth | passed | 4016 |
| TC-AUTH-VAL-002 | auth | passed | 4114 |
| TC-AUTH-VAL-002 | auth | passed | 4180 |
| TC-AUTH-VAL-002 | auth | passed | 4231 |
| TC-AUTH-VAL-002 | auth | passed | 4204 |
| TC-AUTH-VAL-003 | auth | passed | 5017 |
| TC-COMP-ACT-001 | auth | blocked | 528 |
| TC-COMP-ACT-002 | auth | blocked | 511 |
| TC-COMP-CHIPS-001 | auth | passed | 3027 |
| TC-COMP-ERR-001 | auth | blocked | 541 |
| TC-COMP-ERR-002 | auth | blocked | 499 |
| TC-COMP-GUARD-001 | auth | blocked | 560 |
| TC-COMP-OPEN-001 | auth | passed | 2910 |
| TC-COMP-REPLY-001 | auth | blocked | 574 |
| TC-COMP-XSS-001 | auth | blocked | 530 |
| TC-HIST-CORRUPT-001 | guest | passed | 5360 |
| TC-HIST-LIST-001 | guest | passed | 5428 |
| TC-HIST-XSS-001 | guest | passed | 5488 |
| TC-LAND-404-001 | guest | passed | 6623 |
| TC-LAND-A11Y-001 | guest | defect-confirmed | 11927 |
| TC-LAND-ANAT-001 | guest | passed | 2989 |
| TC-LAND-CALC-001 | guest | passed | 5411 |
| TC-LAND-CALC-002 | guest | passed | 5790 |
| TC-LAND-CTA-001 | guest | passed | 4056 |
| TC-LAND-FAQ-001 | guest | passed | 2578 |
| TC-LAND-HDR-001 | guest | passed | 3784 |
| TC-LAND-HERO-001 | guest | passed | 5271 |
| TC-LAND-NAV-001 | guest | passed | 6303 |
| TC-LAND-NAV-002 | guest | passed | 4755 |
| TC-LAND-NAV-003 | guest | passed | 4545 |
| TC-LAND-SEO-001 | guest | passed | 6223 |
| TC-LIB-ADD-001 | guest | passed | 5760 |
| TC-LIB-COUNT-001 | guest | passed | 6276 |
| TC-LIB-EQ-001 | guest | passed | 5183 |
| TC-LIB-FILTER-001 | guest | passed | 6526 |
| TC-LIB-SEARCH-001 | guest | passed | 5871 |
| TC-LIB-SEARCH-002 | guest | passed | 5631 |
| TC-LIB-SEARCH-003 | guest | passed | 5047 |
| TC-ONB-A11Y-001 | guest | passed | 3582 |
| TC-ONB-A11Y-002 | guest | passed | 3921 |
| TC-ONB-BACK-001 | guest | passed | 5697 |
| TC-ONB-BND-001 | guest | passed | 5572 |
| TC-ONB-BND-001 | guest | passed | 8577 |
| TC-ONB-BND-001 | guest | passed | 6850 |
| TC-ONB-BND-001 | guest | passed | 7748 |
| TC-ONB-BND-002 | guest | passed | 7632 |
| TC-ONB-FLOW-001 | guest | passed | 7427 |
| TC-ONB-SKIP-001 | guest | passed | 4938 |
| TC-PICK-A11Y-001 | guest | defect-confirmed | 13156 |
| TC-PICK-ADD-001 | guest | passed | 5675 |
| TC-PICK-ESC-001 | guest | passed | 6468 |
| TC-PICK-FAV-001 | guest | passed | 6231 |
| TC-PICK-FILTER-001 | guest | passed | 4654 |
| TC-PICK-SEARCH-001 | guest | passed | 3364 |
| TC-RESP-DRAWER-001 | phone | passed | 3192 |
| TC-RESP-NAV-001 | phone | passed | 5936 |
| TC-RESP-OVF-001 | phone | defect-confirmed | 5949 |
| TC-RESP-OVF-002 | phone | passed | 3068 |
| TC-RESP-SCALE-001 | phone | defect-confirmed | 3417 |
| TC-RESP-TAP-001 | phone | defect-confirmed | 3161 |
| TC-RTN-SAVE-001 | guest | passed | 6409 |
| TC-SET-A11Y-001 | guest | defect-confirmed | 13025 |
| TC-SET-EXP-001 | guest | passed | 8251 |
| TC-SET-GUEST-001 | guest | passed | 5150 |
| TC-SET-REST-001 | guest | passed | 6480 |
| TC-SET-SW-001 | guest | passed | 5384 |
| TC-SET-UNIT-001 | guest | passed | 6120 |
| TC-SYNC-4XX-001 | auth | blocked | 564 |
| TC-SYNC-5XX-001 | auth | blocked | 550 |
| TC-SYNC-OFF-001 | auth | blocked | 601 |
| TC-SYNC-PULL-001 | auth | blocked | 586 |
| TC-SYNC-TOKEN-001 | auth | defect-confirmed | 10470 |
| TC-SYNC-UP-001 | auth | blocked | 585 |
| TC-WRK-ADD-001 | guest | passed | 7172 |
| TC-WRK-BND-001 | guest | passed | 6865 |
| TC-WRK-BND-002 | guest | passed | 6651 |
| TC-WRK-BND-003 | guest | passed | 5752 |
| TC-WRK-BND-004 | guest | passed | 5916 |
| TC-WRK-FIN-001 | guest | passed | 7748 |
| TC-WRK-FIN-002 | guest | passed | 10000 |
| TC-WRK-FIN-003 | guest | passed | 7123 |
| TC-WRK-FINISH-001 | guest | passed | 5160 |
| TC-WRK-LAST-001 | guest | defect-confirmed | 16985 |
| TC-WRK-LB-001 | guest | passed | 7385 |
| TC-WRK-LB-002 | guest | defect-confirmed | 18587 |
| TC-WRK-NAME-001 | guest | passed | 7321 |
| TC-WRK-PR-001 | guest | passed | 10971 |
| TC-WRK-REFRESH-001 | guest | defect-confirmed | 18699 |
| TC-WRK-REM-001 | guest | passed | 7172 |
| TC-WRK-SET-001 | guest | passed | 6476 |
| TC-WRK-SET-002 | guest | passed | 6310 |
| TC-WRK-SET-003 | guest | passed | 7342 |
| TC-WRK-SET-004 | guest | passed | 7486 |
| TC-WRK-TIMER-001 | guest | passed | 6361 |
