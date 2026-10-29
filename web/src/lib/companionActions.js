import { EXERCISE_LIBRARY } from './exercises.js';
import { EQUIPMENT_OPTIONS } from './userData.js';

const TABS = ['workout', 'library', 'analytics', 'history', 'settings'];
const ACTION_TYPES = ['add_exercise', 'favorite_exercise', 'avoid_exercise', 'open_tab', 'set_equipment'];
const GEAR = EQUIPMENT_OPTIONS;
const MAX_ACTIONS = 5;

/** Finds a library exercise by name: exact match first, then a close match either way round. */
export function resolveExercise(name) {
  const n = String(name || '').trim().toLowerCase();
  if (!n) return null;
  return (
    EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === n) ||
    EXERCISE_LIBRARY.find((e) => n.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(n)) ||
    null
  );
}

/** A stand-in library entry for an exercise the library does not have (id is derived from the name). */
export const customExercise = (name, cue) => ({
  id: `custom_${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 60)}`,
  name: String(name),
  targetMuscle: 'Custom',
  equipment: 'Any',
  cue,
});

/**
 * Turns the model's raw text into { reply, remember, actions }. The model is untrusted: unknown
 * action types are dropped, numbers are clamped and at most 5 actions are kept. If the text is not
 * valid JSON it is shown as a plain reply with no actions.
 */
export function parseChatReply(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // Not JSON. Plain text is fine to show, but half a JSON object must never reach the user.
    const plain = String(text || '').trim();
    if (/^[[{]/.test(plain)) return { reply: '', remember: [], actions: [], broken: true };
    return { reply: plain, remember: [], actions: [] };
  }
  const clamp = (v, min, max, d) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
  };
  return {
    reply: typeof data?.reply === 'string' ? data.reply.trim() : '',
    remember: (Array.isArray(data?.remember) ? data.remember : []).filter((x) => typeof x === 'string').slice(0, 3),
    actions: (Array.isArray(data?.actions) ? data.actions : [])
      .filter((a) => a && ACTION_TYPES.includes(a.type))
      .filter((a) => {
        if (a.type === 'open_tab') return TABS.includes(a.tab);
        if (a.type === 'set_equipment') return Array.isArray(a.equipment) && a.equipment.some((g) => GEAR.includes(g));
        return typeof a.name === 'string' && a.name.trim();
      })
      .map((a) => ({
        type: a.type,
        name: typeof a.name === 'string' ? a.name.trim().slice(0, 100) : undefined,
        tab: a.tab,
        equipment: a.type === 'set_equipment' ? [...new Set(a.equipment.filter((g) => GEAR.includes(g)))] : undefined,
        sets: clamp(a.sets, 1, 10, 3),
        reps: clamp(a.reps, 1, 100, 10),
      }))
      .slice(0, MAX_ACTIONS),
  };
}

/** The companion's mood: pumped after a recent record, sleepy after 3+ idle days, otherwise happy. */
export function petMood(history, now = Date.now()) {
  const day = 86400000;
  const newest = history.reduce((m, w) => Math.max(m, w.timestamp || 0), 0);
  const recentPr = history.some((w) => now - w.timestamp < day && (w.newPRs || []).length > 0);
  if (recentPr) return 'pumped';
  if (!newest || now - newest > 3 * day) return 'sleepy';
  return 'happy';
}

/** Validates the model's plan JSON and returns a safe plan object, or null when it is unusable. */
export function parsePlan(text) {
  try {
    const plan = JSON.parse(text);
    if (!plan || !Array.isArray(plan.days) || plan.days.length === 0) return null;
    const days = plan.days
      .filter((d) => d && typeof d.name === 'string' && Array.isArray(d.exercises))
      .map((d) => ({
        name: d.name,
        focus: typeof d.focus === 'string' ? d.focus : '',
        exercises: d.exercises
          .filter((e) => e && typeof e.name === 'string')
          .map((e) => ({
            name: e.name,
            sets: Math.min(10, Math.max(1, Number(e.sets) || 3)),
            reps: String(e.reps ?? '8-12'),
            restSeconds: Number(e.restSeconds) || 0,
            note: typeof e.note === 'string' ? e.note : '',
          })),
      }))
      .filter((d) => d.exercises.length > 0);
    if (days.length === 0) return null;
    return {
      summary: String(plan.summary || ''),
      photoObservations: typeof plan.photoObservations === 'string' ? plan.photoObservations : '',
      notes: Array.isArray(plan.notes) ? plan.notes.filter((n) => typeof n === 'string') : [],
      days,
    };
  } catch {
    return null;
  }
}
