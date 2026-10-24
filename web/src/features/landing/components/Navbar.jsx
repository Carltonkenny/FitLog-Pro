import React from 'react';
import { Dumbbell, ShieldCheck, ArrowRight, User, Play } from 'lucide-react';

export default function Navbar({ onOpenAuth, onStartOnboarding, onEnterApp, session }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#242836] bg-[#0A0B0E]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F59B] to-[#00D4FF] p-[2px] flex items-center justify-center shadow-lg shadow-[#00F59B]/20">
            <div className="w-full h-full bg-[#0A0B0E] rounded-[10px] flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-[#00F59B]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-['Outfit']">
                FitLog<span className="text-[#00F59B]">.Pro</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#1A1D26] text-[#00D4FF] border border-[#32384D]">
                v2.0 PWA
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-zinc-300">
          <a href="#calculator" className="hover:text-emerald-400 transition-colors">1RM & Plate Engine</a>
          <a href="#science" className="hover:text-emerald-400 transition-colors">Muscle Growth Blueprint</a>
          <a href="#comparison" className="hover:text-emerald-400 transition-colors">Vs Other Apps</a>
          <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            id="nav-enter-app-btn"
            onClick={onEnterApp}
            className="px-3.5 py-2 rounded-lg bg-[#181B26] hover:bg-[#202534] border border-[#2D3346] text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-[#00F59B] fill-[#00F59B]" />
            <span>Open App</span>
          </button>

          {session ? (
            <button
              id="nav-onboarding-btn"
              onClick={onStartOnboarding}
              className="px-4 py-2 rounded-lg bg-[#00F59B] hover:bg-[#00D485] text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00F59B]/25"
            >
              <span>Onboarding Wizard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="nav-start-btn"
              onClick={() => onOpenAuth('signup')}
              className="px-4 py-2 rounded-lg bg-[#00F59B] hover:bg-[#00D485] text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00F59B]/25"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
