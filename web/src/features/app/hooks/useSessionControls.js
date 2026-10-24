import { useState, useEffect } from 'react';

/**
 * Hook for managing universal active workout session controls.
 * Persistent across all tabs.
 */
export function useSessionControls() {
  const [sessionState, setSessionState] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);

  useEffect(() => {
    let interval = null;
    if (sessionState === 'running') {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionState]);

  const startSession = () => setSessionState('running');
  const pauseSession = () => setSessionState('paused');
  const resumeSession = () => setSessionState('running');

  const confirmRestart = (onRestartSuccess) => {
    setSessionSeconds(0);
    setSessionState('running');
    if (onRestartSuccess) onRestartSuccess();
    setIsRestartConfirmOpen(false);
  };

  const formatTimer = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    sessionState,
    sessionSeconds,
    isRestartConfirmOpen,
    setIsRestartConfirmOpen,
    startSession,
    pauseSession,
    resumeSession,
    confirmRestart,
    formatTimer,
  };
}
