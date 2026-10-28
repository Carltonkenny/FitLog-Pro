// Lab performance measurements on the PRODUCTION build (dist-perf, built against mock hosts, served by `vite preview`).
// The backend is mocked in the browser (tests/e2e/fixtures/mockBackend.ts), so these are front-end numbers only.
//   npm run build:perf && npm run perf   ->  docs/performance/results/measurements.json
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { mockBackend } from '../tests/e2e/fixtures/mockBackend.ts';

const PORT = 5190;
const BASE = `http://localhost:${PORT}`;
const RUNS = 7;
const server = spawn('npx', ['vite', 'preview', '--outDir', 'dist-perf', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 7000));

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const stat = (a) => ({ median: +median(a).toFixed(1), min: +Math.min(...a).toFixed(1), max: +Math.max(...a).toFixed(1) });
const PROFILE = { onboarding_completed: true, fitness_goal: 'Muscle Growth' };
const PROFILES = {
  desktop: { cpu: 1, net: null },
  'mobile-4x-cpu-fast4g': { cpu: 4, net: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, offline: false } },
};

const observe = () => {
  window.__m = { lcp: 0, cls: 0, tbt: 0, fcp: 0, inp: 0 };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.tbt += Math.max(0, e.duration - 50); }).observe({ type: 'longtask', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__m.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.interactionId) window.__m.inp = Math.max(window.__m.inp, e.duration); }).observe({ type: 'event', durationThreshold: 16, buffered: true });
};

const browser = await chromium.launch({ channel: 'msedge', args: ['--enable-precise-memory-info'] });
const out = { when: new Date().toISOString(), runsPerCell: RUNS, browser: browser.version(), pages: {} };

async function measurePage(label, path, profileName, signedIn) {
  const p = PROFILES[profileName];
  const rows = [];
  for (let i = 0; i < RUNS; i += 1) {
    const ctx = await browser.newContext({ viewport: profileName === 'desktop' ? { width: 1366, height: 768 } : { width: 412, height: 915 } });
    const page = await ctx.newPage();
    await mockBackend(page, signedIn ? { signedIn: 'ana@example.com', profile: PROFILE } : {});
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', p.net ?? { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: p.cpu });
    await page.addInitScript(observe);
    await page.goto(BASE + path, { waitUntil: 'load', timeout: 90000 });
    await page.waitForTimeout(profileName === 'desktop' ? 2500 : 8000); // lab run: let LCP and the lazy chunk settle
    rows.push(await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const res = performance.getEntriesByType('resource');
      return { ...window.__m, ttfb: nav.responseStart, dcl: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, requests: res.length + 1, transferKB: (nav.transferSize + res.reduce((s, r) => s + r.transferSize, 0)) / 1024, heapMB: performance.memory.usedJSHeapSize / 1048576 };
    }));
    await ctx.close();
  }
  const keys = ['ttfb', 'fcp', 'lcp', 'cls', 'tbt', 'dcl', 'load', 'requests', 'transferKB', 'heapMB'];
  out.pages[`${label} | ${profileName}`] = Object.fromEntries(keys.map((k) => [k, stat(rows.map((r) => r[k]))]));
}

for (const prof of Object.keys(PROFILES)) {
  await measurePage('landing', '/', prof, false);
  await measurePage('app (signed in)', '/app', prof, true);
}

// Interaction latency with 500 saved workouts, and memory after 200 tab switches.
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage();
  await mockBackend(page, { signedIn: 'ana@example.com', profile: PROFILE });
  const now = Date.now();
  const history = Array.from({ length: 500 }, (_, i) => ({
    id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`, title: `Workout ${i}`, timestamp: now - i * 86_400_000, volumeKg: 4000, durationSeconds: 3000,
    exercises: [{ exerciseId: 'bench_press', exerciseName: 'Barbell Flat Bench Press', sets: Array.from({ length: 4 }, (_, s) => ({ id: s + 1, type: String(s + 1), weight: 60, reps: 8, completed: true })) }],
    newPRs: [], synced: true, pendingSync: false,
  }));
  await page.addInitScript((h) => {
    if (!sessionStorage.getItem('s')) {
      sessionStorage.setItem('s', '1');
      localStorage.setItem('fitlog_workout_history', JSON.stringify(h));
      localStorage.setItem('fitlog_profile', JSON.stringify({ onboarding_completed: true }));
    }
  }, history);
  await page.addInitScript(observe);
  const cdp = await ctx.newCDPSession(page);
  await page.goto(BASE + '/app', { waitUntil: 'load' });
  await page.getByRole('heading', { name: 'Barbell Flat Bench Press' }).waitFor();
  const time = async (fn) => {
    const t = await page.evaluate(() => performance.now());
    await fn();
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    return (await page.evaluate(() => performance.now())) - t;
  };
  const main = page.getByRole('navigation', { name: 'Main' });
  const complete = [];
  for (let s = 2; s <= 4; s += 1) complete.push(await time(() => page.getByRole('table').first().getByRole('button', { name: `Complete set ${s}` }).click()));
  const tabs = ['Exercise Explorer', 'Progress', 'History', 'Settings', 'Active Workout'];
  const tabTimes = {};
  for (const t of tabs) tabTimes[t] = await time(() => main.getByRole('button', { name: new RegExp(t) }).click());
  const heap = async () => {
    await cdp.send('HeapProfiler.collectGarbage');
    return (await page.evaluate(() => performance.memory.usedJSHeapSize)) / 1048576;
  };
  const h0 = await heap();
  for (let i = 0; i < 40; i += 1) for (const t of tabs) await main.getByRole('button', { name: new RegExp(t) }).click();
  const h1 = await heap();
  out.interaction500Workouts = {
    completeSetMs: complete.map((x) => +x.toFixed(0)),
    tabSwitchMs: Object.fromEntries(Object.entries(tabTimes).map(([k, v]) => [k, +v.toFixed(0)])),
    worstEventDurationMs: await page.evaluate(() => window.__m.inp),
  };
  out.memory200TabSwitches = { heapBeforeMB: +h0.toFixed(1), heapAfterMB: +h1.toFixed(1), domNodesAfter: await page.evaluate(() => document.getElementsByTagName('*').length) };
  await ctx.close();
}
await browser.close();
server.kill();
mkdirSync('../docs/performance/results', { recursive: true });
writeFileSync('../docs/performance/results/measurements.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out));
process.exit(0);
