# FitLog Pro: Test Plan & Traceability Matrix
## `audit/02_TEST_PLAN_AND_MATRIX.md`

---

### 1. Requirements Traceability Matrix

| Feature ID | Feature / User Journey | Requirement | Preconditions | Test Scenarios | Risk | Test Method | Evidence | Result | Coverage Gap |
|---|---|---|---|---|---|---|---|---|---|
| **REQ-01** | Epley 1RM Engine | Calculate estimated 1RM using $W \times (1 + R/30)$ rounded to 1 decimal place. | Weight and reps provided. | Positive: standard set (82.5kg x 8 reps = 104.5kg). Boundary: 1 rep = exact weight. Negative: $\le 0$ reps/weight, NaN, negative inputs. | P1 | Automated Unit Tests (Dart & JS) | `fitlog_pro/test/unit/epley_calculator_test.dart`<br>`web/test/adversarial_and_security.test.js` | **PASS** | None |
| **REQ-02** | Personal Record (PR) Invariants | Crown new PR only on true 1RM increase; strictly exclude warmup sets and ties. | Historical PR records exist. | Warmup set (`type: 'W'`) with heavy load rejected. Identical 1RM tie rejected. Lower 1RM rejected. Higher 1RM accepted. | P1 | Automated Unit Tests (Dart & JS) | `fitlog_pro/test/unit/pr_detector_test.dart`<br>`web/test/adversarial_and_security.test.js` | **PASS** | None |
| **REQ-03** | Dynamic Streak Tracking | Maintain active streak across midnight boundaries and multiple daily sessions. | Workout history with UTC timestamps. | Multiple workouts on same day count as 1. Active workout today continues streak. Skipped day resets streak. Leap year / midnight transition. | P1 | Automated Unit Tests (Dart & JS) | `fitlog_pro/test/unit/streak_tracker_test.dart`<br>`web/test/adversarial_and_security.test.js` | **PASS** | None |
| **REQ-04** | Sub-2-Second Thumb Stepper | Step weight by 2.5kg and reps by 1 with zero float precision artifacts. | Active workout screen open. | Tap `+` and `-` steppers. Manual input with direct typing. Floating point precision tie prevention. Prevent negative weights/reps. | P2 | Browser Playwright E2E & Unit Test | `web/src/features/app/components/workout/SetRow.jsx`<br>Playwright screenshot tests | **PASS** | Physical touch screen haptics require physical device |
| **REQ-05** | Cascading Exercise Library | 3-step hierarchical filter (Body Part $\rightarrow$ Sub-region $\rightarrow$ Ranked Movement). | 333+ exercise dataset loaded. | Navigate Chest $\rightarrow$ Upper Chest. Search by keyword "Bench", "Cable", "Upper". Validate all 333+ exercises contain growth scores. | P2 | Unit & Browser Verification | `fitlog_pro/test/unit/exercise_database_test.dart`<br>`web/test/domain_and_sync.test.js` | **PASS** | None |
| **REQ-06** | History-Aware Gemini Coach | AI coach analyzes actual user logs, volume trends, and PRs with clinical fallback. | History seeded or logged. | Query "analyze plateaus", "smart swap", "condense workout". Offline mode fallback. Keyless mode fallback. | P1 | Automated Unit & Browser Verification | `fitlog_pro/test/unit/gemini_coach_service_test.dart`<br>Playwright AI response screenshot | **PASS** | Live Google Gemini quota validation requires paid production key |
| **REQ-07** | Local-First Cloud Sync | Zero-loss offline queue with automatic flush upon online reconnection. | Device switches online/offline. | Save workout offline $\rightarrow$ verify added to sync queue $\rightarrow$ reconnect $\rightarrow$ verify queue flushed. | P0 | Domain Test & Browser Emulation | `web/src/lib/workoutStore.js`<br>`web/test/adversarial_and_security.test.js` | **PASS** | Multi-device concurrent conflict resolution requires live Supabase cluster |
| **REQ-08** | Responsive Studio vs Mobile | Fluid 3-Column Studio on desktop ($\ge 1024\text{px}$); single-column thumb PWA on mobile. | Viewport adjusted between 390px and 1440px. | Desktop layout shows Nav, Diary, Visualizer. Mobile layout hides outer columns and renders bottom nav and slide-up drawer. | P2 | Playwright Multi-Viewport E2E | Screenshots: `mobile-390.png`, `desktop-1440.png`, `tablet-768.png` | **PASS** | None |
| **REQ-09** | Deep Link Authentication | Authenticate incoming mobile app user from web onboarding handoff link. | Web onboarding completed with deep link redirect. | Deep link with valid `token` and `userId` accepted. Deep link missing `token` strictly rejected. | P0 | Static Analysis & Code Audit | `fitlog_pro/lib/core/services/supabase_service.dart` | **PASS** | Native Android intent filter requires real device OS |
| **REQ-10** | Database Row-Level Security | Strict multi-tenant isolation: users can only read and write their own data. | Multiple Supabase auth users. | SELECT, INSERT, UPDATE, DELETE on `profiles`, `workouts`, `workout_sets`, `prs`, `body_stats` with RLS. | P0 | SQL Schema Review & Static Verification | `supabase/schema.sql` (15 RLS policies) | **PASS** | Live multi-tenant automated SQL penetration suite |

---

### 2. Test Execution Counts

```
┌──────────────────────────────────────────────────────────────┐
│                    TEST EXECUTION SUMMARY                    │
├────────────────────────────┬──────────┬──────────┬───────────┤
│ Test Suite                 │ Passed   │ Failed   │ Blocked   │
├────────────────────────────┼──────────┼──────────┼───────────┤
│ Flutter Unit Tests         │ 36       │ 0        │ 0         │
│ Flutter Widget Tests       │ 2        │ 0        │ 0         │
│ Flutter Static Analysis    │ 0 errors │ 0        │ 0         │
│ Web Domain Tests           │ 4        │ 0        │ 0         │
│ Web Adversarial & Security │ 18       │ 0        │ 0         │
│ Playwright E2E Browser     │ 6 runs   │ 0        │ 0         │
├────────────────────────────┼──────────┼──────────┼───────────┤
│ TOTAL AUTOMATED CHECKS     │ 66       │ 0        │ 0         │
└────────────────────────────┴──────────┴──────────┴───────────┘
```
*Note: Test counts reflect unique, non-duplicated test specifications.*
