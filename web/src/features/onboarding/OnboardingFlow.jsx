import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { AuthService } from '../../lib/neonClient';
import { fromDisplay, setSettings, toDisplay, useSettings } from '../../lib/settings';

const GOALS = [
  { id: 'Muscle Growth', title: 'Build muscle', desc: 'Gain visible size, shape and definition.' },
  { id: 'Raw Strength', title: 'Get stronger', desc: 'Lift heavier on squat, bench and deadlift.' },
  { id: 'Lean & Toned', title: 'Lean out', desc: 'Lose body fat while keeping and building muscle.' },
  { id: 'Endurance', title: 'Improve fitness', desc: 'Boost stamina, conditioning and energy.' },
];

const LEVELS = [
  { id: 'Novice', title: 'Beginner', desc: 'Under 1 year. Learning form and making fast early gains.' },
  { id: 'Intermediate', title: 'Intermediate', desc: '1 to 3 years. Ready for structured progressive overload.' },
  { id: 'Advanced', title: 'Advanced', desc: '3+ years. Managing high volume and fatigue.' },
];

const SPLITS = [
  { id: 'PPL', title: 'Push / pull / legs', desc: '4 to 6 days a week. The most popular split.' },
  { id: 'UpperLower', title: 'Upper / lower', desc: '4 days a week. Plenty of recovery time.' },
  { id: 'FullBody', title: 'Full body', desc: '3 days a week. Efficient when time is short.' },
  { id: 'Arnold', title: 'Arnold split', desc: '5 to 6 days a week. High volume.' },
];

const STEPS = [
  { key: 'goal', title: 'What is your main goal?', sub: 'We use this to shape your training suggestions.', options: GOALS },
  { key: 'experience', title: 'How long have you been lifting?', sub: 'Be honest. It sets how fast we suggest you progress.', options: LEVELS },
  { key: 'split', title: 'How do you like to train?', sub: 'Pick the split closest to your week. You can change it later.', options: SPLITS },
  { key: 'body', title: 'A few numbers', sub: 'These help the coach set realistic weights. All optional.' },
];

function OptionGroup({ label, options, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={`text-left rounded-xl border p-4 min-h-24 transition-colors ${
              on ? 'bg-[#00F59B]/10 border-[#00F59B] text-white' : 'bg-[#0D0F14] border-white/[0.1] text-zinc-200 hover:border-white/[0.25]'
            }`}
          >
            <span className="flex items-center justify-between gap-2 font-semibold">
              {o.title}
              {on && <Check className="w-4 h-4 text-[#00F59B] stroke-[3]" aria-hidden="true" />}
            </span>
            <span className="block text-sm text-zinc-400 mt-1 leading-snug">{o.desc}</span>
          </button>
        );
      })}
    </div>
  );
}

function NumberField({ id, label, unit, value, onChange, error, hint }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-zinc-200 block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={`${id}-msg`}
          className={`w-full h-12 pl-3.5 pr-12 rounded-xl bg-[#0D0F14] border text-white font-mono tabular-nums focus:border-[#00F59B] ${
            error ? 'border-red-400/60' : 'border-white/[0.1]'
          }`}
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400" aria-hidden="true">
          {unit}
        </span>
      </div>
      <p id={`${id}-msg`} role={error ? 'alert' : undefined} className={`mt-1.5 text-xs ${error ? 'text-red-300' : 'text-zinc-400'}`}>
        {error || hint}
      </p>
    </div>
  );
}

const inRange = (v, min, max) => v === '' || (Number(v) >= min && Number(v) <= max);

