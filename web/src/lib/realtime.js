import { createRealtimeClient } from '@neon/realtime/client';
import { REALTIME_URL, api, isCloudConfigured } from './neonClient.js';

// Live cross-device refresh. The API seals two read-only queries for the signed-in user (their latest workouts
// and their profile). When either changes on another device, `onWorkouts` / `onProfile` run so this device
// pulls the new data. If realtime is unavailable the app still works: it syncs when opened.

const RENEW_EARLY_MS = 10_000;

/** Starts the live subscriptions. Returns a function that stops them. */
export function startRealtime({ onWorkouts, onProfile }) {
  if (!isCloudConfigured || !REALTIME_URL) return () => {};
  let stopped = false;
  let client;
  const timers = new Set();
  const subs = [];

  const watch = (sub, onChange) => {
    let last = null;
    sub.onChange((snap) => {
      if (!snap.data) return;
      const signature = JSON.stringify(snap.data.map((r) => `${r.id}:${r.updated_at}`));
      const first = last === null;
      const changed = signature !== last;
      last = signature;
      if (!first && changed) onChange(); // the first snapshot is just the current state
    });
  };

  // Sealed queries last about a minute. Fetch a replacement shortly before expiry and swap it in.
  const keepFresh = (sub, pick, expiresAt) => {
    const wait = Math.max(5_000, expiresAt - Date.now() - RENEW_EARLY_MS);
    const t = setTimeout(async () => {
      timers.delete(t);
      if (stopped) return;
      try {
        const next = pick(await api('/realtime/seal', { method: 'POST' }));
        await sub.renew(next);
        keepFresh(sub, pick, next.expiresAt);
      } catch {
        keepFresh(sub, pick, Date.now() + 15_000); // try again shortly
      }
    }, wait);
    timers.add(t);
  };

  (async () => {
    try {
      const sealed = await api('/realtime/seal', { method: 'POST' });
      if (stopped) return;
      client = createRealtimeClient({ url: REALTIME_URL });
      [
        [(s) => s.workouts, onWorkouts],
        [(s) => s.profile, onProfile],
      ].forEach(([pick, handler]) => {
        const sub = client.subscribe(pick(sealed));
        subs.push(sub);
        watch(sub, handler);
        keepFresh(sub, pick, pick(sealed).expiresAt);
      });
    } catch (err) {
      console.warn('Live updates unavailable:', err.code || err.message);
    }
  })();

  return () => {
    stopped = true;
    timers.forEach(clearTimeout);
    subs.forEach((s) => s.unsubscribe?.());
    client?.close?.();
  };
}
