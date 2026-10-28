# FitLog Pro: Engineering Fix Log & Audit Trail
## `audit/07_FIX_LOG.md`

---

### 1. Summary of Changes Made During the Gauntlet Audit

| File Changed | Component | Root Cause Addressed | Verification Result |
|---|---|---|---|
| `fitlog_pro/lib/core/services/supabase_service.dart` | Mobile Auth & Deep Linking | Unused `token` variable and potential deep link auth bypass (`SEC-01`, `QA-01`). | `flutter analyze` clean; `token` strictly enforced. |
| `fitlog_pro/lib/features/auth/presentation/screens/auth_screen.dart` | Mobile Auth UI | Missing return type on `Function(String email, String name)` callback (`QA-01`). | `flutter analyze` clean; explicitly typed as `void Function(...)`. |
| `fitlog_pro/lib/features/workout/domain/services/gemini_coach_service.dart` | Mobile AI Coach Service | Redundant `null` init, dynamic calls on JSON candidate tree, and API key exposure in query string (`SEC-03`, `QA-01`). | Clean static analysis; API key transferred via `x-goog-api-key` header; type-safe JSON extraction. |
| `fitlog_pro/lib/features/workout/presentation/screens/active_workout_screen.dart` | Mobile Active Workout Screen | Missing return type on quick stepper modal callback (`QA-01`). | `flutter analyze` clean; explicitly typed as `void Function(...)`. |
| `web/src/lib/workoutStore.js` | Web Local-First Core | 1RM engine returned 100kg on negative reps; Warmups crowned as PRs; streaks were hardcoded (`FN-01`, `FN-02`, `FN-06`). | 1RM bounds verified; Warmups strictly excluded; dynamic streak tracking implemented. |
| `web/src/features/app/hooks/useWorkoutLogger.js` | Web Workout Hook | Warmup sets triggered confetti and PR status; rest timer hardcoded to 90s (`FN-01`, `FN-04`). | Warmup sets excluded; rest timer respects user's saved settings preference. |
| `web/src/features/app/components/workout/SetRow.jsx` | Web Set Row Component | Missing ARIA labels; floating point step precision bugs (`47.50000000000001`); native spin buttons (`FN-03`, `A11Y-01`). | Steppers rounded to 1 decimal place; ARIA labels added; spin buttons hidden in CSS. |
| `web/src/features/app/components/workout/ExerciseCard.jsx` | Web Exercise Card | Potential crash on null `bestSet`; missing ARIA label on trash button; header clipped on small screens (`FN-05`, `A11Y-01`). | `bestSet` null-guarded; ARIA label added; `min-w` applied to Done column. |
| `web/src/features/app/components/modals/FinishModal.jsx` | Web Finish Modal | Potential unhandled TypeError on missing `volumeKg` (`FN-05`). | Nullish coalescing applied: `{(workout?.volumeKg ?? 0).toLocaleString()}`. |
| `web/src/features/app/components/history/HistoryView.jsx` | Web History Timeline | Potential unhandled TypeError on missing `volumeKg` (`FN-05`). | Nullish coalescing applied: `{(wo.volumeKg ?? 0).toLocaleString()}`. |
| `web/src/features/app/components/analytics/AnalyticsView.jsx` | Web Analytics KPI | Static `🔥 3 Days` streak string displayed (`FN-06`). | Replaced with dynamic `WorkoutStore.getStreak()` call. |
| `web/src/features/app/components/settings/SettingsView.jsx` | Web Settings View | Preferences trapped in ephemeral local state and lost upon navigation (`FN-04`). | Persisted to `localStorage` via `WorkoutStore.savePreferences`. |
| `web/src/features/app/components/layout/StudioVisualizer.jsx` | Web Studio Visualizer | Olympic Barbell sleeve shown for non-barbell exercises (`UX-01`). | Contextual equipment guide renders for dumbbells, cables, and bodyweight. |
| `web/vite.config.js` | Web Build Config | Monolithic 610 kB bundle warning (`PERF-01`). | Configured `manualChunks` splitting React, Supabase, animation, and icons into modular chunks. |
| `web/index.html` | Web Entry Point | Missing meta description and security meta tags (`SEC-04`). | Added SEO description, theme color, and CSP meta tags. |
| `web/package.json` | Web NPM Configuration | Only 4 tests executed in test script. | Updated to run both domain tests and adversarial security suite. |
| `web/test/adversarial_and_security.test.js` | Web Automated Tests | Missing adversarial test coverage for PR invariants, boundary values, and streaks. | Created comprehensive 18-test automated suite; all 18 passing. |

