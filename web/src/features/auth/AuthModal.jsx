import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Dumbbell, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { AuthService, supabaseUrl, supabaseKey, isCloudConfigured } from '../../lib/supabaseClient';
import EscapeClose from '../../components/EscapeClose';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 8;

const COPY = {
  signup: { title: 'Create your account', sub: 'Track every set and see your progress add up.', cta: 'Create account' },
  signin: { title: 'Welcome back', sub: 'Sign in to sync your workouts across devices.', cta: 'Sign in' },
  forgot: { title: 'Reset your password', sub: 'Enter your email and we will send you a reset link.', cta: 'Send reset link' },
  reset: { title: 'Choose a new password', sub: 'Use at least 8 characters.', cta: 'Save new password' },
};

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-zinc-200 block mb-1.5">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="mt-1.5 text-xs text-red-300">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-msg`} className="mt-1.5 text-xs text-zinc-400">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const inputClass =
  'w-full h-12 px-3.5 rounded-xl bg-[#0D0E13] border text-white text-sm placeholder:text-zinc-500 focus:border-[#00F59B]';

export default function AuthModal({ isOpen, onClose, initialMode = 'signup', onSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const firstField = useRef(null);

  // Show Google only when the Supabase project has the provider switched on.
  useEffect(() => {
    if (!isCloudConfigured) return undefined;
    let cancelled = false;
    fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseKey } })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => !cancelled && setGoogleEnabled(!!s?.external?.google))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  // Reset transient state and focus the first field whenever the dialog opens or the mode changes.
  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setTouched({});
    setShowPw(false);
    const t = setTimeout(() => firstField.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const copy = COPY[mode];
  const needsName = mode === 'signup';
  const needsEmail = mode !== 'reset';
  const needsPassword = mode !== 'forgot';

  const errors = {
    name: needsName && fullName.trim().length < 1 ? 'Enter your name.' : '',
    email: needsEmail && !EMAIL_RE.test(email.trim()) ? 'Enter a valid email address.' : '',
    password:
      needsPassword && (mode === 'signin' ? password.length < 1 : password.length < MIN_PASSWORD)
        ? mode === 'signin'
          ? 'Enter your password.'
          : `Use at least ${MIN_PASSWORD} characters.`
        : '',
  };
  const show = (k) => (touched[k] ? errors[k] : '');
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const firstId = needsName ? 'auth-name' : needsEmail ? 'auth-email' : 'auth-password';

  const switchMode = (m) => {
    setNotice('');
    setMode(m);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setTouched({ name: true, email: true, password: true });
    if (errors.name || errors.email || errors.password) return;

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { session } = await AuthService.signUp({ email: email.trim(), password, fullName: fullName.trim() });
        if (!session) {
          setNotice('Check your inbox to confirm your email, then sign in.');
          setMode('signin');
          return;
        }
        onSuccess(session);
        onClose();
      } else if (mode === 'signin') {
        const { session } = await AuthService.signIn({ email: email.trim(), password });
        onSuccess(session);
        onClose();
      } else if (mode === 'forgot') {
        await AuthService.resetPassword(email.trim());
        setNotice('If that email has an account, a reset link is on its way.');
        setMode('signin');
      } else {
        await AuthService.updatePassword(password);
        setNotice('Password updated.');
        setTimeout(onClose, 900);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await AuthService.signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Use email instead.');
      setLoading(false);
    }
  };

  const ref = (id) => (id === firstId ? firstField : undefined);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <EscapeClose onClose={onClose} />
      <div className="relative w-full sm:max-w-md max-h-[100dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-[#101218] border border-white/[0.1] p-6 sm:p-8 shadow-2xl animate-popIn [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.06),0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06]"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="text-center mb-6">
          <span className="w-11 h-11 mx-auto mb-4 rounded-xl bg-[#00F59B] flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-black" aria-hidden="true" />
          </span>
          <h2 id="auth-title" className="font-['Outfit'] text-2xl font-bold text-white tracking-tight">
            {copy.title}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">{copy.sub}</p>
        </div>

        {notice && (
          <p role="status" className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
            {error}
          </p>
        )}

        {googleEnabled && (mode === 'signup' || mode === 'signin') && (
          <>
            <button
              id="auth-google-btn"
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full h-12 mb-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm flex items-center justify-center gap-2.5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.93 6.72-4.93z" />
              </svg>
              Continue with Google
            </button>
            <div className="flex items-center gap-3 mb-4" aria-hidden="true">
              <div className="flex-1 h-px bg-white/[0.1]" />
              <span className="text-xs text-zinc-500">or</span>
              <div className="flex-1 h-px bg-white/[0.1]" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {needsName && (
            <Field id="auth-name" label="Name" error={show('name')}>
              <input
                ref={ref('auth-name')}
                id="auth-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={blur('name')}
                aria-invalid={!!show('name')}
                aria-describedby="auth-name-msg"
                placeholder="Alex Miller"
                className={`${inputClass} ${show('name') ? 'border-red-400/60' : 'border-white/[0.1]'}`}
              />
            </Field>
          )}
          {needsEmail && (
            <Field id="auth-email" label="Email" error={show('email')}>
              <input
                ref={ref('auth-email')}
                id="auth-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={blur('email')}
                aria-invalid={!!show('email')}
                aria-describedby="auth-email-msg"
                placeholder="you@example.com"
                className={`${inputClass} ${show('email') ? 'border-red-400/60' : 'border-white/[0.1]'}`}
              />
            </Field>
          )}
          {needsPassword && (
            <Field
              id="auth-password"
              label={mode === 'reset' ? 'New password' : 'Password'}
              error={show('password')}
              hint={mode === 'signup' ? `At least ${MIN_PASSWORD} characters` : undefined}
            >
              <div className="relative">
                <input
                  ref={ref('auth-password')}
                  id="auth-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={blur('password')}
                  aria-invalid={!!show('password')}
                  aria-describedby="auth-password-msg"
                  className={`${inputClass} pr-12 ${show('password') ? 'border-red-400/60' : 'border-white/[0.1]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  aria-pressed={showPw}
                  className="absolute right-1 top-1 w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white"
                >
                  {showPw ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </Field>
          )}

          {mode === 'signin' && (
            <div className="text-right -mt-1">
              <button type="button" onClick={() => switchMode('forgot')} className="text-sm text-zinc-300 hover:text-white underline underline-offset-4 min-h-10 px-1">
                Forgot password?
              </button>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#00F59B] hover:bg-[#00D485] text-black font-bold text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Working…</span>
              </>
            ) : (
              <>
                <span>{copy.cta}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {(mode === 'signup' || mode === 'signin' || mode === 'forgot') && (
          <p className="text-center text-sm text-zinc-400 mt-5">
            {mode === 'signup' ? 'Already have an account?' : mode === 'signin' ? 'New to FitLog Pro?' : 'Remembered it?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'signup' || mode === 'forgot' ? 'signin' : 'signup')}
              className="text-[#00F59B] hover:underline font-semibold min-h-10 px-1"
            >
              {mode === 'signup' || mode === 'forgot' ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
