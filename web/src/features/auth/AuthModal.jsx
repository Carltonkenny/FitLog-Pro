import React, { useState, useEffect } from 'react';
import EscapeClose from '../../components/EscapeClose';
import { X, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { AuthService, supabaseUrl, supabaseKey, isCloudConfigured } from '../../lib/supabaseClient';

export default function AuthModal({ isOpen, onClose, initialMode = 'signup', onSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'signup' or 'signin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  // Show the Google button only when the Supabase project has the provider enabled.
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    if (!isCloudConfigured) return;
    let cancelled = false;
    fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseKey } })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!cancelled) setGoogleEnabled(!!s?.external?.google);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { session } = await AuthService.signUp({ email, password, fullName });
        if (!session) {
          setError('');
          setNotice('Check your inbox to confirm your email, then sign in.');
          setMode('signin');
          return;
        }
        onSuccess(session);
      } else {
        const { session } = await AuthService.signIn({ email, password });
        onSuccess(session);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // Real Supabase Google OAuth — redirects browser to Google, then back to the app.
      // The onAuthStateChange listener in App.jsx picks up the session on return.
      await AuthService.signInWithGoogle();
      // Note: page will redirect — code below this won't run on success
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try email instead.');
      setLoading(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Account" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn animate-fadeIn">
      <EscapeClose onClose={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-[#12141A] border border-[#2B3040] p-6 sm:p-8 shadow-2xl animate-popIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A1D26] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1D26] border border-[#2B3040] text-xs font-mono text-[#00F59B] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SECURE SIGN-IN</span>
          </div>
          <h3 className="text-2xl font-bold text-white font-['Outfit']">
            {mode === 'signup' ? 'Create Your Athlete Account' : 'Welcome Back, Athlete'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signup'
              ? 'Track every set and see your progress add up.'
              : 'Sign in to sync your workouts across devices.'}
          </p>
        </div>

        {notice && (
          <div role="status" className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            {notice}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {googleEnabled && (
          <>
        {/* Google 1-Tap Button */}
        <button
          id="auth-google-btn"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-4 py-2.5 px-4 rounded-xl bg-[#1A1D26] hover:bg-[#222633] border border-[#2F3445] text-slate-200 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#242836]" />
          <span className="text-[10px] font-mono uppercase text-slate-500">Or with Email</span>
          <div className="flex-1 h-px bg-[#242836]" />
        </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Miller"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0D0E13] border border-[#242836] focus:border-[#00F59B] text-white text-xs outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@fitlogpro.in"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0D0E13] border border-[#242836] focus:border-[#00F59B] text-white text-xs outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0D0E13] border border-[#242836] focus:border-[#00F59B] text-white text-xs outline-none transition-colors"
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-[#00F59B] hover:bg-[#00D485] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[#00F59B]/20"
          >
            {loading ? (
              <span>Connecting to Supabase...</span>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account & Continue' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[#00F59B] font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#00F59B] font-semibold hover:underline"
              >
                Sign Up
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
