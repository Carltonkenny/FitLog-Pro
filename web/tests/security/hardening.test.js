// Hardening: error leakage, CORS, health, coach rate limit, secrets and security headers.
// Run: npm run test:security   (real PostgreSQL engine via PGlite; does not touch Neon)
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../functions/app.ts';
import { makeRateLimiter } from '../../functions/lib/coach.ts';
import { call, put, body, pool, verify, geminiCalls, fakeFetch, ORIGIN_OK, setup, teardown } from '../helpers/apiHarness.js';

before(setup);
after(teardown);

test('SEC-ERR-001 a database failure returns a generic 500 with no SQL, table names, stack or connection details', async () => {
  const failing = createApp({
    pool: { query: async () => { throw new Error('connection to postgres://user:secret@host/db failed'); }, connect: async () => { throw new Error('boom postgres://user:secret@host/db'); } },
    verify, allowedOrigins: [],
  });
  const logs = [];
  const orig = console.error;
  console.error = (...a) => logs.push(a.join(' '));
  try {
    for (const r of [await call('/me', { token: 'tok-a', application: failing }), await call('/workouts', { token: 'tok-a', application: failing }), await put(randomUUID(), body(), 'tok-a').catch(() => null)]) {
      if (!r) continue;
      if (r.text) assert.ok(!/secret|postgres:|relation|workouts|stack/i.test(r.text), r.text);
    }
    const r = await call('/me', { token: 'tok-a', application: failing });
    assert.equal(r.status, 500);
    assert.deepEqual(r.json, { error: 'server-error' });
  } finally { console.error = orig; }
  assert.ok(logs.length > 0, 'the failure was logged');
  assert.ok(logs.every((l) => !/user:secret/.test(l)), 'credentials in a connection string never reach the log');
});

test('SEC-CORS-001 only localhost and configured origins are allowed; others get no CORS header; no credentials header', async () => {
  const get = (o) => call('/health', { headers: { Origin: o } });
  assert.equal((await get(ORIGIN_OK)).headers.get('access-control-allow-origin'), ORIGIN_OK);
  assert.equal((await get('http://localhost:5173')).headers.get('access-control-allow-origin'), 'http://localhost:5173');
  for (const o of ['https://evil.example', 'https://fitlog.example.app.evil.com', 'http://localhost.evil.com', 'null', 'https://FITLOG.example.app']) {
    assert.equal((await get(o)).headers.get('access-control-allow-origin'), null, o);
  }
  assert.equal((await get(ORIGIN_OK)).headers.get('access-control-allow-credentials'), null);
  const pre = await call('/workouts', { method: 'OPTIONS', headers: { Origin: ORIGIN_OK, 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'authorization,content-type' } });
  assert.ok(pre.status === 204 || pre.status === 200);
  assert.match(pre.headers.get('access-control-allow-methods') ?? '', /PUT/);
});

test('SEC-HEALTH-001 /health is public, answers ok and runs no SQL, even when the database is down', async () => {
  const dead = createApp({ pool: { query: async () => { throw new Error('db down'); }, connect: async () => { throw new Error('db down'); } }, verify, allowedOrigins: [] });
  const r = await call('/health', { application: dead });
  assert.equal(r.status, 200);
  assert.deepEqual(r.json, { ok: true });
  const n = pool.log.length;
  await call('/health');
  assert.equal(pool.log.length, n);
});

test('SEC-RATE-001 coach limiter: requests 1..30 pass, the 31st is blocked, the window resets, users are independent', () => {
  const limited = makeRateLimiter(30, 3_600_000);
  const t0 = 1_000_000;
  for (let i = 0; i < 30; i += 1) assert.equal(limited('u1', t0 + i), false, `request ${i + 1}`);
  assert.equal(limited('u1', t0 + 31), true, '31st');
  assert.equal(limited('u2', t0 + 31), false, 'another user is unaffected');
  assert.equal(limited('u1', t0 + 3_600_000 - 1), true, 'still blocked just before the window ends');
  assert.equal(limited('u1', t0 + 3_600_000 + 30), false, 'allowed again once the oldest hits age out');
});

