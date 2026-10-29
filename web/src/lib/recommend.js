import { EXERCISE_LIBRARY } from './exercises.js';
import { WEEKLY_SET_TARGET, weeklyMuscleSets } from './stats.js';

const DAY_MS = 86400000;
const COMPOUND = /squat|deadlift|bench press|barbell row|pull-up|chin-up|overhead|shoulder press|dip|lunge|romanian|row\b/i;

/** Maps a library equipment label to the five choices a user picks from. An exercise can match several. */
export function equipmentTags(exercise) {
  const e = exercise.equipment.toLowerCase();
  const tags = new Set();
  if (e.includes('barbell')) tags.add('Barbell');
  if (e.includes('dumbbell')) tags.add('Dumbbells');
  if (e.includes('cable')) tags.add('Cables');
  if (e.includes('machine') || e.includes('smith')) tags.add('Machines');
  if (e.includes('bodyweight') || e.includes('pull-up') || e.includes('belt')) tags.add('Bodyweight');
  if (tags.size === 0) tags.add('Machines');
  return tags;
}

/** True when the user has no equipment filter, or owns at least one piece the exercise needs. */
export const fitsEquipment = (exercise, owned) =>
  !owned?.length || [...equipmentTags(exercise)].some((t) => owned.includes(t));

/**
 * Ranks the library for this user and explains each pick.
 * Inputs: workout `history`, `memory` (equipment, favorites, avoided), `blueprint` (goal, experience).
 * Options: `muscle` limits to one group, `exclude` ids to skip, `limit` results.
 * Avoided exercises are never returned. Returns [{ exercise, score, reasons }] best first.
 */
export function recommendExercises({ history = [], memory = {}, blueprint = {}, muscle = null, exclude = [], limit = 8, now = Date.now() }) {
  const owned = memory.equipment || [];
  const favorites = new Set(memory.favorites || []);
  const avoided = new Set(memory.avoided || []);
  const skip = new Set(exclude);
  const weekly = Object.fromEntries(weeklyMuscleSets(history, now).map((r) => [r.muscle, r.sets]));
  const lastDone = new Map(); // exerciseId -> latest timestamp
  history.forEach((w) =>
    (w.exercises || []).forEach((ex) => {
      if ((ex.sets || []).some((s) => s.completed) && w.timestamp > (lastDone.get(ex.exerciseId) || 0)) {
        lastDone.set(ex.exerciseId, w.timestamp);
      }
    })
  );

  const strength = blueprint.goal === 'strength' || blueprint.fitness_goal === 'Raw Strength';
  const novice = blueprint.experience_level === 'Novice';
  const advanced = blueprint.experience_level === 'Advanced';

  return EXERCISE_LIBRARY.filter((ex) => !avoided.has(ex.id) && !skip.has(ex.id) && (!muscle || ex.muscle === muscle))
    .filter((ex) => fitsEquipment(ex, owned))
    .map((ex) => {
      const reasons = [];
      let score = ((ex.growthFatigueScore - 7) / 3) * 3; // 0 to 3

      const done = weekly[ex.muscle] ?? 0;
      const need = Math.max(0, (WEEKLY_SET_TARGET - done) / WEEKLY_SET_TARGET);
      score += need * 4;
      if (need >= 0.5) reasons.push(done === 0 ? `${ex.muscle} not trained this week` : `${ex.muscle} is behind this week (${done} of ${WEEKLY_SET_TARGET} sets)`);

      if (owned.length) reasons.push('Fits your equipment');
      if (ex.growthFatigueScore >= 9.2) reasons.push('Great growth for the effort');

      if (COMPOUND.test(ex.name)) {
        if (strength) { score += 1.5; reasons.push('Builds raw strength'); }
        if (advanced) score += 0.3;
      } else if (novice && (/machine|bodyweight/i.test(ex.equipment))) {
        score += 0.6;
        reasons.push('Easy to learn');
      }

      if (favorites.has(ex.id)) { score += 2; reasons.unshift('One of your favorites'); }

      const last = lastDone.get(ex.id);
      if (last && now - last < 2 * DAY_MS) { score -= 1.5; reasons.push('Done in the last 2 days'); }
      else if (last && now - last < 28 * DAY_MS) score += 0.5;

      return { exercise: ex, score, reasons: reasons.slice(0, 3) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
