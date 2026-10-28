import test from 'node:test';
import assert from 'node:assert/strict';
import { EXERCISE_LIBRARY, calculate1RM } from '../../src/lib/exercises.js';
import { computeStreak, dayKey, formatWorkoutDate, topLifts, weeklyMuscleSets, workoutsInLastDays } from '../../src/lib/stats.js';
import { fromRow, toRows } from '../../src/lib/syncRows.js';
import { fromDisplay, toDisplay } from '../../src/lib/settings.js';
import { WorkoutStore } from '../../src/lib/workoutStore.js';

// Local-time helper so the tests behave the same in every timezone.
const at = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const chest = EXERCISE_LIBRARY.find((e) => e.muscle === 'Chest');
const back = EXERCISE_LIBRARY.find((e) => e.muscle === 'Back');

const workout = (timestamp, exerciseId, exerciseName, sets) => ({
  id: String(timestamp),
  title: 't',
  timestamp,
  volumeKg: 0,
  durationSeconds: 0,
  exercises: [{ exerciseId, exerciseName, sets }],
});
const done = (weight, reps) => ({ weight, reps, completed: true });

test('estimated max (Epley): zero weight, one rep, decimals', () => {
  assert.equal(calculate1RM(0, 10), 0);
  assert.equal(calculate1RM(100, 1), 100);
  assert.equal(calculate1RM(100, 0), 100);
  assert.equal(calculate1RM(100, 10), 133.3);
  assert.equal(calculate1RM(62.5, 8), 79.2);
});

test('streak: consecutive days, gap, alive through yesterday, empty', () => {
  const now = at(2026, 10, 25, 9);
  assert.equal(computeStreak([], now), 0);
  const three = [at(2026, 10, 25), at(2026, 10, 24), at(2026, 10, 23)].map((t) => ({ timestamp: t }));
  assert.equal(computeStreak(three, now), 3);
  const gap = [at(2026, 10, 25), at(2026, 10, 23)].map((t) => ({ timestamp: t }));
  assert.equal(computeStreak(gap, now), 1);
  const yesterdayOnly = [{ timestamp: at(2026, 10, 24) }];
  assert.equal(computeStreak(yesterdayOnly, now), 1, 'not trained yet today keeps the streak alive');
  const old = [{ timestamp: at(2026, 10, 20) }];
  assert.equal(computeStreak(old, now), 0);
});

test('streak and date labels respect the local midnight boundary', () => {
  const justAfterMidnight = at(2026, 10, 26, 0, 10);
  const lateYesterday = at(2026, 10, 25, 23, 50);
  assert.notEqual(dayKey(lateYesterday), dayKey(justAfterMidnight));
  assert.equal(formatWorkoutDate(lateYesterday, justAfterMidnight), 'Yesterday');
  assert.equal(formatWorkoutDate(justAfterMidnight, justAfterMidnight), 'Today');
  assert.equal(formatWorkoutDate(at(2026, 10, 23), justAfterMidnight), '3 days ago');
  assert.equal(computeStreak([{ timestamp: lateYesterday }, { timestamp: justAfterMidnight }], justAfterMidnight), 2);
});

test('workoutsInLastDays counts only the window', () => {
  const now = at(2026, 10, 25);
  const h = [{ timestamp: at(2026, 10, 24) }, { timestamp: at(2026, 9, 1) }];
  assert.equal(workoutsInLastDays(h, 28, now), 1);
});

test('weekly muscle sets: counts completed working sets in the last 7 days only', () => {
  const now = at(2026, 10, 25);
  const h = [
    workout(at(2026, 10, 24), chest.id, chest.name, [done(60, 8), done(60, 8), { weight: 60, reps: 8, completed: false }]),
    workout(at(2026, 10, 10), chest.id, chest.name, [done(60, 8)]),
    workout(at(2026, 10, 23), back.id, back.name, [done(50, 10), done(0, 10)]),
  ];
  const result = Object.fromEntries(weeklyMuscleSets(h, now).map((r) => [r.muscle, r.sets]));
  assert.equal(result.Chest, 2);
  // Changed on purpose: a 0 kg set is a real set for bodyweight work (pull-ups, push-ups, planks).
  assert.equal(result.Back, 2, 'a completed bodyweight set counts');
  assert.equal(result.Legs, 0);
  assert.equal(Object.keys(result).length, 6);
});

test('top lifts: best estimated max, delta needs two sessions', () => {
  const h = [
    workout(at(2026, 10, 1), 'x', 'Bench', [done(60, 10)]),
    workout(at(2026, 10, 15), 'x', 'Bench', [done(70, 10)]),
    workout(at(2026, 10, 20), 'y', 'Row', [done(50, 8)]),
  ];
  const [bench, row] = topLifts(h);
  assert.equal(bench.exerciseId, 'x');
  assert.equal(bench.oneRm, calculate1RM(70, 10));
  assert.equal(bench.deltaKg, Math.round((calculate1RM(70, 10) - calculate1RM(60, 10)) * 10) / 10);
  assert.equal(row.deltaKg, null);
  assert.deepEqual(topLifts([]), []);
});

test('unit conversion round-trips and stores kg at 0.01', () => {
  assert.equal(toDisplay(30, 'kg'), 30);
  assert.equal(toDisplay(30, 'lb'), 66.1);
  assert.equal(fromDisplay(100, 'lb'), 45.36);
  assert.equal(fromDisplay(62.5, 'kg'), 62.5);
  // What a lb user types is what they see back, for typical plate-based weights.
  [45, 95, 135, 185, 225, 315, 142.5].forEach((lb) => assert.equal(toDisplay(fromDisplay(lb, 'lb'), 'lb'), lb));
});

