import React, { useState } from 'react';
import { Mic, Video, Brain, Sparkles, ChevronRight, ChevronLeft, X, ShieldCheck } from 'lucide-react';

export default function CoachVoiceOnboarding({ onStartVoice, onDismiss }) {
  const [slide, setSlide] = useState(0);

  const SLIDES = [
    {
      badge: 'Voice & Form Vision',
      title: 'Hands-Free Training Flow',
      subtitle: 'Never touch your screen with chalky, sweaty hands again.',
      icon: Mic,
      accentColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      points: [
        {
          label: 'Spoken Set Logging',
          desc: 'Say "Logged 90 for 8 on bench" or "Did 10 reps" to mark sets instantly.',
        },
        {
          label: 'Rest Timers with Audio',
          desc: 'Say "Start 90 seconds" or "Give me 2 minutes" between heavy sets.',
        },
        {
          label: 'Camera Form Checks',
          desc: 'Flip the camera feed to inspect elbow flare, bar path, and depth.',
        },
      ],
    },
    {
      badge: 'Persistent Memory & Coaching',
      title: 'Meet Coach Marcus',
      subtitle: 'A veteran coach who knows your name, lifestyle, and lifts.',
      icon: Brain,
      accentColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      points: [
        {
          label: 'Permanent Athlete Memory',
          desc: 'Marcus stores your name, age, and lifestyle permanently. Never forgets.',
        },
        {
          label: 'Calendar & Temporal Context',
          desc: 'Knows the exact date, time, and days elapsed since your last session.',
        },
        {
          label: 'Gritty, Earned Motivation',
          desc: 'Zero corporate fluff. Pure gym cues, PR hype, and gentle roasts if you slack.',
        },
      ],
    },
  ];

  const current = SLIDES[slide];
  const Icon = current.icon;

  return (
    <div className="p-4 mx-3 my-2 rounded-2xl bg-zinc-900 border border-white/[0.1] shadow-2xl relative overflow-hidden animate-popIn">
      {/* Header dismiss */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${current.bgColor} ${current.accentColor}`}>
          <Sparkles className="w-3 h-3" />
          {current.badge}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Skip walkthrough"
          className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white flex items-center justify-center hover:bg-white/[0.06] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Slide Content */}
      <div className="space-y-2 mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Icon className={`w-5 h-5 ${current.accentColor}`} />
          {current.title}
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {current.subtitle}
        </p>

        <div className="space-y-2 pt-2">
          {current.points.map((pt, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/[0.04] text-xs">
              <span className="font-semibold text-zinc-200 block mb-0.5">{pt.label}</span>
              <span className="text-zinc-400 text-[11px] leading-tight block">{pt.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                slide === idx ? 'w-5 bg-emerald-400' : 'w-1.5 bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {slide > 0 && (
            <button
              type="button"
              onClick={() => setSlide((s) => s - 1)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}

          {slide < SLIDES.length - 1 ? (
            <button
              type="button"
              onClick={() => setSlide((s) => s + 1)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartVoice}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <Mic className="w-3.5 h-3.5" /> Meet Coach Marcus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

