import { createAuthClient } from '@neondatabase/neon-js/auth';

// Backend access for the whole app, on Neon:
//  - accounts: Neon Auth (managed Better Auth), reached through /neon-auth on our own domain so the
//    session cookie is first-party (see vite.config.js and netlify.toml)
//  - data and AI coach: the FitLog API function, called with a short-lived JWT from Neon Auth
// Without these settings the app runs in local-only mode (workouts stay on the device).

const env = import.meta.env;
const API_URL = (env.NEON_FUNCTION_API_BASE_URL || '').replace(/\/$/, '');

export const REALTIME_URL = env.NEON_REALTIME_URL || '';
export const isCloudConfigured = Boolean(env.NEON_AUTH_BASE_URL && API_URL);
// Dev-only escape hatch: VITE_SKIP_AUTH=true lets you open /app without signing in. Ignored in production builds.
export const authRequired = isCloudConfigured && !(env.DEV && env.VITE_SKIP_AUTH === 'true');
// Google sign-in uses Neon's shared development keys until you add your own. Off unless you opt in.
export const googleEnabled = env.VITE_GOOGLE_AUTH === 'true';

const authClient = isCloudConfigured ? createAuthClient(`${window.location.origin}/neon-auth`) : null;

// ---------------------------------------------------------------------------------------- API calls

export class ApiError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

let cached = { token: null, expiresAt: 0 };

/** A valid access token for the API, refreshed shortly before it expires (tokens last 15 minutes). */
async function accessToken(force = false) {
  if (!force && cached.token && Date.now() < cached.expiresAt - 30_000) return cached.token;
  const { data, error } = await authClient.token();
  if (error || !data?.token) return null;
  let expiresAt = Date.now() + 10 * 60_000;
  try {
    const exp = JSON.parse(atob(data.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp;
    if (Number.isFinite(exp)) expiresAt = exp * 1000;
  } catch {
    // Keep the conservative 10 minute guess.
  }
  cached = { token: data.token, expiresAt };
  return cached.token;
}

/** Calls the FitLog API as the signed-in user. Resolves with parsed JSON; throws ApiError on 4xx/5xx. */
export async function api(path, { method = 'GET', body } = {}) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const token = await accessToken(attempt > 0);
    if (!token) throw new ApiError(401, 'unauthorized');
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401 && attempt === 0) continue; // token may have just expired: refresh once
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data?.error || 'error');
    return data;
  }
  throw new ApiError(401, 'unauthorized');
}

// ---------------------------------------------------------------------------------------- accounts

function friendlyAuthError(err) {
  const code = String(err?.code || '').toUpperCase();
  const msg = String(err?.message || '').toLowerCase();
  if (code.includes('INVALID_EMAIL_OR_PASSWORD') || msg.includes('invalid email or password') || msg.includes('invalid login')) {
    return 'Email or password is incorrect.';
  }
  if (code.includes('USER_ALREADY_EXISTS') || msg.includes('already exists') || msg.includes('already registered')) {
    return 'That email already has an account. Sign in instead.';
  }
  if (code.includes('PASSWORD_TOO_SHORT') || msg.includes('password') && msg.includes('short')) return 'Password must be at least 8 characters.';
  if (code.includes('INVALID_EMAIL') || msg.includes('invalid email')) return 'Enter a valid email address.';
  if (code.includes('INVALID_TOKEN') || msg.includes('invalid token') || msg.includes('expired')) return 'That reset link has expired. Request a new one.';
  if (code.includes('INVALID_ORIGIN')) return 'This site is not allowed to sign in yet. Tell the site owner.';
  if (msg.includes('rate') || err?.status === 429) return 'Too many attempts. Wait a minute and try again.';
  if (msg.includes('failed to fetch') || msg.includes('network')) return 'Cannot reach the server. Check your connection and try again.';
  return err?.message || 'Authentication failed. Try again.';
}

/** Shapes a Neon Auth user the way the rest of the app expects it. */
const toSession = (user) =>
  user ? { user: { id: user.id, email: user.email, user_metadata: { full_name: user.name || 'Athlete' } } } : null;

async function currentSession() {
  const { data } = await authClient.getSession();
  return toSession(data?.user);
}

