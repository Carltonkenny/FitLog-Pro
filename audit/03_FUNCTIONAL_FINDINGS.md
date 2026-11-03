# FitLog Pro: Functional & Business Logic Findings
## `audit/03_FUNCTIONAL_FINDINGS.md`

---

### Finding FN-01: Warmup Sets Falsely Crowned as Personal Records (PRs)
- **Severity:** High (P1)
- **Confidence:** Confirmed / Reproducible
- **Affected Component:** `web/src/features/app/hooks/useWorkoutLogger.js` and `web/src/lib/workoutStore.js`
- **Preconditions:** User performs an active workout containing a Warmup set (`type: 'W'`) with heavier weight or higher reps than previous history.
- **Reproduction Steps:**
  1. Open Active Workout logger.
  2. For Barbell Flat Bench Press, locate Set 1 with label `W`.
  3. Increase weight to 100 kg and reps to 10.
  4. Click the checkmark to mark the set completed.
- **Expected Behavior:** Warmup sets prepare muscular motor units and joint synovial fluid; they must never qualify as an all-time personal best or trigger confetti and PR badges.
- **Actual Behavior (Before Fix):** The system checked `WorkoutStore.checkIsPR` without passing set type. Because estimated 1RM (133.3 kg) exceeded current PR, `targetSet.isPR` was set to `true`, celebratory confetti was launched, and the warmup was written to `fitlog_prs` as a new record!
- **Root Cause:** `WorkoutStore.checkIsPR` had signature `checkIsPR(exerciseId, weight, reps)` and lacked warmup set filtering.
- **Remediation:**
  1. Updated `checkIsPR` to accept `setType = 'normal'`:
     ```javascript
     if (setType === 'W' || setType === 'warmup') return false;
     ```
  2. Updated `saveWorkout` to filter out warmups before writing to `prs`:
     ```javascript
     const isWarmup = set.type === 'W' || set.type === 'warmup';
     if (!isWarmup && set.completed && set.weight > 0 && set.reps > 0) { ... }
     ```
- **Regression Verification:** Verified via automated test Suite 2 in `web/test/adversarial_and_security.test.js`:
  `Warmup set (type: "W") is NEVER declared a PR even with heavy weight` $\rightarrow$ **PASS**.

---

### Finding FN-02: Negative Reps and Corrupted Inputs in 1RM Engine
- **Severity:** Medium (P2)
- **Confidence:** Confirmed / Reproducible
- **Affected Component:** `web/src/lib/workoutStore.js:calculate1RM`
- **Preconditions:** Set contains negative reps (e.g., `-5`) or `NaN` from input parse error.
- **Reproduction Steps:** Call `calculate1RM(100, -5)` or `calculate1RM(100, NaN)`.
- **Expected Behavior:** Any non-positive or corrupted input must safely return `0.0`.
- **Actual Behavior (Before Fix):** In the original code:
  ```javascript
  if (!weight || weight <= 0) return 0;
  if (reps <= 1) return Number(weight);
  ```
  Because `-5 <= 1` evaluated to `true`, `calculate1RM(100, -5)` returned `100.0` kg! A lifter doing negative reps was credited with a 100 kg 1RM!
- **Root Cause:** Missing non-negative rep validation and absence of `isNaN` checks.
- **Remediation:** Refactored `calculate1RM` with comprehensive boundary guards:
  ```javascript
  export const calculate1RM = (weight, reps) => {
    const numWeight = Number(weight);
    const numReps = Number(reps);
    if (isNaN(numWeight) || isNaN(numReps) || numWeight <= 0 || numReps < 0) return 0;
    if (numReps <= 1) return Number(numWeight.toFixed(1));
    return Math.round(numWeight * (1 + numReps / 30) * 10) / 10;
  };
  ```
- **Regression Verification:** Automated Suite 1 tests in `adversarial_and_security.test.js`:
  `Rejects negative reps (-5) with 0.0` $\rightarrow$ **PASS**.
  `Rejects NaN inputs gracefully with 0.0` $\rightarrow$ **PASS**.

---

