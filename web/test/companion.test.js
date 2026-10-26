import test from 'node:test';
import assert from 'node:assert/strict';
import { EXERCISE_LIBRARY } from '../src/lib/exercises.js';
import { equipmentTags, fitsEquipment, recommendExercises } from '../src/lib/recommend.js';
import { parseChatReply, parsePlan, petMood, resolveExercise } from '../src/lib/companionActions.js';
import {
  LIMITS, addNotes, addRoutine, getUserData, normalize, resetUserData, toggleAvoided, toggleFavorite,
} from '../src/lib/userData.js';
import { toRows } from '../src/lib/syncRows.js';
import { WorkoutStore } from '../src/lib/workoutStore.js';

const DAY = 86400000;
const chestEx = EXERCISE_LIBRARY.find((e) => e.muscle === 'Chest');
const set = (n) => Array.from({ length: n }, () => ({ weight: 60, reps: 8, completed: true }));
const chestWeek = (now) => [
  { timestamp: now - DAY, exercises: [{ exerciseId: chestEx.id, exerciseName: chestEx.name, sets: set(14) }] },
];

test('equipment tags map library labels to the five user choices', () => {
  const tag = (equipment) => [...equipmentTags({ equipment })].sort();
  assert.deepEqual(tag('Barbell or Dumbbells'), ['Barbell', 'Dumbbells']);
  assert.deepEqual(tag('Pull-up Bar'), ['Bodyweight']);
  assert.deepEqual(tag('Cable with Rope'), ['Cables']);
  assert.deepEqual(tag('Smith Machine'), ['Machines']);
  assert.equal(fitsEquipment({ equipment: 'Barbell' }, []), true, 'no filter means everything fits');
  assert.equal(fitsEquipment({ equipment: 'Barbell' }, ['Dumbbells']), false);
});

test('library has 100+ unique exercises across all six muscle groups', () => {
  assert.ok(EXERCISE_LIBRARY.length >= 100);
  assert.equal(new Set(EXERCISE_LIBRARY.map((e) => e.id)).size, EXERCISE_LIBRARY.length);
  assert.equal(new Set(EXERCISE_LIBRARY.map((e) => e.muscle)).size, 6);
});

test('recommender favours the muscle that is behind this week', () => {
  const now = Date.now();
  const recs = recommendExercises({ history: chestWeek(now), now, limit: 5 });
  assert.equal(recs.length, 5);
  assert.ok(recs.every((r) => r.exercise.muscle !== 'Chest'), 'chest already has 14 sets');
  assert.ok(recs[0].reasons.some((r) => /not trained|behind/.test(r)));
});

test('recommender respects equipment, avoided and favorite exercises', () => {
  const now = Date.now();
  const all = recommendExercises({ history: [], now, limit: 200 });
  const first = all[0].exercise;

  const owned = recommendExercises({ history: [], memory: { equipment: ['Dumbbells'] }, now, limit: 200 });
  assert.ok(owned.length > 0 && owned.every((r) => equipmentTags(r.exercise).has('Dumbbells')));

  const avoiding = recommendExercises({ history: [], memory: { avoided: [first.id] }, now, limit: 200 });
  assert.ok(!avoiding.some((r) => r.exercise.id === first.id), 'avoided exercises never appear');

  const fav = all[all.length - 1].exercise;
  const boosted = recommendExercises({ history: [], memory: { favorites: [fav.id] }, now, limit: 200 });
  assert.ok(boosted.findIndex((r) => r.exercise.id === fav.id) < all.length - 1, 'a favorite moves up');
  assert.match(boosted.find((r) => r.exercise.id === fav.id).reasons[0], /favorite/);
});

test('recommender skips exercises done in the last two days and honours the muscle filter', () => {
  const now = Date.now();
  const ex = EXERCISE_LIBRARY.find((e) => e.muscle === 'Arms');
  const recent = [{ timestamp: now - 3600000, exercises: [{ exerciseId: ex.id, exerciseName: ex.name, sets: set(3) }] }];
  const withRecent = recommendExercises({ history: recent, muscle: 'Arms', now, limit: 200 });
  const without = recommendExercises({ history: [], muscle: 'Arms', now, limit: 200 });
  assert.ok(withRecent.every((r) => r.exercise.muscle === 'Arms'));
  assert.ok(withRecent.findIndex((r) => r.exercise.id === ex.id) > without.findIndex((r) => r.exercise.id === ex.id));
});

test('user data validation: garbage in, safe shape out', () => {
  const messy = normalize({
    routines: [{ name: '  Push   day ', exercises: [{ exerciseId: 'a', exerciseName: 'A', sets: 99, reps: -5 }, { exerciseId: '', exerciseName: 'x' }] }, { name: '', exercises: [] }, 'junk'],
    memory: { petName: '   ', equipment: ['Barbell', 'Rocket'], favorites: ['a', 'a', 5], avoided: ['a', 'b'], notes: ['x'.repeat(500), 7, '  '] },
  });
  assert.equal(messy.routines.length, 1);
  assert.equal(messy.routines[0].name, 'Push day');
  assert.deepEqual(messy.routines[0].exercises, [{ exerciseId: 'a', exerciseName: 'A', sets: 10, reps: 1 }]);
  assert.equal(messy.memory.petName, 'Buddy');
  assert.deepEqual(messy.memory.equipment, ['Barbell']);
  assert.deepEqual(messy.memory.avoided, ['b'], 'an exercise cannot be both favorite and avoided');
  assert.equal(messy.memory.notes.length, 1);
  assert.equal(messy.memory.notes[0].length, LIMITS.noteChars);
  assert.deepEqual(normalize(null).routines, []);
});

