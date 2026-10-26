// Tests the production API code (functions/app.ts) end to end:
//  - real Neon Postgres, inside a throwaway schema that is dropped afterwards
//  - real JWT verification, using a keypair generated here and served from a local JWKS endpoint
//  - Gemini and realtime are exercised separately (mock for Gemini, real sealing when the secret is present)
// DB tests are skipped when DATABASE_URL_UNPOOLED is not set (for example on a fresh checkout).
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { randomUUID, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { SignJWT, exportJWK, generateKeyPair } from 'jose';
import pg from 'pg';
import { createApp } from '../functions/app.ts';
import { makeVerifier } from '../functions/lib/auth.ts';
import { makeSealer } from '../functions/lib/seal.ts';

const DB_URL = process.env.DATABASE_URL_UNPOOLED;
const haveDb = Boolean(DB_URL);
const schema = `t_${randomBytes(5).toString('hex')}`;
const ISSUER = 'https://auth.example.test';
const ORIGIN_OK = 'https://fitlog.example.app';

let admin, pool, server, app, keys;
const userA = randomUUID();
const userB = randomUUID();
const geminiCalls = [];

const fakeFetch = async (url, init) => {
  geminiCalls.push({ url, init, body: JSON.parse(init.body) });
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"reply":"hi"}' }] }, finishReason: 'STOP' }] }), { status: 200 });
};

async function sign(claims = {}, { key = keys.privateKey, kid = 'k1', iss = ISSUER, exp = '10m' } = {}) {
  return new SignJWT({ email: 'a@example.test', name: 'Tester', ...claims })
    .setProtectedHeader({ alg: 'EdDSA', kid })
    .setIssuedAt()
    .setIssuer(iss)
    .setExpirationTime(exp)
    .sign(key);
}

const call = async (path, { method = 'GET', token, body, headers = {} } = {}) => {
  const res = await app.request(path, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json, headers: res.headers };
};

const iso = (offsetMs = 0) => new Date(Date.now() + offsetMs).toISOString();
const workoutBody = (over = {}) => ({
  workout: { title: 'Push day', started_at: iso(-3_600_000), completed_at: iso(), duration_seconds: 3600, volume_kg: 1200.5, total_sets: 2, ...over.workout },
  sets: over.sets ?? [
    { exercise_id: 'bench_press', exercise_name: 'Bench', set_order: 1, weight_kg: 80, reps: 8, is_completed: true, set_type: 'normal', completed_at: iso() },
    { exercise_id: 'pullup', exercise_name: 'Pull-Up', set_order: 2, weight_kg: 0, reps: 10, is_completed: true, set_type: 'normal', completed_at: iso() },
  ],
  prs: over.prs ?? [{ exercise_id: 'bench_press', exercise_name: 'Bench', weight_kg: 80, reps: 8, one_rep_max: 101.3, achieved_at: '2026-10-20T10:00:00.000Z' }],
});

before(async () => {
  keys = await generateKeyPair('EdDSA', { extractable: true });
  const jwk = { ...(await exportJWK(keys.publicKey)), kid: 'k1', alg: 'EdDSA', use: 'sig' };
  server = http.createServer((_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ keys: [jwk] }));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const jwksUrl = `http://127.0.0.1:${server.address().port}/jwks.json`;

  if (haveDb) {
    admin = new pg.Client({ connectionString: DB_URL });
    await admin.connect();
    // Same DDL as production, in a scratch schema, minus the foreign key to Neon Auth's user table.
    const ddl = readFileSync(new URL('../../neon/schema.sql', import.meta.url), 'utf8')
      .replaceAll('public.', `${schema}.`)
      .replace('REFERENCES neon_auth."user"(id) ON DELETE CASCADE', '');
    await admin.query(`CREATE SCHEMA ${schema}`);
    await admin.query(ddl);
    pool = new pg.Pool({ connectionString: DB_URL, max: 4 });
    pool.on('connect', (c) => c.query(`SET search_path TO ${schema}`));
  }

  app = createApp({
    pool: pool ?? { query: async () => ({ rows: [] }), connect: async () => { throw new Error('no db'); } },
    verify: makeVerifier({ jwksUrl, baseUrl: `${ISSUER}/neondb/auth` }),
    allowedOrigins: [ORIGIN_OK],
    geminiKey: 'test-key',
    fetchImpl: fakeFetch,
    seal: async () => ({ workouts: { capability: 'x' }, profile: { capability: 'y' } }),
  });
});

