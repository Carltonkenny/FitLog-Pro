import React from 'react';
import { isCloudConfigured } from '../../../../lib/neonClient';
import {
  Dumbbell,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Monitor,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export default function SessionHeader({
  onBack,
  sessionState,
  sessionSeconds,
  formatTimer,
  onStart,
  onPause,
  onRestartClick,
  layoutMode,
  setLayoutMode,
  onFinishWorkout,
  finishDisabled,
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0d0f14]/90 backdrop-blur-md border-b border-white/[0.08] px-4 py-2.5 flex items-center justify-between">
      {/* Brand & Home */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Back to home"
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition active:scale-95 border border-white/[0.06]"
          title="Return to Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-emerald-500/20">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-sm">FitLog Pro</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {isCloudConfigured ? 'Cloud sync on' : 'Saved on this device'}
            </span>
          </div>
        </div>
      </div>

      {/* Persistent Session Controller (Accessible from all tabs) */}
      <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/[0.08] px-3 py-1 rounded-full shadow-inner">
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              sessionState === 'running'
                ? 'bg-emerald-400 animate-pulse'
                : sessionState === 'paused'
                ? 'bg-amber-400'
                : 'bg-zinc-600'
            }`}
          />
          <span className="font-mono text-zinc-200 font-semibold tabular-nums">
            {formatTimer(sessionSeconds)}
          </span>
        </div>

        <div className="h-3 w-px bg-white/10 mx-1" />

        {sessionState !== 'running' ? (
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 h-9 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition active:scale-95 shadow-sm"
            title="Start or Resume Workout Clock"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{sessionSeconds > 0 ? 'Resume' : 'Start'}</span>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 h-9 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition active:scale-95 border border-amber-500/30"
            title="Pause Workout Clock"
          >
            <Pause className="w-3 h-3" />
            <span>Pause</span>
          </button>
        )}

        <button
          type="button"
          aria-label="Restart session timer"
          onClick={onRestartClick}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition active:scale-95"
          title="Restart Session"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode Switcher & Finish Button */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center bg-zinc-900 p-0.5 rounded-lg border border-white/[0.08]">
          <button
            aria-pressed={layoutMode === 'laptop'}
            onClick={() => setLayoutMode('laptop')}
            className={`flex items-center gap-1 text-xs px-3 h-9 rounded-lg transition ${
              layoutMode === 'laptop'
                ? 'bg-zinc-800 text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>
          <button
            aria-pressed={layoutMode === 'mobile'}
            onClick={() => setLayoutMode('mobile')}
            className={`flex items-center gap-1 text-xs px-3 h-9 rounded-lg transition ${
              layoutMode === 'mobile'
                ? 'bg-zinc-800 text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onFinishWorkout}
          disabled={finishDisabled}
          title={finishDisabled ? 'Complete a set to finish your workout' : undefined}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 h-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 shadow-md shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span className="hidden sm:inline">Finish Workout</span>
          <span className="sm:hidden">Finish</span>
        </button>
      </div>
    </header>
  );
}
