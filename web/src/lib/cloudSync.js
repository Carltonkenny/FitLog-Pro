import { ApiError, api, isCloudConfigured } from './neonClient.js';
import { fromRow, toRows } from './syncRows.js';

const QUEUE_KEY = 'fitlog_sync_queue';
const HISTORY_KEY = 'fitlog_workout_history';
const PRS_KEY = 'fitlog_prs';
const PULL_LIMIT = 200;

let flushing = null;
let pulling = null;

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '') ?? fallback;
  } catch {
    return fallback;
  }
};

// The server decides ownership from the signed-in token, so the user id is not sent. toRows still builds
// the set and record rows; the API replaces a workout's sets as one unit, so retrying never duplicates them.
async function pushRecord(record) {
  const { workout, sets, prs } = toRows(record, null);
  await api(`/workouts/${workout.id}`, { method: 'PUT', body: { workout, sets, prs } });
}

// 4xx answers other than "sign in again", "slow down" and "timed out" will never succeed on retry.
const isPermanent = (err) => err instanceof ApiError && err.status >= 400 && err.status < 500 && ![401, 408, 429].includes(err.status);

export const CloudSync = {
  /** True when the Neon backend is configured; local-only mode otherwise. */
  isEnabled: () => isCloudConfigured,


  /**
   * Downloads the signed-in user's workouts (newest 200) and personal records from the API and
   * merges them into local storage. Local-only records are kept; cloud records the device does
   * not have are added. Resolves with { added, error }.
   */
  pull() {
    if (pulling) return pulling;
    pulling = (async () => {
      if (!isCloudConfigured || navigator.onLine === false) return { added: 0, error: null };
      let rows;
      try {
        ({ workouts: rows } = await api(`/workouts?limit=${PULL_LIMIT}`));
      } catch (err) {
        return { added: 0, error: err.code || err.message };
      }

      const local = readJson(HISTORY_KEY, []);
      const have = new Set(local.map((w) => w.id));
      const incoming = rows.filter((r) => !have.has(r.id)).map(fromRow);
      if (incoming.length) {
        const merged = [...local, ...incoming].sort((a, b) => b.timestamp - a.timestamp);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
      }

      let prRows = null;
      let prErr = null;
      try {
        ({ records: prRows } = await api('/records'));
      } catch (err) {
        prErr = err;
      }
      if (!prErr && prRows?.length) {
        const prs = readJson(PRS_KEY, {});
        prRows.forEach((r) => {
          const best = Number(r.one_rep_max);
          if (!prs[r.exercise_id] || best > prs[r.exercise_id].oneRepMax) {
            prs[r.exercise_id] = {
              weight: Number(r.weight_kg),
              reps: r.reps,
              oneRepMax: best,
              achievedAt: new Date(r.achieved_at).getTime(),
            };
          }
        });
        localStorage.setItem(PRS_KEY, JSON.stringify(prs));
      }

      window.dispatchEvent(new CustomEvent('fitlog:sync', { detail: { pulled: incoming.length } }));
      return { added: incoming.length, error: prErr ? prErr.code || prErr.message : null };
    })().finally(() => {
      pulling = null;
    });
    return pulling;
  },

  /**
   * Pushes every queued workout to the API. Records that fail stay queued for the next
   * attempt. Resolves with { synced, pending, error }.
   */
  flush() {
    if (flushing) return flushing;
    flushing = (async () => {
      const queue = readJson(QUEUE_KEY, []);
      if (!isCloudConfigured || queue.length === 0 || navigator.onLine === false) {
        return { synced: 0, pending: queue.length, error: null };
      }
      const remaining = [];
      const doneIds = new Set();
      const failedIds = new Set();
      let lastError = null;
      for (const record of queue) {
        try {
          await pushRecord(record);
          doneIds.add(record.id);
        } catch (err) {
          lastError = err.code || err.message || String(err);
          if (err instanceof ApiError && err.status === 401) {
            // Signed out mid-way: keep this record and everything after it, but still record what did upload.
            remaining.push(...queue.slice(queue.indexOf(record)));
            lastError = 'not-signed-in';
            break;
          }
          if (isPermanent(err)) failedIds.add(record.id);
          else remaining.push(record);
        }
      }
      localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
      const history = readJson(HISTORY_KEY, []).map((h) => {
        if (doneIds.has(h.id)) return { ...h, synced: true, pendingSync: false };
        if (failedIds.has(h.id)) return { ...h, synced: false, pendingSync: false, syncFailed: true };
        return h;
      });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      window.dispatchEvent(new CustomEvent('fitlog:sync', { detail: { pending: remaining.length } }));
      return { synced: doneIds.size, pending: remaining.length, error: lastError };
    })().finally(() => {
      flushing = null;
    });
    return flushing;
  },

};
