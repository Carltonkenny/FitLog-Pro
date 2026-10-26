// Live integration checks against the real Neon services. Skipped automatically when their settings are
// missing (for example on a fresh checkout), so `npm test` stays green offline.
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import pg from 'pg';
import { createRealtime, rawSql } from '@neon/realtime/server';
import { createRealtimeClient } from '@neon/realtime/client';
import { callGemini, sanitizeCoachRequest } from '../functions/lib/coach.ts';

const env = process.env;
const haveRealtime = Boolean(env.NEON_REALTIME_SECRET && env.NEON_REALTIME_URL && env.DATABASE_URL_UNPOOLED);

// Reads GEMINI_API_KEY from web/.env.production (git-ignored), the same file `neon deploy` uses.
function geminiKey() {
  if (env.GEMINI_API_KEY) return env.GEMINI_API_KEY;
  const file = new URL('../.env.production', import.meta.url);
  if (!existsSync(file)) return null;
  const line = readFileSync(file, 'utf8').split('\n').find((l) => l.startsWith('GEMINI_API_KEY='));
  return line ? line.slice('GEMINI_API_KEY='.length).trim() || null : null;
}

test('realtime: a live subscription sees a row inserted after it started', { skip: !haveRealtime, timeout: 60_000 }, async () => {
  const schema = `rt_${randomBytes(5).toString('hex')}`;
  const uid = randomUUID();
  const db = new pg.Client({ connectionString: env.DATABASE_URL_UNPOOLED });
  await db.connect();
  const realtime = createRealtime({ secret: env.NEON_REALTIME_SECRET, db: new URL(env.DATABASE_URL_UNPOOLED).pathname.slice(1) });
  const client = createRealtimeClient({ url: env.NEON_REALTIME_URL });
  try {
    await db.query(`CREATE SCHEMA ${schema}`);
    await db.query(`CREATE TABLE ${schema}.workouts (id UUID PRIMARY KEY, user_id UUID NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    const sealed = await realtime.seal({
      query: rawSql(`SELECT id, updated_at FROM ${schema}.workouts WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 5`, [uid]),
    });
    const sub = client.subscribe(sealed);
    const snapshots = [];
    const waitFor = (pred, ms) =>
      new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error(`timed out; snapshots: ${JSON.stringify(snapshots.map((s) => [s.status, s.data?.length]))}`)), ms);
        sub.onChange((snap) => {
          snapshots.push(snap);
          if (pred(snap)) { clearTimeout(t); resolve(snap); }
        });
      });
    await waitFor((s) => Array.isArray(s.data) && s.data.length === 0, 25_000); // first snapshot: nothing yet
    const changed = waitFor((s) => Array.isArray(s.data) && s.data.length === 1, 25_000);
    await db.query(`INSERT INTO ${schema}.workouts (id, user_id) VALUES ($1, $2)`, [randomUUID(), uid]);
    const snap = await changed;
    assert.equal(snap.data.length, 1, 'the new row arrived over the live connection');
    sub.unsubscribe();
  } finally {
    await client.close();
    await db.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await db.end();
    // The realtime client leaves its TLS socket open after close(); a browser would drop it on page exit.
    // Destroy leftovers so the test process can end instead of hanging.
    await new Promise((r) => setTimeout(r, 300));
    for (const h of process._getActiveHandles()) if (h.constructor.name === 'TLSSocket') h.destroy();
  }
});

test('coach: the production Gemini path returns structured JSON with the real key', { skip: !geminiKey(), timeout: 130_000 }, async (t) => {
  const payload = sanitizeCoachRequest({
    system: 'You are a strength coach. Reply as JSON.',
    contents: [{ role: 'user', parts: [{ text: 'Say hi in one short sentence.' }] }],
    maxOutputTokens: 4000,
    responseSchema: { type: 'OBJECT', properties: { reply: { type: 'STRING' } }, required: ['reply'] },
  });
  let result;
  for (let i = 0; i < 4; i++) {
    result = await callGemini(payload, { apiKey: geminiKey(), model: 'gemini-3.6-flash', fallbackModel: 'gemini-3.1-flash-lite' });
    if (!('error' in result) || result.error !== 'busy') break;
    await new Promise((r) => setTimeout(r, 3000));
  }
  // Google sometimes answers 503 "high demand" for minutes. That is their capacity, not a bug here.
  if ('error' in result && result.error === 'busy') return t.skip('Gemini is busy right now (503); try again later');
  assert.ok(!('error' in result), `Gemini call failed: ${JSON.stringify(result)}`);
  assert.equal(result.truncated, false);
  assert.equal(typeof JSON.parse(result.text).reply, 'string');
});
