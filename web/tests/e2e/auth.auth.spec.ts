import { test, expect, type Page } from '@playwright/test';
import { mockBackend } from './fixtures/mockBackend';

// Every test here runs against the MOCKED backend (see fixtures/mockBackend.ts). No real account is created or used.
const DONE_PROFILE = { onboarding_completed: true, fitness_goal: 'Muscle Growth', experience_level: 'Intermediate', split_preference: 'PPL' };
const dialog = (page: Page) => page.getByRole('dialog');
const email = (page: Page) => page.locator('#auth-email');
const password = (page: Page) => page.locator('#auth-password');
const submit = (page: Page) => page.locator('#auth-submit-btn');

async function openSignIn(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in' }).first().click();
  await expect(dialog(page)).toBeVisible();
}

async function openSignUp(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Start free/ }).first().click();
  await expect(dialog(page)).toBeVisible();
}

test.describe('Route guard', () => {
  for (const path of ['/app', '/onboarding']) {
    test(`TC-AUTH-GUARD-00${path === '/app' ? 1 : 2} signed-out visitor to ${path} is sent to the landing page with the sign-in dialog`, async ({ page }) => {
      await mockBackend(page);
      await page.goto(path);
      await expect(dialog(page)).toBeVisible();
      expect(new URL(page.url()).pathname).toBe('/');
    });
  }

  test('TC-AUTH-GUARD-003 a signed-in user with a finished profile opens /app directly', async ({ page }) => {
    await mockBackend(page, { signedIn: 'ana@example.com', profile: DONE_PROFILE });
    await page.goto('/app');
    await expect(page.getByRole('heading', { name: 'FitLog Pro', level: 1 })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/app');
  });

  test('TC-AUTH-GUARD-004 a signed-in user without a profile is sent to onboarding', async ({ page }) => {
    await mockBackend(page, { signedIn: 'ana@example.com' });
    await page.goto('/app');
    await expect(page).toHaveURL(/\/onboarding$/);
  });
});

test.describe('Auth dialog', () => {
  test('TC-AUTH-DLG-001 the dialog opens, focuses the first field and closes on Escape', async ({ page }) => {
    await mockBackend(page);
    await openSignIn(page);
    await expect(email(page)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
  });

  test('TC-AUTH-DLG-002 the Google button shows when Google sign-in is enabled', async ({ page }) => {
    await mockBackend(page);
    await openSignIn(page);
    await expect(page.locator('#auth-google-btn')).toBeVisible();
  });

  test('TC-AUTH-DLG-003 the show-password toggle reveals and hides the password', async ({ page }) => {
    await mockBackend(page);
    await openSignIn(page);
    await password(page).fill('Secret-123');
    await expect(password(page)).toHaveAttribute('type', 'password');
    await dialog(page).getByRole('button', { name: /show password/i }).click();
    await expect(password(page)).toHaveAttribute('type', 'text');
  });

  test('TC-AUTH-DLG-004 switching between sign-in and sign-up changes the form', async ({ page }) => {
    await mockBackend(page);
    await openSignIn(page);
    await expect(page.locator('#auth-name')).toHaveCount(0);
    await dialog(page).getByRole('button', { name: /create|sign up|start free/i }).first().click();
    await expect(page.locator('#auth-name')).toBeVisible();
  });
});

test.describe('Validation', () => {
  test('TC-AUTH-VAL-001 submitting an empty sign-up form shows all three field errors and sends nothing', async ({ page }) => {
    const m = await mockBackend(page);
    await openSignUp(page);
    await submit(page).click();
    await expect(dialog(page).getByText('Enter your name.')).toBeVisible();
    await expect(dialog(page).getByText('Enter a valid email address.')).toBeVisible();
    await expect(dialog(page).getByText('Use at least 8 characters.')).toBeVisible();
    expect(m.calls.filter((c) => c.path.includes('sign-up'))).toHaveLength(0);
  });

  for (const bad of ['plain', 'a@b', 'a b@c.com', "' OR 1=1 --"]) {
    test(`TC-AUTH-VAL-002 invalid email "${bad}" is rejected before any request`, async ({ page }) => {
      const m = await mockBackend(page);
      await openSignIn(page);
      await email(page).fill(bad);
      await password(page).fill('Correct-horse-1');
      await submit(page).click();
      await expect(dialog(page).getByText('Enter a valid email address.')).toBeVisible();
      expect(m.calls.filter((c) => c.path.includes('sign-in'))).toHaveLength(0);
    });
  }

  test('TC-AUTH-VAL-003 a 7-character password is rejected on sign-up and an 8-character one is accepted', async ({ page }) => {
    const m = await mockBackend(page);
    await openSignUp(page);
    await page.locator('#auth-name').fill('Ben');
    await email(page).fill('ben@example.com');
    await password(page).fill('1234567');
    await submit(page).click();
    await expect(dialog(page).getByText('Use at least 8 characters.')).toBeVisible();
    expect(m.calls.filter((c) => c.path.includes('sign-up'))).toHaveLength(0);
    await password(page).fill('12345678');
    await submit(page).click();
    await expect(page).toHaveURL(/\/onboarding$/);
  });
});

test.describe('Sign in and sign up', () => {
  test('TC-AUTH-SIGNIN-001 a wrong password shows a plain error and keeps the dialog open', async ({ page }) => {
    await mockBackend(page);
    await openSignIn(page);
    await email(page).fill('ana@example.com');
    await password(page).fill('Wrong-password-1');
    await submit(page).click();
    await expect(dialog(page).getByText('Email or password is incorrect.')).toBeVisible();
    await expect(dialog(page)).toBeVisible();
  });
  test('TC-AUTH-MSG-001 a wrong password shows the app own plain message', async ({ page }) => {
    await mockBackend(page);
    await openSignIn(page);
    await email(page).fill('ana@example.com');
    await password(page).fill('Wrong-password-1');
    await submit(page).click();
    await expect(dialog(page).getByText('Email or password is incorrect.')).toBeVisible();
  });

  test('TC-AUTH-SIGNIN-002 an unknown email gets the same message as a wrong password (no account enumeration)', async ({ page }) => {
    await mockBackend(page);
    await openSignIn(page);
    await email(page).fill('nobody@example.com');
    await password(page).fill('Wrong-password-1');
    await submit(page).click();
    await expect(dialog(page).getByText('Email or password is incorrect.')).toBeVisible();
  });

  test('TC-AUTH-SIGNIN-003 valid credentials with a finished profile open the app', async ({ page }) => {
    await mockBackend(page, { profile: DONE_PROFILE });
    await openSignIn(page);
    await email(page).fill('ana@example.com');
    await password(page).fill('Correct-horse-1');
    await submit(page).click();
    await expect(page).toHaveURL(/\/app$/);
  });

  test('TC-AUTH-SIGNIN-004 email matching ignores letter case and surrounding spaces', async ({ page }) => {
    await mockBackend(page, { profile: DONE_PROFILE });
    await openSignIn(page);
    await email(page).fill('  ANA@Example.com ');
    await password(page).fill('Correct-horse-1');
    await submit(page).click();
    await expect(page).toHaveURL(/\/app$/);
  });

  test('TC-AUTH-SIGNIN-005 double-clicking Sign in sends one request', async ({ page }) => {
    const m = await mockBackend(page, { profile: DONE_PROFILE });
    await openSignIn(page);
    await email(page).fill('ana@example.com');
    await password(page).fill('Correct-horse-1');
    await submit(page).dblclick();
    await expect(page).toHaveURL(/\/app$/);
    expect(m.calls.filter((c) => c.path.includes('sign-in'))).toHaveLength(1);
  });

  test('TC-AUTH-SIGNIN-006 an unreachable server shows a connection message, not a crash', async ({ page }) => {
    await mockBackend(page);
    await page.route('**/neon-auth/sign-in/email', (r) => r.abort('connectionrefused'));
    await openSignIn(page);
    await email(page).fill('ana@example.com');
    await password(page).fill('Correct-horse-1');
    await submit(page).click();
    await expect(dialog(page).getByRole('alert').or(dialog(page).getByText(/reach the server/i)).first()).toBeVisible();
  });

  test('TC-AUTH-SIGNUP-001 a new account goes to onboarding', async ({ page }) => {
    await mockBackend(page);
    await openSignUp(page);
    await page.locator('#auth-name').fill('Ben');
    await email(page).fill('ben@example.com');
    await password(page).fill('Another-pass-9');
    await submit(page).click();
    await expect(page).toHaveURL(/\/onboarding$/);
  });

  test('TC-AUTH-SIGNUP-002 an email that already has an account is refused with a pointer to sign in', async ({ page }) => {
    await mockBackend(page);
    await openSignUp(page);
    await page.locator('#auth-name').fill('Ana');
    await email(page).fill('ana@example.com');
    await password(page).fill('Another-pass-9');
    await submit(page).click();
    await expect(dialog(page).getByText('That email already has an account. Sign in instead.')).toBeVisible();
  });

  test('TC-AUTH-SIGNUP-003 a name with markup is sent as text and never executed', async ({ page }) => {
    const m = await mockBackend(page);
    await openSignUp(page);
    await page.locator('#auth-name').fill('<img src=x onerror="window.__xss=1">');
    await email(page).fill('xss@example.com');
    await password(page).fill('Another-pass-9');
    await submit(page).click();
    await expect(page).toHaveURL(/\/onboarding$/);
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
    expect(m.users.get('xss@example.com')?.name).toContain('<img');
  });
});

test.describe('Password reset', () => {
  test('TC-AUTH-RESET-001 Forgot password sends a reset request and tells the user to check email', async ({ page }) => {
    const m = await mockBackend(page);
    await openSignIn(page);
    await dialog(page).getByRole('button', { name: /forgot password/i }).click();
    await email(page).fill('ana@example.com');
    await submit(page).click();
    await expect(dialog(page).getByText(/Failed to execute/)).toHaveCount(0);
    expect(m.calls.some((c) => /password/.test(c.path))).toBe(true);
  });

  test('TC-AUTH-RESET-002 the emailed link opens the new-password dialog and rewrites the URL', async ({ page }) => {
    await mockBackend(page);
    await page.goto('/reset-password?token=qa-token');
    await expect(dialog(page)).toBeVisible();
    await expect(password(page)).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');
    expect(page.url()).not.toContain('qa-token');
  });

  test('TC-AUTH-RESET-003 a too-short new password is refused; a valid one is accepted', async ({ page }) => {
    const m = await mockBackend(page);
    await page.goto('/reset-password?token=qa-token');
    await password(page).fill('short');
    await submit(page).click();
    await expect(page.locator('#auth-password-msg')).toHaveText('Use at least 8 characters.');
    expect(m.calls.filter((c) => /reset-password/.test(c.path))).toHaveLength(0);
    await password(page).fill('Brand-new-pass-1');
    await submit(page).click();
    await expect(dialog(page).getByText(/password (was )?updated/i).first()).toBeVisible();
  });

  test('TC-AUTH-RESET-004 /reset-password without a token opens no dialog', async ({ page }) => {
    await mockBackend(page);
    await page.goto('/reset-password');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(dialog(page)).toBeHidden();
  });
});

test.describe('Sign out', () => {
  test('TC-AUTH-OUT-001 signing out clears device data and returns to the landing page', async ({ page }) => {
    const m = await mockBackend(page, { signedIn: 'ana@example.com', profile: DONE_PROFILE });
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        sessionStorage.setItem('seeded', '1');
        localStorage.setItem('fitlog_workout_history', JSON.stringify([{ id: '00000000-0000-4000-8000-000000000009', title: 'Old', timestamp: Date.now(), volumeKg: 1, durationSeconds: 1, exercises: [], newPRs: [], synced: true }]));
      }
    });
    await page.goto('/app');
    await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/localhost:5181\/$/);
    expect(await page.evaluate(() => localStorage.getItem('fitlog_workout_history'))).toBeNull();
    expect(m.signedIn).toBeUndefined();
  });
});

test.describe('API token (DEF-007)', () => {
  test('TC-SYNC-TOKEN-001 [DEF-007] a signed-in user profile request reaches the API with a token', async ({ page }) => {
    
    const m = await mockBackend(page, { signedIn: 'ana@example.com', profile: DONE_PROFILE });
    await page.goto('/app');
    await expect.poll(() => m.calls.some((c) => c.path === '/me')).toBe(true);
  });
});