test('SEC-RATE-002 /coach returns 429 {error: rate-limited} after 30 calls per user; limit is per user id, so spoofed headers do not change it', async () => {
  const gated = createApp({ pool, verify, allowedOrigins: [], geminiKey: 'k', fetchImpl: fakeFetch });
  const ask = (token, extra = {}) => call('/coach', { method: 'POST', token, json: { system: 's', contents: [{ role: 'user', parts: [{ text: 'hi' }] }] }, headers: extra, application: gated });
  for (let i = 0; i < 30; i += 1) assert.equal((await ask('tok-a', { 'X-Forwarded-For': `1.2.3.${i}` })).status, 200, `call ${i + 1}`);
  const blocked = await ask('tok-a', { 'X-Forwarded-For': '9.9.9.9' });
  assert.equal(blocked.status, 429);
  assert.deepEqual(blocked.json, { error: 'rate-limited' });
  assert.equal((await ask('tok-b')).status, 200, 'a different user is not blocked');
});

test('SEC-RATE-003 the 429 carries a Retry-After header', async () => {
  const gated = createApp({ pool, verify, allowedOrigins: [], geminiKey: 'k', fetchImpl: fakeFetch });
  for (let i = 0; i < 31; i += 1) await call('/coach', { method: 'POST', token: 'tok-a', json: { system: 's', contents: [{ role: 'user', parts: [{ text: 'x' }] }] }, application: gated });
  const r = await call('/coach', { method: 'POST', token: 'tok-a', json: { system: 's', contents: [{ role: 'user', parts: [{ text: 'x' }] }] }, application: gated });
  assert.equal(r.status, 429);
  const wait = Number(r.headers.get('retry-after'));
  assert.ok(wait >= 1 && wait <= 3600, `Retry-After ${wait}`);
});

test('SEC-RATE-004 coach input limits: bad MIME, 4 images, oversize text and wrong shapes are 400 and never reach Gemini', async () => {
  const before = geminiCalls.length;
  const ok = { role: 'user', parts: [{ text: 'hi' }] };
  const img = { inlineData: { mimeType: 'image/png', data: 'AAAA' } };
  const cases = [
    { system: 's', contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'text/html', data: 'AAAA' } }] }] },
    { system: 's', contents: [{ role: 'user', parts: [img, img, img, img] }] },
    { system: 's'.repeat(31_000), contents: [ok] },
    { system: 5, contents: [ok] }, { system: 's', contents: 'x' }, { system: 's', contents: [{ role: 'user', parts: [{ nope: 1 }] }] },
  ];
  for (const c of cases) {
    const gated = createApp({ pool, verify, allowedOrigins: [], geminiKey: 'k', fetchImpl: fakeFetch });
    assert.equal((await call('/coach', { method: 'POST', token: 'tok-b', json: c, application: gated })).status, 400);
  }
  assert.equal(geminiCalls.length, before);
});

test('SEC-RATE-005 the Gemini key is sent in a header to Google only, never in a URL, and never returned to the browser', async () => {
  const gated = createApp({ pool, verify, allowedOrigins: [], geminiKey: 'SECRET-KEY-123', fetchImpl: fakeFetch });
  const r = await call('/coach', { method: 'POST', token: 'tok-b', json: { system: 's', contents: [{ role: 'user', parts: [{ text: 'hi' }] }] }, application: gated });
  assert.ok(!r.text.includes('SECRET-KEY-123'));
  const last = geminiCalls.at(-1);
  assert.ok(!last.url.includes('SECRET-KEY-123') && last.url.startsWith('https://generativelanguage.googleapis.com/'));
  assert.equal(last.headers['x-goog-api-key'], 'SECRET-KEY-123');
});

test('SEC-RATE-007 retryAfter reports the real wait: seconds until the oldest request leaves the window', () => {
  const limited = makeRateLimiter(2, 3_600_000);
  limited('u', 0); limited('u', 1000); limited('u', 2000);
  assert.equal(limited.retryAfter('u', 600_000), 3000); // oldest hit at t=0 ages out at 3600 s; 600 s have passed
  assert.equal(limited.retryAfter('nobody', 0), 1);
});

