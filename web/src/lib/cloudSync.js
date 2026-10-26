import { supabase, isCloudConfigured } from './supabaseClient';

const QUEUE_KEY = 'fitlog_sync_queue';
const HISTORY_KEY = 'fitlog_workout_history';

let flushing = null;

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '') ?? fallback;
  } catch {
    return fallback;
  }
};

const toIso = (ts) => new Date(ts || Date.now()).toISOString();

function toRows(record, userId) {
  const started = record.timestamp - (record.durationSeconds || 0) * 1000;
  const workout = {
    id: record.id,
    user_id: userId,
    title: String(record.title || 'Logged Workout').slice(0, 100),
    started_at: toIso(started),
    completed_at: toIso(record.timestamp),
    duration_seconds: Math.round(record.durationSeconds || 0),
    volume_kg: Math.round((record.volumeKg || 0) * 100) / 100,
    total_sets: (record.exercises || []).reduce(
      (n, ex) => n + (ex.sets || []).filter((s) => s.completed).length,
      0
    ),
  };
  const sets = [];
  (record.exercises || []).forEach((ex) => {
    (ex.sets || []).forEach((s, i) => {
      sets.push({
        id: crypto.randomUUID(),
        workout_id: record.id,
        user_id: userId,
        exercise_id: String(ex.exerciseId).slice(0, 100),
        exercise_name: String(ex.exerciseName).slice(0, 150),
        set_order: i + 1,
        weight_kg: Math.round((s.weight || 0) * 100) / 100,
        reps: Math.round(s.reps || 0),
        is_completed: !!s.completed,
        set_type: s.type === 'W' ? 'warmup' : 'normal',
        completed_at: s.completed ? toIso(record.timestamp) : null,
      });
    });
  });
  const prs = (record.newPRs || []).map((pr) => ({
    user_id: userId,
    exercise_id: String(pr.exerciseId || pr.exerciseName).slice(0, 100),
    exercise_name: String(pr.exerciseName).slice(0, 150),
    weight_kg: pr.weight,
    reps: pr.reps,
    one_rep_max: Math.round(pr.oneRepMax * 100) / 100,
    achieved_at: toIso(record.timestamp),
  }));
  return { workout, sets, prs };
}

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
