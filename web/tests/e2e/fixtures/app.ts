import { expect, type Page } from '@playwright/test';
import { mockBackend } from './mockBackend';

/** Opens /app in guest mode (backend mocked so nothing leaves the machine) on a clean device. */
export async function openApp(page: Page, storage: Record<string, unknown> = {}) {
  await mockBackend(page);
  await page.addInitScript((seed) => {
    if (sessionStorage.getItem('qa-seeded')) return; // seed once, so reload tests see real persistence
    sessionStorage.setItem('qa-seeded', '1');
    localStorage.clear();
    for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
  }, storage);
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'Barbell Flat Bench Press' })).toBeVisible();
}

/** Table of sets for the n-th exercise card (0 = bench press in the starter session). */
export const sets = (page: Page, n = 0) => page.getByRole('table').nth(n);
export const complete = (page: Page, set: number, n = 0) => sets(page, n).getByRole('button', { name: `Complete set ${set}` }).click();
export const finishBtn = (page: Page) => page.getByRole('button', { name: /^Finish/ });
export const nav = (page: Page, name: RegExp | string) => page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name });
export const stored = (page: Page, key: string) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);