after(async () => {
  server?.close();
  await pool?.end();
  if (admin) {
    await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await admin.end();
  }
});

// ---------------------------------------------------------------- authentication
test('rejects requests with no token, garbage, a foreign key, wrong issuer, expiry or a non-uuid subject', async () => {
  const other = await generateKeyPair('EdDSA');
  const cases = {
    none: undefined,
    garbage: 'not.a.jwt',
    foreignKey: await sign({}, { key: other.privateKey }),
    wrongIssuer: await sign({ sub: userA }, { iss: 'https://evil.example' }),
    expired: await sign({ sub: userA }, { exp: Math.floor(Date.now() / 1000) - 60 }),
    notUuid: await sign({ sub: 'admin' }),
    noSub: await sign({}),
  };
  for (const [name, token] of Object.entries(cases)) {
    const r = await call('/me', { token });
    assert.equal(r.status, 401, `${name} must be 401`);
    assert.deepEqual(r.json, { error: 'unauthorized' }, `${name} must not leak a reason`);
  }
});

test('health is public and every other route is protected', async () => {
  if (haveDb) assert.deepEqual((await call('/health')).json, { ok: true });
  for (const [method, path] of [['GET', '/me'], ['PUT', '/me'], ['GET', '/workouts'], ['PUT', `/workouts/${randomUUID()}`], ['GET', '/records'], ['POST', '/coach'], ['POST', '/realtime/seal']]) {
    assert.equal((await call(path, { method })).status, 401, `${method} ${path}`);
  }
});

// ---------------------------------------------------------------- CORS
test('CORS: localhost and the configured origin are allowed, others are not', async () => {
  const origin = async (o, extra = {}) => (await call('/health', { headers: { Origin: o }, ...extra })).headers.get('access-control-allow-origin');
  assert.equal(await origin('http://localhost:5173'), 'http://localhost:5173');
  assert.equal(await origin(ORIGIN_OK), ORIGIN_OK);
  assert.equal(await origin('https://evil.example'), null);
  const pre = await app.request('/workouts/x', { method: 'OPTIONS', headers: { Origin: ORIGIN_OK, 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'authorization,content-type' } });
  assert.ok([200, 204].includes(pre.status), 'preflight succeeds without a token');
  assert.match(pre.headers.get('access-control-allow-headers') ?? '', /authorization/i);
});

// ---------------------------------------------------------------- profile
test('profile: created on first call, updated with allowed fields, protected fields are ignored', { skip: !haveDb }, async () => {
  const token = await sign({ sub: userA, email: 'a@example.test' });
  const first = await call('/me', { token });
  assert.equal(first.status, 200);
  assert.equal(first.json.profile.id, userA);
  assert.equal(first.json.profile.onboarding_completed, false);

  const put = await call('/me', {
    method: 'PUT', token,
    body: { fitness_goal: 'Raw Strength', body_weight_kg: 80.5, onboarding_completed: true, routines: [{ id: 'r1', name: 'Push' }], coach_memory: { petName: 'Rex' }, is_pro_member: true, id: userB },
  });
  assert.equal(put.status, 200);
  assert.equal(put.json.profile.fitness_goal, 'Raw Strength');
  assert.equal(put.json.profile.body_weight_kg, 80.5);
  assert.equal(put.json.profile.onboarding_completed, true);
  assert.deepEqual(put.json.profile.routines, [{ id: 'r1', name: 'Push' }]);
  assert.equal(put.json.profile.id, userA, 'the id cannot be changed');

  const { rows } = await admin.query(`SELECT is_pro_member FROM ${schema}.profiles WHERE id = $1`, [userA]);
  assert.equal(rows[0].is_pro_member, false, 'a user cannot grant themselves paid status');
});

