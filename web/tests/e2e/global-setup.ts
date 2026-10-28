import { chromium } from '@playwright/test';

// Vite compiles on first request; on this OneDrive path that can take ~20 s. Pay it once, here,
// instead of inside the first test's timeout.
export default async function globalSetup() {
  const browser = await chromium.launch({ channel: 'msedge' });
  for (const port of [5180, 5181]) {
    const page = await browser.newPage();
    for (const path of ['/', '/app']) await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'load', timeout: 120_000 });
    await page.close();
  }
  await browser.close();
}