export default function OnboardingFlow({ session, onComplete }) {
  const { unit } = useSettings();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState({ goal: 'Muscle Growth', experience: 'Intermediate', split: 'PPL' });
  const [body, setBody] = useState({ weight: '', target: '', bench: '' });
  const headingRef = useRef(null);

  const last = step === STEPS.length - 1;
  const current = STEPS[step];
  const maxBody = toDisplay(300, unit);
  const maxBench = toDisplay(500, unit);
  const errors = {
    weight: inRange(body.weight, 1, maxBody) ? '' : `Enter a value up to ${maxBody} ${unit}.`,
    target: inRange(body.target, 1, maxBody) ? '' : `Enter a value up to ${maxBody} ${unit}.`,
    bench: inRange(body.bench, 1, maxBench) ? '' : `Enter a value up to ${maxBench} ${unit}.`,
  };
  const bodyInvalid = last && Object.values(errors).some(Boolean);

  // Move focus to the new heading so keyboard and screen-reader users land at the top of each step.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const toKg = (v) => (v === '' ? undefined : fromDisplay(Number(v), unit));

  const finish = async () => {
    setSaving(true);
    const blueprint = {
      fitness_goal: answers.goal,
      goal: answers.goal === 'Raw Strength' ? 'strength' : 'muscle_growth',
      experience_level: answers.experience,
      split_preference: answers.split,
      body_weight_kg: toKg(body.weight),
      target_weight_kg: toKg(body.target),
      bench_1rm_kg: toKg(body.bench),
      weekly_volume_target_sets: answers.experience === 'Advanced' ? 18 : 14,
    };
    try {
      await AuthService.saveOnboardingProfile(session?.user?.id || 'guest', blueprint);
    } catch (err) {
      // The plan is cached on this device already, so the user can carry on; it re-uploads next time.
      console.error('Onboarding profile cloud save failed:', err.message);
    }
    setSaving(false);
    onComplete(blueprint);
  };

  const next = () => {
    if (bodyInvalid || saving) return;
    if (last) finish();
    else setStep((s) => s + 1);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div aria-hidden="true" className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[560px] h-[300px] bg-[#00F59B]/[0.06] blur-[140px] rounded-full pointer-events-none" />

      <form
        className="relative w-full max-w-xl rounded-2xl bg-[#101218] border border-white/[0.09] p-6 sm:p-9 [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.06),0_30px_80px_-20px_rgba(0,0,0,0.9)]"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        noValidate
      >
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <button
              type="button"
              onClick={finish}
              disabled={saving}
              className="min-h-10 px-2 hover:text-white underline underline-offset-4"
            >
              Skip for now
            </button>
          </div>
          <div
            role="progressbar"
            aria-label="Onboarding progress"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={step + 1}
            className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-[#00F59B] rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div key={step} className="space-y-6 animate-popIn">
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-white tracking-[-0.02em] focus:outline-none">
              {current.title}
            </h1>
            <p className="text-sm text-zinc-400 mt-1.5">{current.sub}</p>
          </div>

          {current.options ? (
            <OptionGroup
              label={current.title}
              options={current.options}
              value={answers[current.key]}
              onChange={(v) => setAnswers((a) => ({ ...a, [current.key]: v }))}
            />
          ) : (
            <div className="space-y-5">
              <div role="radiogroup" aria-label="Weight unit" className="inline-flex p-1 rounded-xl bg-[#0D0F14] border border-white/[0.08]">
                {['kg', 'lb'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    role="radio"
                    aria-checked={unit === u}
                    onClick={() => {
                      setBody({ weight: '', target: '', bench: '' });
                      setSettings({ unit: u });
                    }}
                    className={`min-w-16 h-10 rounded-lg text-sm font-semibold ${unit === u ? 'bg-[#00F59B] text-black' : 'text-zinc-300 hover:text-white'}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <NumberField id="ob-weight" label="Body weight" unit={unit} value={body.weight} error={errors.weight} onChange={(v) => setBody((b) => ({ ...b, weight: v }))} />
              <NumberField id="ob-target" label="Target body weight" unit={unit} value={body.target} error={errors.target} hint="Leave blank if you are not aiming to change." onChange={(v) => setBody((b) => ({ ...b, target: v }))} />
              <NumberField id="ob-bench" label="Best bench press (one rep)" unit={unit} value={body.bench} error={errors.bench} hint="An estimate is fine. We use it to suggest starting weights." onChange={(v) => setBody((b) => ({ ...b, bench: v }))} />
            </div>
          )}
        </div>

        <div className="mt-9 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0 || saving}
            className="h-12 px-5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2 disabled:opacity-0 disabled:pointer-events-none"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </button>
          <button
            type="submit"
            disabled={saving || bodyInvalid}
            className="h-12 px-7 rounded-xl bg-[#00F59B] hover:bg-[#00D485] text-black font-bold flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                {last ? 'Finish and start' : 'Continue'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
