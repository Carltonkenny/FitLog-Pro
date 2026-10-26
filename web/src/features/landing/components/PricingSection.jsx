import React from 'react';
import { Check } from 'lucide-react';
import Reveal from '../../../components/Reveal';

const INCLUDED = [
  'Unlimited workout logging',
  'Personal-record detection and estimated max lifts',
  'Progress charts: streak, volume and sets per muscle',
  'Library of 100+ exercises with form cues and a recommender',
  'AI coach with photo input and weekly plans',
  'Cloud sync across your devices',
  'Works offline, export your data anytime',
];

export default function PricingSection({ onStartOnboarding }) {
  return (
    <section id="pricing" className="py-20 md:py-28 border-t border-white/[0.06] bg-[#0C0E12]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#00F59B]">Pricing</p>
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-white tracking-[-0.02em]">
            Free during early access
          </h2>
          <p className="text-zinc-400">
            Everything is included while we are in early access. If paid plans arrive later, we will tell you well
            ahead of time, and your data stays yours.
          </p>
        </Reveal>

        <Reveal delay={80} className="max-w-xl mx-auto rounded-2xl bg-[#101218] border border-[#00F59B]/30 p-8 [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-['Outfit'] font-bold text-xl text-white">Early access</h3>
            <p className="text-white">
              <span className="font-['Outfit'] text-4xl font-black tabular-nums">$0</span>
              <span className="text-zinc-400 text-sm ml-1.5">/ month</span>
            </p>
          </div>
          <ul className="mt-6 space-y-3">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-zinc-200">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#00F59B]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onStartOnboarding}
            className="mt-8 w-full h-12 rounded-xl bg-[#00F59B] hover:bg-[#00D485] text-black font-bold"
          >
            Start free
          </button>
          <p className="mt-3 text-center text-xs text-zinc-400">No credit card required</p>
        </Reveal>
      </div>
    </section>
  );
}
