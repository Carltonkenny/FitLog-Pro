// Shared set-up for the security and database tests.
// Real PostgreSQL semantics via PGlite loaded with neon/schema.sql (it does NOT touch Neon).
// The API under test is the production code (functions/app.ts). Most tests use a fixed token table;
// the real JWT verification tests are in tests/security/authentication.test.js.
// Limit: PGlite has one connection, so requests are serialised (no true parallel transactions).
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../functions/app.ts';
import { makeDb, makePool } from './pgliteDb.js';

export const ORIGIN_OK = 'https://fitlog.example.app';
export const A = randomUUID();
export const B = randomUUID();
export const TOKENS = { 'tok-a': { id: A, email: 'a@example.test', name: 'Alice' }, 'tok-b': { id: B, email: 'b@example.test', name: 'Bob' } };
export const verify = async (t) => TOKENS[t] ?? null;

export let db;
export let pool;
export let app;
export const geminiCalls = [];
export const fakeFetch = async (url, init) => {
  geminiCalls.push({ url, headers: init.headers });
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"reply":"hi"}' }] }, finishReason: 'STOP' }] }), { status: 200 });
};

export const iso = (offsetMs = 0) => new Date(Date.now() + offsetMs).toISOString();
export const setRow = (n, over = {}) => ({ exercise_id: 'bench_press', exercise_name: 'Bench', set_order: n, weight_kg: 60 + n, reps: 8, is_completed: true, set_type: 'normal', completed_at: iso(), ...over });
export const body = (over = {}) => ({
  workout: { title: 'Push day', started_at: iso(-3_600_000), completed_at: iso(), duration_seconds: 3600, volume_kg: 1200.5, total_sets: 2, ...over.workout },
  sets: over.sets ?? [setRow(1), setRow(2)],
  prs: over.prs ?? [{ exercise_id: 'bench_press', exercise_name: 'Bench', weight_kg: 80, reps: 8, one_rep_max: 101.3, achieved_at: '2026-10-20T10:00:00.000Z' }],
});

export const call = async (path, { method = 'GET', token, json, raw, headers = {}, application = app } = {}) => {
  const res = await application.request(path, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(json || raw ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: method === 'GET' ? undefined : (raw ?? (json === undefined ? undefined : JSON.stringify(json))),
  });
  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  return { status: res.status, json: parsed, text, headers: res.headers };
};
export const put = (id, json, token = 'tok-a') => call(`/workouts/${id}`, { method: 'PUT', token, json });
export const q = async (sql, params) => (await db.query(sql, params)).rows;
export const count = async (table, where = 'TRUE', params = []) => (await q(`SELECT count(*)::int AS n FROM ${table} WHERE ${where}`, params))[0].n;


/** Call from each test file: before(setup); after(teardown). */
export async function setup() {
  db = await makeDb();
  await db.query('INSERT INTO neon_auth."user" (id, email) VALUES ($1, $2), ($3, $4)', [A, 'a@example.test', B, 'b@example.test']);
  pool = makePool(db);
  app = createApp({ pool, verify, allowedOrigins: [ORIGIN_OK], geminiKey: 'test-key', fetchImpl: fakeFetch });
}
export async function teardown() {
  await db.close();
}

export const insertUser = async () => { const id = randomUUID(); await db.query('INSERT INTO neon_auth."user" (id, email) VALUES ($1, $2)', [id, `${id}@x.test`]); await db.query('INSERT INTO profiles (id) VALUES ($1)', [id]); return id; };
export const insWorkout = (id, user, over = {}) => db.query('INSERT INTO workouts (id, user_id, title, started_at, duration_seconds, volume_kg, total_sets) VALUES ($1, $2, $3, NOW(), $4, $5, $6)', [id, user, over.title ?? 't', over.duration ?? 10, over.volume ?? 1, over.sets ?? 1]);
export const rejects = async (p, re = /violates|constraint|null value|invalid|too long|overflow/i) => { await assert.rejects(p, re); };

export const setsOf = (id) => q('SELECT exercise_id, set_order, weight_kg::float AS w, reps, is_completed, set_type, completed_at FROM workout_sets WHERE workout_id = $1 ORDER BY set_order', [id]);

