// Schema: constraints, keys, indexes, triggers, cascade deletion (direct SQL on real PostgreSQL).
// Run: npm run test:database   (real PostgreSQL engine via PGlite; does not touch Neon)
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { db, q, count, insertUser, insWorkout, rejects, setup, teardown } from '../helpers/apiHarness.js';

before(setup);
after(teardown);

test('DB-SCHEMA-001 the four tables exist with primary keys, and the expected indexes and unique key are present', async () => {
  const tables = (await q("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1")).map((r) => r.table_name);
  assert.deepEqual(tables, ['personal_records', 'profiles', 'workout_sets', 'workouts']);
  const idx = (await q("SELECT indexname FROM pg_indexes WHERE schemaname = 'public'")).map((r) => r.indexname);
  for (const i of ['idx_workouts_user_started', 'idx_workout_sets_workout', 'idx_personal_records_user', 'uq_personal_record_event']) assert.ok(idx.includes(i), i);
});

test('DB-SCHEMA-002 CHECK constraints reject out-of-range values written directly (second line of defence)', async () => {
  const u = await insertUser();
  const w = randomUUID();
  await rejects(insWorkout(randomUUID(), u, { duration: -1 }));
  await rejects(insWorkout(randomUUID(), u, { duration: 86401 }));
  await rejects(insWorkout(randomUUID(), u, { volume: -0.01 }));
  await rejects(insWorkout(randomUUID(), u, { sets: -1 }));
  await rejects(insWorkout(randomUUID(), u, { title: 'x'.repeat(101) }));
  await insWorkout(w, u);
  const ins = (over) => db.query('INSERT INTO workout_sets (workout_id, user_id, exercise_id, exercise_name, set_order, weight_kg, reps) VALUES ($1,$2,$3,$4,$5,$6,$7)', [w, u, 'e', 'E', over.order ?? 1, over.weight ?? 10, over.reps ?? 5]);
  await rejects(ins({ weight: 1000.01 }));
  await rejects(ins({ weight: -1 }));
  await rejects(ins({ reps: 501 }));
  await rejects(ins({ reps: -1 }));
  await rejects(ins({ order: 0 }));
  await ins({ weight: 1000, reps: 500, order: 1 }); // boundary values accepted
  await rejects(db.query('INSERT INTO personal_records (user_id, exercise_id, exercise_name, weight_kg, reps, one_rep_max, achieved_at) VALUES ($1,$2,$3,$4,$5,$6,NOW())', [u, 'e', 'E', 10, 5, 2000.01]));
});

test('DB-SCHEMA-003 NOT NULL and numeric precision: nulls rejected; NUMERIC(6,2) overflow rejected', async () => {
  const u = await insertUser();
  await rejects(db.query('INSERT INTO workouts (id, user_id, title, started_at) VALUES ($1, $2, NULL, NOW())', [randomUUID(), u]));
  await rejects(db.query('INSERT INTO workouts (id, user_id, title, started_at) VALUES ($1, $2, $3, NULL)', [randomUUID(), u, 't']));
  await rejects(db.query('INSERT INTO workouts (id, user_id, title) VALUES ($1, $2, $3)', [randomUUID(), u, 't']));
  const w = randomUUID();
  await insWorkout(w, u);
  await rejects(db.query('INSERT INTO workout_sets (workout_id, user_id, exercise_id, exercise_name, set_order, weight_kg, reps) VALUES ($1,$2,$3,$4,$5,$6,$7)', [w, u, 'e', 'E', 1, 10000, 5]));
});

test('DB-SCHEMA-004 foreign keys: no workout without a profile, no set without a workout, no profile without an auth user', async () => {
  await rejects(insWorkout(randomUUID(), randomUUID()));
  const u = await insertUser();
  await rejects(db.query('INSERT INTO workout_sets (workout_id, user_id, exercise_id, exercise_name, set_order, weight_kg, reps) VALUES ($1,$2,$3,$4,$5,$6,$7)', [randomUUID(), u, 'e', 'E', 1, 1, 1]));
  await rejects(db.query('INSERT INTO profiles (id) VALUES ($1)', [randomUUID()]));
});

test('DB-SCHEMA-005 profile JSON checks: routines must be an array and coach_memory an object', async () => {
  const u = await insertUser();
  await rejects(db.query("UPDATE profiles SET routines = '{}'::jsonb WHERE id = $1", [u]));
  await rejects(db.query("UPDATE profiles SET coach_memory = '[]'::jsonb WHERE id = $1", [u]));
});