---

### 2. Regression Test Evidence

#### Flutter Test Run (`fitlog_pro/`):
```
flutter test
00:04 +38: All tests passed!
```

#### Flutter Static Analysis (`fitlog_pro/`):
```
flutter analyze
Analyzing fitlog_pro...
No issues found! (ran in 7.1s)
```

#### Web Test Run (`web/`):
```
npm test
> fitlog-pro-web@1.0.0 test
> node test/domain_and_sync.test.js && node test/adversarial_and_security.test.js

🧪 Starting FitLog Pro Domain & Verification Tests...
   ✅ 1RM boundary tests passed.
   ✅ All 28 movements validated with plain English ratings and sub-regions.
   ✅ Progressive overload target engine passed.
   ✅ Seeded history verified. Ready for live PostgreSQL sync.
🎉 ALL DOMAIN TESTS PASSED WITH 0 FAILURES!

🛡️ Starting FitLog Pro Adversarial & Security Test Suite...
   ✅ [PASS] Rejects negative weight (-50kg) with 0.0
   ✅ [PASS] Rejects negative reps (-5) with 0.0
   ✅ [PASS] Rejects NaN inputs gracefully with 0.0
   ✅ [PASS] Handles extreme superhuman load (1,000 kg x 30 reps) without overflowing
   ✅ [PASS] Preserves exact decimal weights on 1-rep lift
   ✅ [PASS] Warmup set (type: "W") is NEVER declared a PR even with heavy weight
   ✅ [PASS] Warmup set (type: "warmup") is NEVER declared a PR
   ✅ [PASS] Lower weight and reps is NOT a PR
   ✅ [PASS] Floating-point tie (80.0kg x 5 reps = 93.3kg 1RM) is NOT falsely crowned as a PR
   ✅ [PASS] Legitimate higher 1RM (85kg x 5 reps = 99.2kg) IS crowned as a PR
   ✅ [PASS] Corrupted negative weight or rep does not qualify as PR for new exercise
   ✅ [PASS] Empty history returns 0 streak
   ✅ [PASS] Active workout logged today yields at least 1 day streak
   ✅ [PASS] Multiple workouts on the same day count as single streak day
   ✅ [PASS] Consecutive 3-day history yields 3-day streak
   ✅ [PASS] Skipped day breaks consecutive streak
   ✅ [PASS] Preferences persist default rest timer and unit
   ✅ [PASS] Saving workout with missing volumeKg defaults safely to 0

🎉 ALL 18/18 ADVERSARIAL & SECURITY TESTS PASSED!
```

#### Web Production Build (`web/`):
```
npm run build
dist/index.html                             1.27 kB │ gzip:  0.61 kB
dist/assets/index-BHOTLKAr.css             72.57 kB │ gzip: 11.91 kB
dist/assets/vendor-icons-BC5tUAjb.js       30.17 kB │ gzip:  8.05 kB
dist/assets/vendor-animation-CXEw0R-E.js   81.42 kB │ gzip: 31.99 kB
dist/assets/vendor-react-CCiVq_t_.js      134.67 kB │ gzip: 43.23 kB
dist/assets/index-kMzaKFJ4.js             138.58 kB │ gzip: 34.28 kB
dist/assets/vendor-supabase-s3XNS0mn.js   227.08 kB │ gzip: 58.97 kB
✓ built in 2.34s
```
