import { supabase, isCloudConfigured } from './supabaseClient.js';
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

async function pushRecord(record, userId) {
  const { workout, sets, prs } = toRows(record, userId);
  // Workout + sets are replaced as a unit so a retry after a partial failure never duplicates sets.
  const { error: wErr } = await supabase.from('workouts').upsert(workout);
  if (wErr) throw wErr;
  const { error: dErr } = await supabase.from('workout_sets').delete().eq('workout_id', workout.id);
  if (dErr) throw dErr;
  if (sets.length) {
    const { error: sErr } = await supabase.from('workout_sets').insert(sets);
    if (sErr) throw sErr;
  }
  if (prs.length) {
    const { error: pErr } = await supabase.from('personal_records').insert(prs);
    if (pErr) throw pErr;
  }
}

export const CloudSync = {
  /** True when a real Supabase key is configured; local-only mode otherwise. */
  isEnabled: () => isCloudConfigured,


  /**
   * Downloads the signed-in user's workouts (newest 200) and personal records from Supabase and
   * merges them into local storage. Local-only records are kept; cloud records the device does
   * not have are added. Resolves with { added, error }.
   */
  pull() {
    if (pulling) return pulling;
    pulling = (async () => {
      if (!isCloudConfigured || navigator.onLine === false) return { added: 0, error: null };
      const { data: auth } = await supabase.auth.getSession();
      if (!auth?.session) return { added: 0, error: 'not-signed-in' };

      const { data: rows, error } = await supabase
        .from('workouts')
        .select('*, workout_sets(*)')
        .is('deleted_at', null)
        .eq('is_template', false)
        .order('started_at', { ascending: false })
        .limit(PULL_LIMIT);
      if (error) return { added: 0, error: error.message };

      const local = readJson(HISTORY_KEY, []);
      const have = new Set(local.map((w) => w.id));
      const incoming = rows.filter((r) => !have.has(r.id)).map(fromRow);
      if (incoming.length) {
        const merged = [...local, ...incoming].sort((a, b) => b.timestamp - a.timestamp);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
      }

      const { data: prRows, error: prErr } = await supabase
        .from('personal_records')
        .select('exercise_id, weight_kg, reps, one_rep_max, achieved_at')
        .order('one_rep_max', { ascending: false })
        .limit(1000);
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
      return { added: incoming.length, error: prErr ? prErr.message : null };
    })().finally(() => {
      pulling = null;
    });
    return pulling;
  },

  /**
   * Pushes every queued workout to Supabase. Records that fail stay queued for the next
   * attempt. Resolves with { synced, pending, error }.
   */
  flush() {
    if (flushing) return flushing;
    flushing = (async () => {
      const queue = readJson(QUEUE_KEY, []);
      if (!isCloudConfigured || queue.length === 0 || navigator.onLine === false) {
        return { synced: 0, pending: queue.length, error: null };
      }
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      if (!userId) return { synced: 0, pending: queue.length, error: 'not-signed-in' };

      const remaining = [];
      const doneIds = new Set();
      let lastError = null;
      for (const record of queue) {
        try {
          await pushRecord(record, userId);
          doneIds.add(record.id);
        } catch (err) {
          lastError = err.message || String(err);
          remaining.push(record);
        }
      }
      localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
      const history = readJson(HISTORY_KEY, []).map((h) =>
        doneIds.has(h.id) ? { ...h, synced: true, pendingSync: false } : h
      );
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      window.dispatchEvent(new CustomEvent('fitlog:sync', { detail: { pending: remaining.length } }));
      return { synced: doneIds.size, pending: remaining.length, error: lastError };
    })().finally(() => {
      flushing = null;
    });
    return flushing;
  },

};
