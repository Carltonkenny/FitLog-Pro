import React, { useState, useEffect, useRef } from 'react';
import { Play, Sparkles, CheckCircle2, Zap, ArrowRight, Flame } from 'lucide-react';
import gsap from 'gsap';

export default function Hero({ onStartOnboarding, onEnterApp }) {
  const [completedSets, setCompletedSets] = useState([true, true, false, false]);
  const heroRef = useRef(null);

  useEffect(() => {
    // GSAP staggered entrance animation
    const ctx = gsap.context(() => {
      gsap.from('.gsap-hero-title', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      });
      gsap.from('.gsap-hero-p', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      });
      gsap.from('.gsap-hero-cta', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.35,
        stagger: 0.1,
        ease: 'power3.out',
      });
      gsap.from('.gsap-hero-card', {
        scale: 0.94,
        opacity: 0,
        duration: 1.0,
        delay: 0.3,
        ease: 'power2.out',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const toggleSet = (idx) => {
    const updated = [...completedSets];
    updated[idx] = !updated[idx];
    setCompletedSets(updated);
  };

  return (
    <section ref={heroRef} className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
      {/* Background radial accent glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#00F59B]/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-[#00D4FF]/10 blur-[110px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hooks & Value Props */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1D26] border border-[#242836] text-xs font-medium text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-[#00F59B] animate-pulse" />
              <span className="font-mono text-[#00F59B]">FITLOG PRO v2.0</span>
              <span className="text-slate-500">•</span>
              <span>Sub-2-Second Thumb Zone Engine</span>
            </div>

            <h1 className="gsap-hero-title text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-['Outfit'] leading-[1.08]">
              Log Sets in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F59B] via-[#00D4FF] to-white">&lt; 2 Taps.</span><br />
              Out-Lift Your Yesterday.
            </h1>

            <p className="gsap-hero-p text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Tired of bloated fitness apps that take 30 seconds between sets just to type numbers? 
              FitLog Pro delivers instant thumb logging, automatic Epley 1RM PR detection, and live Gemini biomechanics guidance.
            </p>

            {/* Direct Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                id="hero-start-btn"
                onClick={onStartOnboarding}
                className="gsap-hero-cta w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#00F59B] to-[#00D485] hover:opacity-95 text-black font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-[#00F59B]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Launch Onboarding Wizard</span>
                <ArrowRight className="w-5 h-5 text-black" />
              </button>

              <button
                id="hero-enter-app-direct-btn"
                onClick={onEnterApp}
                className="gsap-hero-cta w-full sm:w-auto px-6 py-4 rounded-xl bg-[#161822] hover:bg-[#1F2230] border border-[#2F3547] text-white font-semibold text-base flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 text-[#00D4FF] fill-[#00D4FF]" />
                <span>Enter App Directly</span>
              </button>
            </div>

            {/* Credibility Micro-Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00F59B]" />
                <span>No Credit Card Needed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00F59B]" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00F59B]" />
                <span>333+ Science-Backed Movements</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Interactive Workout Preview Card */}
          <div className="lg:col-span-5 gsap-hero-card">
            <div className="relative mx-auto max-w-md rounded-2xl bg-[#12141A] border border-[#242836] p-5 shadow-2xl shadow-black/80">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-[#242836] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00F59B] animate-pulse" />
                  <span className="font-['Outfit'] font-bold text-white text-sm">Active Session: Push Day</span>
                </div>
                <div className="font-mono text-xs px-2 py-0.5 rounded bg-[#1A1D26] text-[#00D4FF] border border-[#32384D] tabular-nums">
                  00:42:18
                </div>
              </div>

              {/* Exercise Card */}
              <div className="bg-[#181B24] rounded-xl p-4 border border-[#2B3040] mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">Barbell Bench Press</h4>
                    <span className="text-xs text-slate-400">Pectoralis Major • Sternal Head</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    <span>NEW PR: 104.5 kg</span>
                  </span>
                </div>

                {/* Interactive Sets Table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 text-[11px] font-mono uppercase text-slate-400 px-2 py-1">
                    <span className="col-span-2">Set</span>
                    <span className="col-span-4">Previous</span>
                    <span className="col-span-4">KG × Reps</span>
                    <span className="col-span-2 text-right">Log</span>
                  </div>

                  {[
                    { set: 1, prev: '80.0 × 8', kg: 82.5, reps: 8 },
                    { set: 2, prev: '80.0 × 8', kg: 82.5, reps: 8 },
                    { set: 3, prev: '80.0 × 7', kg: 82.5, reps: 7 },
                    { set: 4, prev: '77.5 × 8', kg: 80.0, reps: 8 },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleSet(idx)}
                      className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                        completedSets[idx]
                          ? 'bg-[#00F59B]/10 border-[#00F59B]/40 text-white'
                          : 'bg-[#12141A] border-[#242836] hover:border-[#3A4054] text-slate-300'
                      }`}
                    >
                      <span className="col-span-2 font-mono text-xs font-bold">{row.set}</span>
                      <span className="col-span-4 font-mono text-xs text-slate-400">{row.prev}</span>
                      <span className="col-span-4 font-mono text-xs font-bold text-[#00D4FF]">
                        {row.kg} × {row.reps}
                      </span>
                      <div className="col-span-2 flex justify-end">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                            completedSets[idx]
                              ? 'bg-[#00F59B] text-black'
                              : 'border border-slate-600'
                          }`}
                        >
                          {completedSets[idx] && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gemini AI Coach Live Callout */}
              <div className="rounded-xl bg-gradient-to-r from-[#181B24] to-[#1F2330] p-3.5 border border-[#00D4FF]/30 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#00D4FF]/20 flex items-center justify-center flex-shrink-0 text-[#00D4FF]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[#00D4FF] font-bold uppercase tracking-wider">
                    Gemini 2.5 Live Coach
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                    "Solid bar speed on set 2. For set 3, keep scapulae retracted and pause 0.5s at chest to maximize pec hypertrophy."
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
