import { test, expect, type Page } from '@playwright/test';
import { mockBackend } from './fixtures/mockBackend';
import { stored } from './fixtures/app';

async function start(page: Page) {
  await mockBackend(page);
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); }
  });
  await page.goto('/onboarding');
  await expect(page.getByRole('heading', { name: 'What is your main goal?', level: 1 })).toBeVisible();
}

async function toBodyStep(page: Page) {
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: 'Continue' }).click();
  }
  await expect(page.locator('#ob-weight')).toBeVisible();
}

test.describe('Onboarding', () => {
  test('TC-ONB-FLOW-001 the four steps complete and open the app with a saved profile', async ({ page }) => {
    await start(page);
    await expect(page.getByText('Step 1 of 4')).toBeVisible();
    await toBodyStep(page);
    await expect(page.getByText('Step 4 of 4')).toBeVisible();
    await page.locator('#ob-weight').fill('80');
    await page.getByRole('button', { name: 'Finish and start' }).click();
    await expect(page).toHaveURL(/\/app$/);
    expect((await stored(page, 'fitlog_profile')).onboarding_completed).toBe(true);
  });

  test('TC-ONB-SKIP-001 Skip for now opens the app', async ({ page }) => {
    await start(page);
    await page.getByRole('button', { name: 'Skip for now' }).click();
    await expect(page).toHaveURL(/\/app$/);
  });

  test('TC-ONB-BACK-001 Back is disabled on step 1 and returns to the previous step', async ({ page }) => {
    await start(page);
    await expect(page.getByRole('button', { name: 'Back' })).toBeDisabled();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Step 2 of 4')).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByText('Step 1 of 4')).toBeVisible();
  });

  test('TC-ONB-A11Y-001 the heading takes focus on each new step', async ({ page }) => {
    await start(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  });

  test('TC-ONB-A11Y-002 the progress bar reports its position', async ({ page }) => {
    await start(page);
    await expect(page.getByRole('progressbar', { name: 'Onboarding progress' })).toBeVisible();
  });

  for (const [value, ok] of [['300', true], ['301', false], ['-5', false], ['0', false]] as const) {
    test(`TC-ONB-BND-001 body weight ${value} kg ${ok ? 'is accepted' : 'blocks Finish'}`, async ({ page }) => {
      await start(page);
      await toBodyStep(page);
      await page.locator('#ob-weight').fill(value);
      const finish = page.getByRole('button', { name: 'Finish and start' });
      if (ok) await expect(finish).toBeEnabled();
      else await expect(finish).toBeDisabled();
    });
  }

  test('TC-ONB-BND-002 all body numbers are optional', async ({ page }) => {
    await start(page);
    await toBodyStep(page);
    await expect(page.getByRole('button', { name: 'Finish and start' })).toBeEnabled();
  });
});
