import { test, expect, type Page } from '@playwright/test';
import { mockBackend, type Mock } from './fixtures/mockBackend';
import { sets, complete, finishBtn, nav, stored } from './fixtures/app';

// MOCKED backend; see fixtures/mockBackend.ts.
const PROFILE = { onboarding_completed: true, fitness_goal: 'Muscle Growth', experience_level: 'Intermediate', split_preference: 'PPL' };

async function openSignedIn(page: Page, tweak?: (m: Mock) => void) {
  const m = await mockBackend(page, { signedIn: 'ana@example.com', profile: PROFILE });
  tweak?.(m);
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'Barbell Flat Bench Press' })).toBeVisible();
  return m;
}

const openBuddy = async (page: Page) => {
  await page.getByRole('button', { name: 'Open Buddy, your training companion' }).click();
  return page.getByRole('dialog', { name: 'Buddy, your training companion' });
};
const say = async (page: Page, text: string) => {
  await page.getByRole('textbox', { name: 'Message Buddy' }).fill(text);
  await page.keyboard.press('Enter');
};

test.describe('AI companion (mocked coach)', () => {
  test('TC-COMP-OPEN-001 the companion opens from the floating button and closes on Escape', async ({ page }) => {
    await openSignedIn(page);
    const d = await openBuddy(page);
    await expect(d.getByRole('log', { name: 'Conversation' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(d).toBeHidden();
  });

  test('TC-COMP-CHIPS-001 the three starter prompts are offered', async ({ page }) => {
    await openSignedIn(page);
    const d = await openBuddy(page);
    for (const name of ['Build my plan', 'What should I train today?', 'Review my progress']) await expect(d.getByRole('button', { name })).toBeVisible();
  });

  test('TC-COMP-REPLY-001 a coach reply is shown and its memory note is saved', async ({ page }) => {
    await openSignedIn(page, (m) => { m.coachReply = { reply: 'Noted, home gym it is.', remember: ['Trains at home'], actions: [] }; });
    await openBuddy(page);
    await say(page, 'I train at home');
    await expect(page.getByText('Noted, home gym it is.')).toBeVisible();
    expect(JSON.stringify(await stored(page, 'fitlog_userdata'))).toContain('Trains at home');
  });

  test('TC-COMP-ACT-001 an add_exercise action puts the exercise in today\'s workout', async ({ page }) => {
    await openSignedIn(page, (m) => { m.coachReply = { reply: 'Added.', remember: [], actions: [{ type: 'add_exercise', name: 'Incline Dumbbell Press', sets: 3, reps: 10 }] }; });
    await openBuddy(page);
    await say(page, 'add incline press');
    await expect(page.getByText('Added.')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Incline Dumbbell Press', level: 3 })).toBeVisible();
  });

  test('TC-COMP-ACT-002 unknown actions from the model are ignored', async ({ page }) => {
    await openSignedIn(page, (m) => { m.coachReply = { reply: 'Done.', remember: [], actions: [{ type: 'delete_all_data' }] }; });
    await openBuddy(page);
    await say(page, 'wipe everything');
    await expect(page.getByText('Done.')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Barbell Flat Bench Press' })).toBeVisible();
  });

  test('TC-COMP-ERR-001 a busy coach shows a plain retry message and keeps the chat usable', async ({ page }) => {
    await openSignedIn(page, (m) => { m.coachFail = { status: 503, error: 'busy' }; });
    await openBuddy(page);
    await say(page, 'hello');
    await expect(page.getByText(/coach is busy right now/i)).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Message Buddy' })).toBeEnabled();
  });

  test('TC-COMP-ERR-002 the hourly limit shows its own message', async ({ page }) => {
    await openSignedIn(page, (m) => { m.coachFail = { status: 429, error: 'rate-limited' }; });
    await openBuddy(page);
    await say(page, 'hello');
    await expect(page.getByText(/hourly limit/i)).toBeVisible();
  });

  test('TC-COMP-XSS-001 markup in a coach reply is shown as text', async ({ page }) => {
    await openSignedIn(page, (m) => { m.coachReply = { reply: '<img src=x onerror="window.__xss=1">hi', remember: [], actions: [] }; });
    await openBuddy(page);
    await say(page, 'hello');
    await expect(page.getByText('<img src=x', { exact: false })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  });

  test('TC-COMP-GUARD-001 the companion never sends the API key or a Gemini URL from the browser', async ({ page }) => {
    const urls: string[] = [];
    page.on('request', (r) => urls.push(r.url()));
    await openSignedIn(page);
    await openBuddy(page);
    await say(page, 'hello');
    await expect(page.getByText('Mock coach reply.')).toBeVisible();
    expect(urls.filter((u) => /generativelanguage.googleapis.com|[?&]key=/.test(u))).toEqual([]);
  });
});

test.describe('Workout sync (mocked API)', () => {
  const finishOne = async (page: Page) => {
    await complete(page, 2);
    await finishBtn(page).click();
    await expect(page.getByRole('dialog', { name: 'Workout complete' })).toBeVisible();
  };

  test('TC-SYNC-UP-001 a finished workout is uploaded once with its sets and records', async ({ page }) => {
    const m = await openSignedIn(page);
    await finishOne(page);
    await expect.poll(() => m.calls.filter((c) => c.method === 'PUT' && c.path.startsWith('/workouts/')).length).toBe(1);
    const put = m.calls.find((c) => c.method === 'PUT' && c.path.startsWith('/workouts/'))!;
    expect(put.path).toMatch(/\/workouts\/[0-9a-f-]{36}$/);
    expect(JSON.stringify(put.body)).toContain('Barbell Flat Bench Press');
    await expect.poll(async () => (await stored(page, 'fitlog_sync_queue')).length).toBe(0);
  });

  test('TC-SYNC-OFF-001 a workout finished while the API is unreachable stays queued and uploads on reconnect', async ({ page }) => {
    const m = await openSignedIn(page, (mm) => { mm.online = false; });
    await finishOne(page);
    expect((await stored(page, 'fitlog_sync_queue')).length).toBe(1);
    expect((await stored(page, 'fitlog_workout_history'))).toHaveLength(1);
    m.online = true;
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect.poll(async () => (await stored(page, 'fitlog_sync_queue')).length, { timeout: 15_000 }).toBe(0);
  });

  test('TC-SYNC-4XX-001 a permanent rejection (400) flags the workout and stops retrying', async ({ page }) => {
    await openSignedIn(page, (m) => { m.failWorkoutPut = 400; });
    await finishOne(page);
    await expect.poll(async () => (await stored(page, 'fitlog_sync_queue')).length).toBe(0);
    expect((await stored(page, 'fitlog_workout_history'))[0].syncFailed).toBe(true);
  });

  test('TC-SYNC-5XX-001 a server error (500) keeps the workout queued for retry and never loses it', async ({ page }) => {
    await openSignedIn(page, (m) => { m.failWorkoutPut = 500; });
    await finishOne(page);
    await expect.poll(async () => (await stored(page, 'fitlog_sync_queue')).length).toBe(1);
    expect(await stored(page, 'fitlog_workout_history')).toHaveLength(1);
  });

  test('TC-SYNC-PULL-001 workouts from another device appear after sign-in without duplicating', async ({ page }) => {
    const remote = { id: '00000000-0000-4000-8000-0000000000aa', title: 'From phone', timestamp: Date.now() - 3600_000, volumeKg: 500, durationSeconds: 900, exercises: [], newPRs: [], synced: true };
    const m = await mockBackend(page, { signedIn: 'ana@example.com', profile: PROFILE });
    m.workouts.set(remote.id, remote);
    await page.goto('/app');
    await nav(page, 'History').click();
    await expect(page.getByRole('heading', { name: 'From phone' })).toHaveCount(1);
  });
});

test.describe('Sign out with unsynced work', () => {
  const unsynced = { id: '00000000-0000-4000-8000-0000000000bb', title: 'Not yet synced', timestamp: Date.now(), volumeKg: 100, durationSeconds: 60, exercises: [], newPRs: [], synced: false, pendingSync: true };

  async function setup(page: Page) {
    const m = await mockBackend(page, { signedIn: 'ana@example.com', profile: PROFILE });
    m.failWorkoutPut = 500; // keeps the workout unsynced whether or not the token works
    await page.addInitScript((w) => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem('fitlog_workout_history', JSON.stringify([w]));
      localStorage.setItem('fitlog_sync_queue', JSON.stringify([w]));
      localStorage.setItem('fitlog_profile', JSON.stringify({ onboarding_completed: true }));
    }, unsynced);
    await page.goto('/app');
    await nav(page, 'Settings').click();
  }

  test('TC-AUTH-OUT-002 declining the unsynced-workout warning keeps the user signed in with data intact', async ({ page }) => {
    await setup(page);
    let message = '';
    page.once('dialog', (d) => { message = d.message(); void d.dismiss(); });
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect.poll(() => message).not.toBe('');
    expect(message).toMatch(/not (yet )?(been )?(synced|uploaded)|waiting|unsynced/i);
    expect(new URL(page.url()).pathname).toBe('/app');
    expect(await stored(page, 'fitlog_workout_history')).toHaveLength(1);
  });

  test('TC-AUTH-OUT-003 accepting the warning signs out and clears the device', async ({ page }) => {
    await setup(page);
    page.once('dialog', (d) => void d.accept());
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/localhost:5181\/$/);
    expect(await stored(page, 'fitlog_workout_history')).toBeNull();
  });
});
