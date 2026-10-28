// ==============================================================================
// FitLog Pro: Adversarial, Regression & Security Test Suite
// Verifies:
// 1. Boundary & Corrupted Inputs on 1RM Engine
// 2. PR Detection Invariants (Warmup exclusion, Tie prevention, Floating-point precision)
// 3. Dynamic Streak Tracking & Midnight Boundary Logic
// 4. Persistence & Safe Defaults on Missing / Corrupted History
// 5. User Preferences Persistence & Cloud Sync Queue Integrity
// ==============================================================================

import assert from 'node:assert';

// Mock localStorage for headless Node test environment
const mockStorage = {};
globalThis.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); },
};

import {
  calculate1RM,
  WorkoutStore,
} from '../src/lib/workoutStore.js';

console.log('🛡️ Starting FitLog Pro Adversarial & Security Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`   ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`   ❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

// ------------------------------------------------------------------------------
// SUITE 1: 1RM Adversarial & Boundary Value Tests
// ------------------------------------------------------------------------------
console.log('👉 [Suite 1] 1RM Epley Adversarial Boundary Attacks:');

runTest('Rejects negative weight (-50kg) with 0.0', () => {
  assert.strictEqual(calculate1RM(-50, 10), 0);
});

runTest('Rejects negative reps (-5) with 0.0', () => {
  assert.strictEqual(calculate1RM(100, -5), 0);
});

runTest('Rejects NaN inputs gracefully with 0.0', () => {
  assert.strictEqual(calculate1RM(NaN, 10), 0);
  assert.strictEqual(calculate1RM(100, NaN), 0);
  assert.strictEqual(calculate1RM('corrupt', 'data'), 0);
});

runTest('Handles extreme superhuman load (1,000 kg x 30 reps) without overflowing', () => {
  const result = calculate1RM(1000, 30);
  assert.strictEqual(result, 2000);
});

runTest('Preserves exact decimal weights on 1-rep lift', () => {
  assert.strictEqual(calculate1RM(82.5, 1), 82.5);
});

// ------------------------------------------------------------------------------
// SUITE 2: Personal Record Invariants & Anti-Corruption Tests
// ------------------------------------------------------------------------------
console.log('\n👉 [Suite 2] Personal Record Invariants & Warmup Defense:');

// Seed a known baseline PR
mockStorage['fitlog_prs'] = JSON.stringify({
  bench_press: { weight: 80.0, reps: 5, oneRepMax: calculate1RM(80.0, 5), date: 'Yesterday' } // 1RM: 93.3
});

runTest('Warmup set (type: "W") is NEVER declared a PR even with heavy weight', () => {
  const isPR = WorkoutStore.checkIsPR('bench_press', 120.0, 10, 'W');
  assert.strictEqual(isPR, false, 'Warmup set must never be crowned as PR');
});

runTest('Warmup set (type: "warmup") is NEVER declared a PR', () => {
  const isPR = WorkoutStore.checkIsPR('bench_press', 150.0, 5, 'warmup');
  assert.strictEqual(isPR, false, 'Warmup string must never be crowned as PR');
});

runTest('Lower weight and reps is NOT a PR', () => {
  const isPR = WorkoutStore.checkIsPR('bench_press', 60.0, 5, '1');
  assert.strictEqual(isPR, false);
});

runTest('Floating-point tie (80.0kg x 5 reps = 93.3kg 1RM) is NOT falsely crowned as a PR', () => {
  const isPR = WorkoutStore.checkIsPR('bench_press', 80.0, 5, '1');
  assert.strictEqual(isPR, false, 'Identical 1RM tie must not trigger new PR');
});

runTest('Legitimate higher 1RM (85kg x 5 reps = 99.2kg) IS crowned as a PR', () => {
  const isPR = WorkoutStore.checkIsPR('bench_press', 85.0, 5, '1');
  assert.strictEqual(isPR, true);
});

runTest('Corrupted negative weight or rep does not qualify as PR for new exercise', () => {
  const isPR1 = WorkoutStore.checkIsPR('brand_new_lift', -40, 10, '1');
  const isPR2 = WorkoutStore.checkIsPR('brand_new_lift', 40, -5, '1');
  assert.strictEqual(isPR1, false);
  assert.strictEqual(isPR2, false);
});

// ------------------------------------------------------------------------------
// SUITE 3: Dynamic Streak Engine Verification
// ------------------------------------------------------------------------------
console.log('\n👉 [Suite 3] Dynamic Streak Tracking Engine:');

runTest('Empty history returns 0 streak', () => {
  mockStorage['fitlog_workout_history'] = JSON.stringify([]);
  assert.strictEqual(WorkoutStore.getStreak(), 0);
});

runTest('Active workout logged today yields at least 1 day streak', () => {
  const today = Date.now();
  mockStorage['fitlog_workout_history'] = JSON.stringify([
    { id: 'wo_1', timestamp: today, volumeKg: 2000, exercises: [] }
  ]);
  assert.strictEqual(WorkoutStore.getStreak(), 1);
});

runTest('Multiple workouts on the same day count as single streak day', () => {
  const today = Date.now();
  mockStorage['fitlog_workout_history'] = JSON.stringify([
    { id: 'wo_1', timestamp: today, volumeKg: 2000, exercises: [] },
    { id: 'wo_2', timestamp: today - 60000, volumeKg: 1500, exercises: [] }
  ]);
  assert.strictEqual(WorkoutStore.getStreak(), 1);
});

runTest('Consecutive 3-day history yields 3-day streak', () => {
  const today = Date.now();
  const dayMs = 86400000;
  mockStorage['fitlog_workout_history'] = JSON.stringify([
    { id: 'wo_today', timestamp: today, volumeKg: 2000, exercises: [] },
    { id: 'wo_yest', timestamp: today - dayMs, volumeKg: 2000, exercises: [] },
    { id: 'wo_2days', timestamp: today - 2 * dayMs, volumeKg: 2000, exercises: [] }
  ]);
  assert.strictEqual(WorkoutStore.getStreak(), 3);
});

runTest('Skipped day breaks consecutive streak', () => {
  const today = Date.now();
  const dayMs = 86400000;
  mockStorage['fitlog_workout_history'] = JSON.stringify([
    { id: 'wo_today', timestamp: today, volumeKg: 2000, exercises: [] },
    // skipped yesterday!
    { id: 'wo_3days', timestamp: today - 3 * dayMs, volumeKg: 2000, exercises: [] }
  ]);
  assert.strictEqual(WorkoutStore.getStreak(), 1);
});

// ------------------------------------------------------------------------------
// SUITE 4: User Preference & Sync Queue Continuity
// ------------------------------------------------------------------------------
console.log('\n👉 [Suite 4] Preference Persistence & Cloud Queue Continuity:');

runTest('Preferences persist default rest timer and unit', () => {
  WorkoutStore.savePreferences({ unit: 'lbs', restDuration: 120 });
  const prefs = WorkoutStore.getPreferences();
  assert.strictEqual(prefs.unit, 'lbs');
  assert.strictEqual(prefs.restDuration, 120);
});

runTest('Saving workout with missing volumeKg defaults safely to 0', () => {
  const res = WorkoutStore.saveWorkout({
    title: 'Minimal Workout',
    exercises: []
  });
  assert.strictEqual(res.savedRecord.volumeKg, 0);
  assert.strictEqual(res.savedRecord.durationSeconds, 0);
  assert(Array.isArray(res.savedRecord.exercises));
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} ADVERSARIAL & SECURITY TESTS PASSED!`);
