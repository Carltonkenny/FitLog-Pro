import { createClient } from '@supabase/supabase-js';

// Project Reference provided by user
const DEFAULT_SUPABASE_URL = 'https://witglwqwxcquvttyflir.supabase.co';
const DEFAULT_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseKey = DEFAULT_ANON_KEY;
export const isCloudConfigured = !supabaseKey.includes('placeholder');
// Dev-only escape hatch: VITE_SKIP_AUTH=true lets you open /app without signing in. Ignored in production builds.
export const authRequired = isCloudConfigured && !(import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === 'true');

// Older builds mirrored the whole session (including the refresh token) into a second key.
// Supabase already keeps the session; remove the duplicate so a stale copy can never grant access.
if (isCloudConfigured) {
  try {
    localStorage.removeItem('fitlog_session');
  } catch {
    // Storage unavailable (private mode): nothing to clean up.
  }
}

// Real client instance
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

function friendlyAuthError(err) {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('invalid login')) return 'Email or password is incorrect.';
  if (msg.includes('already registered')) return 'That email already has an account. Sign in instead.';
  if (msg.includes('password should be')) return 'Password must be at least 6 characters.';
  if (msg.includes('same password')) return 'Choose a password you have not used before.';
  if (msg.includes('rate limit')) return 'Too many attempts. Wait a minute and try again.';
  if (msg.includes('failed to fetch') || msg.includes('network')) return 'Cannot reach the server. Check your connection and try again.';
  return err?.message || 'Authentication failed. Try again.';
}

// Centralized Auth & Profile Service. Without a Supabase key it runs in local-only mode.
export const AuthService = {
  // Sign up with Email/Password
  async signUp({ email, password, fullName }) {
    try {
      if (supabaseKey && !supabaseKey.includes('placeholder')) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName || 'Athlete' },
          },
        });
        if (error) throw error;
        return { user: data.user, session: data.session };
      }
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }

    // Local-only mode (no Supabase key configured)
    const simulatedUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      email,
      user_metadata: { full_name: fullName || 'Athlete' },
      created_at: new Date().toISOString(),
    };
    const simulatedSession = {
      access_token: 'fitlog_tok_' + Math.random().toString(36).substring(2, 15),
      user: simulatedUser,
    };
    localStorage.setItem('fitlog_session', JSON.stringify(simulatedSession));
    return { user: simulatedUser, session: simulatedSession };
  },

  // Sign in with Email/Password
  async signIn({ email, password }) {
    try {
      if (supabaseKey && !supabaseKey.includes('placeholder')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return { user: data.user, session: data.session };
      }
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }

    // Local-only mode (no Supabase key configured)
    const simulatedUser = {
      id: 'local_' + Math.random().toString(36).substring(2, 11),
      email,
      user_metadata: { full_name: 'Athlete' },
    };
    const simulatedSession = {
      access_token: 'fitlog_tok_carlton_session',
      user: simulatedUser,
    };
    localStorage.setItem('fitlog_session', JSON.stringify(simulatedSession));
    return { user: simulatedUser, session: simulatedSession };
  },

  // Save the onboarding blueprint. The full blueprint is always cached locally; the cloud
  // row only receives columns that exist in supabase/schema.sql.
  async saveOnboardingProfile(userId, profileData) {
    const record = {
      id: userId,
      ...profileData,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('fitlog_profile', JSON.stringify(record));

    if (!isCloudConfigured) return profileData;
    const { data: auth } = await supabase.auth.getSession();
    if (!auth?.session) return profileData;

    const COLUMNS = [
      'fitness_goal', 'experience_level', 'split_preference', 'body_weight_kg',
      'target_weight_kg', 'daily_calorie_target', 'bench_1rm_kg', 'weekly_volume_target_sets',
    ];
    const row = { id: auth.session.user.id, email: auth.session.user.email, onboarding_completed: true };
    COLUMNS.forEach((c) => {
      if (profileData[c] !== undefined && !Number.isNaN(profileData[c])) row[c] = profileData[c];
    });
    const { error } = await supabase.from('profiles').upsert(row);
    if (error) throw new Error('Could not save your profile to the cloud: ' + error.message);
    return profileData;
  },

  // Download the signed-in user's onboarding profile. Returns null when they have not finished onboarding.
  async fetchProfile() {
    if (!isCloudConfigured) return null;
    const { data: auth } = await supabase.auth.getSession();
    if (!auth?.session) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', auth.session.user.id)
      .maybeSingle();
    if (error || !data || !data.onboarding_completed) return null;
    const profile = { ...data, goal: data.fitness_goal === 'Raw Strength' ? 'strength' : 'muscle_growth' };
    localStorage.setItem('fitlog_profile', JSON.stringify(profile));
    return profile;
  },

  // Get current active session
  getSession() {
    // Cloud mode: the Supabase client is the only source of truth (see onAuthStateChange).
    if (isCloudConfigured) return null;
    const cached = localStorage.getItem('fitlog_session');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Email a password-reset link. The link returns to /app and fires PASSWORD_RECOVERY.
  async resetPassword(email) {
    if (!isCloudConfigured) throw new Error('Password reset needs a cloud account.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/app`,
    });
    if (error) throw new Error(friendlyAuthError(error));
  },

  // Set a new password for the signed-in (recovery) session.
  async updatePassword(password) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(friendlyAuthError(error));
  },

  // Google OAuth — redirects to Google; session is restored via onAuthStateChange
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });
    if (error) throw error;
  },

  // Subscribe to Supabase real auth state changes (call once in App.jsx)
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session, event);
    });
  },

  // Sign Out
  async signOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    ['fitlog_session', 'fitlog_profile', 'fitlog_workout_history', 'fitlog_prs', 'fitlog_sync_queue', 'fitlog_userdata'].forEach((k) =>
      localStorage.removeItem(k)
    );
  }
};
