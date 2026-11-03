import { useState, useEffect, useRef, useCallback } from 'react';
import { createClock } from '../../../lib/sessionClock';

const CLOCK_KEY = 'fitlog_workout_clock';

function readClock() {
  try {
    const c = JSON.parse(localStorage.getItem(CLOCK_KEY) || 'null');
    return c && Date.now() - c.at < 12 * 3_600_000 && Number.isFinite(c.banked) && Number.isFinite(c.at) && (c.since === null || Number.isFinite(c.since)) ? c : undefined;
  } catch {
    return undefined;
  }
}

/** Workout session clock shared by every tab. The timekeeping lives in lib/sessionClock.js. */
export function useSessionControls() {
  const clock = useRef(null);
  if (clock.current === null) clock.current = createClock(readClock());
  const restoredSeconds = useRef(clock.current.seconds()).current;
  const [sessionState, setSessionState] = useState(restoredSeconds > 0 ? 'paused' : 'idle'); // 'idle' | 'running' | 'paused'
  const [sessionSeconds, setSessionSeconds] = useState(restoredSeconds);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const c = clock.current;
  // Saved on every change so a refresh keeps the elapsed time that goes with the saved sets.
  const save = () => {
    try {
      localStorage.setItem(CLOCK_KEY, JSON.stringify(c.snapshot()));
    } catch {
      // Storage full: the clock still works in memory.
    }
  };

  const getElapsedSeconds = useCallback(() => c.seconds(), [c]);

  useEffect(() => {
    if (sessionState !== 'running') return undefined;
    const tick = () => {
      setSessionSeconds(c.seconds());
      try {
        localStorage.setItem(CLOCK_KEY, JSON.stringify(c.snapshot()));
      } catch {
        // see save()
      }
    };
    const interval = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [sessionState, c]);

  const startSession = () => {
    if (c.isRunning()) return;
    c.start();
    save();
    setSessionState('running');
  };

  const pauseSession = () => {
    c.pause();
    save();
    setSessionSeconds(c.seconds());
    setSessionState('paused');
  };

  const resumeSession = startSession;

  /** Back to a blank, stopped clock (used after a workout is saved). */
  const resetSession = () => {
    c.reset();
    save();
    setSessionSeconds(0);
    setSessionState('idle');
  };

  const confirmRestart = (onRestartSuccess) => {
    c.restart();
    save();
    setSessionSeconds(0);
    setSessionState('running');
    if (onRestartSuccess) onRestartSuccess();
    setIsRestartConfirmOpen(false);
  };

  const formatTimer = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const mm = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return h > 0 ? `${h}:${mm}` : mm;
  };

  return {
    sessionState,
    sessionSeconds,
    isRestartConfirmOpen,
    setIsRestartConfirmOpen,
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
    confirmRestart,
    getElapsedSeconds,
    formatTimer,
  };
}
