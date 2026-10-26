import React, { useState, useEffect } from 'react';
import LandingPage from './features/landing/LandingPage';
import AuthModal from './features/auth/AuthModal';
import OnboardingFlow from './features/onboarding/OnboardingFlow';
import ProApp from './features/app/ProApp';
import { AuthService, authRequired } from './lib/supabaseClient';
import { CloudSync } from './lib/cloudSync';
import { resetUserData } from './lib/userData';

export default function App() {
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/app' || path === '/simulator') return 'app';
      if (path === '/onboarding') return 'onboarding';
    }
    return 'landing';
  };

  const [view, setView] = useState(getInitialView);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(!authRequired);
  const [blueprint, setBlueprint] = useState(null);

  const updateView = (newView) => {
    setView(newView);
    if (typeof window !== 'undefined') {
      const pathMap = {
        landing: '/',
        onboarding: '/onboarding',
        app: '/app',
      };
      const path = pathMap[newView] || '/';
      window.history.pushState({}, '', path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Restore existing session and cached blueprint if present
    const existing = AuthService.getSession();
    if (existing) {
      setSession(existing);
    }
    const cachedProfile = localStorage.getItem('fitlog_profile');
    if (cachedProfile) {
      try {
        setBlueprint(JSON.parse(cachedProfile));
      } catch (e) {
        // ignore
      }
    } else if (!authRequired) {
      // Local-only mode (no cloud account): start with a neutral plan.
      setBlueprint({
        fitness_goal: 'Muscle Growth',
        goal: 'muscle_growth',
        experience_level: 'Intermediate',
        split_preference: 'PPL',
      });
    }
  }, []);

  useEffect(() => {
    // Pick up real Supabase sessions (e.g. after the Google OAuth redirect back to /app)
    const { data } = AuthService.onAuthStateChange((newSession, event) => {
      if (newSession) setSession(newSession);
      else if (event === 'SIGNED_OUT') setSession(null);
      if (event === 'PASSWORD_RECOVERY') {
        // The reset link signs the user in; ask for the new password before anything else.
        setAuthMode('reset');
        setAuthModalOpen(true);
      }
      setAuthReady(true);
    });
    return () => data?.subscription?.unsubscribe();
  }, []);

  // Cloud mode: the app and onboarding screens require a signed-in user.
  useEffect(() => {
    if (authReady && authRequired && !session && (view === 'app' || view === 'onboarding')) {
      updateView('landing');
      setAuthMode('signin');
      setAuthModalOpen(true);
    }
  }, [authReady, session, view]);

  // Returning user on a new device: restore their saved plan instead of repeating onboarding.
  useEffect(() => {
    if (!session || !authRequired || localStorage.getItem('fitlog_profile')) return;
    AuthService.fetchProfile().then((profile) => {
      if (profile) setBlueprint(profile);
      else if (window.location.pathname === '/app') updateView('onboarding');
    });
  }, [session]);

  const handleSignOut = async () => {
    const result = await CloudSync.flush();
    if (result.pending > 0) {
      const ok = window.confirm(
        `${result.pending} workout${result.pending === 1 ? ' has' : 's have'} not synced yet and will be lost if you sign out. Sign out anyway?`
      );
      if (!ok) return;
    }
    await AuthService.signOut();
    resetUserData();
    setSession(null);
    setBlueprint(null);
    updateView('landing');
  };

  const handleOpenAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = async (newSession) => {
    setSession(newSession);
    // Finished onboarding before (here or on another device)? Go straight to the app.
    let profile = null;
    try {
      const cached = localStorage.getItem('fitlog_profile');
      profile = cached ? JSON.parse(cached) : await AuthService.fetchProfile();
    } catch {
      profile = null;
    }
    if (profile) {
      setBlueprint(profile);
      updateView('app');
    } else {
      updateView('onboarding');
    }
  };

  const handleStartOnboarding = () => {
    if (!session) {
      handleOpenAuth('signup');
    } else {
      updateView('onboarding');
    }
  };

  // When Onboarding is completed: GO DIRECTLY INTO THE APP!
  const handleOnboardingComplete = (newBlueprint) => {
    setBlueprint(newBlueprint);
    updateView('app');
  };

  return (
    <div className="bg-[#0A0B0E] min-h-screen text-slate-100 selection:bg-[#00F59B] selection:text-black">
      {view === 'landing' && (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onStartOnboarding={handleStartOnboarding}
          onEnterApp={() => updateView('app')}
          session={session}
        />
      )}

      {view === 'onboarding' && (!authRequired || session) && (
        <OnboardingFlow
          session={session}
          onComplete={handleOnboardingComplete}
          onCancel={() => updateView('landing')}
        />
      )}

      {view === 'app' && (!authRequired || session) && (
        <ProApp
          blueprint={blueprint}
          session={session}
          onUpdateBlueprint={(newBp) => setBlueprint(newBp)}
          onBack={() => updateView('landing')}
          onSignOut={handleSignOut}
        />
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
