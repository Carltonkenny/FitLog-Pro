// Authentication: missing, malformed, forged and expired tokens. Real JWT verification with a local key and JWKS server.
// Run: npm run test:security   (real PostgreSQL engine via PGlite; does not touch Neon)
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { SignJWT, exportJWK, generateKeyPair } from 'jose';
import { makeVerifier } from '../../functions/lib/auth.ts';
import { call, pool, setup, teardown } from '../helpers/apiHarness.js';
import { A, B } from '../helpers/apiHarness.js';

before(setup);
after(async () => {
  await teardown();
  jwksServer?.closeAllConnections?.();
  jwksServer?.close();
});

let jwksServer;
let keys;
const ISSUER = 'https://auth.example.test';
async function jwtApp() {
  keys ??= await generateKeyPair('EdDSA', { extractable: true });
  const jwk = { ...(await exportJWK(keys.publicKey)), kid: 'k1', alg: 'EdDSA', use: 'sig' };
  jwksServer ??= http.createServer((_, res) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ keys: [jwk] })); });
  if (!jwksServer.listening) await new Promise((r) => jwksServer.listen(0, '127.0.0.1', r));
  return makeVerifier({ jwksUrl: `http://127.0.0.1:${jwksServer.address().port}/jwks.json`, baseUrl: `${ISSUER}/neondb/auth` });
}
const sign = (claims = {}, { key, kid = 'k1', iss = ISSUER, exp = '10m', alg = 'EdDSA' } = {}) =>
  new SignJWT({ email: 'a@example.test', ...claims }).setProtectedHeader({ alg, kid }).setIssuedAt().setIssuer(iss).setExpirationTime(exp).sign(key ?? keys.privateKey);


test('SEC-AUTH-001 every protected route answers 401 without a token and never touches the database', async () => {
  const before = pool.log.length;
  const routes = [['GET', '/me'], ['PUT', '/me'], ['GET', '/workouts'], ['PUT', `/workouts/${randomUUID()}`], ['GET', '/records'], ['POST', '/coach'], ['POST', '/realtime/seal']];
  for (const [method, path] of routes) {
    const r = await call(path, { method, json: {} });
    assert.equal(r.status, 401, `${method} ${path}`);
    assert.deepEqual(r.json, { error: 'unauthorized' });
  }
  assert.equal(pool.log.length, before, 'no SQL ran for unauthenticated requests');
});

test('SEC-AUTH-002 malformed Authorization headers are rejected', async () => {
  for (const h of ['Basic abc', 'Bearer', 'Bearer ', 'bearer tok-a', 'Token tok-a', 'tok-a', 'Bearer tok-a extra']) {
    const r = await call('/records', { headers: { Authorization: h } });
    assert.equal(r.status, 401, h);
  }
});

test('SEC-AUTH-003 an unknown or empty token is 401 with an identical body (no hint why)', async () => {
  const a = await call('/records', { token: 'nope' });
  const b = await call('/records', { token: 'x'.repeat(5000) });
  assert.equal(a.status, 401);
  assert.deepEqual(a.json, b.json);
});

test('SEC-AUTH-004 real JWT verification: valid token accepted; expired, wrong issuer, wrong key, bad kid, non-UUID subject, alg=none, HS256 key-confusion and tampered payload rejected', async () => {
  const v = await jwtApp();
  assert.equal((await v(await sign({ sub: A })))?.id, A);
  assert.equal(await v(await sign({ sub: A }, { exp: '-1m' })), null, 'expired');
  assert.equal(await v(await sign({ sub: A }, { iss: 'https://evil.example' })), null, 'wrong issuer');
  const other = await generateKeyPair('EdDSA');
  assert.equal(await v(await sign({ sub: A }, { key: other.privateKey })), null, 'signed by another key');
  assert.equal(await v(await sign({ sub: A }, { kid: 'unknown' })), null, 'unknown kid');
  assert.equal(await v(await sign({ sub: 'not-a-uuid' })), null, 'non-UUID sub');
  assert.equal(await v(await sign({})), null, 'missing sub');
  const none = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: A, iss: ISSUER, exp: 9999999999 })).toString('base64url')}.`;
  assert.equal(await v(none), null, 'alg none');
  const hs = await new SignJWT({ sub: A }).setProtectedHeader({ alg: 'HS256', kid: 'k1' }).setIssuer(ISSUER).setExpirationTime('10m').sign(new TextEncoder().encode(JSON.stringify(await exportJWK(keys.publicKey))));
  assert.equal(await v(hs), null, 'HS256 signed with the public key as secret');
  const good = await sign({ sub: A });
  const [h, , s] = good.split('.');
  const forged = `${h}.${Buffer.from(JSON.stringify({ sub: B, iss: ISSUER, exp: 9999999999 })).toString('base64url')}.${s}`;
  assert.equal(await v(forged), null, 'payload swapped to another user');
});

test('SEC-AUTH-005 a still-valid token can be replayed (bearer-token design): documented behaviour, not a defect', async () => {
  const v = await jwtApp();
  const t = await sign({ sub: A });
  assert.equal((await v(t))?.id, A);
  assert.equal((await v(t))?.id, A);
});

test('SEC-AUTH-006 email and name claims from the token are length-limited before they reach the database', async () => {
  const v = await jwtApp();
  const user = await v(await sign({ sub: A, email: `${'a'.repeat(500)}@example.test`, name: 'n'.repeat(500) }));
  assert.ok(user.email.length <= 254 && user.name.length <= 100);
});
