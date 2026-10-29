import React from 'react';
import { Camera, ClipboardList, LineChart, MessageSquareText, ShieldCheck, Zap } from 'lucide-react';
import Reveal from '../../../components/Reveal';

const eyebrow = 'text-xs font-semibold uppercase tracking-[0.12em] text-[#00F59B]';
const h2 = "font-['Outfit_Variable'] text-3xl sm:text-4xl font-extrabold text-white tracking-[-0.02em]";

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Tell us your goal',
    body: 'Answer four quick questions: your goal, experience, training split and body weight. It takes under a minute.',
  },
  {
    icon: Zap,
    title: 'Log sets in two taps',
    body: 'Big controls and your last numbers pre-filled. Tick a set and the rest timer starts on its own.',
  },
  {
    icon: LineChart,
    title: 'Watch it add up',
    body: 'See your estimated max lifts, weekly sets per muscle and your streak, all calculated from what you logged.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-12">
          <p className={eyebrow}>How it works</p>
          <h2 className={`${h2} mt-2`}>From first set to clear progress</h2>
        </Reveal>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 80} className="rounded-2xl bg-[#101218] border border-white/[0.08] p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="w-10 h-10 rounded-xl bg-[#00F59B]/10 text-[#00F59B] flex items-center justify-center">
                  <s.icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-zinc-400 tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{s.title}</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

const COACH_POINTS = [
  { icon: MessageSquareText, text: 'Reads your real workouts and personal records before it answers.' },
  { icon: Camera, text: 'Add a photo of your gym, your form or your physique and the plan adapts to what it sees.' },
  { icon: ShieldCheck, text: 'Photos are resized, stripped of location data and never stored by FitLog.' },
];

export function CoachSection() {
  return (
    <section id="coach" className="py-20 md:py-28 border-t border-white/[0.06] bg-[#0C0E12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <Reveal className="space-y-6">
          <p className={eyebrow}>AI coach</p>
          <h2 className={h2}>A plan built from your own training</h2>
          <p className="text-zinc-400 leading-relaxed max-w-lg">
            Ask for a weekly plan and get days, exercises, sets and reps you can load straight into today's workout.
            General guidance, not medical advice.
          </p>
          <ul className="space-y-4">
            {COACH_POINTS.map((p) => (
              <li key={p.text} className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="mt-0.5 w-8 h-8 shrink-0 rounded-lg bg-white/[0.05] text-[#00F59B] flex items-center justify-center">
                  <p.icon className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="pt-1.5">{p.text}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={100}>
          <figure className="rounded-2xl bg-[#101218] border border-white/[0.09] p-5 [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <figcaption className="text-[11px] font-medium text-zinc-400 mb-3">Example coach plan (sample)</figcaption>
            <div className="rounded-xl bg-[#0D0F14] border border-white/[0.07] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/[0.06]">
                <p className="text-sm font-bold text-white">Day 1: Push</p>
                <p className="text-[11px] text-zinc-400">Chest, shoulders, triceps</p>
              </div>
              {[
                ['Barbell bench press', '4 × 6–8'],
                ['Incline dumbbell press', '3 × 8–10'],
                ['Lateral raise', '3 × 12–15'],
                ['Triceps pushdown', '3 × 10–12'],
              ].map(([n, r]) => (
                <div key={n} className="px-4 py-2.5 flex items-center justify-between border-b border-white/[0.04] last:border-0">
                  <span className="text-xs text-zinc-200">{n}</span>
                  <span className="font-mono text-xs text-[#00F59B] tabular-nums">{r}</span>
                </div>
              ))}
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

const FAQS = [
  ['Is FitLog Pro free?', 'Yes. It is free during early access. If paid plans arrive later, your logged data stays yours and you can export it at any time.'],
  ['Does it work without internet?', 'Yes. Workouts save on your device first and upload to your account when you are back online.'],
  ['What happens to my photos?', 'When you attach a photo to the AI coach, it is resized, stripped of location data and sent to Google Gemini to answer that request. FitLog does not store it.'],
  ['Can I switch between kg and lb?', 'Yes. Pick your unit in Settings. Weights are stored in kg and converted for display.'],
  ['Can I take my data with me?', 'Yes. Settings has an export button that downloads all your workouts and records as a file.'],
  ['Is the AI coach medical advice?', 'No. It gives general training guidance. See a professional for pain, injury or health conditions.'],
];

export function Faq() {
  return (
    <section id="faq" className="py-20 md:py-28 border-t border-white/[0.06]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10">
          <p className={eyebrow}>FAQ</p>
          <h2 className={`${h2} mt-2`}>Questions, answered</h2>
        </Reveal>
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group py-1">
              <summary className="flex items-center justify-between gap-4 min-h-14 cursor-pointer list-none text-white font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <span aria-hidden="true" className="text-zinc-400 text-xl leading-none transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-4 text-sm text-zinc-400 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ onStartOnboarding }) {
  return (
    <section className="py-20 md:py-24 border-t border-white/[0.06]">
      <Reveal className="max-w-3xl mx-auto px-4 text-center space-y-6">
        <h2 className={h2}>Your next set is waiting</h2>
        <p className="text-zinc-400">Create a free account and log your first workout in minutes.</p>
        <button
          type="button"
          onClick={onStartOnboarding}
          className="h-13 px-8 py-3.5 rounded-xl bg-[#00F59B] hover:bg-[#00D485] text-black font-bold text-base"
        >
          Start free
        </button>
      </Reveal>
    </section>
  );
}