test('sync rows: workout, sets and PRs map to the database columns with safe limits', () => {
  const record = {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'x'.repeat(300),
    timestamp: at(2026, 10, 25, 18),
    volumeKg: 1234.567,
    durationSeconds: 3600,
    exercises: [
      {
        exerciseId: 'bench_press',
        exerciseName: 'Bench',
        sets: [
          { type: 'W', weight: 40, reps: 10, completed: true },
          { type: '1', weight: 82.504, reps: 8, completed: false },
        ],
      },
    ],
    newPRs: [{ exerciseId: 'bench_press', exerciseName: 'Bench', weight: 82.5, reps: 8, oneRepMax: 104.5 }],
  };
  const { workout, sets, prs } = toRows(record, 'user-1');
  assert.equal(workout.user_id, 'user-1');
  assert.equal(workout.title.length, 100);
  assert.equal(workout.volume_kg, 1234.57);
  assert.equal(workout.total_sets, 1, 'only completed sets are counted');
  assert.equal(sets.length, 2);
  assert.equal(sets[0].set_type, 'warmup');
  assert.equal(sets[1].set_type, 'normal');
  assert.equal(sets[1].weight_kg, 82.5);
  assert.ok(sets.every((s) => s.workout_id === record.id && s.user_id === 'user-1'));
  assert.equal(prs[0].one_rep_max, 104.5);
});

test('sync rows: cloud row converts back to the local shape', () => {
  const rec = fromRow({
    id: 'w1',
    title: 'Push',
    started_at: '2026-10-25T10:00:00Z',
    completed_at: '2026-10-25T11:00:00Z',
    volume_kg: '1500.50',
    duration_seconds: 3600,
    workout_sets: [
      { set_order: 2, exercise_id: 'b', exercise_name: 'Bench', weight_kg: '60.00', reps: 8, is_completed: true, set_type: 'normal' },
      { set_order: 1, exercise_id: 'b', exercise_name: 'Bench', weight_kg: '40.00', reps: 10, is_completed: true, set_type: 'warmup' },
    ],
  });
  assert.equal(rec.volumeKg, 1500.5);
  assert.equal(rec.exercises.length, 1);
  assert.deepEqual(rec.exercises[0].sets.map((s) => [s.type, s.weight]), [['W', 40], ['2', 60]]);
  assert.equal(rec.synced, true);
});

test('a new user has no history and no records, and old seeded data is cleaned up', () => {
  localStorage.clear();
  assert.deepEqual(WorkoutStore.getHistory(), []);
  assert.deepEqual(WorkoutStore.getPersonalRecords(), {});

  localStorage.setItem('fitlog_workout_history', JSON.stringify([{ id: 'wo_hist_prev', timestamp: 1 }, { id: 'real', timestamp: 2 }]));
  localStorage.setItem('fitlog_prs', JSON.stringify({ bench_press: { date: '3 days ago', oneRepMax: 54 }, squat: { oneRepMax: 100 } }));
  assert.deepEqual(WorkoutStore.getHistory().map((w) => w.id), ['real']);
  assert.deepEqual(Object.keys(WorkoutStore.getPersonalRecords()), ['squat']);
});

test('saving a workout stores a real timestamp, a UUID and detects the first PR', () => {
  localStorage.clear();
  const { savedRecord, newPRsFound } = WorkoutStore.saveWorkout({
    title: 'Push',
    volumeKg: 640,
    durationSeconds: 1800,
    exercises: [{ exerciseId: 'bench_press', exerciseName: 'Bench', sets: [done(80, 8)] }],
  });
  assert.match(savedRecord.id, /^[0-9a-f-]{36}$/);
  assert.equal(typeof savedRecord.timestamp, 'number');
  assert.equal('date' in savedRecord, false);
  assert.equal(newPRsFound.length, 1);
  assert.equal(newPRsFound[0].exerciseId, 'bench_press');
  // a lighter set is not a new PR; an equal estimated max is not either (tie)
  assert.equal(WorkoutStore.checkIsPR('bench_press', 70, 8), false);
  assert.equal(WorkoutStore.checkIsPR('bench_press', 80, 8), false);
  assert.equal(WorkoutStore.checkIsPR('bench_press', 85, 8), true);
});

test('progressive overload suggestions stay unit-aware', () => {
  assert.match(WorkoutStore.getNextSessionTarget('b', 40, 9), /\+1 rep/);
  assert.match(WorkoutStore.getNextSessionTarget('b', 40, 12), /\+2\.5 kg/);
  assert.match(WorkoutStore.getNextSessionTarget('b', 40, 12, 'lb'), /lb/);
});

test('exercise library is well formed', () => {
  assert.ok(EXERCISE_LIBRARY.length > 15);
  EXERCISE_LIBRARY.forEach((ex) => {
    assert.ok(ex.id && ex.name, 'id and name');
    assert.ok(ex.growthFatigueScore >= 7 && ex.growthFatigueScore <= 10, ex.name);
  });
  assert.equal(new Set(EXERCISE_LIBRARY.map((e) => e.id)).size, EXERCISE_LIBRARY.length, 'ids are unique');
});
