// Input validation and injection: bad types, ranges, dates, sizes, SQL and XSS payloads.
// Run: npm run test:security   (real PostgreSQL engine via PGlite; does not touch Neon)
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { call, put, q, count, body, setRow, iso, setup, teardown } from '../helpers/apiHarness.js';

before(setup);
after(teardown);

test('SEC-INJECT-001 SQL metacharacters in text fields are stored literally and the schema survives', async () => {
  const id = randomUUID();
  const payload = `x'); DROP TABLE workouts; --`;
  const r = await put(id, body({ workout: { title: payload }, sets: [setRow(1, { exercise_name: payload, exercise_id: `' OR '1'='1` })] }));
  assert.equal(r.status, 200);
  const [w] = await q('SELECT title FROM workouts WHERE id = $1', [id]);
  assert.equal(w.title, payload);
  assert.ok((await count('workouts')) >= 1);
});

test('SEC-INJECT-002 a non-UUID workout id, SQL in the path, and path tricks are rejected with 400 or 404 and change nothing', async () => {
  const total = await count('workouts');
  for (const bad of ['1', "1' OR '1'='1", '00000000-0000-0000-0000-00000000000g', '..%2F..%2Fme', 'null', 'a'.repeat(300)]) {
    const r = await put(bad, body());
    assert.ok([400, 404].includes(r.status), `${bad.slice(0, 20)} -> ${r.status}`);
  }
  assert.equal(await count('workouts'), total);
});

test('SEC-INJECT-003 limit parameter: injection, negative, huge, fractional and non-numeric values fall back to safe numbers', async () => {
  for (const lim of ["1;DROP TABLE workouts", '-5', '999999', '2.7', 'abc', '', 'NaN', '1e9']) {
    const r = await call(`/workouts?limit=${encodeURIComponent(lim)}`, { token: 'tok-a' });
    assert.equal(r.status, 200, lim);
    assert.ok(r.json.workouts.length <= 500);
  }
  assert.ok((await count('workouts')) >= 0);
});

test('SEC-VALID-001 workout field boundaries: each bad value is a 400 and nothing is written', async () => {
  const total = await count('workouts');
  const cases = [
    ['missing workout', {}], ['workout is an array', { workout: [] }], ['title missing', { workout: { title: undefined } }],
    ['title is an array', { workout: { title: ['a'] } }], ['title is a number', { workout: { title: 5 } }],
    ['duration negative', { workout: { duration_seconds: -1 } }], ['duration 86401', { workout: { duration_seconds: 86401 } }],
    ['duration NaN string', { workout: { duration_seconds: 'abc' } }], ['volume negative', { workout: { volume_kg: -1 } }],
    ['volume huge', { workout: { volume_kg: 1e12 } }], ['total_sets 1001', { workout: { total_sets: 1001 } }],
    ['started_at not a date', { workout: { started_at: 'yesterday' } }], ['started_at in 1999', { workout: { started_at: '1999-12-31T00:00:00Z' } }],
    ['started_at 3 days ahead', { workout: { started_at: iso(3 * 86_400_000) } }],
    ['501 sets', { sets: Array.from({ length: 501 }, (_, i) => setRow(Math.min(i + 1, 500))) }],
    ['set weight 1001', { sets: [setRow(1, { weight_kg: 1001 })] }], ['set weight negative', { sets: [setRow(1, { weight_kg: -1 })] }],
    ['set reps 501', { sets: [setRow(1, { reps: 501 })] }], ['set_order 0', { sets: [setRow(0)] }],
    ['set is null', { sets: [null] }], ['exercise_id empty', { sets: [setRow(1, { exercise_id: '' })] }],
    ['51 records', { prs: Array.from({ length: 51 }, () => body().prs[0]) }],
    ['record 1RM 2001', { prs: [{ ...body().prs[0], one_rep_max: 2001 }] }],
  ];
  for (const [name, over] of cases) {
    const b = body();
    if (over.workout) Object.assign(b.workout, over.workout);
    if (over.sets) b.sets = over.sets;
    if (over.prs) b.prs = over.prs;
    const payload = name === 'missing workout' ? {} : name === 'workout is an array' ? { ...b, workout: [] } : b;
    const r = await put(randomUUID(), payload);
    assert.equal(r.status, 400, name);
    assert.ok(typeof r.json.error === 'string' && !/select |insert |postgres|stack|at \S+\(|constraint|relation/i.test(r.json.error), `error text for ${name}: ${r.json.error}`);
  }
  assert.equal(await count('workouts'), total, 'no rejected request wrote a workout');
});

test('SEC-VALID-002 invalid JSON, empty body, JSON null and an oversized body are 400', async () => {
  for (const raw of ['{not json', '', 'null', '[]', '"text"', '1']) {
    const r = await call(`/workouts/${randomUUID()}`, { method: 'PUT', token: 'tok-a', raw });
    assert.equal(r.status, 400, `body ${JSON.stringify(raw)}`);
  }
  const big = await call(`/workouts/${randomUUID()}`, { method: 'PUT', token: 'tok-a', raw: JSON.stringify({ pad: 'x'.repeat(401_000) }) });
  assert.equal(big.status, 400);
});

test('SEC-VALID-003 decimal boundaries are rounded to 2 places and stay inside the column limits', async () => {
  const id = randomUUID();
  assert.equal((await put(id, body({ sets: [setRow(1, { weight_kg: 999.999 }), setRow(2, { weight_kg: 0.005 })] }))).status, 200);
  const rows = await q('SELECT weight_kg::float AS w FROM workout_sets WHERE workout_id = $1 ORDER BY set_order', [id]);
  assert.deepEqual(rows.map((r) => r.w), [1000, 0.01]);
});

test('SEC-VALID-004 profile: wrong types, out-of-range numbers and oversized JSON are 400', async () => {
  for (const bad of [{ body_weight_kg: 0 }, { body_weight_kg: 501 }, { body_weight_kg: 'x' }, { daily_calorie_target: 499 }, { full_name: ['a'] }, { routines: {} }, { routines: 'x' }, { coach_memory: [] }, { routines: Array.from({ length: 5000 }, (_, i) => ({ i, pad: 'x'.repeat(30) })) }]) {
    const r = await call('/me', { method: 'PUT', token: 'tok-a', json: bad });
    assert.equal(r.status, 400, JSON.stringify(bad).slice(0, 50));
  }
});

test('SEC-VALID-005 stored XSS payloads are kept as inert text (the API never renders HTML) and returned unchanged', async () => {
  const id = randomUUID();
  const xss = '<img src=x onerror=alert(1)>';
  await put(id, body({ workout: { title: xss } }));
  const r = await call('/workouts', { token: 'tok-a' });
  assert.ok(r.json.workouts.some((w) => w.title === xss));
  assert.match(r.headers.get('content-type'), /application\/json/);
});
