// Builds docs/qa/* from scripts/qa-cases.mjs and the saved Playwright JSON results.
//   node scripts/qa-docs.mjs
// Results files (written by `npx playwright test`, then copied): docs/qa/results/baseline.json (required),
// docs/qa/results/with-fix.json (optional: run against a temporary, uncommitted one-line fix for DEF-007).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CASES, MODULES } from './qa-cases.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const qa = join(root, 'docs', 'qa');
const e2e = join(root, 'web', 'tests', 'e2e');
const strip = (s) => String(s || '').replace(/\x1b\[[0-9;]*m/g, '');
const ID = /TC-[A-Z0-9]+-[A-Z0-9]+-\d{3}/g;

// ---- Playwright results -> per-case outcome
function load(file) {
  const path = join(qa, 'results', file);
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}
function outcomes(run) {
  const map = new Map(); // id -> [{ project, title, outcome, ms, error, reason }]
  if (!run) return map;
  const walk = (suite, file) => {
    for (const spec of suite.specs || []) {
      for (const t of spec.tests) {
        const r = t.results[t.results.length - 1] || {};
        let outcome;
        if (t.status === 'skipped') outcome = 'blocked';
        else if (t.status === 'unexpected') outcome = 'failed';
        else if (t.status === 'flaky') outcome = 'flaky';
        else if (t.expectedStatus === 'failed') outcome = 'defect-confirmed';
        else outcome = 'passed';
        const reason = (t.annotations || []).find((a) => a.type === 'skip' || a.type === 'fail')?.description || '';
        for (const id of new Set(spec.title.match(ID) || [])) {
          if (!map.has(id)) map.set(id, []);
          map.get(id).push({ project: t.projectName, title: spec.title, outcome, ms: r.duration || 0, error: strip(r.error?.message).split('\n').slice(0, 4).join(' | '), reason, file });
        }
      }
    }
    for (const s of suite.suites || []) walk(s, file || s.file);
  };
  for (const s of run.suites) walk(s, s.file);
  return map;
}
const rank = ['failed', 'flaky', 'blocked', 'defect-confirmed', 'passed'];
const worst = (list) => (list && list.length ? rank.find((r) => list.some((x) => x.outcome === r)) : undefined);

const base = load('baseline.json');
const fix = load('with-fix.json');
const baseMap = outcomes(base);
const fixMap = outcomes(fix);

// ---- Which IDs have a Playwright test
const specIds = new Map();
for (const f of readdirSync(e2e).filter((x) => x.endsWith('.spec.ts'))) {
  for (const id of readFileSync(join(e2e, f), 'utf8').match(ID) || []) specIds.set(id, f);
}
for (const id of baseMap.keys()) if (!specIds.has(id)) specIds.set(id, baseMap.get(id)[0].file || '');

// ---- Build full case objects
const cases = CASES.map(([id, title, category, priority, rule, steps, expected, x = {}]) => {
  const prefix = id.split('-')[1];
  const m = MODULES[prefix] || { module: prefix, route: '', role: '' };
  const automated = x.auto === 'manual' || x.auto === 'blocked' ? false : specIds.has(id);
  const automation = x.auto === 'blocked' ? 'blocked' : automated ? 'automated' : 'manual (not automated)';
  return {
    id,
    module: m.module,
    feature: id.split('-')[2],
    screen: m.module,
    route: x.route || m.route,
    title,
    category,
    priority,
    type: x.type || 'functional',
    role: x.role || m.role,
    preconditions: x.pre || (automated ? 'Fresh browser context; backend mocked where marked' : 'See steps'),
    testData: x.data || '',
    steps: steps.split(' > '),
    expectedResults: expected.split(' > ').length > 1 ? expected.split(' > ') : [expected],
    uiApiExpectations: x.ui || (automated ? 'Backend is MOCKED in the browser suite (fixtures/mockBackend.ts)' : ''),
    postconditions: automated ? 'Context discarded; no shared state' : '',
    automationStatus: automation,
    automationFile: automated ? `web/tests/e2e/${specIds.get(id)}` : '',
    businessRule: rule,
    dependencies: x.deps || '',
    linkedDefect: x.defect || '',
  };
});
const problems = [];
const ids = new Set(cases.map((c) => c.id));
if (ids.size !== cases.length) problems.push('Duplicate case IDs in qa-cases.mjs');
for (const id of specIds.keys()) if (!ids.has(id)) problems.push(`Spec has ${id} but the registry does not`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

// ---- Execution status per case
const status = (c) => {
  if (c.automationStatus !== 'automated') return c.automationStatus === 'blocked' ? 'blocked (not run)' : 'not run (manual)';
  const w = worst(baseMap.get(c.id));
  return w || 'not executed';
};
for (const c of cases) {
  c.executionBaseline = status(c);
  c.executionWithFix = worst(fixMap.get(c.id)) || '';
}

writeFileSync(join(qa, 'functional-test-cases.json'), JSON.stringify(cases, null, 2) + '\n');

// ---- Markdown: test cases
const byModule = new Map();
for (const c of cases) byModule.set(c.module, [...(byModule.get(c.module) || []), c]);
let md = `# Functional test cases\n\nGenerated from \`web/scripts/qa-cases.mjs\` (the registry) joined with the saved Playwright results. Do not edit by hand; run \`npm run qa:docs\` in \`web\`.\n\n${cases.length} cases. Machine-readable copy: \`functional-test-cases.json\`.\n\n**How to read it:** *Automation* says whether a Playwright test exists. *Baseline* is the observed result against the unmodified app. *After fixes* is the final full run after the defects were fixed. \`defect-confirmed\` means the test is written to expect the defect and the defect was observed.\n\n`;
for (const [mod, list] of byModule) {
  md += `## ${mod}\n\n| ID | Title | Cat | Pri | Rule | Automation | Baseline | After fixes | Defect |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const c of list) md += `| ${c.id} | ${c.title.replace(/\|/g, '/')} | ${c.category} | ${c.priority} | ${c.businessRule} | ${c.automationStatus} | ${c.executionBaseline} | ${c.executionWithFix} | ${c.linkedDefect} |\n`;
  md += '\n<details><summary>Steps and expected results</summary>\n\n';
  for (const c of list) {
    md += `**${c.id}** (${c.role}; ${c.route})\n- Steps: ${c.steps.join(' → ')}\n- Expected: ${c.expectedResults.join('; ')}\n`;
    if (c.testData) md += `- Test data: ${c.testData}\n`;
    if (c.uiApiExpectations) md += `- Note: ${c.uiApiExpectations}\n`;
    if (c.dependencies) md += `- Depends on: ${c.dependencies}\n`;
    md += '\n';
  }
  md += '</details>\n\n';
}
writeFileSync(join(qa, 'functional-test-cases.md'), md);

// ---- Coverage matrix
const count = (list, f) => list.filter(f).length;
let cm = `# Coverage matrix\n\nEvery number below comes from \`functional-test-cases.json\` joined with Playwright's own result files. "Discovered" means a test case exists in the registry. It does **not** mean the feature is proven correct. Nothing here claims 100% coverage.\n\n## Definitions\n- **Discovered**: written test cases.\n- **Automated**: a Playwright test with that ID exists.\n- **Executed**: the test ran in the baseline run (not skipped).\n- **Passed**: executed and its assertions held.\n- **Defect confirmed**: executed; written to expect a known defect and the defect was observed (counts as a *finding*, not a pass).\n- **Failed**: executed and failed unexpectedly.\n- **Blocked**: skipped, or cannot be run in this environment (reason in the case).\n- **Not run**: manual cases nobody has executed yet.\n\n## By module (baseline run, unmodified app)\n\n| Module | Discovered | Automated | Executed | Passed | Defect confirmed | Failed | Blocked | Not run (manual) |\n|---|---|---|---|---|---|---|---|---|\n`;
const tot = { d: 0, a: 0, e: 0, p: 0, dc: 0, f: 0, b: 0, m: 0 };
for (const [mod, list] of byModule) {
  const r = {
    d: list.length,
    a: count(list, (c) => c.automationStatus === 'automated'),
    e: count(list, (c) => ['passed', 'defect-confirmed', 'failed', 'flaky'].includes(c.executionBaseline)),
    p: count(list, (c) => c.executionBaseline === 'passed'),
    dc: count(list, (c) => c.executionBaseline === 'defect-confirmed'),
    f: count(list, (c) => ['failed', 'flaky'].includes(c.executionBaseline)),
    b: count(list, (c) => c.executionBaseline.startsWith('blocked')),
    m: count(list, (c) => c.executionBaseline === 'not run (manual)'),
  };
  for (const k of Object.keys(tot)) tot[k] += r[k];
  cm += `| ${mod} | ${r.d} | ${r.a} | ${r.e} | ${r.p} | ${r.dc} | ${r.f} | ${r.b} | ${r.m} |\n`;
}
cm += `| **Total** | **${tot.d}** | **${tot.a}** | **${tot.e}** | **${tot.p}** | **${tot.dc}** | **${tot.f}** | **${tot.b}** | **${tot.m}** |\n\n`;
if (fix) {
  const ran = [...fixMap.keys()];
  cm += `## Final run after the fixes
The whole suite was run again after the defects were fixed: ${count(cases, (c) => c.executionWithFix === 'passed')} cases passed, ${count(cases, (c) => ['failed', 'flaky'].includes(c.executionWithFix))} failed, ${count(cases, (c) => c.executionWithFix === 'blocked')} blocked. Auth is still a mocked server, so this does not prove the real Neon Auth.

`;
}

const rules = new Map();
for (const c of cases) for (const r of c.businessRule.split(/[,;]| and /).map((x) => x.trim()).filter(Boolean)) rules.set(r, [...(rules.get(r) || []), c]);
cm += `## Business-rule traceability\n\n| Rule | Cases | Best baseline result |\n|---|---|---|\n`;
for (const r of [...rules.keys()].sort()) {
  const list = rules.get(r);
  const results = list.map((c) => c.executionBaseline);
  cm += `| ${r} | ${list.map((c) => c.id).join(', ')} | ${results.includes('passed') ? 'passed' : results[0]} |\n`;
}
const all = Array.from({ length: 18 }, (_, i) => `BR-${String(i + 1).padStart(2, '0')}`);
const none = all.filter((r) => !rules.has(r));
cm += `\nRules with **no** Playwright test case: ${none.join(', ') || 'none'}. Those are covered (or not) only by the unit tests in \`web/test\`.\n`;
writeFileSync(join(qa, 'coverage-matrix.md'), cm);

// ---- Execution report (observed numbers only)
const flat = [];
for (const [id, list] of baseMap) for (const x of list) flat.push({ id, ...x });
let ex = `# Execution report\n\nAll numbers below were read from Playwright's JSON output (\`docs/qa/results/baseline.json\`). Nothing was estimated.\n\n`;
if (base) {
  const s = base.stats;
  ex += `## Baseline run: unmodified app\n- Command: \`cd web && npx playwright test\`\n- Playwright ${base.config?.version || ''}; browser: Microsoft Edge (Chromium channel); 4 workers; no retries\n- Started: ${s.startTime}; duration: ${(s.duration / 1000).toFixed(0)} s\n- **Expected (passed as designed): ${s.expected}**, **Unexpected (failed): ${s.unexpected}**, **Flaky: ${s.flaky}**, **Skipped (blocked): ${s.skipped}**\n- Of the "expected" results, tests whose title carries a [DEF-xxx] tag are written to fail on a known defect (\`test.fail\`) and are reported as *defect confirmed*.\n\n`;
}
if (fix) {
  const s = fix.stats;
  ex += `## Final run: whole suite after the fixes
- Command: \`npx playwright test\` (2 workers, no retries)
- Expected ${s.expected}, unexpected ${s.unexpected}, flaky ${s.flaky}, skipped ${s.skipped}; duration ${(s.duration / 1000).toFixed(0)} s

`;
}
const bad = flat.filter((x) => x.outcome === 'failed' || x.outcome === 'flaky');
ex += `## Unexpected failures (baseline)\n${bad.length ? bad.map((x) => `- **${x.id}** [${x.project}] ${x.error}`).join('\n') : 'None.'}\n\n`;
const blocked = flat.filter((x) => x.outcome === 'blocked');
ex += `## Skipped / blocked tests (baseline)\n${blocked.length ? blocked.map((x) => `- ${x.id}: ${x.reason || 'skipped'}`).join('\n') : 'None.'}\n\n`;
const dcs = flat.filter((x) => x.outcome === 'defect-confirmed');
ex += `## Defects confirmed by tests (baseline)\n${dcs.map((x) => `- ${x.id}: ${x.title.replace(ID, '').trim()}`).join('\n') || 'None.'}\n\n`;
ex += `## Every executed test (baseline)\n\n| ID | Project | Result | ms |\n|---|---|---|---|\n`;
for (const x of flat.sort((a, b) => a.id.localeCompare(b.id))) ex += `| ${x.id} | ${x.project} | ${x.outcome} | ${x.ms} |\n`;
writeFileSync(join(qa, 'execution-report.md'), ex);

console.log(`cases=${cases.length} automated=${tot.a} executed=${tot.e} passed=${tot.p} defect-confirmed=${tot.dc} failed=${tot.f} blocked=${tot.b} manual=${tot.m}`);
