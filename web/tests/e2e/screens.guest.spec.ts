import { test, expect } from '@playwright/test';
import { openApp, nav, sets, stored } from './fixtures/app';
import { workout } from './fixtures/data';

const seeded = { fitlog_workout_history: [workout(1, 'Push A'), workout(2, 'Pull B', { pendingSync: true, synced: false })] };

test.describe('Exercise explorer', () => {
  test('TC-LIB-COUNT-001 the library reports 106 movements', async ({ page }) => {
    await openApp(page);
    await nav(page, /Exercise Explorer/).click();
    await expect(page.getByRole('heading', { name: /106 movements/ })).toBeVisible();
  });

  test('TC-LIB-FILTER-001 choosing Back replaces the chest results', async ({ page }) => {
    await openApp(page);
    await nav(page, /Exercise Explorer/).click();
    await expect(page.getByRole('heading', { name: 'Incline Dumbbell Press' })).toBeVisible();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Incline Dumbbell Press' })).toBeHidden();
  });

  test('TC-LIB-SEARCH-001 searching by name finds the exercise', async ({ page }) => {
    await openApp(page);
    await nav(page, /Exercise Explorer/).click();
    await page.getByRole('textbox', { name: /Search exercises/ }).fill('face pull');
    await expect(page.getByRole('heading', { name: /Face Pull/i }).first()).toBeVisible();
  });

  test('TC-LIB-SEARCH-002 a search with no match shows no exercise to add', async ({ page }) => {
    await openApp(page);
    await nav(page, /Exercise Explorer/).click();
    await page.getByRole('textbox', { name: /Search exercises/ }).fill('zzqqxx');
    await expect(page.getByRole('button', { name: '+ Add to Current Session' })).toHaveCount(0);
  });

  test('TC-LIB-SEARCH-003 markup typed into search is shown as text and never runs', async ({ page }) => {
    await openApp(page);
    await nav(page, /Exercise Explorer/).click();
    await page.getByRole('textbox', { name: /Search exercises/ }).fill('<img src=x onerror="window.__xss=1">');
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  });

  test('TC-LIB-EQ-001 the Bodyweight pill narrows results to bodyweight moves', async ({ page }) => {
    await openApp(page);
    await nav(page, /Exercise Explorer/).click();
    await page.getByRole('button', { name: 'Bodyweight', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Incline Push-Up' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Incline Dumbbell Press' })).toBeHidden();
  });

  test('TC-LIB-ADD-001 adding from the explorer puts the exercise in the current workout', async ({ page }) => {
    await openApp(page);
    await nav(page, /Exercise Explorer/).click();
    await page.getByRole('heading', { name: 'Incline Dumbbell Press' }).locator('xpath=ancestor::*[.//button[contains(., "Add to Current Session")]][1]').getByRole('button', { name: '+ Add to Current Session' }).click();
    await nav(page, /Active Workout/).click();
    await expect(page.getByRole('heading', { name: 'Incline Dumbbell Press', level: 3 })).toBeVisible();
  });
});

test.describe('Exercise picker', () => {
  const open = async (page: import('@playwright/test').Page) => {
    await openApp(page);
    await page.getByRole('button', { name: /Add exercise/ }).click();
    await expect(page.getByRole('dialog', { name: 'Choose exercises' })).toBeVisible();
    return page.getByRole('dialog', { name: 'Choose exercises' });
  };

  test('TC-PICK-ADD-001 Add marks the row Added and Done puts it in the workout', async ({ page }) => {
    const d = await open(page);
    await d.getByRole('button', { name: 'Add Cable Face Pull with Rope' }).first().click();
    await expect(d.getByText('Added').first()).toBeVisible();
    await d.getByRole('button', { name: /^Done/ }).click();
    await expect(page.getByRole('heading', { name: 'Cable Face Pull with Rope', level: 3 })).toBeVisible();
  });
  test('TC-PICK-A11Y-001 the Add button announces the Added state', async ({ page }) => {
    const d = await open(page);
    await d.getByRole('button', { name: 'Add Cable Face Pull with Rope' }).first().click();
    await expect(d.getByRole('button', { name: /Added/ }).first()).toBeVisible();
  });

  test('TC-PICK-FAV-001 the favorite star toggles and is remembered in user data', async ({ page }) => {
    const d = await open(page);
    const star = d.getByRole('button', { name: /Favorite: Cable Face Pull with Rope/ }).first();
    await expect(star).toHaveAttribute('aria-pressed', 'false');
    await star.click();
    await expect(d.getByRole('button', { name: /Cable Face Pull with Rope/ }).first()).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.stringify(await stored(page, 'fitlog_userdata'))).toContain('face');
  });

  test('TC-PICK-FILTER-001 the Chest chip reduces the all-exercises count below 106', async ({ page }) => {
    const d = await open(page);
    await d.getByRole('radio', { name: 'Chest' }).click();
    await expect(d.getByRole('heading', { name: /All exercises \(106\)/ })).toBeHidden();
  });

  test('TC-PICK-SEARCH-001 searching narrows the list', async ({ page }) => {
    const d = await open(page);
    await d.getByRole('searchbox', { name: 'Search exercises' }).fill('face pull');
    await expect(d.getByRole('heading', { name: /^Results \(/ })).toBeVisible();
  });

  test('TC-PICK-ESC-001 Escape closes the picker', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Choose exercises' })).toBeHidden();
  });
});

