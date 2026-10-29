import { test, expect } from '@playwright/test';
import { openApp, sets, complete, finishBtn, nav, stored } from './fixtures/app';

const summary = (page: import('@playwright/test').Page) => page.getByRole('dialog', { name: 'Workout complete' });

test.describe('Active workout', () => {
  test('TC-WRK-FINISH-001 Finish is disabled until a set is completed', async ({ page }) => {
    await openApp(page);
    await expect(finishBtn(page)).toBeDisabled();
    await complete(page, 2);
    await expect(finishBtn(page)).toBeEnabled();
  });

  test('TC-WRK-SET-001 completing and undoing a set updates total lifted', async ({ page }) => {
    await openApp(page);
    await complete(page, 2); // 40 kg x 10
    await expect(page.getByText('400 kg total lifted')).toBeVisible();
    await expect(sets(page).getByRole('button', { name: 'Undo set 2' })).toHaveAttribute('aria-pressed', 'true');
    await sets(page).getByRole('button', { name: 'Undo set 2' }).click();
    await expect(page.getByText('0 kg total lifted')).toBeVisible();
    await expect(finishBtn(page)).toBeDisabled();
  });

  test('TC-WRK-SET-002 completing a set starts the rest timer; +30s extends and Skip dismisses it', async ({ page }) => {
    await openApp(page);
    await complete(page, 2);
    await expect(page.getByText('Rest Interval Active:')).toBeVisible();
    const remaining = async () => Number((await page.getByText(/\d+s remaining/).innerText()).match(/(\d+)s/)![1]);
    const before = await remaining();
    await page.getByRole('button', { name: '+30s' }).click();
    await expect.poll(remaining).toBeGreaterThan(before + 20);
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByText('Rest Interval Active:')).toBeHidden();
  });

  test('TC-WRK-SET-003 a set with zero reps does not count', async ({ page }) => {
    await openApp(page);
    await sets(page).getByRole('spinbutton', { name: 'Reps, set 2' }).fill('0');
    await complete(page, 2);
    await expect(page.getByText('0 kg total lifted')).toBeVisible();
    await expect(finishBtn(page)).toBeDisabled();
  });

  test('TC-WRK-SET-004 a bodyweight (0 kg) set with reps counts and enables Finish', async ({ page }) => {
    await openApp(page);
    await sets(page).getByRole('spinbutton', { name: 'Weight in kilograms, set 2' }).fill('0');
    await complete(page, 2);
    await expect(finishBtn(page)).toBeEnabled();
    await expect(page.getByText('0 kg total lifted')).toBeVisible();
  });

  test('TC-WRK-BND-001 weight above 1000 kg is clamped to 1000', async ({ page }) => {
    await openApp(page);
    const w = sets(page).getByRole('spinbutton', { name: 'Weight in kilograms, set 2' });
    await w.fill('5000');
    await w.blur();
    await expect(w).toHaveValue('1000');
  });

  test('TC-WRK-BND-002 reps above 200 are clamped to 200', async ({ page }) => {
    await openApp(page);
    const r = sets(page).getByRole('spinbutton', { name: 'Reps, set 2' });
    await r.fill('999');
    await r.blur();
    await expect(r).toHaveValue('200');
  });

  test('TC-WRK-BND-003 a negative weight is not accepted', async ({ page }) => {
    await openApp(page);
    const w = sets(page).getByRole('spinbutton', { name: 'Weight in kilograms, set 2' });
    await w.fill('-5');
    await w.blur();
    expect(Number(await w.inputValue())).toBeGreaterThanOrEqual(0);
  });

  test('TC-WRK-BND-004 the weight stepper moves by 2.5 kg and the reps stepper by 1', async ({ page }) => {
    await openApp(page);
    await sets(page).getByRole('button', { name: 'Increase weight, set 2' }).click();
    await expect(sets(page).getByRole('spinbutton', { name: 'Weight in kilograms, set 2' })).toHaveValue('42.5');
    await sets(page).getByRole('button', { name: 'Decrease reps, set 2' }).click();
    await expect(sets(page).getByRole('spinbutton', { name: 'Reps, set 2' })).toHaveValue('9');
  });

  test('TC-WRK-ADD-001 Add Set appends a row; TC-WRK-REM-001 Remove drops the exercise', async ({ page }) => {
    await openApp(page);
    const rows = sets(page).getByRole('row');
    const before = await rows.count();
    await page.getByRole('button', { name: 'Add set to Barbell Flat Bench Press' }).click();
    await expect(rows).toHaveCount(before + 1);
    await page.getByRole('button', { name: 'Remove Barbell Flat Bench Press' }).click();
    await expect(page.getByRole('heading', { name: 'Barbell Flat Bench Press' })).toBeHidden();
  });

  test('TC-WRK-NAME-001 the workout name can be edited and is saved with the workout', async ({ page }) => {
    await openApp(page);
    await page.getByRole('textbox', { name: 'Workout name' }).fill('Leg day QA');
    await complete(page, 2);
    await finishBtn(page).click();
    await expect(summary(page)).toBeVisible();
    const history = await stored(page, 'fitlog_workout_history');
    expect(history[0].title).toBe('Leg day QA');
  });

  test('TC-WRK-FIN-001 finishing shows the summary, saves one workout and a first personal record', async ({ page }) => {
    await openApp(page);
    await complete(page, 2);
    await finishBtn(page).click();
    const dialog = summary(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Total Volume')).toBeVisible();
    await expect(dialog.getByText('Duration')).toBeVisible();
    await expect(dialog.getByText('New Personal Records Broken:')).toBeVisible();
    expect(await stored(page, 'fitlog_workout_history')).toHaveLength(1);
    await dialog.getByRole('button', { name: 'View in Workout History' }).click();
    await expect(nav(page, 'History')).toHaveAttribute('aria-current', 'page');
  });

  test('TC-WRK-FIN-003 double-clicking Finish saves the workout once', async ({ page }) => {
    await openApp(page);
    await complete(page, 2);
    await finishBtn(page).dblclick();
    await expect(summary(page)).toBeVisible();
    expect(await stored(page, 'fitlog_workout_history')).toHaveLength(1);
  });

  test('TC-WRK-FIN-002 after finishing, the next workout starts with nothing completed', async ({ page }) => {
    await openApp(page);
    await complete(page, 2);
    await finishBtn(page).click();
    await summary(page).getByRole('button', { name: 'View in Workout History' }).click();
    await nav(page, /Active Workout/).click();
    await expect(finishBtn(page)).toBeDisabled();
  });

  test('TC-WRK-PR-001 repeating an identical best set is a tie, not a new personal record', async ({ page }) => {
    await openApp(page);
    await complete(page, 4); // 42.5 kg x 8
    await finishBtn(page).click();
    await summary(page).getByRole('button', { name: 'View in Workout History' }).click();
    await nav(page, /Active Workout/).click();
    // The new session pre-fills every set from the last best set (42.5 kg x 8), so set 2 repeats it exactly.
    await expect(sets(page).getByRole('spinbutton', { name: 'Weight in kilograms, set 2' })).toHaveValue('42.5');
    await complete(page, 2);
    await finishBtn(page).click();
    await expect(summary(page)).toBeVisible();
    await expect(page.getByText('New Personal Records Broken:')).toBeHidden();
  });
  test('TC-WRK-LAST-001 only completed sets feed the next session prefill', async ({ page }) => {
    await openApp(page);
    await complete(page, 2); // 40 kg x 10 done; set 4 (42.5 kg x 8) was never done
    await finishBtn(page).click();
    await summary(page).getByRole('button', { name: 'View in Workout History' }).click();
    await nav(page, /Active Workout/).click();
    await expect(sets(page).getByRole('spinbutton', { name: 'Weight in kilograms, set 2' })).toHaveValue('40');
  });

  test('TC-WRK-LB-001 in pounds the weight column shows lb and converts 40 kg to 88.2', async ({ page }) => {
    await openApp(page, { fitlog_settings: { unit: 'lb' } });
    await expect(sets(page).getByRole('spinbutton', { name: 'Weight in pounds, set 2' })).toHaveValue('88.2');
  });
  test('TC-WRK-LB-002 the weight column header says lb when the unit is pounds', async ({ page }) => {
    await openApp(page, { fitlog_settings: { unit: 'lb' } });
    await expect(sets(page).getByRole('columnheader', { name: /lb/ })).toBeVisible();
  });

  test('TC-WRK-REFRESH-002 the session clock keeps its elapsed time after a refresh and comes back paused', async ({ page }) => {
    await page.clock.install({ time: new Date() });
    await openApp(page);
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await page.clock.runFor(65_000);
    await expect(page.getByText('01:05').first()).toBeVisible();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('01:0').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Resume|Start/ }).first()).toBeVisible();
  });

  test('TC-WRK-TIMER-001 the session clock runs and pauses (fake clock)', async ({ page }) => {
    await page.clock.install({ time: new Date() });
    await openApp(page);
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible(); // wait until the interval is registered
    await page.clock.runFor(5000);
    const timeLocator = page.locator('header').getByText(/00:0[5-9]/).first();
    await expect(timeLocator).toBeVisible();
    const paused = await timeLocator.textContent();
    await page.getByRole('button', { name: 'Pause' }).click();
    await page.clock.runFor(5000);
    await expect(page.locator('header').getByText(paused)).toBeVisible();
  });
  test('TC-WRK-REFRESH-001 a completed set survives a page refresh', async ({ page }) => {
    await openApp(page);
    await complete(page, 2);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(sets(page).getByRole('button', { name: 'Undo set 2' })).toBeVisible();
  });
});
