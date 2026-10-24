import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PlateCalculator from './components/PlateCalculator';
import ScienceAcademy from './components/ScienceAcademy';
import ComparisonMatrix from './components/ComparisonMatrix';
import PricingSection from './components/PricingSection';
import { Dumbbell } from 'lucide-react';

export default function LandingPage({ onOpenAuth, onStartOnboarding, onEnterApp, session }) {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-100 flex flex-col font-['Inter']">
      <Navbar
        onOpenAuth={onOpenAuth}
        onStartOnboarding={onStartOnboarding}
        onEnterApp={onEnterApp}
        session={session}
      />

      <main className="flex-1">
        <Hero
          onStartOnboarding={onStartOnboarding}
          onEnterApp={onEnterApp}
        />
        <PlateCalculator />
        <ScienceAcademy />
        <ComparisonMatrix />
        <PricingSection onStartOnboarding={onStartOnboarding} />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1C1F2B] bg-[#07080B] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00F59B] flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-black" />
            </div>
            <span className="font-extrabold text-white font-['Outfit']">FitLog Pro</span>
            <span className="text-xs text-slate-500 font-mono">v2.0 Architecture</span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1 font-mono">
            <span>Decoupled React Web + Supabase + Drift Mobile Engine</span>
          </div>

          <div className="text-xs text-slate-400">
            © 2026 Tabor Synergy • All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