test('SEC-RATE-006 the limiter evicts users who stopped calling, and still blocks an active abuser while pruning', () => {
  const limited = makeRateLimiter(3, 1000);
  for (let i = 0; i < 6000; i += 1) limited(`user-${i}`, 0);
  limited('abuser', 1500); limited('abuser', 1501); limited('abuser', 1502);
  assert.equal(limited('abuser', 1503), true, 'blocked');
  assert.equal(limited('late', 1600), false); // triggers pruning of users idle for the whole window
  assert.equal(limited('abuser', 1601), true, 'abuser (inside the window) is not forgotten by pruning');
  assert.equal(limited('user-0', 1602), false);
});

const repo = new URL('../../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 50_000_000 });

test('SEC-CONFIG-001 no secret-looking value is committed (API keys, DB URLs with passwords, private keys)', () => {
  const files = git('ls-files').split('\n').filter((f) => f && !/package-lock\.json|^docs\/|^web\/tests\/|\.(png|jpg|webp|woff2|ico)$/.test(f));
  const pattern = /AIza[0-9A-Za-z_-]{30,}|npg_[A-Za-z0-9]{10,}|postgres(?:ql)?:\/\/[^\s"'<>:@]+:[^\s"'<>@]{6,}@|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sb_secret_[A-Za-z0-9]+|sk-[A-Za-z0-9]{20,}/;
  const hits = files.filter((f) => existsSync(`${repo}/${f}`) && pattern.test(readFileSync(`${repo}/${f}`, 'utf8')));
  assert.deepEqual(hits, []);
});

test('SEC-CONFIG-002 only .env.example is tracked, and it holds public values or placeholders', () => {
  const envFiles = git('ls-files').split('\n').filter((f) => /(^|\/)\.env/.test(f));
  assert.deepEqual(envFiles, ['web/.env.example']);
  const example = readFileSync(`${repo}/web/.env.example`, 'utf8');
  assert.ok(!/GEMINI_API_KEY\s*=\s*\S|DATABASE_URL\s*=\s*\S|REALTIME_SECRET\s*=\s*\S/.test(example), 'no secret values');
  assert.match(example, /VITE_GOOGLE_AUTH=false/, 'Google flag is off by default in the shared example');
});

test('SEC-CONFIG-003 Vite only exposes public prefixes, never DATABASE/SECRET/GEMINI names', () => {
  const cfg = readFileSync(`${repo}/web/vite.config.js`, 'utf8');
  const list = cfg.match(/PUBLIC_ENV\s*=\s*\[([^\]]*)\]/)?.[1] ?? '';
  assert.ok(list.length > 0);
  assert.ok(!/DATABASE|SECRET|GEMINI|KEY/i.test(list), list);
});

test('SEC-CONFIG-004 the built bundle has no source maps and none of the secret variable names', (t) => {
  const dist = `${repo}/web/dist-perf/assets`;
  if (!existsSync(dist)) return t.skip('run `npm run build:perf` first; nothing was checked'); // shows as skipped, never as passed
  const files = readdirSync(dist);
  assert.equal(files.filter((f) => f.endsWith('.map')).length, 0, 'source maps shipped');
  for (const f of files.filter((x) => x.endsWith('.js'))) {
    assert.ok(!/GEMINI_API_KEY|DATABASE_URL|NEON_REALTIME_SECRET/.test(readFileSync(`${dist}/${f}`, 'utf8')), f);
  }
});

test('SEC-CONFIG-005 Netlify sends the security headers and a CSP without unsafe-eval or third-party script/font hosts', () => {
  const toml = readFileSync(`${repo}/netlify.toml`, 'utf8');
  for (const h of ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options = "nosniff"', 'X-Frame-Options = "DENY"', 'Referrer-Policy', 'Permissions-Policy']) assert.ok(toml.includes(h), h);
  const csp = toml.match(/Content-Security-Policy = "([^"]+)"/)[1];
  assert.ok(!/unsafe-eval/.test(csp));
  assert.match(csp, /script-src 'self'(;|$)/);
  assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(csp), 'fonts are self-hosted');
  assert.match(csp, /frame-ancestors 'none'/);
});

test('SEC-CONFIG-006 the API keeps its Gemini key only on the server side (no import from src/)', () => {
  const files = ['app.ts', 'lib/coach.ts'].map((f) => readFileSync(new URL(`../../functions/${f}`, import.meta.url), 'utf8')).join('\n');
  assert.ok(!/VITE_|import\.meta\.env/.test(files));
});