test.describe('History and progress', () => {
  test('TC-HIST-LIST-001 saved workouts are listed newest first with a pending-sync badge', async ({ page }) => {
    await openApp(page, seeded);
    await nav(page, 'History').click();
    await expect(page.getByRole('heading', { name: 'Past workouts (2)' })).toBeVisible();
    const titles = await page.getByRole('article').getByRole('heading').allInnerTexts();
    expect(titles).toEqual(['Push A', 'Pull B']);
    await expect(page.getByText('Waiting to sync')).toBeVisible();
  });

  test('TC-HIST-XSS-001 a workout title containing markup is rendered as text', async ({ page }) => {
    const title = '<img src=x onerror="window.__xss=1">';
    await openApp(page, { fitlog_workout_history: [workout(1, title)] });
    await nav(page, 'History').click();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  });

  test('TC-HIST-CORRUPT-001 corrupt stored history does not crash the app', async ({ page }) => {
    await openApp(page, { fitlog_workout_history: 'this is not json{' });
    await nav(page, 'History').click();
    await expect(page.getByRole('heading', { name: 'History', level: 2 })).toBeVisible();
  });

  test('TC-ANA-KPI-001 progress totals come from the logged workouts', async ({ page }) => {
    await openApp(page, seeded);
    await nav(page, 'Progress').click();
    await expect(page.getByText('3,600 kg')).toBeVisible();
    await expect(page.locator('#main').getByText('Current streak')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Top lifts' }).getByText('53.3 kg')).toBeVisible(); // Epley: 40 x (1 + 10/30)
  });

  test('TC-ANA-WEEK-001 weekly muscle bars count completed sets in the last 7 days', async ({ page }) => {
    await openApp(page, seeded);
    await nav(page, 'Progress').click();
    await expect(page.getByText('Chest', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('2 / 12 sets')).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Chest sets this week' })).toBeVisible();
  });

  test('TC-ANA-EMPTY-001 with no workouts the progress screen invites the first log', async ({ page }) => {
    await openApp(page);
    await nav(page, 'Progress').click();
    await expect(page.getByRole('button', { name: /Log a workout/i })).toBeVisible();
  });
});

test.describe('Settings', () => {
  test('TC-SET-UNIT-001 switching to lb is saved and shown in the workout', async ({ page }) => {
    await openApp(page);
    await nav(page, 'Settings').click();
    await page.getByRole('radio', { name: 'lb' }).click();
    expect((await stored(page, 'fitlog_settings')).unit).toBe('lb');
    await nav(page, /Active Workout/).click();
    await expect(sets(page).getByRole('spinbutton', { name: 'Weight in pounds, set 2' })).toHaveValue('88.2');
  });

  test('TC-SET-REST-001 the chosen rest time is used by the rest timer', async ({ page }) => {
    await openApp(page);
    await nav(page, 'Settings').click();
    await page.getByRole('combobox', { name: 'Rest between sets' }).selectOption({ label: '2:00 min' });
    expect((await stored(page, 'fitlog_settings')).restSeconds).toBe(120);
    await nav(page, /Active Workout/).click();
    await sets(page).getByRole('button', { name: 'Complete set 2' }).click();
    await expect(page.getByText(/1[12]\ds remaining/)).toBeVisible();
  });

  test('TC-SET-SW-001 the vibration switch toggles and is saved', async ({ page }) => {
    await openApp(page);
    await nav(page, 'Settings').click();
    const sw = page.getByRole('switch', { name: 'Vibration' });
    await expect(sw).toBeChecked();
    await sw.click();
    await expect(sw).not.toBeChecked();
    expect((await stored(page, 'fitlog_settings')).haptics).toBe(false);
  });
  test('TC-SET-A11Y-001 every settings switch has an accessible name', async ({ page }) => {
    await openApp(page);
    await nav(page, 'Settings').click();
    await expect(page.getByRole('switch', { name: /chime/i })).toBeVisible();
  });

  test('TC-SET-EXP-001 Export my data downloads a JSON file that parses', async ({ page }) => {
    await openApp(page, seeded);
    await nav(page, 'Settings').click();
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export my data (JSON)' }).click()]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
    const { readFile } = await import('node:fs/promises');
    const parsed = JSON.parse(await readFile((await download.path())!, 'utf8'));
    expect(JSON.stringify(parsed)).toContain('Push A');
  });

  test('TC-SET-GUEST-001 a guest sees the guest label and no Sign out button', async ({ page }) => {
    await openApp(page);
    await nav(page, 'Settings').click();
    await expect(page.getByRole('heading', { name: 'Guest on this device' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
  });
});

test.describe('Routines', () => {
  test('TC-RTN-SAVE-001 a routine can be saved, listed and deleted', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: 'Save as routine' }).click();
    await page.locator('#routine-name').fill('QA push');
    await page.getByRole('button', { name: /^Save$/ }).click();
    await expect(page.getByRole('button', { name: 'Delete routine QA push' })).toBeVisible();
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Delete routine QA push' }).click();
    await expect(page.getByRole('button', { name: 'Delete routine QA push' })).toBeHidden();
  });
});
