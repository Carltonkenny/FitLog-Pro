import { useState, useEffect, useRef, useCallback } from 'react';
import { createClock } from '../../../lib/sessionClock';

/** Workout session clock shared by every tab. The timekeeping lives in lib/sessionClock.js. */
export function useSessionControls() {
  const [sessionState, setSessionState] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const clock = useRef(createClock()).current;

  const getElapsedSeconds = useCallback(() => clock.seconds(), [clock]);

  useEffect(() => {
    if (sessionState !== 'running') return undefined;
    const tick = () => setSessionSeconds(clock.seconds());
    const interval = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [sessionState, clock]);

  const startSession = () => {
    if (clock.isRunning()) return;
    clock.start();
    setSessionState('running');
  };

  const pauseSession = () => {
    clock.pause();
    setSessionSeconds(clock.seconds());
    setSessionState('paused');
  };

  const resumeSession = startSession;

  /** Back to a blank, stopped clock (used after a workout is saved). */
  const resetSession = () => {
    clock.reset();
    setSessionSeconds(0);
    setSessionState('idle');
  };

  const confirmRestart = (onRestartSuccess) => {
    clock.restart();
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
