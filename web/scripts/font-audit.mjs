// Lists the font files each page actually downloads (production build in dist-perf).
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mockBackend } from '../tests/e2e/fixtures/mockBackend.ts';
const server = spawn('npx', ['vite', 'preview', '--outDir', 'dist-perf', '--port', '5191', '--strictPort'], { shell: true, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 6000));
const browser = await chromium.launch({ channel: 'msedge' });
for (const [label, path, signedIn] of [['landing', '/', false], ['app', '/app', true]]) {
  const page = await browser.newPage();
  await mockBackend(page, signedIn ? { signedIn: 'a@example.com', profile: { onboarding_completed: true } } : {});
  const fonts = [];
  page.on('response', async (r) => { if (r.url().endsWith('.woff2')) fonts.push(r.url().split('/').pop().replace(/-[A-Za-z0-9_]{8}\.woff2/, '') + ' ' + Math.round((await r.body()).length / 1024) + 'kB'); });
  await page.goto('http://localhost:5191' + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  console.log(label, fonts.sort().join(', '));
  await page.close();
}
await browser.close(); server.kill(); process.exit(0);
