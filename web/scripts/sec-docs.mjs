// Builds docs/security/* and docs/database/* test-case files and coverage matrices.
//   1. node --import ./test/register.mjs --test --test-reporter=spec "tests/security/*.test.js" "tests/database/*.test.js" > e2e-results/security-db.log
//   2. node scripts/sec-docs.mjs
// Automated cases come from the test names in test/security-db.test.js (ID + description) joined with the log.
// Rows in EXTRA are cases that are NOT in that file: other automated suites, manual, or blocked.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
import { readdirSync } from 'node:fs';
const srcFiles = ['security', 'database'].flatMap((d) => readdirSync(new URL(`web/tests/${d}/`, root)).map((f) => `web/tests/${d}/${f}`));
const src = srcFiles.filter((f) => f.endsWith('.test.js')).map(read).join('\n');
const log = read('web/e2e-results/security-db.log');

const PRIORITY = { 'SEC-AUTH-001': 'P0', 'SEC-AUTH-004': 'P0', 'SEC-AUTHZ-001': 'P0', 'SEC-AUTHZ-002': 'P0', 'SEC-AUTHZ-003': 'P0', 'SEC-AUTHZ-004': 'P0', 'SEC-INJECT-001': 'P0', 'SEC-CONFIG-001': 'P0', 'SEC-ERR-001': 'P1', 'DB-TXN-001': 'P0', 'DB-TXN-002': 'P0', 'DB-BULK-001': 'P0', 'DB-BULK-005': 'P0', 'DB-DELETE-001': 'P0', 'DB-WORKOUT-001': 'P0', 'DB-SCHEMA-002': 'P0' };
const CATEGORY = { AUTH: 'authentication', AUTHZ: 'authorization', INJECT: 'injection', VALID: 'input validation', ERR: 'error handling', CORS: 'configuration', HEALTH: 'availability', RATE: 'rate limiting', CONFIG: 'configuration', SCHEMA: 'schema/constraints', DELETE: 'deletion/cascade', WORKOUT: 'workout persistence', BULK: 'bulk insert', TXN: 'transactions', PERF: 'query performance', CONCURRENCY: 'concurrency' };
const GAP = { 'SEC-RATE-006': 'DEF-S02', 'SEC-RATE-003': 'DEF-S01', 'DB-SCHEMA-008': 'DEF-D01', 'DB-SCHEMA-009': 'DEF-D02', 'DB-WORKOUT-006': 'DEF-D03', 'DB-WORKOUT-004': 'INFO-D04', 'DB-WORKOUT-007': 'DEF-D05', 'DB-WORKOUT-008': 'DEF-D05' };