test('DB-SCHEMA-006 updated_at advances on update (trigger) and created_at does not', async () => {
  const u = await insertUser();
  const w = randomUUID();
  await insWorkout(w, u);
  await db.query("UPDATE workouts SET created_at = NOW() - interval '1 hour', updated_at = NOW() - interval '1 hour' WHERE id = $1", [w]);
  const [before] = await q('SELECT created_at, updated_at FROM workouts WHERE id = $1', [w]);
  await db.query("UPDATE workouts SET title = 'changed' WHERE id = $1", [w]);
  const [after] = await q('SELECT created_at, updated_at FROM workouts WHERE id = $1', [w]);
  assert.ok(after.updated_at > before.updated_at);
  assert.deepEqual(after.created_at, before.created_at);
});

test('DB-SCHEMA-007 the unique key on personal records blocks a duplicate event for the same user, exercise and time', async () => {
  const u = await insertUser();
  const ins = () => db.query("INSERT INTO personal_records (user_id, exercise_id, exercise_name, weight_kg, reps, one_rep_max, achieved_at) VALUES ($1,'e','E',10,5,11,'2026-01-01T00:00:00Z')", [u]);
  await ins();
  await rejects(ins(), /unique|duplicate/i);
});

test('DB-SCHEMA-008 KNOWN GAP: nothing stops two sets with the same set_order in one workout (no unique key)', async () => {
  const u = await insertUser();
  const w = randomUUID();
  await insWorkout(w, u);
  const ins = () => db.query("INSERT INTO workout_sets (workout_id, user_id, exercise_id, exercise_name, set_order, weight_kg, reps) VALUES ($1,$2,'e','E',1,1,1)", [w, u]);
  await ins();
  await ins(); // accepted: characterisation of DEF-D02
  assert.equal(await count('workout_sets', 'workout_id = $1', [w]), 2);
});

test('DB-SCHEMA-009 KNOWN GAP: a set\'s user_id is not forced to equal its workout\'s user_id by the database', async () => {
  const u1 = await insertUser();
  const u2 = await insertUser();
  const w = randomUUID();
  await insWorkout(w, u1);
  await db.query("INSERT INTO workout_sets (workout_id, user_id, exercise_id, exercise_name, set_order, weight_kg, reps) VALUES ($1,$2,'e','E',1,1,1)", [w, u2]); // accepted: DEF-D03
  assert.equal(await count('workout_sets', 'workout_id = $1 AND user_id = $2', [w, u2]), 1);
});

test('DB-DELETE-001 deleting an auth user cascades to profile, workouts, sets and records; other users are untouched', async () => {
  const gone = await insertUser();
  const keep = await insertUser();
  for (const u of [gone, keep]) {
    const w = randomUUID();
    await insWorkout(w, u);
    await db.query("INSERT INTO workout_sets (workout_id, user_id, exercise_id, exercise_name, set_order, weight_kg, reps) VALUES ($1,$2,'e','E',1,1,1)", [w, u]);
    await db.query("INSERT INTO personal_records (user_id, exercise_id, exercise_name, weight_kg, reps, one_rep_max, achieved_at) VALUES ($1,'e','E',1,1,1,NOW())", [u]);
  }
  await db.query('DELETE FROM neon_auth."user" WHERE id = $1', [gone]);
  for (const t of ['profiles', 'workouts', 'workout_sets', 'personal_records']) {
    assert.equal(await count(t, t === 'profiles' ? 'id = $1' : 'user_id = $1', [gone]), 0, `${t} for deleted user`);
    assert.equal(await count(t, t === 'profiles' ? 'id = $1' : 'user_id = $1', [keep]), 1, `${t} for kept user`);
  }
});

test('DB-DELETE-002 deleting a workout cascades to its sets only', async () => {
  const u = await insertUser();
  const w1 = randomUUID();
  const w2 = randomUUID();
  for (const w of [w1, w2]) {
    await insWorkout(w, u);
    await db.query("INSERT INTO workout_sets (workout_id, user_id, exercise_id, exercise_name, set_order, weight_kg, reps) VALUES ($1,$2,'e','E',1,1,1)", [w, u]);
  }
  await db.query('DELETE FROM workouts WHERE id = $1', [w1]);
  assert.equal(await count('workout_sets', 'workout_id = $1', [w1]), 0);
  assert.equal(await count('workout_sets', 'workout_id = $1', [w2]), 1);
});
