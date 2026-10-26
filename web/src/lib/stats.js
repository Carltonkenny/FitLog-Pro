import { EXERCISE_LIBRARY, calculate1RM } from './workoutStore';

const DAY_MS = 86400000;
const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

/** Weekly working sets per muscle group used as the progress target. */
export const WEEKLY_SET_TARGET = 12;

const byId = new Map(EXERCISE_LIBRARY.map((e) => [e.id, e]));
const byName = new Map(EXERCISE_LIBRARY.map((e) => [e.name.toLowerCase(), e]));

const lookup = (ex) => byId.get(ex.exerciseId) || byName.get(String(ex.exerciseName || '').toLowerCase());

/** Local calendar day as YYYY-MM-DD (the user's timezone, not UTC). */
export const dayKey = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** "Today", "Yesterday", "3 days ago", or a short date for anything older than a week. */
export function formatWorkoutDate(ts, now = Date.now()) {
  if (!ts) return '';
  const days = Math.round((new Date(dayKey(now)) - new Date(dayKey(ts))) / DAY_MS);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Consecutive days (local time) with at least one workout. The streak stays alive through
 * today if the user has not trained yet but trained yesterday. Returns 0 for empty history.
 */
export function computeStreak(history, now = Date.now()) {
  const days = new Set(history.map((w) => dayKey(w.timestamp)));
  let cursor = now;
  if (!days.has(dayKey(cursor))) cursor -= DAY_MS;
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

/** Number of workouts in the last `days` days. */
export const workoutsInLastDays = (history, days, now = Date.now()) =>
  history.filter((w) => now - w.timestamp < days * DAY_MS).length;

/** Completed sets per muscle group over the last 7 days. Always returns all six groups. */
export function weeklyMuscleSets(history, now = Date.now()) {
  const counts = Object.fromEntries(MUSCLE_GROUPS.map((m) => [m, 0]));
  history
    .filter((w) => now - w.timestamp < 7 * DAY_MS)
    .forEach((w) =>
      (w.exercises || []).forEach((ex) => {
        const muscle = lookup(ex)?.muscle;
        if (!muscle || !(muscle in counts)) return;
        counts[muscle] += (ex.sets || []).filter((s) => s.completed && s.weight > 0 && s.reps > 0).length;
      })
    );
  return MUSCLE_GROUPS.map((muscle) => ({ muscle, sets: counts[muscle] }));
}

/**
 * Most-trained lifts with their best estimated 1RM (Epley) and the change since the first
 * logged session. `deltaKg` is null until a lift has been logged in two different workouts.
 */
export function topLifts(history, limit = 3) {
  const sessions = new Map();
  [...history]
    .sort((a, b) => a.timestamp - b.timestamp)
    .forEach((w) =>
      (w.exercises || []).forEach((ex) => {
        let best = null;
        (ex.sets || []).forEach((s) => {
          if (!s.completed || !(s.weight > 0) || !(s.reps > 0)) return;
          const oneRm = calculate1RM(s.weight, s.reps);
          if (!best || oneRm > best.oneRm) best = { oneRm, weight: s.weight, reps: s.reps };
        });
        if (!best) return;
        const entry = sessions.get(ex.exerciseId) || { name: ex.exerciseName, list: [] };
        entry.list.push(best);
        sessions.set(ex.exerciseId, entry);
      })
    );

  return [...sessions.entries()]
    .map(([exerciseId, { name, list }]) => {
      const overall = list.reduce((a, b) => (b.oneRm > a.oneRm ? b : a));
      return {
        exerciseId,
        name,
        oneRm: overall.oneRm,
        weight: overall.weight,
        reps: overall.reps,
        sessions: list.length,
        deltaKg: list.length > 1 ? Math.round((overall.oneRm - list[0].oneRm) * 10) / 10 : null,
      };
    })
    .sort((a, b) => b.sessions - a.sessions || b.oneRm - a.oneRm)
    .slice(0, limit);
}
