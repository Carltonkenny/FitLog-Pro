import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Smartphone, QrCode, CheckCircle2, Sparkles, ExternalLink, ArrowRight, Download, Monitor } from 'lucide-react';

export default function HandoffScreen({ blueprint, session, onReset, onOpenWebSimulator }) {
  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F59B', '#00D4FF', '#FFD026'],
    });
  }, []);

  const deepLink = `fitlogpro://auth/callback?token=${session?.access_token || 'fitlog_session'}&userId=${session?.user?.id || 'usr_carlton_kenny'}`;

  return (
    <div className="min-h-screen bg-[#0A0B0E] flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <div className="w-full max-w-2xl rounded-2xl bg-[#12141A] border border-[#242836] p-6 sm:p-10 shadow-2xl relative z-10 text-center">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center mx-auto mb-4 text-[#00F59B] shadow-lg shadow-[#00F59B]/20">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
          Your Athlete Blueprint Is Live!
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Synchronized to Supabase Project <code className="text-[#00D4FF] font-mono text-xs">fczhckzsynzfomytkgym</code>. Ready for native mobile logging.
        </p>

        {/* Generated Blueprint Summary Card */}
        <div className="my-6 p-5 rounded-xl bg-[#0D0E13] border border-[#252A38] text-left">
          <div className="text-[11px] font-mono text-[#00F59B] uppercase font-bold tracking-wider mb-3 flex items-center justify-between">
            <span>Synchronized Cloud Profile</span>
            <span className="text-slate-400 font-normal">{session?.user?.email || 'alex.athlete@gmail.com'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[#161822] border border-[#202433]">
              <span className="text-slate-500 block text-[10px] font-mono uppercase">Goal</span>
              <span className="font-bold text-white font-['Outfit']">{blueprint?.fitness_goal || 'Hypertrophy'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#161822] border border-[#202433]">
              <span className="text-slate-500 block text-[10px] font-mono uppercase">Split</span>
              <span className="font-bold text-[#00D4FF] font-mono">{blueprint?.split_preference || 'PPL'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#161822] border border-[#202433]">
              <span className="text-slate-500 block text-[10px] font-mono uppercase">Volume</span>
              <span className="font-bold text-[#FFD026] font-mono">{blueprint?.weekly_volume_target_sets || 16} sets/wk</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#161822] border border-[#202433]">
              <span className="text-slate-500 block text-[10px] font-mono uppercase">Bench 1RM</span>
              <span className="font-bold text-[#00F59B] font-mono">{blueprint?.bench_1rm_kg || 85} kg</span>
            </div>
          </div>
        </div>

        {/* Handoff Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center my-6">
          
          {/* Option A: Direct Mobile Deep Link */}
          <div className="p-5 rounded-xl bg-[#161922] border border-[#282E40] text-left space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#00F59B]" />
              <span className="font-bold text-white text-sm font-['Outfit']">Open on Mobile Device</span>
            </div>
            <p className="text-xs text-slate-400">
              Launches the Flutter Android app using deep linking and restores your cloud session instantly.
            </p>
            <a
              id="handoff-deeplink-btn"
              href={deepLink}
              className="w-full py-3 px-4 rounded-xl bg-[#00F59B] hover:bg-[#00D485] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[#00F59B]/20"
            >
              <span>Launch App (fitlogpro://)</span>
              <ExternalLink className="w-4 h-4 text-black" />
            </a>
          </div>

          {/* Option B: QR Code Scanner */}
          <div className="p-5 rounded-xl bg-[#161922] border border-[#282E40] flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2.5 rounded-xl bg-white shadow-md">
              {/* High-Contrast SVG QR Pattern */}
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="white" />
                {/* Top-Left Finder */}
                <rect x="10" y="10" width="28" height="28" fill="black" />
                <rect x="14" y="14" width="20" height="20" fill="white" />
                <rect x="18" y="18" width="12" height="12" fill="black" />
                {/* Top-Right Finder */}
                <rect x="62" y="10" width="28" height="28" fill="black" />
                <rect x="66" y="14" width="20" height="20" fill="white" />
                <rect x="70" y="18" width="12" height="12" fill="black" />
                {/* Bottom-Left Finder */}
                <rect x="10" y="62" width="28" height="28" fill="black" />
                <rect x="14" y="66" width="20" height="20" fill="white" />
                <rect x="18" y="70" width="12" height="12" fill="black" />
                {/* Simulated Data Matrix */}
                <rect x="42" y="14" width="6" height="6" fill="black" />
                <rect x="50" y="22" width="6" height="6" fill="black" />
                <rect x="44" y="32" width="12" height="6" fill="black" />
                <rect x="14" y="44" width="6" height="12" fill="black" />
                <rect x="24" y="50" width="6" height="6" fill="black" />
                <rect x="44" y="44" width="14" height="14" fill="black" />
                <rect x="64" y="44" width="8" height="8" fill="black" />
                <rect x="78" y="52" width="8" height="8" fill="black" />
                <rect x="44" y="66" width="6" height="12" fill="black" />
                <rect x="56" y="74" width="10" height="6" fill="black" />
                <rect x="72" y="66" width="14" height="6" fill="black" />
                <rect x="80" y="78" width="8" height="10" fill="black" />
              </svg>
            </div>
            <span className="text-[11px] font-mono text-slate-300">Scan with Phone Camera</span>
          </div>

        </div>

        {/* Web Simulator Option */}
        <div className="pt-4 border-t border-[#242836] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <button
            id="handoff-simulator-btn"
            onClick={onOpenWebSimulator}
            className="flex items-center gap-1.5 text-[#00D4FF] hover:underline font-mono"
          >
            <Monitor className="w-4 h-4" />
            <span>Launch In-Browser Workout Simulator</span>
          </button>

          <button
            onClick={onReset}
            className="hover:text-white transition-colors font-mono"
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}
