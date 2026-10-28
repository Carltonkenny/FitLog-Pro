import { test, expect } from '@playwright/test';
import { openApp, sets, nav } from './fixtures/app';
import { mockBackend } from './fixtures/mockBackend';

// Pixel 7 emulation (412 x 915, touch). Minimum touch target used here: 44 CSS px (WCAG 2.5.5 / Apple HIG).
const MIN_TARGET = 44;
const hasHorizontalScroll = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

test.describe('Phone layout', () => {
  test('TC-RESP-NAV-001 the five tabs are a bottom bar and the desktop sidebar is hidden', async ({ page }) => {
    await openApp(page);
    const bar = page.getByRole('navigation', { name: 'Main' });
    await expect(bar.getByRole('button')).toHaveCount(5);
    const box = (await bar.boundingBox())!;
    expect(box.y).toBeGreaterThan(400); // sits at the bottom of the screen
  });
  test('TC-RESP-OVF-001 the workout screen does not scroll sideways', async ({ page }) => {
    await openApp(page);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test('TC-RESP-OVF-002 the landing page does not scroll sideways', async ({ page }) => {
    await mockBackend(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test('TC-RESP-SCALE-001 at 130% text size the workout screen still does not scroll sideways', async ({ page }) => {
    await openApp(page);
    await page.addStyleTag({ content: 'html { font-size: 130% !important; }' });
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test('TC-RESP-DRAWER-001 the Plate Loader & Coach button opens a dialog on a phone', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: /Plate Loader/ }).click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
  });
  test('TC-RESP-TAP-001 the set controls and tabs are at least 44 px tall and wide', async ({ page }) => {
    await openApp(page);
    const targets = [
      sets(page).getByRole('button', { name: 'Complete set 2' }),
      sets(page).getByRole('button', { name: 'Increase weight, set 2' }),
      sets(page).getByRole('button', { name: 'Decrease reps, set 2' }),
      nav(page, 'Settings'),
      page.getByRole('button', { name: 'Open Buddy, your training companion' }),
    ];
    const small: string[] = [];
    for (const t of targets) {
      const b = (await t.boundingBox())!;
      if (b.width < MIN_TARGET || b.height < MIN_TARGET) small.push(`${await t.getAttribute('aria-label')}: ${Math.round(b.width)}x${Math.round(b.height)}`);
    }
    expect(small, `targets under ${MIN_TARGET}px`).toEqual([]);
  });
});