const found = [...src.matchAll(/^test\('((?:SEC|DB)-[A-Z]+-\d{3}) ([^\n]*?)', (?:\{[^}]*\}, )?(?:async )?\(/gm)];
const automated = found.map(([, id, title]) => {
  const part = id.split('-')[1];
  const sec = id.startsWith('SEC');
  const line = log.split('\n').find((l) => new RegExp(`^\\s*[✔✖﹣] ${id} `).test(l)) ?? '';
  const status = line.includes('✔') ? 'passed' : line.includes('✖') ? 'failed' : line.includes('﹣') ? 'blocked' : 'not executed';
  return {
    id, area: sec ? 'security' : 'database', module: part, feature: title.replace(/ \(.*/, '').slice(0, 90), title: title.replace(/^(KNOWN GAP|BLOCKED|REGRESSION|BENCHMARK)[^:]*: ?/, ''),
    category: CATEGORY[part] ?? part, priority: PRIORITY[id] ?? 'P1',
    endpoint: sec ? 'functions/app.ts' : 'neon/schema.sql + functions/app.ts',
    role: 'Anonymous or authenticated test user (fixed token table) / direct SQL as owner',
    preconditions: sec ? 'In-process API (createApp); fixed test tokens; PGlite database with neon/schema.sql' : 'PGlite (real PostgreSQL in WASM) loaded with neon/schema.sql; no Neon contact',
    testData: 'Generated UUIDs; synthetic workouts; no real user data',
    steps: ['Run the test of the same ID under web/tests/security or web/tests/database', 'The test body is the executable specification of the steps and assertions'],
    expected: [title],
    expectedHttp: 'see assertions in the test body',
    expectedDbState: sec ? 'unchanged for rejected requests' : 'as asserted in the test body',
    expectedControl: part,
    cleanup: 'In-memory database discarded when the test process exits',
    automation: 'automated (unit/integration, mocked auth table, real Postgres engine)',
    execution: status, evidence: GAP[id] ? `${GAP[id]} (see final report)` : 'test log: web/e2e-results/security-db.log (local, not committed)',
    dependencies: 'PGlite; real jose for token cases',
  };
});

const X = (id, title, category, priority, endpoint, how, expected, auto, evidence, extra = {}) => ({
  id, area: id.startsWith('SEC') ? 'security' : 'database', module: id.split('-')[1], feature: title.slice(0, 90), title, category, priority, endpoint,
  role: extra.role ?? 'Test user', preconditions: extra.pre ?? 'See steps', testData: extra.data ?? '', steps: how.split(' > '), expected: [expected],
  expectedHttp: extra.http ?? '', expectedDbState: extra.db ?? '', expectedControl: extra.control ?? '', cleanup: extra.cleanup ?? 'Delete only the test-created rows',
  automation: auto, execution: extra.exec ?? 'not run', evidence, dependencies: extra.deps ?? '',
});
const BLOCK = 'blocked';
const EXTRA = [
  X('SEC-AUTH-101', 'Real sign-up, sign-in, sign-out and session invalidation against Neon Auth', 'authentication', 'P0', '/neon-auth/*', 'Sign up a test account in a dedicated test environment > Sign in > Sign out > Reuse the old session cookie', 'Old session is rejected after sign-out', 'blocked', 'Needs a dedicated Neon branch/test auth tenant; automation must not create accounts on the live project', { exec: BLOCK, deps: 'Authorised test environment' }),
  X('SEC-AUTH-102', 'Account enumeration: sign-up with an existing email reveals existence', 'authentication', 'P2', '/neon-auth/sign-up/email', 'Sign up twice with the same email', 'Observed in the UI test: message says the user already exists (enumeration by design)', 'automated (Playwright, mocked auth)', 'e2e TC-AUTH-SIGNUP-002 (mock). Real Neon response unverified', { exec: 'passed (mock only)' }),
  X('SEC-AUTH-103', 'Brute-force / lockout on sign-in', 'rate limiting', 'P1', '/neon-auth/sign-in/email', 'Submit many wrong passwords', 'Throttled', 'blocked', 'Policy lives in Neon Auth; not exercised', { exec: BLOCK }),
  X('SEC-AUTH-104', 'Password reset token expiry and single use', 'authentication', 'P1', '/neon-auth/reset-password', 'Request reset > Use the token twice > Use an old token', 'Second use rejected; expired rejected', 'blocked', 'Needs real email delivery in a test tenant', { exec: BLOCK }),
  X('SEC-AUTH-105', 'Google OAuth: state, redirect URI and callback validation; disabled when not configured', 'authentication', 'P0', '/neon-auth/sign-in/social', 'Enable Google on a test tenant > Start sign-in > Tamper with state and redirect', 'Tampered state/redirect rejected', 'blocked', 'Needs a Google test app and a test tenant. Dependency advisory GHSA-965c-763c-88jm concerns OAuth state handling (server side, run by Neon)', { exec: BLOCK }),
  X('SEC-AUTH-106', 'Session fixation and cookie flags (HttpOnly, Secure, SameSite)', 'authentication', 'P1', 'cookies', 'Sign in on a deployed HTTPS site > inspect Set-Cookie', 'HttpOnly; Secure; SameSite set; session id changes on login', 'blocked', 'Needs the deployed site', { exec: BLOCK }),
  X('SEC-CSRF-001', 'CSRF: API uses Bearer tokens (no ambient cookies), so cross-site form posts carry no credentials', 'web security', 'P1', 'functions/app.ts', 'Review: API reads only Authorization header; CORS allows no credentials', 'No cookie-authenticated API route exists', 'manual (static review)', 'Verified by SEC-CORS-001 (no credentials header) and code review. Auth cookies on /neon-auth are Neon\'s', { exec: 'reviewed' }),
  X('SEC-HDR-001', 'Deployed security headers (CSP, HSTS, nosniff, frame, referrer)', 'configuration', 'P1', 'netlify.toml', 'Request the deployed site and read headers', 'Headers present', 'blocked', 'Configuration verified statically in SEC-CONFIG-005; live headers need the deployed URL', { exec: BLOCK }),
  X('SEC-DEP-001', 'Dependency vulnerabilities', 'dependencies', 'P0', 'package-lock.json', 'npm audit', 'No high/critical in code we run', 'automated (npm audit, manual review)', 'npm audit: 1 critical + 9 low, all transitive via @neondatabase/neon-js -> better-auth 1.7.6 (fixed in 1.7.7); no fix available from the SDK', { exec: 'failed (see DEF-S03)' }),
  X('SEC-RATE-101', 'Coach limiter is shared across function instances', 'rate limiting', 'P2', 'POST /coach', 'Run two function instances > 30 calls on each', 'Combined limit enforced', 'blocked', 'Limiter is in memory per instance by design (beta decision). Not shared. Needs a database or Redis counter', { exec: BLOCK }),
  X('DB-CONCURRENCY-101', 'Two simultaneous PUTs of the same new workout id', 'concurrency', 'P0', 'PUT /workouts/:id', 'Open two connections > Start both transactions > Commit', 'One workout row; sets equal to the last writer; no duplicates', 'blocked', 'Needs a real multi-connection Postgres (isolated Neon branch). Reasoned: ON CONFLICT waits on the row lock, so writers serialise', { exec: BLOCK }),
  X('DB-CONCURRENCY-102', 'Queue several workouts concurrently from one browser', 'concurrency', 'P0', 'cloudSync.flush', 'Finish workout B while A uploads', 'Both uploaded; queue empty', 'automated (Playwright, mocked API)', 'e2e TC-SYNC-RACE-001 passes (browser queue logic; server mocked)', { exec: 'passed (mock only)' }),
  X('DB-WORKOUT-101', 'Refresh or close the browser during an upload; draft restore then upload', 'resilience', 'P0', 'browser + API', 'Reload during a slow PUT > Reopen > Finish', 'Workout still queued and uploaded once', 'automated in part (Playwright)', 'e2e TC-WRK-REFRESH-001/002 (draft and clock). Interrupted PUT itself is not automated', { exec: 'partly passed' }),
  X('DB-WORKOUT-102', 'Failed item in a multi-item upload: queue keeps order and continues; failed upload does not disappear', 'resilience', 'P1', 'cloudSync.flush', 'Queue 3 > Make the 2nd return 400', '2nd flagged syncFailed, 1st and 3rd uploaded', 'automated in part (Playwright 4XX/5XX)', 'e2e TC-SYNC-4XX-001 / 5XX-001 (single item). Multi-item ordering not automated', { exec: 'partly passed' }),
  X('DB-MIGRATE-001', 'Migration is safe to re-run and creates the same schema', 'migrations', 'P1', 'scripts/db-migrate.mjs', 'Apply schema twice on an empty database', 'No error; same objects', 'automated in part', 'schema.sql loads cleanly into PGlite (every run). The migrate script itself and the Neon-specific parts were not run', { exec: 'partly passed' }),
  X('DB-NEON-001', 'Neon role privileges: the function should connect with a least-privilege role, not the owner', 'configuration', 'P1', 'DATABASE_URL', 'Inspect the role used by the function', 'Role cannot DROP/ALTER', 'blocked', 'Needs Neon console / MCP authorisation; not inspected', { exec: BLOCK }),
  X('DB-NEON-002', 'Real Neon timing of the bulk insert (round trips, execution time)', 'performance', 'P2', 'PUT /workouts/:id', 'Run on an isolated branch with 40 and 500 sets', 'Measured', 'blocked', 'Needs a Neon branch. Local numbers are in DB-BULK-004 and are not a Neon figure', { exec: BLOCK }),
];

const all = [...automated, ...EXTRA];
const dup = all.map((c) => c.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dup.length) throw new Error(`duplicate ids ${dup}`);

for (const area of ['security', 'database']) {
  const list = all.filter((c) => c.area === area);
  mkdirSync(new URL(`docs/${area}/`, root), { recursive: true });
  writeFileSync(new URL(`docs/${area}/${area}-test-cases.json`, root), JSON.stringify(list, null, 2) + '\n');
  let md = `# ${area === 'security' ? 'Security' : 'Database'} test cases\n\nGenerated by \`web/scripts/sec-docs.mjs\` from \`web/tests/security and web/tests/database\` plus the extra rows in the script. ${list.length} cases. JSON copy: \`${area}-test-cases.json\`.\n\nAutomated cases run against the production API code with a **real PostgreSQL engine (PGlite)**, not against Neon. Auth cases that need Neon Auth are marked **blocked**. Test bodies are the executable steps and assertions.\n\n| ID | Title | Category | Pri | Automation | Execution | Evidence |\n|---|---|---|---|---|---|---|\n`;
  for (const c of list) md += `| ${c.id} | ${c.title.replace(/\|/g, '/')} | ${c.category} | ${c.priority} | ${c.automation} | ${c.execution} | ${c.evidence.replace(/\|/g, '/')} |\n`;
  writeFileSync(new URL(`docs/${area}/${area}-test-cases.md`, root), md);

  const by = new Map();
  for (const c of list) by.set(c.module, [...(by.get(c.module) ?? []), c]);
  let cm = `# ${area === 'security' ? 'Security' : 'Database'} coverage matrix\n\nCounts are from \`${area}-test-cases.json\`. "Passed" means the test ran in this session and passed. This is not a claim that the area is fully covered or secure.\n\n| Area | Cases | Automated | Passed | Failed | Blocked | Manual / other |\n|---|---|---|---|---|---|---|\n`;
  let t = [0, 0, 0, 0, 0, 0];
  for (const [m, cs] of by) {
    const r = [cs.length, cs.filter((c) => c.automation.startsWith('automated')).length, cs.filter((c) => c.execution.startsWith('passed')).length, cs.filter((c) => c.execution.startsWith('failed')).length, cs.filter((c) => c.execution === 'blocked').length];
    r.push(r[0] - r[2] - r[3] - r[4]);
    t = t.map((v, i) => v + r[i]);
    cm += `| ${m} (${CATEGORY[m] ?? m}) | ${r.join(' | ')} |\n`;
  }
  cm += `| **Total** | ${t.map((v) => `**${v}**`).join(' | ')} |\n\n"Passed (mock only)" rows count as passed but use a mocked auth server or API.\n`;
  writeFileSync(new URL(`docs/${area}/${area}-coverage-matrix.md`, root), cm);
}
console.log(`security=${all.filter((c) => c.area === 'security').length} database=${all.filter((c) => c.area === 'database').length} automated-from-tests=${automated.length}`);
