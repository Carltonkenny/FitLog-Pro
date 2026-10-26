import React, { useEffect, useState } from 'react';
import { ArrowRight, Dumbbell, Menu, X } from 'lucide-react';

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#coach', label: 'AI coach' },
  { href: '#tools', label: 'Tools' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export default function Navbar({ onOpenAuth, onEnterApp, session }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-md transition-colors duration-200 ${
        scrolled || open ? 'bg-[#0A0B0E]/90 border-b border-white/[0.08]' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#00F59B] focus:text-black focus:font-bold"
      >
        Skip to main content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5" aria-label="FitLog Pro home">
          <span className="w-9 h-9 rounded-xl bg-[#00F59B] flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-black" aria-hidden="true" />
          </span>
          <span className="font-['Outfit'] font-extrabold text-lg tracking-tight text-white">FitLog Pro</span>
        </a>

        <nav aria-label="Primary" className="hidden lg:flex items-center gap-1 text-sm font-medium text-zinc-300">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="px-3 h-10 flex items-center rounded-lg hover:text-white hover:bg-white/[0.05]">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <button
              type="button"
              onClick={onEnterApp}
              className="h-10 px-4 rounded-lg bg-[#00F59B] hover:bg-[#00D485] text-black font-semibold text-sm flex items-center gap-1.5"
            >
              Open app
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="hidden sm:block h-10 px-4 rounded-lg text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/[0.05]"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="h-10 px-4 rounded-lg bg-[#00F59B] hover:bg-[#00D485] text-black font-semibold text-sm flex items-center gap-1.5"
              >
                Start free
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          )}
          <button
            type="button"
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-zinc-200 hover:bg-white/[0.06]"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="lg:hidden animate-fadeIn border-t border-white/[0.08] px-4 py-3 space-y-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center h-12 px-3 rounded-lg text-zinc-100 hover:bg-white/[0.05]"
            >
              {l.label}
            </a>
          ))}
          {!session && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenAuth('signin');
              }}
              className="w-full text-left h-12 px-3 rounded-lg text-zinc-100 hover:bg-white/[0.05]"
            >
              Sign in
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