test('routines: invalid input is rejected, same name replaces', () => {
  resetUserData();
  assert.equal(addRoutine('', [{ exerciseId: 'a', exerciseName: 'A', sets: 3, reps: 10 }]), false);
  assert.equal(addRoutine('Push', []), false);
  assert.equal(addRoutine('Push', [{ exerciseId: 'a', exerciseName: 'A', sets: 3, reps: 10 }]), true);
  assert.equal(addRoutine('push', [{ exerciseId: 'b', exerciseName: 'B', sets: 4, reps: 8 }]), true);
  assert.equal(getUserData().routines.length, 1);
  assert.equal(getUserData().routines[0].exercises[0].exerciseId, 'b');
});

test('memory notes: duplicates skipped, three per call, oldest dropped at the limit', () => {
  resetUserData();
  assert.deepEqual(addNotes(['Trains at home', 'trains at home', 'No barbell', 'A', 'B']), ['Trains at home', 'No barbell', 'A']);
  assert.equal(addNotes(['Trains at home']).length, 0);
  for (let i = 0; i < 20; i++) addNotes([`n${i}a`, `n${i}b`, `n${i}c`]);
  const notes = getUserData().memory.notes;
  assert.equal(notes.length, LIMITS.notes);
  assert.equal(notes.at(-1), 'n19c');
});

test('favorite and avoid are mutually exclusive toggles', () => {
  resetUserData();
  toggleFavorite('x');
  assert.deepEqual(getUserData().memory.favorites, ['x']);
  toggleAvoided('x');
  assert.deepEqual(getUserData().memory.favorites, []);
  assert.deepEqual(getUserData().memory.avoided, ['x']);
  toggleAvoided('x');
  assert.deepEqual(getUserData().memory.avoided, []);
});

test('companion replies: untrusted actions are filtered and clamped', () => {
  const r = parseChatReply(JSON.stringify({
    reply: ' Try this ',
    remember: ['a', 2, 'b', 'c', 'd'],
    actions: [
      { type: 'add_exercise', name: 'Goblet Squat', sets: 99, reps: 0 },
      { type: 'delete_everything', name: 'x' },
      { type: 'open_tab', tab: 'nope' },
      { type: 'open_tab', tab: 'history' },
      { type: 'add_exercise' },
      ...Array.from({ length: 10 }, () => ({ type: 'favorite_exercise', name: 'Pull-Up' })),
    ],
  }));
  assert.equal(r.reply, 'Try this');
  assert.deepEqual(r.remember, ['a', 'b', 'c']);
  assert.equal(r.actions.length, 5);
  assert.deepEqual(r.actions[0], { type: 'add_exercise', name: 'Goblet Squat', tab: undefined, equipment: undefined, sets: 10, reps: 1 });
  assert.equal(r.actions[1].tab, 'history');
  const gear = parseChatReply(JSON.stringify({ reply: 'ok', remember: [], actions: [{ type: 'set_equipment', equipment: ['Dumbbells', 'Spaceship', 'Dumbbells'] }, { type: 'set_equipment', equipment: ['Spaceship'] }] }));
  assert.equal(gear.actions.length, 1, 'equipment actions need at least one real option');
  assert.deepEqual(gear.actions[0].equipment, ['Dumbbells']);
  assert.deepEqual(parseChatReply('not json at all'), { reply: 'not json at all', remember: [], actions: [] });
  const cut = parseChatReply('{"reply":"You got it! I added Goblet Squat for 4 sets');
  assert.equal(cut.broken, true, 'a truncated JSON reply is flagged, not shown');
  assert.equal(cut.reply, '');
});

test('exercise names from the AI resolve to library entries', () => {
  assert.equal(resolveExercise('goblet squat').id, 'goblet_squat');
  assert.equal(resolveExercise('Barbell Row (heavy)')?.id, 'barbell_row');
  assert.equal(resolveExercise('totally made up lift'), null);
  assert.equal(resolveExercise(''), null);
});

test('plan parsing drops bad days and clamps sets', () => {
  assert.equal(parsePlan('nope'), null);
  assert.equal(parsePlan(JSON.stringify({ days: [] })), null);
  const plan = parsePlan(JSON.stringify({ summary: 's', days: [{ name: 'D1', exercises: [{ name: 'Squat', sets: 50, reps: 5 }, { sets: 3 }] }, { name: 'empty', exercises: [] }] }));
  assert.equal(plan.days.length, 1);
  assert.equal(plan.days[0].exercises.length, 1);
  assert.equal(plan.days[0].exercises[0].sets, 10);
});

test('companion mood follows recent records and idle days', () => {
  const now = Date.now();
  assert.equal(petMood([], now), 'sleepy');
  assert.equal(petMood([{ timestamp: now - 5 * DAY }], now), 'sleepy');
  assert.equal(petMood([{ timestamp: now - DAY * 1.5 }], now), 'happy');
  assert.equal(petMood([{ timestamp: now - 3600000, newPRs: [{}] }], now), 'pumped');
});

test('a workout longer than 24 hours is capped so it can still sync', () => {
  const { workout } = toRows({ id: 'w', title: 't', timestamp: Date.now(), volumeKg: 1, durationSeconds: 200000, exercises: [] }, 'u');
  assert.equal(workout.duration_seconds, 86400);
});

test('history cache returns fresh data after storage changes and the same copy when unchanged', () => {
  localStorage.clear();
  const first = WorkoutStore.getHistory();
  assert.equal(WorkoutStore.getHistory(), first, 'unchanged storage reuses the parsed copy');
  localStorage.setItem('fitlog_workout_history', JSON.stringify([{ id: 'z', timestamp: 1, exercises: [] }]));
  assert.deepEqual(WorkoutStore.getHistory().map((w) => w.id), ['z']);
});