test('profile: out-of-range and oversized values are rejected', { skip: !haveDb }, async () => {
  const token = await sign({ sub: userA });
  for (const body of [{ body_weight_kg: 9999 }, { daily_calorie_target: 5 }, { routines: 'nope' }, { coach_memory: [] }, { routines: Array.from({ length: 3000 }, (_, i) => ({ i, pad: 'x'.repeat(40) })) }]) {
    assert.equal((await call('/me', { method: 'PUT', token, body })).status, 400, JSON.stringify(body).slice(0, 40));
  }
});

// ---------------------------------------------------------------- workouts
test('workouts: save, read back, retry is idempotent, bodyweight sets survive', { skip: !haveDb }, async () => {
  const token = await sign({ sub: userA });
  const id = randomUUID();
  assert.equal((await call(`/workouts/${id}`, { method: 'PUT', token, body: workoutBody() })).status, 200);
  assert.equal((await call(`/workouts/${id}`, { method: 'PUT', token, body: workoutBody() })).status, 200, 'retry after a lost response');

  const list = await call('/workouts', { token });
  assert.equal(list.status, 200);
  const w = list.json.workouts.find((x) => x.id === id);
  assert.ok(w, 'workout is listed');
  assert.equal(w.title, 'Push day');
  assert.equal(Number(w.volume_kg), 1200.5);
  assert.equal(w.workout_sets.length, 2, 'retry did not duplicate sets');
  assert.deepEqual(w.workout_sets.map((s) => [s.set_order, Number(s.weight_kg), s.reps]), [[1, 80, 8], [2, 0, 10]]);

  const rec = await call('/records', { token });
  assert.equal(rec.json.records.filter((r) => r.exercise_id === 'bench_press').length, 1, 'retry did not duplicate the record');
  assert.equal(Number(rec.json.records[0].one_rep_max), 101.3);
});

test('workouts: one user cannot read, overwrite or see the records of another', { skip: !haveDb }, async () => {
  const a = await sign({ sub: userA });
  const b = await sign({ sub: userB, email: 'b@example.test' });
  const id = randomUUID();
  await call(`/workouts/${id}`, { method: 'PUT', token: a, body: workoutBody({ workout: { title: 'A private' } }) });

  const hijack = await call(`/workouts/${id}`, { method: 'PUT', token: b, body: workoutBody({ workout: { title: 'HIJACKED' } }) });
  assert.equal(hijack.status, 404, 'overwriting someone else\'s workout id updates nothing');

  const bList = await call('/workouts', { token: b });
  assert.ok(!bList.json.workouts.some((w) => w.id === id), 'B cannot list A\'s workout');
  assert.equal((await call('/records', { token: b })).json.records.length, 0, 'B has no records');

  const { rows } = await admin.query(`SELECT title, user_id FROM ${schema}.workouts WHERE id = $1`, [id]);
  assert.equal(rows[0].title, 'A private');
  assert.equal(rows[0].user_id, userA);
});

