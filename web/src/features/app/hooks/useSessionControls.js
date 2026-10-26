import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Workout session clock shared by every tab.
 * Elapsed time comes from timestamps, not from counting ticks, so it stays correct when the phone
 * locks or the browser throttles a background tab.
 */
export function useSessionControls() {
  const [sessionState, setSessionState] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const bankedMs = useRef(0); // time from earlier running stretches
  const runningSince = useRef(null); // start of the current stretch, or null

  const getElapsedSeconds = useCallback(
    () => Math.floor((bankedMs.current + (runningSince.current ? Date.now() - runningSince.current : 0)) / 1000),
    []
  );

  useEffect(() => {
    if (sessionState !== 'running') return undefined;
    const tick = () => setSessionSeconds(getElapsedSeconds());
    const interval = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [sessionState, getElapsedSeconds]);

  const startSession = () => {
    if (runningSince.current) return;
    runningSince.current = Date.now();
    setSessionState('running');
  };

  const pauseSession = () => {
    if (runningSince.current) {
      bankedMs.current += Date.now() - runningSince.current;
      runningSince.current = null;
    }
    setSessionSeconds(getElapsedSeconds());
    setSessionState('paused');
  };

  const resumeSession = startSession;

  /** Back to a blank, stopped clock (used after a workout is saved). */
  const resetSession = () => {
    bankedMs.current = 0;
    runningSince.current = null;
    setSessionSeconds(0);
    setSessionState('idle');
  };

  const confirmRestart = (onRestartSuccess) => {
    bankedMs.current = 0;
    runningSince.current = Date.now();
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
