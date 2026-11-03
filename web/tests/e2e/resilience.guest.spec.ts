import { test, expect } from '@playwright/test';
import { mockBackend } from './fixtures/mockBackend';
import { workout } from './fixtures/data';
import { nav, openApp } from './fixtures/app';

// Regression tests for the findings of the review: paging, draft and clock expiry.
const draftWith = (savedAt: number) => ({
  title: 'Restored session',
  savedAt,
  exercises: [{ exerciseId: 'draft_squat', exerciseName: 'Draft Squat', targetMuscle: 'Legs', equipment: 'Barbell', sets: [{ id: 1, type: '1', weight: 100, reps: 5, completed: true, isPR: false }] }],
});

async function openWithSeed(page: import('@playwright/test').Page, seed: Record<string, unknown>) {
  await mockBackend(page);
  await page.addInitScript((s) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.clear();
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, JSON.stringify(v));
  }, seed);
  await page.goto('/app');
}

test('TC-HIST-PAGE-001 History shows 30 workouts at a time and Show more reveals the rest', async ({ page }) => {
  await openApp(page, { fitlog_workout_history: Array.from({ length: 45 }, (_, i) => workout(i + 1, `Workout ${i + 1}`)) });
  await nav(page, 'History').click();
  await expect(page.getByRole('article')).toHaveCount(30);
  await page.getByRole('button', { name: /Show more \(15 left\)/ }).click();
  await expect(page.getByRole('article')).toHaveCount(45);
  await expect(page.getByRole('button', { name: /Show more/ })).toHaveCount(0);
});

test('TC-WRK-DRAFT-001 an unfinished workout from an hour ago is restored', async ({ page }) => {
  await openWithSeed(page, { fitlog_workout_draft: draftWith(Date.now() - 3_600_000) });
  await expect(page.getByRole('heading', { name: 'Draft Squat' })).toBeVisible();
});

test('TC-WRK-DRAFT-002 an unfinished workout older than 12 hours is ignored and the starter session shows', async ({ page }) => {
  await openWithSeed(page, { fitlog_workout_draft: draftWith(Date.now() - 13 * 3_600_000) });
  await expect(page.getByRole('heading', { name: 'Barbell Flat Bench Press' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Draft Squat' })).toHaveCount(0);
});

test('TC-WRK-DRAFT-003 a session clock older than 12 hours is ignored and starts at 00:00', async ({ page }) => {
  const old = Date.now() - 13 * 3_600_000;
  await openWithSeed(page, { fitlog_workout_clock: { banked: 3_000_000, since: null, at: old } });
  await expect(page.getByRole('heading', { name: 'Barbell Flat Bench Press' })).toBeVisible();
  await expect(page.getByText('00:00').first()).toBeVisible();
});

test('TC-WRK-DRAFT-004 opening the app does not refresh the draft timestamp (an untouched draft can still expire)', async ({ page }) => {
  const savedAt = Date.now() - 3_600_000;
  await openWithSeed(page, { fitlog_workout_draft: draftWith(savedAt) });
  await expect(page.getByRole('heading', { name: 'Draft Squat' })).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('fitlog_workout_draft') || '{}').savedAt);
  expect(stored).toBe(savedAt);
});
