// Authorization: ownership, cross-user access, protected fields.
// Run: npm run test:security   (real PostgreSQL engine via PGlite; does not touch Neon)
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../functions/app.ts';
import { call, put, q, count, body, setRow, setup, teardown, verify, pool, A, B } from '../helpers/apiHarness.js';
import { randomUUID } from 'node:crypto';

before(setup);
after(teardown);

test('SEC-AUTHZ-001 another user cannot overwrite my workout: 404 and my data is unchanged', async () => {
  const id = randomUUID();
  assert.equal((await put(id, body({ workout: { title: 'Mine' } }))).status, 200);
  const r = await put(id, body({ workout: { title: 'Hijacked' }, sets: [setRow(1, { weight_kg: 1 })] }), 'tok-b');
  assert.equal(r.status, 404);
  const [w] = await q('SELECT title, user_id FROM workouts WHERE id = $1', [id]);
  assert.equal(w.title, 'Mine');
  assert.equal(w.user_id, A);
  assert.equal(await count('workout_sets', 'workout_id = $1 AND weight_kg = 1', [id]), 0);
});

test('SEC-AUTHZ-002 reads are scoped to the caller: B never sees A\'s workouts, sets or records', async () => {
  const id = randomUUID();
  await put(id, body({ workout: { title: 'A-private-title' } }));
  const list = await call('/workouts', { token: 'tok-b' });
  assert.equal(list.status, 200);
  assert.ok(!JSON.stringify(list.json).includes('A-private-title'));
  const rec = await call('/records', { token: 'tok-b' });
  assert.deepEqual(rec.json.records, []);
  const mine = await call('/workouts', { token: 'tok-a' });
  assert.ok(JSON.stringify(mine.json).includes('A-private-title'));
});

test('SEC-AUTHZ-003 user_id, workout_id and set ids sent in the body are ignored; the row belongs to the token\'s user', async () => {
  const id = randomUUID();
  const evil = body();
  evil.workout.user_id = B;
  evil.sets = [{ ...setRow(1), user_id: B, workout_id: randomUUID(), id: randomUUID() }];
  evil.prs = [{ ...evil.prs[0], user_id: B }];
  assert.equal((await put(id, evil)).status, 200);
  assert.equal(await count('workouts', 'id = $1 AND user_id = $2', [id, A]), 1);
  assert.equal(await count('workout_sets', 'workout_id = $1 AND user_id = $2', [id, A]), 1);
  assert.equal(await count('personal_records', 'user_id = $1', [B]), 0);
});

test('SEC-AUTHZ-004 profile: is_pro_member, id, email and unknown fields cannot be set through PUT /me', async () => {
  const r = await call('/me', { method: 'PUT', token: 'tok-b', json: { is_pro_member: true, id: A, email: 'x@evil.test', created_at: '2000-01-01', role: 'admin', full_name: 'Bobby' } });
  assert.equal(r.status, 200);
  const [p] = await q('SELECT id, email, is_pro_member, full_name FROM profiles WHERE id = $1', [B]);
  assert.equal(p.is_pro_member, false);
  assert.equal(p.id, B);
  assert.equal(p.email, 'b@example.test');
  assert.equal(p.full_name, 'Bobby');
});

test('SEC-AUTHZ-005 no endpoint deletes data, so the only delete path is account deletion (cascade); there is no DELETE route', async () => {
  const r = await call(`/workouts/${randomUUID()}`, { method: 'DELETE', token: 'tok-a' });
  assert.ok([404, 405].includes(r.status), `status ${r.status}`);
});

test('SEC-AUTHZ-006 the sealed realtime endpoint returns 503 when not configured and never a token for another user', async () => {
  assert.equal((await call('/realtime/seal', { method: 'POST', token: 'tok-a' })).status, 503);
  let askedFor;
  const sealApp = createApp({ pool, verify, allowedOrigins: [], seal: async (id) => { askedFor = id; return { workouts: 'w', profile: 'p' }; } });
  await call('/realtime/seal', { method: 'POST', token: 'tok-b', json: { userId: A }, application: sealApp });
  assert.equal(askedFor, B, 'the user id comes from the verified token, not the body');
});
