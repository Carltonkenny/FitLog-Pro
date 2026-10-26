import React, { useState } from 'react';
import { ArrowRight, Check, Flame } from 'lucide-react';

const SAMPLE_SETS = [
  { prev: '80 × 8', kg: 82.5, reps: 8 },
  { prev: '80 × 8', kg: 82.5, reps: 8 },
  { prev: '80 × 7', kg: 82.5, reps: 7 },
  { prev: '77.5 × 8', kg: 80, reps: 8 },
];

const TRUST = ['No credit card', 'Works offline', 'Export your data anytime'];

export default function Hero({ onStartOnboarding }) {
  const [done, setDone] = useState([true, true, false, false]);
  const toggle = (i) => setDone((d) => d.map((v, k) => (k === i ? !v : v)));
  const completed = done.filter(Boolean).length;

  return (
    <section id="top" className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
      <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-[#00F59B]/[0.07] blur-[140px] rounded-full pointer-events-none" />
      <div aria-hidden="true" className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
        <div className="lg:col-span-7 space-y-7 text-center lg:text-left animate-popIn">
          <p className="inline-flex items-center gap-2 px-3 h-8 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs font-medium text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F59B]" aria-hidden="true" />
            Workout tracker for lifters
          </p>

          <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-[-0.03em]">
            Log every set<br />
            in <span className="text-[#00F59B]">two taps.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Big, thumb-friendly controls keep you moving between sets. FitLog Pro spots your personal records
            automatically, and an AI coach reads your history and your photos to build the next plan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <button
              id="hero-start-btn"
              type="button"
              onClick={onStartOnboarding}
              className="w-full sm:w-auto h-13 px-8 py-3.5 rounded-xl bg-[#00F59B] hover:bg-[#00D485] text-black font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#00F59B]/20"
            >
              Start free
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/[0.14] hover:bg-white/[0.05] text-white font-semibold text-base text-center"
            >
              See how it works
            </a>
          </div>

          <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-zinc-400">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#00F59B]" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Interactive preview */}
        <div className="lg:col-span-5 animate-popIn" style={{ animationDelay: '120ms' }}>
          <div className="relative mx-auto max-w-md rounded-2xl bg-[#101218] border border-white/[0.09] p-5 shadow-2xl shadow-black/60 [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.06),0_30px_80px_-20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.07]">
              <div>
                <p className="font-['Outfit'] font-bold text-white text-sm">Push day</p>
                <p className="text-xs text-zinc-400">Barbell bench press</p>
              </div>
              <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-white/[0.06] text-zinc-300">
                Preview · sample data
              </span>
            </div>

            <div className="grid grid-cols-12 text-[11px] uppercase tracking-wide text-zinc-500 px-3 pb-1">
              <span className="col-span-2">Set</span>
              <span className="col-span-4">Previous</span>
              <span className="col-span-4">kg × reps</span>
              <span className="col-span-2 text-right">Done</span>
            </div>

            <div className="space-y-2">
              {SAMPLE_SETS.map((row, i) => (
                <button
                  key={i}
                  type="button"
                  role="checkbox"
                  aria-checked={done[i]}
                  aria-label={`Set ${i + 1}, ${row.kg} kilograms for ${row.reps} reps`}
                  onClick={() => toggle(i)}
                  className={`w-full grid grid-cols-12 items-center px-3 min-h-12 rounded-xl border text-left ${
                    done[i]
                      ? 'bg-[#00F59B]/10 border-[#00F59B]/40 text-white'
                      : 'bg-[#0D0F14] border-white/[0.08] hover:border-white/[0.18] text-zinc-300'
                  }`}
                >
                  <span className="col-span-2 font-mono text-xs font-bold tabular-nums">{i + 1}</span>
                  <span className="col-span-4 font-mono text-xs text-zinc-400 tabular-nums">{row.prev}</span>
                  <span className="col-span-4 font-mono text-xs font-bold text-white tabular-nums">
                    {row.kg} × {row.reps}
                  </span>
                  <span className="col-span-2 flex justify-end">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                        done[i] ? 'bg-[#00F59B] text-black' : 'border border-zinc-600'
                      }`}
                    >
                      {done[i] && <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#0D0F14] border border-white/[0.07] px-3.5 py-3">
              <span className="text-xs text-zinc-400" aria-live="polite">
                {completed} of {SAMPLE_SETS.length} sets done
              </span>
              {completed === SAMPLE_SETS.length && (
                <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1 animate-popIn">
                  <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                  New personal record
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
