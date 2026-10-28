// Workout persistence: transactions and rollback, retries, bulk unnest insert, ordering, listing, query plans.
// Run: npm run test:database   (real PostgreSQL engine via PGlite; does not touch Neon)
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../functions/app.ts';
import { toRows, fromRow } from '../../src/lib/syncRows.js';
import { makePool } from '../helpers/pgliteDb.js';
import { db, call, put, q, count, body, setRow, iso, verify, TOKENS, A, setup, teardown, insertUser, insWorkout, setsOf } from '../helpers/apiHarness.js';

before(setup);
after(teardown);

test('DB-WORKOUT-001 one valid workout is stored with its sets and records, owned by the caller, with a profile row created on demand', async () => {
  const user = randomUUID();
  await db.query('INSERT INTO neon_auth."user" (id, email) VALUES ($1, $2)', [user, 'new@x.test']);
  TOKENS['tok-new'] = { id: user, email: 'new@x.test', name: 'New' };
  const id = randomUUID();
  const r = await put(id, body(), 'tok-new');
  assert.equal(r.status, 200);
  assert.equal(await count('profiles', 'id = $1', [user]), 1);
  assert.equal(await count('workouts', 'id = $1 AND user_id = $2', [id, user]), 1);
  assert.equal((await setsOf(id)).length, 2);
  assert.equal(await count('personal_records', 'user_id = $1', [user]), 1);
});

test('DB-WORKOUT-002 zero, one and many sets are all accepted and stored exactly', async () => {
  for (const n of [0, 1, 40, 500]) {
    const id = randomUUID();
    const sets = Array.from({ length: n }, (_, i) => setRow(i + 1, { weight_kg: i % 100, reps: i % 50 }));
    assert.equal((await put(id, body({ sets, prs: [] }))).status, 200, `n=${n}`);
    assert.equal((await setsOf(id)).length, n, `stored ${n}`);
  }
});

test('DB-BULK-001 the bulk insert keeps every value and the order of each set (nulls, booleans, types, timestamps)', async () => {
  const id = randomUUID();
  const sets = [
    setRow(1, { weight_kg: 0, reps: 0, is_completed: false, set_type: 'warmup', completed_at: null }),
    setRow(2, { weight_kg: 12.5, reps: 10, is_completed: true, set_type: 'drop', exercise_id: 'squat' }),
    setRow(3, { weight_kg: 1000, reps: 500, is_completed: false, set_type: 'failure', completed_at: '2026-10-20T10:00:00.000Z' }),
  ];
  await put(id, body({ sets, prs: [] }));
  const got = await setsOf(id);
  assert.deepEqual(got.map((s) => [s.set_order, s.w, s.reps, s.is_completed, s.set_type, s.exercise_id]), [[1, 0, 0, false, 'warmup', 'bench_press'], [2, 12.5, 10, true, 'drop', 'squat'], [3, 1000, 500, false, 'failure', 'bench_press']]);
  assert.equal(got[0].completed_at, null);
  assert.equal(new Date(got[2].completed_at).toISOString(), '2026-10-20T10:00:00.000Z');
});

test('DB-BULK-002 unknown set types fall back to normal; text is trimmed and truncated to the column size', async () => {
  const id = randomUUID();
  await put(id, body({ sets: [setRow(1, { set_type: 'evil; DROP', exercise_name: `  ${'N'.repeat(400)}  ` })], prs: [] }));
  const [s] = await q('SELECT set_type, length(exercise_name) AS len FROM workout_sets WHERE workout_id = $1', [id]);
  assert.equal(s.set_type, 'normal');
  assert.equal(s.len, 150);
});

test('DB-BULK-003 statement count is constant: saving 2 sets and 400 sets both take the same number of SQL statements', async () => {
  const run = async (n) => {
    const p = makePool(db);
    const a = createApp({ pool: p, verify, allowedOrigins: [] });
    const r = await call(`/workouts/${randomUUID()}`, { method: 'PUT', token: 'tok-a', json: body({ sets: Array.from({ length: n }, (_, i) => setRow(i + 1)), prs: [] }), application: a });
    assert.equal(r.status, 200);
    return p.log.length;
  };
  const small = await run(2);
  const large = await run(400);
  assert.equal(small, large, `statements: ${small} vs ${large}`);
  assert.ok(large <= 7, `statements per save: ${large}`); // BEGIN, profile, upsert, delete, insert sets, COMMIT (+records)
});