const LOCAL_KEYS = ['fitlog_session', 'fitlog_profile', 'fitlog_workout_history', 'fitlog_prs', 'fitlog_sync_queue', 'fitlog_userdata', 'fitlog_userdata_base'];

const localSession = (email, fullName) => {
  const session = {
    access_token: 'local_' + Math.random().toString(36).slice(2),
    user: { id: 'local_' + Math.random().toString(36).slice(2, 11), email, user_metadata: { full_name: fullName || 'Athlete' } },
  };
  localStorage.setItem('fitlog_session', JSON.stringify(session));
  return session;
};

// Cloud mode talks to Neon Auth. Local-only mode (nothing configured) keeps a device-only session for development.
export const AuthService = {
  async signUp({ email, password, fullName }) {
    if (!isCloudConfigured) {
      const session = localSession(email, fullName);
      return { user: session.user, session };
    }
    const { error } = await authClient.signUp.email({ email, password, name: fullName || email.split('@')[0] });
    if (error) throw new Error(friendlyAuthError(error));
    // No session yet means the project requires email verification first.
    const session = await currentSession();
    return { user: session?.user ?? null, session };
  },

  async signIn({ email, password }) {
    if (!isCloudConfigured) {
      const session = localSession(email);
      return { user: session.user, session };
    }
    const { error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(friendlyAuthError(error));
    const session = await currentSession();
    return { user: session?.user ?? null, session };
  },

  /** The signed-in user, or null. Cloud mode asks Neon Auth; local mode reads the device-only session. */
  async restoreSession() {
    if (isCloudConfigured) return currentSession().catch(() => null);
    try {
      return JSON.parse(localStorage.getItem('fitlog_session') || 'null');
    } catch {
      return null;
    }
  },

  /** Saves the onboarding plan: always on this device, and to the account when signed in. */
  async saveOnboardingProfile(userId, profileData) {
    localStorage.setItem(
      'fitlog_profile',
      JSON.stringify({ id: userId, ...profileData, onboarding_completed: true, updated_at: new Date().toISOString() })
    );
    if (!isCloudConfigured) return profileData;
    const COLUMNS = ['fitness_goal', 'experience_level', 'split_preference', 'body_weight_kg', 'target_weight_kg', 'daily_calorie_target', 'bench_1rm_kg', 'weekly_volume_target_sets'];
    const body = { onboarding_completed: true };
    COLUMNS.forEach((c) => {
      if (profileData[c] !== undefined && !Number.isNaN(profileData[c])) body[c] = profileData[c];
    });
    try {
      await api('/me', { method: 'PUT', body });
    } catch (err) {
      throw new Error('Could not save your profile to your account: ' + (err.code || err.message));
    }
    return profileData;
  },

  /** The signed-in user's saved plan, or null if they have not finished onboarding. */
  async fetchProfile() {
    if (!isCloudConfigured) return null;
    const { profile } = await api('/me');
    if (!profile?.onboarding_completed) return null;
    const result = { ...profile, goal: profile.fitness_goal === 'Raw Strength' ? 'strength' : 'muscle_growth' };
    localStorage.setItem('fitlog_profile', JSON.stringify(result));
    return result;
  },

  /** Emails a reset link that returns to /reset-password?token=... */
  async resetPassword(email) {
    if (!isCloudConfigured) throw new Error('Password reset needs an online account.');
    const request = authClient.requestPasswordReset || authClient.forgetPassword;
    const { error } = await request.call(authClient, { email, redirectTo: `${window.location.origin}/reset-password` });
    if (error) throw new Error(friendlyAuthError(error));
  },

  /** Sets a new password using the token from the reset email link. */
  async updatePassword(newPassword, token) {
    const { error } = await authClient.resetPassword({ newPassword, token });
    if (error) throw new Error(friendlyAuthError(error));
  },

  async signInWithGoogle() {
    const { error } = await authClient.signIn.social({ provider: 'google', callbackURL: `${window.location.origin}/app` });
    if (error) throw new Error(friendlyAuthError(error));
  },

  async signOut() {
    cached = { token: null, expiresAt: 0 };
    try {
      await authClient?.signOut();
    } catch {
      // Already signed out or offline: local data is cleared below either way.
    }
    LOCAL_KEYS.forEach((k) => localStorage.removeItem(k));
  },
};
