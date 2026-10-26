// ==============================================================================
// Domain & Data Flow Verification Test Suite
// Verifies:
// 1. 1RM calculations & boundary edge cases
// 2. Cascading exercise library depth & metadata
// 3. Progressive overload delta recommendations
// 4. New users start with empty, real data
// ==============================================================================

import assert from 'node:assert';

import {
  calculate1RM,
  CASCADING_CATEGORIES,
  EXERCISE_LIBRARY,
  WorkoutStore,
} from '../src/lib/workoutStore.js';

console.log('🧪 Starting FitLog Pro Domain & Verification Tests...\n');

// ------------------------------------------------------------------------------
// TEST 1: 1RM Epley Calculations
// ------------------------------------------------------------------------------
console.log('👉 [Test 1] 1RM Epley Formula & Boundary Checks:');
assert.strictEqual(calculate1RM(0, 10), 0, 'Zero weight should yield 0 1RM');
assert.strictEqual(calculate1RM(100, 0), 100, 'Zero reps should yield base weight');
assert.strictEqual(calculate1RM(100, 1), 100, '1 rep should yield exactly base weight');
// 100 * (1 + 10 / 30) = 133.33 -> rounded to 133.3
assert.strictEqual(calculate1RM(100, 10), 133.3, '100kg x 10 reps should equal 133.3kg');
// 40 * (1 + 10 / 30) = 53.33 -> 53.3
assert.strictEqual(calculate1RM(40, 10), 53.3, '40kg x 10 reps should equal 53.3kg');
console.log('   ✅ 1RM boundary tests passed.\n');

// ------------------------------------------------------------------------------
// TEST 2: Cascading Movement Library Structure
// ------------------------------------------------------------------------------
console.log('👉 [Test 2] Cascading Movement Library Validation:');
assert(CASCADING_CATEGORIES.length >= 6, 'Should have at least 6 primary muscle groups');
const chest = CASCADING_CATEGORIES.find((c) => c.id === 'chest');
assert(chest, 'Chest category must exist');
assert(chest.subregions.length >= 2, 'Chest must have upper and mid/lower sub-regions');
assert(EXERCISE_LIBRARY.length > 15, 'Exercise library must be fully flattened and accessible');

EXERCISE_LIBRARY.forEach((ex) => {
  assert(ex.id, `Exercise must have an ID: ${ex.name}`);
  assert(ex.name, `Exercise must have a name`);
  assert(ex.growthFatigueScore >= 7 && ex.growthFatigueScore <= 10, `Growth score out of range: ${ex.name}`);
  assert(ex.plainRating, `Exercise must have plain English explanation: ${ex.name}`);
});
console.log(`   ✅ All ${EXERCISE_LIBRARY.length} movements validated with plain English ratings and sub-regions.\n`);

// ------------------------------------------------------------------------------
// TEST 3: Progressive Overload Recommendations
// ------------------------------------------------------------------------------
console.log('👉 [Test 3] Progressive Overload Logic:');
const targetUnder12 = WorkoutStore.getNextSessionTarget('bench_press', 40, 9);
assert(targetUnder12.includes('+1 rep'), 'Reps under 12 should suggest +1 rep overload');

const targetOver12 = WorkoutStore.getNextSessionTarget('bench_press', 40, 12);
assert(targetOver12.includes('+2.5 kg'), 'Reps >= 12 should suggest micro-loading +2.5kg');
console.log('   ✅ Progressive overload target engine passed.\n');

// ------------------------------------------------------------------------------
// TEST 4: New users start with real (empty) data
// Changed deliberately: earlier builds seeded a fake "3 days ago" workout and fake records for every
// new user. That data polluted analytics and the AI coach, so a new account must start empty.
// ------------------------------------------------------------------------------
console.log('👉 [Test 4] New users start with empty, real data:');
localStorage.clear();
assert.deepStrictEqual(WorkoutStore.getHistory(), [], 'A new user has no workouts');
assert.deepStrictEqual(WorkoutStore.getPersonalRecords(), {}, 'A new user has no personal records');
console.log('   ✅ Empty-state verified. No fake data is injected.\n');

console.log('🎉 ALL DOMAIN TESTS PASSED WITH 0 FAILURES!');
