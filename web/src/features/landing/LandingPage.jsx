import React from 'react';
import { Dumbbell } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PlateCalculator from './components/PlateCalculator';
import ScienceAcademy from './components/ScienceAcademy';
import PricingSection from './components/PricingSection';
import { CoachSection, Faq, FinalCta, HowItWorks } from './components/Sections';

const FOOTER_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#coach', label: 'AI coach' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export default function LandingPage({ onOpenAuth, onStartOnboarding, onEnterApp, session }) {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-100 flex flex-col font-['Inter_Variable']">
      <Navbar onOpenAuth={onOpenAuth} onEnterApp={onEnterApp} session={session} />

      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Hero onStartOnboarding={onStartOnboarding} />
        <HowItWorks />
        <CoachSection />
        <div id="tools">
          <PlateCalculator />
          <ScienceAcademy />
        </div>
        <PricingSection onStartOnboarding={onStartOnboarding} />
        <Faq />
        <FinalCta onStartOnboarding={onStartOnboarding} />
      </main>

      <footer className="border-t border-white/[0.08] bg-[#07080B] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#00F59B] flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-black" aria-hidden="true" />
            </span>
            <span className="font-['Outfit_Variable'] font-extrabold text-white">FitLog Pro</span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-400">
            {FOOTER_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-white py-1">
                {l.label}
              </a>
            ))}
          </nav>
          <p className="text-xs text-zinc-400">© 2026 Tabor Synergy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
