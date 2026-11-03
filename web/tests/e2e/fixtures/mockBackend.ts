import type { Page, Route } from '@playwright/test';

// MOCKED backend. Real server rules are covered by web/test/api.test.js against a live database.
export type Mock = {
  users: Map<string, { password: string; name: string }>;
  workouts: Map<string, unknown>;
  calls: { method: string; path: string; body?: unknown }[];
  failWorkoutPut?: number; // status to return for PUT /workouts/:id
  putDelayMs?: number; // slow down PUT /workouts/:id to test overlapping uploads
  coachFail?: { status: number; error: string };
  coachReply?: unknown; // JSON object returned by /coach
  signedIn?: string;
  online: boolean;
};

const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
// Unsigned, fake token: the mocked API never verifies it.
const fakeToken = () => `${b64({ alg: 'none' })}.${b64({ sub: '00000000-0000-4000-8000-000000000001', exp: Math.floor(Date.now() / 1000) + 900 })}.x`;
const json = (route: Route, status: number, body: unknown, headers: Record<string, string> = {}) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body), headers: { 'access-control-expose-headers': 'set-auth-jwt', ...headers } });

export async function mockBackend(page: Page, opts: { signedIn?: string; profile?: unknown } = {}) {
  const m: Mock = { users: new Map([['ana@example.com', { password: 'Correct-horse-1', name: 'Ana' }]]), workouts: new Map(), calls: [], signedIn: opts.signedIn, online: true };
  const session = () => (m.signedIn ? { session: { id: 's1' }, user: { id: '00000000-0000-4000-8000-000000000001', email: m.signedIn, name: m.users.get(m.signedIn)?.name ?? 'Ana' } } : null);

  await page.route('**/neon-auth/**', async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname.replace('/neon-auth', '');
    const body = req.postDataJSON?.() ?? {};
    m.calls.push({ method: req.method(), path: `auth${path}` });
    // The Better Auth JWT plugin hands out the API token in this header on every get-session response.
    if (path.endsWith('/get-session')) return json(route, 200, session(), m.signedIn ? { 'set-auth-jwt': fakeToken() } : {});
    if (path.endsWith('/token')) return m.signedIn ? json(route, 200, { token: fakeToken() }) : json(route, 401, {});
    if (path.endsWith('/sign-in/email')) {
      const u = m.users.get(String(body.email).toLowerCase());
      if (!u || u.password !== body.password) return json(route, 401, { code: 'INVALID_EMAIL_OR_PASSWORD', message: 'Invalid email or password' });
      m.signedIn = String(body.email).toLowerCase();
      return json(route, 200, { user: session()!.user, token: 't' });
    }
    if (path.endsWith('/sign-up/email')) {
      const email = String(body.email).toLowerCase();
      if (m.users.has(email)) return json(route, 422, { code: 'USER_ALREADY_EXISTS', message: 'User already exists' });
      m.users.set(email, { password: body.password, name: body.name });
      m.signedIn = email;
      return json(route, 200, { user: session()!.user, token: 't' });
    }
    if (path.endsWith('/sign-out')) { m.signedIn = undefined; return json(route, 200, { success: true }); }
    if (path.includes('password')) return json(route, 200, { status: true });
    return json(route, 404, {});
  });

  await page.route('**/api.mock.invalid/**', async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const body = req.postDataJSON?.();
    m.calls.push({ method: req.method(), path, body });
    if (!m.online) return route.abort('internetdisconnected');
    if (path === '/me') return json(route, 200, req.method() === 'GET' ? { profile: opts.profile ?? null } : { ok: true });
    if (path === '/records') return json(route, 200, { records: [] });
    if (path === '/workouts' && req.method() === 'GET') return json(route, 200, { workouts: [...m.workouts.values()] });
    if (path.startsWith('/workouts/') && req.method() === 'PUT') {
      if (m.putDelayMs) await new Promise((r) => setTimeout(r, m.putDelayMs));
      if (m.failWorkoutPut) return json(route, m.failWorkoutPut, { error: 'mock failure' });
      m.workouts.set(path.split('/').pop()!, body);
      return json(route, 200, { ok: true });
    }
    if (path === '/coach' && m.coachFail) return json(route, m.coachFail.status, { error: m.coachFail.error });
    if (path === '/coach') return json(route, 200, { text: JSON.stringify(m.coachReply ?? { reply: 'Mock coach reply.', remember: [], actions: [] }) });
    if (path === '/realtime/seal') return json(route, 404, {});
    return json(route, 404, {});
  });
  return m;
}
