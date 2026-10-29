import { test, expect } from '@playwright/test';
import { mockBackend } from './fixtures/mockBackend';

// A deploy removes old hashed files; the host answers the old name with the home page. The app must recover.
const PROFILE = { onboarding_completed: true, fitness_goal: 'Muscle Growth' };
const CHUNK = '**/src/features/app/ProApp.jsx*';
const html = { status: 200, contentType: 'text/html', body: '<!doctype html><html><body>home page</body></html>' };

test('TC-NAV-CHUNK-001 a missing app file after a deploy reloads once and then loads the app', async ({ page }) => {
  await mockBackend(page, { signedIn: 'ana@example.com', profile: PROFILE });
  let requests = 0;
  await page.route(CHUNK, (route) => {
    requests += 1;
    return requests === 1 ? route.fulfill(html) : route.continue();
  });
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'Barbell Flat Bench Press' })).toBeVisible({ timeout: 20_000 });
  expect(requests).toBe(2);
  expect(await page.evaluate(() => sessionStorage.getItem('fitlog_chunk_retry'))).toBeNull();
});

test('TC-NAV-CHUNK-002 if the file is still missing after the one retry, an error screen with a Reload button shows (no reload loop)', async ({ page }) => {
  await mockBackend(page, { signedIn: 'ana@example.com', profile: PROFILE });
  let requests = 0;
  await page.route(CHUNK, (route) => {
    requests += 1;
    return route.fulfill(html);
  });
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('button', { name: 'Reload' })).toBeVisible();
  await page.waitForTimeout(1500); // proves nothing reloads again; a loop would keep adding requests
  expect(requests).toBe(2);
});
