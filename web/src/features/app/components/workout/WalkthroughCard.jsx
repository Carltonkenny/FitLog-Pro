import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Timer, Calculator, Sparkles } from 'lucide-react';

const SLIDES = [
  {
    badge: 'Fast Logging',
    icon: Check,
    title: '1-Tap Logging & Auto Rest Timer',
    description:
      'Tap the checkmark when you finish a set. Your session timer starts, total volume recalculates, and the rest countdown chimes automatically.',
    preview: (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-xs">
        <span className="font-mono text-zinc-400">Set 1</span>
        <span className="font-mono font-bold text-zinc-200">20 kg × 10 reps</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Timer className="w-3 h-3 animate-spin" /> 90s
          </span>
          <span className="w-6 h-6 rounded-lg bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">
            ✓
          </span>
        </div>
      </div>
    ),
  },
  {
    badge: 'Barbell Math',
    icon: Calculator,
    title: 'Plate Loader & Live 1RM Curves',
    description:
      'Never calculate 45lb / 20kg plates in your head. See exact sleeve loading on desktop or by tapping "Plate Loader" on mobile, with Epley 1RM strength curves.',
    preview: (
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-8 rounded-sm bg-red-500/80 border border-red-400 text-[9px] text-white font-bold flex items-center justify-center">
            20
          </span>
          <span className="w-2.5 h-7 rounded-sm bg-blue-500/80 border border-blue-400 text-[9px] text-white font-bold flex items-center justify-center">
            10
          </span>
          <span className="text-[11px] text-zinc-400 ml-1">Load each side</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-zinc-500 uppercase block">Est. 1RM</span>
          <span className="text-emerald-400 font-bold text-sm">66.7 kg</span>
        </div>
      </div>
    ),
  },
  {
    badge: 'AI Coach',
    icon: Sparkles,
    title: 'Buddy AI Coach & 1-Tap Routines',
    description:
      'Save your workout as a 1-tap routine, or open Buddy to analyze stalled lifts, optimize training splits, and ask questions tailored to your history.',
    preview: (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-xs">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
          B
        </div>
        <div className="flex-1 min-w-0">
          <span className="block font-bold text-white text-[11px]">Buddy Knows Your History</span>
          <span className="block text-[10px] text-zinc-400 truncate">Ask: "Review my chest progression this week"</span>
        </div>
        <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
          Push Day
        </span>
      </div>
    ),
  },
];

export default function WalkthroughCard({ onDismiss }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((s) => s + 1);
    } else {
      onDismiss();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((s) => s - 1);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/30 via-zinc-900 to-cyan-950/20 border border-emerald-500/30 p-4 sm:p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Icon className="w-4 h-4" />
          </span>
          <span className="text-[11px] font-bold font-mono tracking-wider uppercase text-emerald-400">
            {slide.badge} • Slide {currentSlide + 1} of {SLIDES.length}
          </span>
        </div>

        <button
          type="button"
          aria-label="Dismiss tour"
          onClick={onDismiss}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-base font-bold text-white">{slide.title}</h4>
          <p className="text-xs text-zinc-300 leading-relaxed mt-1 max-w-xl">{slide.description}</p>
        </div>

        {/* Live preview component */}
        <div className="pt-1">{slide.preview}</div>

        {/* Footer controls: dots + buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          {/* Dot Indicators */}
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === i ? 'w-6 bg-emerald-400' : 'w-2 bg-zinc-700 hover:bg-zinc-600'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05] transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 shadow-sm"
            >
              <span>{currentSlide === SLIDES.length - 1 ? 'Got it' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

