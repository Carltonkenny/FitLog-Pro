import { useSyncExternalStore } from 'react';

// Captures the browser's install prompt (Chrome and Edge on Android and desktop) so Settings can
// offer an "Install app" button. Safari on iPhone has no prompt; Settings shows manual steps instead.
let deferred = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
const getCanPrompt = () => deferred !== null;

export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true);

export const isIos = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

/** True when the browser can show its install prompt right now. */
export const useCanInstall = () => useSyncExternalStore(subscribe, getCanPrompt);

/** Shows the install prompt. Resolves with 'accepted', 'dismissed' or null when unavailable. */
export async function promptInstall() {
  if (!deferred) return null;
  deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  notify();
  return outcome;
}
