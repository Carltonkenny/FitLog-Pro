import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeUserData, normalize } from '../../src/lib/userData.js';
import { createClock } from '../../src/lib/sessionClock.js';
import { weeklyMuscleSets, workoutStats } from '../../src/lib/stats.js';
import { EXERCISE_LIBRARY } from '../../src/lib/exercises.js';

const routine = (name, id = name) => ({ id, name, exercises: [{ exerciseId: 'x', exerciseName: 'X', sets: 3, reps: 10 }] });
const data = (over = {}) => ({ updatedAt: 1, routines: [], memory: { petName: 'Buddy', equipment: [], favorites: [], avoided: [], notes: [] }, ...over });
const names = (d) => d.routines.map((r) => r.name).sort();

test('merge: routines added on two offline devices both survive (the lost-routine bug)', () => {
  const base = data({ routines: [] });
  const phone = data({ updatedAt: 5, routines: [routine('Pull')] });
  const laptop = data({ updatedAt: 9, routines: [routine('Legs')] });
  assert.deepEqual(names(mergeUserData(phone, laptop, base)), ['Legs', 'Pull']);
  assert.deepEqual(names(mergeUserData(laptop, phone, base)), ['Legs', 'Pull'], 'same result from either side');
});

test('merge: a routine deleted on one device stays deleted, new ones are kept', () => {
  const base = data({ routines: [routine('Push'), routine('Pull')] });
  const local = data({ updatedAt: 5, routines: [routine('Pull')] }); // deleted Push here
  const cloud = data({ updatedAt: 4, routines: [routine('Push'), routine('Pull'), routine('Legs')] }); // added Legs elsewhere
  assert.deepEqual(names(mergeUserData(local, cloud, base)), ['Legs', 'Pull']);
});

test('merge: deleting a remembered note on one device is not undone by the other', () => {
  const mem = (notes, petName = 'Buddy') => ({ petName, equipment: [], favorites: [], avoided: [], notes });
  const base = data({ memory: mem(['Has a bad knee', 'Trains at home']) });
  const local = data({ updatedAt: 8, memory: mem(['Trains at home']) }); // user erased the knee note
  const cloud = data({ updatedAt: 3, memory: mem(['Has a bad knee', 'Trains at home', 'Prefers mornings']) });
  assert.deepEqual(mergeUserData(local, cloud, base).memory.notes.sort(), ['Prefers mornings', 'Trains at home']);
});

test('merge: first sync on a device (empty base) keeps everything from both sides', () => {
  const local = data({ updatedAt: 2, routines: [routine('A')] });
  const cloud = data({ updatedAt: 1, routines: [routine('B')] });
  assert.deepEqual(names(mergeUserData(local, cloud)), ['A', 'B']);
});

test('merge: same routine name, newer copy wins; the companion name follows the newer copy; favorites are exclusive of avoided', () => {
  const older = data({ updatedAt: 1, routines: [{ ...routine('Push'), exercises: [{ exerciseId: 'a', exerciseName: 'A', sets: 3, reps: 10 }] }] });
  older.memory.petName = 'Old';
  const newer = data({ updatedAt: 9, routines: [{ ...routine('Push'), exercises: [{ exerciseId: 'b', exerciseName: 'B', sets: 4, reps: 8 }] }] });
  newer.memory.petName = 'New';
  const m = mergeUserData(older, newer);
  assert.equal(m.routines.length, 1);
  assert.equal(m.routines[0].exercises[0].exerciseId, 'b');
  assert.equal(m.memory.petName, 'New');
  assert.equal(m.updatedAt, 9);

  const x = mergeUserData(
    data({ memory: { petName: 'B', equipment: [], favorites: ['sq'], avoided: [], notes: [] } }),
    data({ memory: { petName: 'B', equipment: [], favorites: [], avoided: ['sq'], notes: [] } }),
  );
  assert.ok(!(x.memory.favorites.includes('sq') && x.memory.avoided.includes('sq')), 'an exercise is never both');
});

test('merge: untrusted cloud data is validated', () => {
  const m = mergeUserData(data(), { updatedAt: 'x', routines: 'nope', memory: { notes: [1, 2, { a: 1 }], equipment: ['Rocket'] } });
  assert.deepEqual(m.routines, []);
  assert.deepEqual(m.memory.equipment, []);
  assert.deepEqual(m.memory.notes, []);
  assert.deepEqual(normalize(undefined).routines, []);
});

test('stopwatch: start, pause, resume and reset add up from timestamps, not ticks', () => {
  const c = createClock();
  assert.equal(c.seconds(1_000), 0);
  c.start(0);
  assert.equal(c.seconds(61_500), 61, 'keeps counting while the tab is throttled');
  c.pause(90_000);
  assert.equal(c.seconds(500_000), 90, 'paused time is not counted');
  c.start(600_000);
  c.start(650_000); // a second start while running must not reset the stretch
  assert.equal(c.seconds(660_000), 150, '90 s banked plus 60 s since resuming');
  c.restart(700_000);
  assert.equal(c.seconds(705_000), 5);
  c.reset();
  assert.equal(c.seconds(999_999), 0);
  assert.equal(c.isRunning(), false);
  c.pause(5);
  assert.equal(c.seconds(10), 0, 'pausing a stopped clock is harmless');
});

test('bodyweight sets (0 kg) count as sets, so a pull-up-only workout can be finished and is counted', () => {
  const pull = EXERCISE_LIBRARY.find((e) => e.id === 'pullup');
  const sets = [{ weight: 0, reps: 10, completed: true }, { weight: 0, reps: 8, completed: true }, { weight: 0, reps: 8, completed: false }];
  const stats = workoutStats([{ exerciseId: pull.id, exerciseName: pull.name, sets }]);
  assert.equal(stats.completedSetsCount, 2, 'the Finish button needs this to be above 0');
  assert.equal(stats.volume, 0, 'no weight, no volume');
  assert.equal(stats.progressPercent, 67);

  const now = Date.now();
  const back = weeklyMuscleSets([{ timestamp: now - 1000, exercises: [{ exerciseId: pull.id, exerciseName: pull.name, sets }] }], now).find((r) => r.muscle === 'Back');
  assert.equal(back.sets, 2);

  assert.equal(workoutStats([{ sets: [{ weight: 50, reps: 0, completed: true }] }]).completedSetsCount, 0, 'zero reps is not a set');
  assert.equal(workoutStats([{ sets: [{ weight: 50, reps: 5, completed: true }] }]).volume, 250);
});

test('clock restored from a snapshot comes back paused with the saved elapsed time', () => {
  const c = createClock();
  c.start(1_000);
  const snap = c.snapshot(61_000); // 60 s into the run when saved
  const restored = createClock(snap);
  assert.equal(restored.isRunning(), false);
  assert.equal(restored.seconds(9_999_999), 60); // time while the tab was closed does not count
});

test('workout dates from a wrong device clock are clamped into the range the server accepts', async () => {
  const { toRows } = await import('../../src/lib/syncRows.js');
  const future = toRows({ id: 'w', timestamp: Date.now() + 400 * 86_400_000, durationSeconds: 60, exercises: [] }, null).workout;
  assert.ok(Date.parse(future.completed_at) <= Date.now());
  const ancient = toRows({ id: 'w', timestamp: 1000, durationSeconds: 0, exercises: [] }, null).workout;
  assert.ok(Date.parse(ancient.started_at) >= Date.parse('2000-01-01'));
});
