import React, { useState, useEffect } from 'react';
import LandingPage from './features/landing/LandingPage';
import AuthModal from './features/auth/AuthModal';
import OnboardingFlow from './features/onboarding/OnboardingFlow';
import ProApp from './features/app/ProApp';
import { AuthService } from './lib/supabaseClient';

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
    } else {
      // Default initial blueprint
      setBlueprint({
        fitness_goal: 'Hypertrophy',
        experience_level: 'Intermediate',
        split_preference: 'PPL',
        body_weight_kg: 76.5,
        target_weight_kg: 80.0,
        bench_1rm_kg: 85.0,
      });
    }
  }, []);

  const handleOpenAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (newSession) => {
    setSession(newSession);
    // If onboarding hasn't been completed, go to onboarding, else go directly into app
    const cachedProfile = localStorage.getItem('fitlog_profile');
    if (cachedProfile) {
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

      {view === 'onboarding' && (
        <OnboardingFlow
          session={session}
          onComplete={handleOnboardingComplete}
          onCancel={() => updateView('landing')}
        />
      )}

      {view === 'app' && (
        <ProApp
          blueprint={blueprint}
          session={session}
          onUpdateBlueprint={(newBp) => setBlueprint(newBp)}
          onBack={() => updateView('landing')}
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