test('workouts: client-supplied owner fields are ignored and bad input is rejected', { skip: !haveDb }, async () => {
  const token = await sign({ sub: userA });
  const id = randomUUID();
  const body = workoutBody();
  body.workout.user_id = userB;
  body.sets[0].user_id = userB;
  assert.equal((await call(`/workouts/${id}`, { method: 'PUT', token, body })).status, 200);
  const { rows } = await admin.query(`SELECT user_id FROM ${schema}.workouts WHERE id = $1`, [id]);
  assert.equal(rows[0].user_id, userA);
  const sets = await admin.query(`SELECT DISTINCT user_id FROM ${schema}.workout_sets WHERE workout_id = $1`, [id]);
  assert.deepEqual(sets.rows.map((r) => r.user_id), [userA]);

  const bad = [
    ['bad id', 'not-a-uuid', workoutBody()],
    ['negative weight', randomUUID(), workoutBody({ sets: [{ exercise_id: 'x', exercise_name: 'X', set_order: 1, weight_kg: -5, reps: 5 }] })],
    ['huge weight', randomUUID(), workoutBody({ sets: [{ exercise_id: 'x', exercise_name: 'X', set_order: 1, weight_kg: 99999, reps: 5 }] })],
    ['over 24h', randomUUID(), workoutBody({ workout: { duration_seconds: 200000 } })],
    ['future date', randomUUID(), workoutBody({ workout: { started_at: iso(10 * 86_400_000) } })],
    ['too many sets', randomUUID(), workoutBody({ sets: Array.from({ length: 501 }, (_, i) => ({ exercise_id: 'x', exercise_name: 'X', set_order: (i % 500) + 1, weight_kg: 1, reps: 1 })) })],
    ['no workout', randomUUID(), {}],
  ];
  for (const [name, wid, b] of bad) {
    assert.equal((await call(`/workouts/${wid}`, { method: 'PUT', token, body: b })).status, 400, name);
  }
  const res = await app.request(`/workouts/${randomUUID()}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{"workout": ' });
  assert.equal(res.status, 400, 'broken JSON');
});

test('workouts: a failed upload leaves no partial data', { skip: !haveDb }, async () => {
  const token = await sign({ sub: userA });
  const id = randomUUID();
  // The 2nd set passes validation but violates nothing in the DB, so force a DB failure with a record whose
  // value is valid for the API but too long for the column: exercise_name is cut at 150 so use a bad type instead.
  const body = workoutBody({ prs: [{ exercise_id: 'x', exercise_name: 'X', weight_kg: 1, reps: 1, one_rep_max: 5, achieved_at: iso(-1000) }] });
  await admin.query(`DROP INDEX ${schema}.uq_personal_record_event`);
  await admin.query(`ALTER TABLE ${schema}.personal_records ADD CONSTRAINT force_fail CHECK (one_rep_max <> 5)`);
  try {
    const r = await call(`/workouts/${id}`, { method: 'PUT', token, body });
    assert.equal(r.status, 500);
    assert.deepEqual(r.json, { error: 'server-error' }, 'internals are not leaked');
    const { rows } = await admin.query(`SELECT count(*)::int AS n FROM ${schema}.workouts WHERE id = $1`, [id]);
    assert.equal(rows[0].n, 0, 'the transaction rolled back');
  } finally {
    await admin.query(`ALTER TABLE ${schema}.personal_records DROP CONSTRAINT force_fail`);
    await admin.query(`CREATE UNIQUE INDEX uq_personal_record_event ON ${schema}.personal_records(user_id, exercise_id, achieved_at)`);
  }
});

// ---------------------------------------------------------------- coach proxy
test('coach: forwards only allowed fields, hides the key from the body, and limits abuse', async () => {
  const token = await sign({ sub: randomUUID() });
  geminiCalls.length = 0;
  const ok = await call('/coach', {
    method: 'POST', token,
    body: { system: 'be brief', contents: [{ role: 'user', parts: [{ text: 'hi' }] }], maxOutputTokens: 999_999, model: 'evil-model', tools: [{ x: 1 }], safetySettings: [] },
  });
  assert.equal(ok.status, 200);
  assert.deepEqual(ok.json, { text: '{"reply":"hi"}', truncated: false });
  const sent = geminiCalls[0];
  assert.equal(sent.init.headers['x-goog-api-key'], 'test-key');
  assert.ok(!sent.url.includes('test-key'), 'key is never in the URL');
  assert.ok(!sent.url.includes('evil-model'), 'the model is fixed server-side');
  assert.deepEqual(Object.keys(sent.body).sort(), ['contents', 'generationConfig', 'systemInstruction']);
  assert.equal(sent.body.generationConfig.maxOutputTokens, 8192, 'output size is capped');

  const img = { inlineData: { mimeType: 'image/png', data: 'AAAA' } };
  const tooMany = await call('/coach', { method: 'POST', token, body: { system: 's', contents: [{ role: 'user', parts: [img, img, img, img] }] } });
  assert.equal(tooMany.status, 400);
  const badMime = await call('/coach', { method: 'POST', token, body: { system: 's', contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'text/html', data: 'AAAA' } }] }] } });
  assert.equal(badMime.status, 400);
  const garbage = await call('/coach', { method: 'POST', token, body: { nope: true } });
  assert.equal(garbage.status, 400);
});

test('coach: hourly limit per user, and a busy upstream maps to a stable error', async () => {
  const token = await sign({ sub: randomUUID() });
  const body = { system: 's', contents: [{ role: 'user', parts: [{ text: 'hi' }] }] };
  for (let i = 0; i < 30; i++) assert.equal((await call('/coach', { method: 'POST', token, body })).status, 200);
  assert.equal((await call('/coach', { method: 'POST', token, body })).status, 429);

  const busyApp = createApp({
    pool: { query: async () => ({ rows: [] }), connect: async () => ({}) },
    verify: async () => ({ id: userA, email: null, name: null }),
    allowedOrigins: [], geminiKey: 'k',
    fetchImpl: async () => new Response('{}', { status: 503 }),
  });
  const r = await busyApp.request('/coach', { method: 'POST', headers: { Authorization: 'Bearer x', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal(r.status, 502);
  assert.deepEqual(await r.json(), { error: 'busy' });

  const noKey = createApp({ pool: { query: async () => ({ rows: [] }), connect: async () => ({}) }, verify: async () => ({ id: userA, email: null, name: null }), allowedOrigins: [] });
  const nk = await noKey.request('/coach', { method: 'POST', headers: { Authorization: 'Bearer x', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal(nk.status, 500);
  assert.deepEqual(await nk.json(), { error: 'not-configured' });
});

// ---------------------------------------------------------------- realtime
test('realtime: sealing returns opaque capabilities for exactly the two live queries', { skip: !process.env.NEON_REALTIME_SECRET }, async () => {
  const dbName = new URL(process.env.DATABASE_URL).pathname.slice(1);
  const seal = makeSealer({ secret: process.env.NEON_REALTIME_SECRET, db: dbName });
  const sealed = await seal(userA);
  assert.deepEqual(Object.keys(sealed).sort(), ['profile', 'workouts']);
  for (const q of Object.values(sealed)) {
    assert.equal(typeof q.capability, 'string');
    assert.ok(q.expiresAt > Date.now());
    assert.ok(!JSON.stringify(q).includes(userA), 'the user id is not readable in the capability');
    assert.ok(!JSON.stringify(q).includes(process.env.NEON_REALTIME_SECRET), 'the secret is never returned');
  }
});

// ---------------------------------------------------------------- Gemini fallback
test('coach: falls back to the lighter model when the main one is limited, and gives up cleanly when both are', async () => {
  const { callGemini } = await import('../functions/lib/coach.ts');
  const payload = { systemInstruction: { parts: [{ text: 's' }] }, contents: [{ role: 'user', parts: [{ text: 'hi' }] }], generationConfig: {} };
  const ok = JSON.stringify({ candidates: [{ content: { parts: [{ text: 'fallback answer' }] }, finishReason: 'STOP' }] });
  const urls = [];
  const mk = (statuses) => async (url) => {
    urls.push(String(url));
    const status = statuses.shift();
    return new Response(status === 200 ? ok : '{}', { status });
  };

  const rescued = await callGemini(payload, { apiKey: 'k', model: 'main-m', fallbackModel: 'lite-m', fetchImpl: mk([429, 200]) });
  assert.deepEqual(rescued, { text: 'fallback answer', truncated: false });
  assert.ok(urls[0].includes('main-m') && urls[1].includes('lite-m'), 'tried main first, then the fallback');

  urls.length = 0;
  const both = await callGemini(payload, { apiKey: 'k', model: 'main-m', fallbackModel: 'lite-m', fetchImpl: mk([503, 429]) });
  assert.deepEqual(both, { error: 'busy' });

  urls.length = 0;
  const bad = await callGemini(payload, { apiKey: 'k', model: 'main-m', fallbackModel: 'lite-m', fetchImpl: mk([400]) });
  assert.deepEqual(bad, { error: 'upstream-error' });
  assert.equal(urls.length, 1, 'a bad request is not retried on another model');

  urls.length = 0;
  await callGemini(payload, { apiKey: 'k', model: 'same', fallbackModel: 'same', fetchImpl: mk([429]) });
  assert.equal(urls.length, 1, 'no pointless retry on the same model');
});
