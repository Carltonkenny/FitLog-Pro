import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openApp, nav } from './fixtures/app';
import { mockBackend } from './fixtures/mockBackend';
import { workout } from './fixtures/data';

// WCAG 2.0/2.1 A and AA rules via axe-core. Automated checks find roughly a third of real issues; a screen-reader pass is still manual.
const scan = async (page: Page) => {
  await page.waitForLoadState('networkidle'); // a dev-server reload during the scan destroyed the page once in a full run
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`);
};

test('TC-A11Y-AXE-001 landing page has no axe A/AA violations', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await scan(page)).toEqual([]);
});

for (const tab of ['Active Workout', 'Exercise Explorer', 'Progress', 'History', 'Settings']) {
  test(`TC-A11Y-AXE-002 ${tab} tab has no axe A/AA violations`, async ({ page }) => {
    await openApp(page, { fitlog_workout_history: [workout(1, 'Push A')] });
    await nav(page, new RegExp(tab)).click();
    expect(await scan(page)).toEqual([]);
  });
}