### Finding FN-03: Floating-Point Step Precision in Set Stepper
- **Severity:** Medium (P2)
- **Confidence:** Confirmed / Reproducible
- **Affected Component:** `web/src/features/app/components/workout/SetRow.jsx`
- **Reproduction Steps:** Repeatedly click the `+` button to increment weight by 2.5 kg from 40 kg.
- **Expected Behavior:** Weight steps cleanly through `42.5`, `45.0`, `47.5`, `50.0`.
- **Actual Behavior (Before Fix):** JavaScript binary floating-point representation resulted in values such as `47.50000000000001` rendered in the input field.
- **Root Cause:** Bare arithmetic `set.weight + 2.5` without fixed-point rounding.
- **Remediation:** Applied `Number((set.weight + 2.5).toFixed(1))` and `Math.max(0, Number((set.weight - 2.5).toFixed(1)))`.
- **Regression Verification:** Manual UI stepper test verified with Playwright DOM inspection.

---

### Finding FN-04: Disconnected Settings & Lost Rest Duration Preferences
- **Severity:** Medium (P2)
- **Confidence:** Confirmed / Reproducible
- **Affected Component:** `web/src/features/app/components/settings/SettingsView.jsx` and `hooks/useWorkoutLogger.js`
- **Reproduction Steps:**
  1. Open App Settings.
  2. Change "Default Rest Pause" from 90s to 120s.
  3. Navigate to Active Workout and check off a completed set.
- **Expected Behavior:** Rest timer starts counting down from 120 seconds.
- **Actual Behavior (Before Fix):** Rest timer started at 90 seconds. Leaving and reopening Settings reverted the dropdown back to 90 seconds.
- **Root Cause:** `SettingsView` stored settings in ephemeral component state (`useState('90')`), and `useWorkoutLogger` hardcoded `triggerRestTimer(90)`.
- **Remediation:**
  1. Added `getPreferences()` and `savePreferences()` to `WorkoutStore` backed by `localStorage`.
  2. Updated `useWorkoutLogger.js` to read `WorkoutStore.getPreferences().restDuration || 90`.
  3. Wired `SettingsView` change handlers to `WorkoutStore.savePreferences`.
- **Regression Verification:** Verified via automated Suite 4 test in `adversarial_and_security.test.js`:
  `Preferences persist default rest timer and unit` $\rightarrow$ **PASS**.

---

### Finding FN-05: Unhandled Undefined Access in History and Finish Modals
- **Severity:** Medium (P2)
- **Confidence:** Confirmed / Edge Case
- **Affected Component:** `web/src/features/app/components/modals/FinishModal.jsx:29` and `HistoryView.jsx:57`
- **Reproduction Steps:** Complete a custom workout where `volumeKg` is null or undefined.
- **Expected Behavior:** Displays `0 kg` without crashing.
- **Actual Behavior (Before Fix):** Threw unhandled TypeError: `Cannot read properties of undefined (reading 'toLocaleString')`.
- **Root Cause:** Direct method invocation on potentially nullish property: `{workout?.volumeKg.toLocaleString()}`.
- **Remediation:** Replaced with nullish coalescing: `{(workout?.volumeKg ?? 0).toLocaleString()} kg`.
- **Regression Verification:** Verified via automated Suite 4 test:
  `Saving workout with missing volumeKg defaults safely to 0` $\rightarrow$ **PASS**.

---

### Finding FN-06: Hardcoded Streak in Progress Analytics
- **Severity:** Low (P3)
- **Confidence:** Confirmed
- **Affected Component:** `web/src/features/app/components/analytics/AnalyticsView.jsx:47`
- **Actual Behavior (Before Fix):** Current Streak card displayed static `🔥 3 Days` regardless of actual user history.
- **Remediation:** Added `WorkoutStore.getStreak()` calculating consecutive daily UTC timestamps and wired dynamically to `AnalyticsView`.
- **Regression Verification:** Verified via automated Suite 3 tests:
  `Consecutive 3-day history yields 3-day streak` $\rightarrow$ **PASS**.

---

### Finding FN-07: Olympic Barbell Visualizer Applied to Dumbbells and Cables
- **Severity:** Low (P3)
- **Confidence:** Confirmed / UI Logic
- **Affected Component:** `web/src/features/app/components/layout/StudioVisualizer.jsx`
- **Actual Behavior (Before Fix):** When selecting Dumbbell Bicep Curls or Cable Lat Pulldowns, the right studio column rendered an Olympic Barbell sleeve graphic with 0 kg plates.
- **Remediation:** Added `isBarbell` check. Non-barbell exercises now display an equipment load selector guide showing required dumbbell pairs or cable weight stack pin targets.
- **Regression Verification:** Verified visually in Playwright desktop studio mode.
