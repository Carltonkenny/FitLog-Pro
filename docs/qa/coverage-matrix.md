# Coverage matrix

Every number below comes from `functional-test-cases.json` joined with Playwright's own result files. "Discovered" means a test case exists in the registry. It does **not** mean the feature is proven correct. Nothing here claims 100% coverage.

## Definitions
- **Discovered**: written test cases.
- **Automated**: a Playwright test with that ID exists.
- **Executed**: the test ran in the baseline run (not skipped).
- **Passed**: executed and its assertions held.
- **Defect confirmed**: executed; written to expect a known defect and the defect was observed (counts as a *finding*, not a pass).
- **Failed**: executed and failed unexpectedly.
- **Blocked**: skipped, or cannot be run in this environment (reason in the case).
- **Not run**: manual cases nobody has executed yet.

## By module (baseline run, unmodified app)

| Module | Discovered | Automated | Executed | Passed | Defect confirmed | Failed | Blocked | Not run (manual) |
|---|---|---|---|---|---|---|---|---|
| Landing page | 13 | 13 | 13 | 12 | 1 | 0 | 0 | 0 |
| Authentication | 32 | 28 | 23 | 21 | 2 | 0 | 8 | 1 |
| Onboarding | 7 | 7 | 7 | 7 | 0 | 0 | 0 | 0 |
| Active workout | 25 | 21 | 21 | 18 | 3 | 0 | 0 | 4 |
| Routines | 3 | 1 | 1 | 1 | 0 | 0 | 0 | 2 |
| Exercise picker | 6 | 6 | 6 | 5 | 1 | 0 | 0 | 0 |
| Exercise explorer | 7 | 7 | 7 | 7 | 0 | 0 | 0 | 0 |
| History | 3 | 3 | 3 | 3 | 0 | 0 | 0 | 0 |
| Progress | 3 | 3 | 3 | 3 | 0 | 0 | 0 | 0 |
| Settings | 6 | 6 | 6 | 5 | 1 | 0 | 0 | 0 |
| AI companion | 13 | 9 | 2 | 2 | 0 | 0 | 8 | 3 |
| Cloud sync | 8 | 6 | 1 | 0 | 1 | 0 | 6 | 1 |
| Responsive layout | 6 | 6 | 6 | 3 | 3 | 0 | 0 | 0 |
| Security | 3 | 0 | 0 | 0 | 0 | 0 | 1 | 2 |
| PWA and offline | 2 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| Accessibility | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 2 |
| BROWSER | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| Domain rules and data integrity | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| **Total** | **143** | **118** | **99** | **87** | **12** | **0** | **25** | **17** |

## Final run after the fixes
The whole suite was run again after the defects were fixed: 118 cases passed, 0 failed, 0 blocked. Auth is still a mocked server, so this does not prove the real Neon Auth.

## Business-rule traceability

| Rule | Cases | Best baseline result |
|---|---|---|
| BR-01 | TC-WRK-SET-003, TC-WRK-SET-004 | passed |
| BR-02 | TC-WRK-SET-001, TC-ANA-KPI-001 | passed |
| BR-02..BR-11 | TC-DATA-001 | not run (manual) |
| BR-03 | TC-WRK-FINISH-001 | passed |
| BR-04 | TC-WRK-BND-001, TC-WRK-BND-002, TC-WRK-BND-003 | passed |
| BR-05 | TC-LAND-CALC-001 | passed |
| BR-06 | TC-WRK-FIN-001, TC-WRK-PR-001 | passed |
| BR-07 | TC-WRK-LB-001, TC-WRK-LB-002, TC-SET-UNIT-001 | passed |
| BR-09 | TC-WRK-SET-002, TC-SET-REST-001 | passed |
| BR-10 | TC-WRK-DST-001 | not run (manual) |
| BR-11 | TC-ANA-WEEK-001 | passed |
| BR-13 | TC-PICK-FAV-001 | passed |
| BR-14 | TC-RTN-SAVE-001, TC-RTN-LIMIT-001, TC-COMP-REPLY-001, TC-COMP-MEM-001 | passed |
| BR-15 | TC-SYNC-UP-001, TC-SYNC-PULL-001, TC-SYNC-MERGE-001 | blocked |
| BR-16 | TC-AUTH-OUT-001, TC-AUTH-OUT-002, TC-AUTH-OUT-003 | passed |
| BR-17 | TC-WRK-REFRESH-001, TC-WRK-PERSIST-002 | defect-confirmed |
| BR-18 | TC-COMP-ACT-001, TC-COMP-ACT-002 | blocked |

Rules with **no** Playwright test case: BR-08, BR-12. Those are covered (or not) only by the unit tests in `web/test`.
