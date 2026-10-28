import { test, expect } from '@playwright/test';
import { mockBackend } from './fixtures/mockBackend';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Log every set in two taps.', level: 1 })).toBeVisible();
  });

  test('TC-LAND-SEO-001 the page has a title, a description and a language', async ({ page }) => {
    await expect(page).toHaveTitle(/FitLog/i);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20,}/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('TC-LAND-NAV-001 the primary navigation lists all five sections', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Primary' });
    for (const name of ['How it works', 'AI coach', 'Tools', 'Pricing', 'FAQ']) await expect(nav.getByRole('link', { name })).toBeVisible();
  });

  test('TC-LAND-NAV-002 clicking Pricing jumps to the pricing section', async ({ page }) => {
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL(/#pricing$/);
    await expect(page.getByRole('heading', { name: 'Free during early access' })).toBeInViewport();
  });

  test('TC-LAND-NAV-003 the first Tab stop is the skip link and it targets the main content', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute('href', '#main');
  });

  test('TC-LAND-HERO-001 the hero preview sets can be ticked and unticked', async ({ page }) => {
    const set3 = page.getByRole('checkbox', { name: /^Set 3,/ });
    await expect(set3).not.toBeChecked();
    await set3.check();
    await expect(set3).toBeChecked();
    await set3.uncheck();
    await expect(set3).not.toBeChecked();
  });

  test('TC-LAND-CALC-001 the plate calculator steppers change the total weight', async ({ page }) => {
    const total = page.getByRole('slider', { name: 'Total weight in kilograms' });
    await expect(total).toHaveValue('100');
    await page.getByRole('button', { name: '+2.5', exact: true }).click();
    await expect(total).toHaveValue('102.5');
    await page.getByRole('button', { name: '-5', exact: true }).click();
    await expect(total).toHaveValue('97.5');
  });

  test('TC-LAND-CALC-002 the calculator reps slider and bar choice are operable', async ({ page }) => {
    const reps = page.getByRole('slider', { name: 'Reps' });
    await reps.fill('10');
    await expect(reps).toHaveValue('10');
    await page.getByRole('button', { name: 'Technique (15 kg)' }).click();
  });
  test('TC-LAND-A11Y-001 the chosen bar weight is exposed to assistive technology', async ({ page }) => {
    await page.getByRole('button', { name: 'Technique (15 kg)' }).click();
    await expect(page.getByRole('button', { name: 'Technique (15 kg)' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('TC-LAND-ANAT-001 choosing a muscle updates the anatomy explorer', async ({ page }) => {
    const heading = page.locator('#tools').getByRole('heading', { level: 4 }).first();
    const before = await heading.innerText();
    await page.locator('#tools').getByRole('button', { name: 'Back', exact: true }).click();
    await expect(heading).not.toHaveText(before);
  });

  test('TC-LAND-FAQ-001 a FAQ item opens and closes', async ({ page }) => {
    const item = page.locator('#faq details').first();
    await expect(item).not.toHaveAttribute('open', '');
    await item.locator('summary').click();
    await expect(item).toHaveAttribute('open', '');
    await item.locator('summary').click();
    await expect(item).not.toHaveAttribute('open', '');
  });

  test('TC-LAND-CTA-001 Start free opens the sign-up dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Start free' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#auth-name')).toBeVisible();
  });

  test('TC-LAND-404-001 an unknown path shows the landing page rather than an error', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('TC-LAND-HDR-001 the page has exactly one h1', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });
});
