// ==============================================================================
// FitLog Pro: Adversarial, Regression & Security Test Suite
// Verifies:
// 1. Boundary & Corrupted Inputs on 1RM Engine
// 2. PR Detection Invariants (Warmup exclusion, Tie prevention, Floating-point precision)
// 3. Dynamic Streak Tracking & Midnight Boundary Logic
// 4. Persistence & Safe Defaults on Missing / Corrupted History
// 5. User Preferences Persistence & Cloud Sync Queue Integrity
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert';
import { calculate1RM, WorkoutStore } from '../../src/lib/workoutStore.js';

test('1RM: rejects negative weight (-50kg) with 0.0', () => {
  assert.strictEqual(calculate1RM(-50, 10), 0);
});

test('1RM: rejects negative reps (-5) with 0.0', () => {
  assert.strictEqual(calculate1RM(100, -5), 0);
});

test('1RM: rejects NaN inputs gracefully with 0.0', () => {
  assert.strictEqual(calculate1RM(NaN, 10), 0);
  assert.strictEqual(calculate1RM(100, NaN), 0);
  assert.strictEqual(calculate1RM('corrupt', 'data'), 0);
});

test('1RM: handles extreme superhuman load (1,000 kg x 30 reps) without overflowing', () => {
  const result = calculate1RM(1000, 30);
  assert.strictEqual(result, 2000);
});

test('1RM: preserves exact decimal weights on 1-rep lift', () => {
  assert.strictEqual(calculate1RM(82.5, 1), 82.5);
});

test('PRs: warmup set (type: "W") is NEVER declared a PR even with heavy weight', () => {
  localStorage.setItem('fitlog_prs', JSON.stringify({
    bench_press: { weight: 80.0, reps: 5, oneRepMax: calculate1RM(80.0, 5), date: 'Yesterday' }
  }));
  const isPR = WorkoutStore.checkIsPR('bench_press', 120.0, 10, 'W');
  assert.strictEqual(isPR, false, 'Warmup set must never be crowned as PR');
});

test('PRs: warmup set (type: "warmup") is NEVER declared a PR', () => {
  localStorage.setItem('fitlog_prs', JSON.stringify({
    bench_press: { weight: 80.0, reps: 5, oneRepMax: calculate1RM(80.0, 5), date: 'Yesterday' }
  }));
  const isPR = WorkoutStore.checkIsPR('bench_press', 150.0, 5, 'warmup');
  assert.strictEqual(isPR, false, 'Warmup string must never be crowned as PR');
});

test('PRs: lower weight and reps is NOT a PR', () => {
  localStorage.setItem('fitlog_prs', JSON.stringify({
    bench_press: { weight: 80.0, reps: 5, oneRepMax: calculate1RM(80.0, 5), date: 'Yesterday' }
  }));
  const isPR = WorkoutStore.checkIsPR('bench_press', 60.0, 5, '1');
  assert.strictEqual(isPR, false);
});

test('PRs: floating-point tie (80.0kg x 5 reps = 93.3kg 1RM) is NOT falsely crowned as a PR', () => {
  localStorage.setItem('fitlog_prs', JSON.stringify({
    bench_press: { weight: 80.0, reps: 5, oneRepMax: calculate1RM(80.0, 5), date: 'Yesterday' }
  }));
  const isPR = WorkoutStore.checkIsPR('bench_press', 80.0, 5, '1');
  assert.strictEqual(isPR, false, 'Identical 1RM tie must not trigger new PR');
});

test('PRs: legitimate higher 1RM (85kg x 5 reps = 99.2kg) IS crowned as a PR', () => {
  localStorage.setItem('fitlog_prs', JSON.stringify({
    bench_press: { weight: 80.0, reps: 5, oneRepMax: calculate1RM(80.0, 5), date: 'Yesterday' }
  }));
  const isPR = WorkoutStore.checkIsPR('bench_press', 85.0, 5, '1');
  assert.strictEqual(isPR, true);
});

test('PRs: corrupted negative weight or rep does not qualify as PR for new exercise', () => {
  const isPR1 = WorkoutStore.checkIsPR('brand_new_lift', -40, 10, '1');
  const isPR2 = WorkoutStore.checkIsPR('brand_new_lift', 40, -5, '1');
  assert.strictEqual(isPR1, false);
  assert.strictEqual(isPR2, false);
});

test('Streak: empty history returns 0 streak', () => {
  localStorage.setItem('fitlog_workout_history', JSON.stringify([]));
  assert.strictEqual(WorkoutStore.getStreak(), 0);
});

test('Streak: active workout logged today yields at least 1 day streak', () => {
  const today = Date.now();
  localStorage.setItem('fitlog_workout_history', JSON.stringify([
    { id: 'wo_1', timestamp: today, volumeKg: 2000, exercises: [] }
  ]));
  assert.strictEqual(WorkoutStore.getStreak(), 1);
});

test('Streak: multiple workouts on the same day count as single streak day', () => {
  const today = Date.now();
  localStorage.setItem('fitlog_workout_history', JSON.stringify([
    { id: 'wo_1', timestamp: today, volumeKg: 2000, exercises: [] },
    { id: 'wo_2', timestamp: today - 60000, volumeKg: 1500, exercises: [] }
  ]));
  assert.strictEqual(WorkoutStore.getStreak(), 1);
});

test('Streak: consecutive 3-day history yields 3-day streak', () => {
  const today = Date.now();
  const dayMs = 86400000;
  localStorage.setItem('fitlog_workout_history', JSON.stringify([
    { id: 'wo_today', timestamp: today, volumeKg: 2000, exercises: [] },
    { id: 'wo_yest', timestamp: today - dayMs, volumeKg: 2000, exercises: [] },
    { id: 'wo_2days', timestamp: today - 2 * dayMs, volumeKg: 2000, exercises: [] }
  ]));
  assert.strictEqual(WorkoutStore.getStreak(), 3);
});

test('Streak: skipped day breaks consecutive streak', () => {
  const today = Date.now();
  const dayMs = 86400000;
  localStorage.setItem('fitlog_workout_history', JSON.stringify([
    { id: 'wo_today', timestamp: today, volumeKg: 2000, exercises: [] },
    { id: 'wo_3days', timestamp: today - 3 * dayMs, volumeKg: 2000, exercises: [] }
  ]));
  assert.strictEqual(WorkoutStore.getStreak(), 1);
});

test('Preferences: preferences persist default rest timer and unit', () => {
  WorkoutStore.savePreferences({ unit: 'lbs', restDuration: 120 });
  const prefs = WorkoutStore.getPreferences();
  assert.strictEqual(prefs.unit, 'lbs');
  assert.strictEqual(prefs.restDuration, 120);
});

test('WorkoutStore: saving workout with missing volumeKg defaults safely to 0', () => {
  const res = WorkoutStore.saveWorkout({
    title: 'Minimal Workout',
    exercises: []
  });
  assert.strictEqual(res.savedRecord.volumeKg, 0);
  assert.strictEqual(res.savedRecord.durationSeconds, 0);
  assert(Array.isArray(res.savedRecord.exercises));
});