test('DB-BULK-004 BENCHMARK (PGlite, in-process WASM Postgres; NOT Neon): bulk insert of 500 sets vs one INSERT per set', async () => {
  const u = await insertUser();
  const mk = async () => { const w = randomUUID(); await insWorkout(w, u); return w; };
  const rows = Array.from({ length: 500 }, (_, i) => setRow(i + 1));
  const w1 = await mk();
  const t1 = performance.now();
  await db.query(
    'INSERT INTO workout_sets (workout_id, user_id, exercise_id, exercise_name, set_order, weight_kg, reps, is_completed, set_type, completed_at) SELECT $1, $2, * FROM unnest($3::text[], $4::text[], $5::int[], $6::numeric[], $7::int[], $8::bool[], $9::text[], $10::timestamptz[])',
    [w1, u, rows.map((s) => s.exercise_id), rows.map((s) => s.exercise_name), rows.map((s) => s.set_order), rows.map((s) => s.weight_kg), rows.map((s) => s.reps), rows.map((s) => s.is_completed), rows.map((s) => s.set_type), rows.map((s) => s.completed_at)],
  );
  const bulkMs = performance.now() - t1;
  const w2 = await mk();
  const t2 = performance.now();
  for (const s of rows) {
    await db.query('INSERT INTO workout_sets (workout_id, user_id, exercise_id, exercise_name, set_order, weight_kg, reps, is_completed, set_type, completed_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [w2, u, s.exercise_id, s.exercise_name, s.set_order, s.weight_kg, s.reps, s.is_completed, s.set_type, s.completed_at]);
  }
  const loopMs = performance.now() - t2;
  assert.equal(await count('workout_sets', 'workout_id = $1', [w1]), 500);
  assert.equal(await count('workout_sets', 'workout_id = $1', [w2]), 500);
  console.log(`# DB-BULK-004 bulk=${bulkMs.toFixed(1)} ms (1 statement) loop=${loopMs.toFixed(1)} ms (500 statements) on in-process PGlite; no network, so this is statement overhead only`);
});

test('DB-BULK-005 retrying the same workout is idempotent: same rows, no duplicate sets or records, updated values win', async () => {
  const id = randomUUID();
  const b1 = body({ sets: [setRow(1), setRow(2), setRow(3)] });
  assert.equal((await put(id, b1)).status, 200);
  assert.equal((await put(id, b1)).status, 200); // ambiguous-timeout retry: the server already committed
  assert.equal((await put(id, b1)).status, 200);
  assert.equal((await setsOf(id)).length, 3);
  assert.equal(await count('workouts', 'id = $1', [id]), 1);
  assert.equal(await count('personal_records', 'user_id = $1 AND achieved_at = $2', [A, '2026-10-20T10:00:00.000Z']), 1);
  assert.equal((await put(id, body({ workout: { title: 'Edited' }, sets: [setRow(1, { weight_kg: 99 })] }))).status, 200);
  const got = await setsOf(id);
  assert.equal(got.length, 1);
  assert.equal(got[0].w, 99);
  assert.equal((await q('SELECT title FROM workouts WHERE id = $1', [id]))[0].title, 'Edited');
});

test('DB-TXN-001 failure while writing records rolls everything back: a new workout leaves no workout, no sets, no records', async () => {
  const p = makePool(db, { hook: (sql) => { if (/INTO personal_records/.test(sql)) throw new Error('injected failure'); } });
  const a = createApp({ pool: p, verify, allowedOrigins: [] });
  const id = randomUUID();
  const orig = console.error; console.error = () => {};
  const r = await call(`/workouts/${id}`, { method: 'PUT', token: 'tok-a', json: body(), application: a });
  console.error = orig;
  assert.equal(r.status, 500);
  assert.equal(await count('workouts', 'id = $1', [id]), 0);
  assert.equal(await count('workout_sets', 'workout_id = $1', [id]), 0);
  assert.ok(p.log.includes('ROLLBACK'));
});

test('DB-TXN-002 failure during the set insert on an EXISTING workout keeps the old sets and old title (no partial update)', async () => {
  const id = randomUUID();
  await put(id, body({ workout: { title: 'Original' }, sets: [setRow(1), setRow(2)] }));
  const p = makePool(db, { hook: (sql) => { if (/INTO workout_sets/.test(sql)) throw new Error('injected failure'); } });
  const a = createApp({ pool: p, verify, allowedOrigins: [] });
  const orig = console.error; console.error = () => {};
  const r = await call(`/workouts/${id}`, { method: 'PUT', token: 'tok-a', json: body({ workout: { title: 'Changed' }, sets: [setRow(1, { weight_kg: 5 })] }), application: a });
  console.error = orig;
  assert.equal(r.status, 500);
  assert.equal((await q('SELECT title FROM workouts WHERE id = $1', [id]))[0].title, 'Original');
  assert.equal((await setsOf(id)).length, 2);
});

test('DB-TXN-003 a database constraint violation inside the transaction (CHECK) rolls back and returns a generic 500, not partial data', async () => {
  // Bypass app validation with a pool that tampers with the sets, to prove the DB constraint is a real second line.
  const p = makePool(db);
  const tamper = { query: p.query, connect: async () => { const c = await p.connect(); return { release: c.release, query: (t, params) => c.query(t, /INTO workout_sets/.test(t) ? params.map((x, i) => (i === 5 ? x.map(() => 5000) : x)) : params) }; } };
  const a = createApp({ pool: tamper, verify, allowedOrigins: [] });
  const id = randomUUID();
  const orig = console.error; console.error = () => {};
  const r = await call(`/workouts/${id}`, { method: 'PUT', token: 'tok-a', json: body(), application: a });
  console.error = orig;
  assert.equal(r.status, 500);
  assert.equal(await count('workouts', 'id = $1', [id]), 0);
});

test('DB-TXN-004 the connection is always released, even after a failed save (no leak)', async () => {
  let open = 0;
  const p = makePool(db, { hook: (sql) => { if (/INTO workout_sets/.test(sql)) throw new Error('x'); } });
  const counting = { query: p.query, connect: async () => { const c = await p.connect(); open += 1; return { query: c.query, release: () => { open -= 1; c.release(); } }; } };
  const a = createApp({ pool: counting, verify, allowedOrigins: [] });
  const orig = console.error; console.error = () => {};
  for (let i = 0; i < 5; i += 1) await call(`/workouts/${randomUUID()}`, { method: 'PUT', token: 'tok-a', json: body(), application: a });
  console.error = orig;
  assert.equal(open, 0);
});

test('DB-TXN-005 REGRESSION: a rejected cross-user overwrite rolls back and does not leave the transaction open or change the profile table', async () => {
  const id = randomUUID();
  await put(id, body());
  const profilesBefore = await count('profiles');
  const p = makePool(db);
  const a = createApp({ pool: p, verify, allowedOrigins: [] });
  const r = await call(`/workouts/${id}`, { method: 'PUT', token: 'tok-b', json: body(), application: a });
  assert.equal(r.status, 404);
  assert.ok(p.log.includes('ROLLBACK') && !p.log.includes('COMMIT'));
  assert.equal(await count('profiles'), profilesBefore);
});

test('DB-WORKOUT-003 a 2xx on retry after a "lost" response leaves exactly the state of the first success (ambiguous timeout)', async () => {
  const id = randomUUID();
  const payload = body({ sets: [setRow(1), setRow(2)] });
  await put(id, payload); // first attempt committed, response "lost"
  const snapshot = JSON.stringify(await setsOf(id));
  await put(id, payload);
  assert.equal(JSON.stringify(await setsOf(id)), snapshot.replace(/"completed_at":"[^"]*"/g, (m) => m), 'values stable'); // completed_at is client-supplied so equal here
  assert.equal(await count('workout_sets', 'workout_id = $1', [id]), 2);
});

test('DB-WORKOUT-004 characterisation: re-sending a soft-deleted workout revives it (deleted_at cleared); the API has no delete route', async () => {
  const id = randomUUID();
  await put(id, body());
  await db.query('UPDATE workouts SET deleted_at = NOW() WHERE id = $1', [id]);
  assert.ok(!JSON.stringify((await call('/workouts', { token: 'tok-a' })).json).includes(id));
  await put(id, body());
  assert.ok(JSON.stringify((await call('/workouts', { token: 'tok-a' })).json).includes(id));
});

test('DB-WORKOUT-006 a valid token for an account that no longer exists is 401, not a 500, and nothing is written', async () => {
  TOKENS['tok-ghost'] = { id: randomUUID(), email: 'ghost@x.test', name: 'Ghost' };
  const orig = console.error; console.error = () => {};
  const r = await put(randomUUID(), body(), 'tok-ghost');
  const m = await call('/me', { token: 'tok-ghost' });
  console.error = orig;
  assert.equal(r.status, 401);
  assert.equal(m.status, 401);
  assert.equal(await count('profiles', 'id = $1', [TOKENS['tok-ghost'].id]), 0);
});

test('DB-WORKOUT-007 a workout round-trips through the API with its exercise order and a repeated exercise intact (set_order is one running position)', async () => {
  const mk = (id, name, n) => ({ exerciseId: id, exerciseName: name, sets: Array.from({ length: n }, (_, i) => ({ type: String(i + 1), weight: 50 + i, reps: 8, completed: true })) });
  const record = { id: randomUUID(), title: 'Round trip', timestamp: Date.now(), volumeKg: 100, durationSeconds: 600, exercises: [mk('squat', 'Squat', 2), mk('bench_press', 'Bench', 2), mk('squat', 'Squat', 1)] };
  const rows = toRows(record, null);
  assert.equal((await put(record.id, rows)).status, 200);
  const listed = (await call('/workouts', { token: 'tok-a' })).json.workouts.find((w) => w.id === record.id);
  const back = fromRow(listed);
  assert.deepEqual(back.exercises.map((e) => [e.exerciseId, e.sets.length]), [['squat', 2], ['bench_press', 2], ['squat', 1]]);
});

test('DB-WORKOUT-008 rows written by older builds (set_order restarting per exercise) still load, grouped by exercise', () => {
  const legacy = fromRow({ id: 'w', title: 't', started_at: '2026-10-25T10:00:00Z', volume_kg: 1, duration_seconds: 1, workout_sets: [
    { set_order: 1, exercise_id: 'a', exercise_name: 'A', weight_kg: '1', reps: 1, is_completed: true, set_type: 'normal' },
    { set_order: 2, exercise_id: 'a', exercise_name: 'A', weight_kg: '1', reps: 1, is_completed: true, set_type: 'normal' },
    { set_order: 1, exercise_id: 'b', exercise_name: 'B', weight_kg: '1', reps: 1, is_completed: true, set_type: 'normal' },
  ] });
  assert.deepEqual(legacy.exercises.map((e) => [e.exerciseId, e.sets.length]), [['a', 2], ['b', 1]]);
});

test('DB-WORKOUT-009 only the profile insert maps a missing account to 401; other database errors still return 500', async () => {
  const p = makePool(db, { hook: (sql) => { if (/INTO workout_sets/.test(sql)) { const e = new Error('fk'); e.code = '23503'; throw e; } } });
  const a = createApp({ pool: p, verify, allowedOrigins: [] });
  const orig = console.error; console.error = () => {};
  const r = await call(`/workouts/${randomUUID()}`, { method: 'PUT', token: 'tok-a', json: body(), application: a });
  console.error = orig;
  assert.equal(r.status, 500);
});

test('DB-WORKOUT-005 listing returns only my non-deleted, non-template workouts, newest first, at most `limit`, with their sets', async () => {
  const user = await insertUser();
  TOKENS['tok-list'] = { id: user, email: 'l@x.test', name: 'L' };
  const ids = [];
  for (let i = 0; i < 5; i += 1) { const id = randomUUID(); ids.push(id); await put(id, body({ workout: { started_at: iso(-i * 3_600_000 - 60_000), completed_at: iso(-i * 3_600_000) } }), 'tok-list'); }
  await db.query('UPDATE workouts SET deleted_at = NOW() WHERE id = $1', [ids[4]]);
  await db.query('UPDATE workouts SET is_template = TRUE WHERE id = $1', [ids[3]]);
  const r = await call('/workouts?limit=2', { token: 'tok-list' });
  assert.equal(r.json.workouts.length, 2);
  assert.deepEqual(r.json.workouts.map((w) => w.id), [ids[0], ids[1]]);
  assert.equal(r.json.workouts[0].workout_sets.length, 2);
  const all = await call('/workouts', { token: 'tok-list' });
  assert.deepEqual(all.json.workouts.map((w) => w.id).sort(), [ids[0], ids[1], ids[2]].sort());
});

test('DB-PERF-001 the read path for a list of workouts is exactly two queries (no N+1)', async () => {
  const p = makePool(db);
  const a = createApp({ pool: p, verify, allowedOrigins: [] });
  const r = await call('/workouts?limit=50', { token: 'tok-list', application: a });
  assert.equal(r.status, 200);
  assert.ok(r.json.workouts.length >= 3);
  assert.equal(p.log.length, 2);
});

test('DB-PERF-002 the hot queries use the intended indexes in the query plan (PGlite planner, small data: indicative only)', async () => {
  const u = await insertUser();
  for (let i = 0; i < 300; i += 1) await db.query("INSERT INTO workouts (id, user_id, title, started_at) VALUES ($1,$2,'t', NOW() - ($3 || ' hours')::interval)", [randomUUID(), u, String(i)]);
  await db.query('ANALYZE workouts');
  await db.exec('SET enable_seqscan = off'); // force a choice so the test proves an index CAN serve the query
  const plan = (await q('EXPLAIN SELECT id FROM workouts WHERE user_id = $1 AND deleted_at IS NULL AND is_template = FALSE ORDER BY started_at DESC LIMIT 200', [u])).map((r) => r['QUERY PLAN']).join('\n');
  await db.exec('RESET enable_seqscan');
  assert.match(plan, /idx_workouts_user_started/);
});

test('DB-CONCURRENCY-001 BLOCKED: true parallel transactions (two connections racing on one workout id) need a real multi-connection Postgres, i.e. an isolated Neon branch', { skip: 'Blocked: needs an authorised Neon branch. PGlite serialises requests, so it cannot prove this.' }, () => {});
