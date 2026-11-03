/**
 * The workout stopwatch as a small pure object. Time comes from timestamps passed in, not from counting
 * ticks, so a locked phone or a throttled tab cannot lose seconds. `now` defaults to the real clock.
 */
export function createClock(restored) {
  // A restored clock comes back paused: the time up to the last save counts, the time the tab was closed does not.
  let banked = restored ? Math.max(0, restored.banked + (restored.since === null ? 0 : restored.at - restored.since)) : 0; // ms from earlier running stretches
  let since = null; // start of the current stretch, or null when stopped
  return {
    /** What to save so a refresh can restore the clock. */
    snapshot: (now = Date.now()) => ({ banked, since, at: now }),
    start(now = Date.now()) {
      if (since === null) since = now;
    },
    pause(now = Date.now()) {
      if (since !== null) banked += now - since;
      since = null;
    },
    /** Zero and running from `now` (used by "restart session"). */
    restart(now = Date.now()) {
      banked = 0;
      since = now;
    },
    /** Zero and stopped. */
    reset() {
      banked = 0;
      since = null;
    },
    isRunning: () => since !== null,
    seconds(now = Date.now()) {
      return Math.floor((banked + (since === null ? 0 : now - since)) / 1000);
    },
  };
}
