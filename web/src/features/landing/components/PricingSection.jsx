import React from 'react';
import { Check, Zap, Sparkles, ArrowRight } from 'lucide-react';

export default function PricingSection({ onStartOnboarding }) {
  return (
    <section id="pricing" className="py-20 border-t border-[#242836] bg-[#0A0B0E] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1D26] border border-[#2B3040] text-xs font-mono text-[#00F59B] mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>TRANSPARENT MONETIZATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Invest in Your Progression
          </h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Start completely free. Upgrade to Pro when you demand advanced AI coaching and cloud telemetry.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Free Tier */}
          <div className="rounded-2xl bg-[#12141A] border border-[#242836] p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-['Outfit'] font-bold text-lg text-white">Athlete Free</span>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#1C202B] text-slate-400">
                  Forever
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black text-white font-['Outfit']">₹0</span>
                <span className="text-slate-400 text-sm ml-2">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Everything you need to log workouts with zero distraction or timers interrupting you.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Unlimited workout logging',
                  'Instant sub-2s thumb zone entry',
                  'Epley 1RM PR calculations',
                  'Offline local SQLite persistence',
                  'Basic plate calculator',
                  '50 essential compound exercises',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-[#00F59B]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onStartOnboarding}
              className="w-full py-3.5 rounded-xl bg-[#1C202B] hover:bg-[#252A3A] text-slate-200 font-semibold text-sm transition-all border border-[#2F3445]"
            >
              Start Free Today
            </button>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="rounded-2xl bg-gradient-to-b from-[#161922] to-[#101217] border-2 border-[#00F59B]/60 p-8 flex flex-col justify-between relative shadow-2xl shadow-[#00F59B]/10">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#00F59B] text-black font-extrabold text-[11px] font-mono tracking-wider shadow-md">
              POPULAR ATHLETE CHOICE
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-['Outfit'] font-bold text-lg text-white flex items-center gap-2">
                  <span>Pro Elite</span>
                  <Sparkles className="w-4 h-4 text-[#00F59B]" />
                </span>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30">
                  Cancel Anytime
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black text-white font-['Outfit']">₹499</span>
                <span className="text-slate-400 text-sm ml-2">/ month ($9.99 global)</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Full access to the Supabase Cloud Brain, Gemini AI coaching, and 333+ exercise library.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Everything in Free tier',
                  'Live Gemini 2.5 Biomechanics Gym Coach',
                  'Complete 333+ Exercise Anatomy Library',
                  'Cross-device Supabase cloud sync',
                  'Visual 2D Barbell Plate Sleeve Engine',
                  'Annual GitHub-style consistency heatmap',
                  'Superset & dropset telemetry pairing',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                    <Check className="w-4 h-4 text-[#00F59B]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onStartOnboarding}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00F59B] to-[#00D485] hover:opacity-95 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#00F59B]/20"
            >
              <span>Unlock Pro With Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
