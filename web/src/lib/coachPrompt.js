import { calculate1RM, EXERCISE_LIBRARY } from './exercises.js';

const LIBRARY_NAMES = EXERCISE_LIBRARY.map((e) => e.name);

/** Gemini response schema for a structured training plan. */
export const PLAN_SCHEMA = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    photoObservations: { type: 'STRING' },
    days: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          focus: { type: 'STRING' },
          exercises: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                sets: { type: 'INTEGER' },
                reps: { type: 'STRING' },
                restSeconds: { type: 'INTEGER' },
                note: { type: 'STRING' },
              },
              required: ['name', 'sets', 'reps'],
            },
          },
        },
        required: ['name', 'exercises'],
      },
    },
    notes: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['summary', 'days'],
};

/** Gemini response schema for a normal chat turn: the answer, facts to remember, and actions to run. */
export const CHAT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    reply: { type: 'STRING' },
    remember: { type: 'ARRAY', items: { type: 'STRING' } },
    actions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          type: { type: 'STRING', enum: ['add_exercise', 'favorite_exercise', 'avoid_exercise', 'open_tab', 'set_equipment'] },
          equipment: { type: 'ARRAY', items: { type: 'STRING', enum: ['Barbell', 'Dumbbells', 'Cables', 'Machines', 'Bodyweight'] } },
          name: { type: 'STRING' },
          sets: { type: 'INTEGER' },
          reps: { type: 'INTEGER' },
          tab: { type: 'STRING', enum: ['workout', 'library', 'analytics', 'history', 'settings'] },
        },
        required: ['type'],
      },
    },
  },
  required: ['reply', 'remember', 'actions'],
};

/**
 * System instruction for the companion. `memory` is the user's stored memory object, `names` maps
 * exercise ids to readable names so favorites and avoided exercises can be listed.
 */
export function buildSystem({ withPhotos, wantsPlan, petName = 'Buddy', memory = {}, names = {} }) {
  const label = (ids) => (ids || []).map((id) => names[id] || id).join(', ') || 'none';
  const known = [
    `Equipment they have: ${(memory.equipment || []).join(', ') || 'not set'}`,
    `Favorite exercises: ${label(memory.favorites)}`,
    `Exercises to avoid: ${label(memory.avoided)}`,
    `Things you remember: ${(memory.notes || []).map((n) => `"${n}"`).join('; ') || 'nothing yet'}`,
  ].join('\n');
  return [
    `You are ${petName}, the athlete's training companion inside FitLog Pro: warm, upbeat, brief. Plain English, no medical jargon.`,
    'Base every recommendation on the athlete data provided and quote real numbers from it. All weights are in kg.',
    'You are not a doctor. Do not diagnose injuries or medical conditions. If they mention pain, suggest a professional.',
    `WHAT YOU REMEMBER ABOUT THE ATHLETE:
${known}`,
    'Respect favorites, never suggest exercises to avoid, and only use equipment they have.',
    withPhotos
      ? 'Photos may show a physique, lifting form, or gym equipment. Only describe what is clearly visible and relevant to training. Say so when a photo is unclear. Never estimate body-fat percentage or comment on attractiveness. If a photo shows no person or equipment, say that.'
      : '',
    wantsPlan
      ? `Return a plan as JSON matching the schema. Prefer exercises from this list, using the exact names: ${LIBRARY_NAMES.join('; ')}. Use 3 to 6 exercises per day and a sensible number of days for their experience.`
      : [
          'Reply as JSON: reply (at most 4 short sentences), remember, actions.',
          'remember: up to 3 lasting facts the athlete stated about themselves (equipment, schedule, goals, limitations, likes and dislikes), each under 120 characters, written as a plain fact. Leave empty if there is nothing new. Never invent facts.',
          'Always include both remember and actions, as empty lists when there is nothing to add. Never say you added, saved or changed anything unless the matching action or remember entry is in your reply, because the app only does what the lists say.',
          'remember must contain only facts the athlete said in their latest message. Never copy from the profile or earlier replies. Each entry is one short plain sentence.',
          `actions: only when the athlete clearly asks. If they ask you to add an exercise you must include an add_exercise action. add_exercise puts an exercise in today's workout (use an exact name from this list: ${LIBRARY_NAMES.join('; ')}, with sets and reps). favorite_exercise or avoid_exercise records a like or a dislike or inability. open_tab shows a screen. set_equipment replaces the list of equipment the athlete has, using only Barbell, Dumbbells, Cables, Machines, Bodyweight, when they say what gear they have. Otherwise leave actions empty.`,
        ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n');
}

/** Compact, real-data context block for the prompt. */
export function buildContext({ history, prs, blueprint }) {
  const sessions = history.slice(0, 8).map((w) => ({
    date: new Date(w.timestamp).toISOString().slice(0, 10),
    title: w.title,
    volumeKg: Math.round(w.volumeKg || 0),
    lifts: (w.exercises || [])
      .map((ex) => {
        const done = (ex.sets || []).filter((s) => s.completed && s.weight > 0 && s.reps > 0);
        if (!done.length) return null;
        const best = done.reduce((a, b) => (calculate1RM(b.weight, b.reps) > calculate1RM(a.weight, a.reps) ? b : a));
        return `${ex.exerciseName}: ${done.length} sets, best ${best.weight} kg x ${best.reps}`;
      })
      .filter(Boolean),
  }));
  const records = Object.entries(prs).map(
    ([id, pr]) => `${id}: ${pr.weight} kg x ${pr.reps} (est. max ${pr.oneRepMax} kg)`
  );
  const profile = blueprint
    ? {
        goal: blueprint.fitness_goal || blueprint.goal,
        experience: blueprint.experience_level,
        split: blueprint.split_preference,
        bodyWeightKg: blueprint.body_weight_kg,
        targetWeightKg: blueprint.target_weight_kg,
      }
    : 'not provided';
  return `ATHLETE PROFILE: ${JSON.stringify(profile)}
RECENT WORKOUTS (newest first, ${history.length} logged in total): ${sessions.length ? JSON.stringify(sessions) : 'none yet'}
PERSONAL RECORDS: ${records.length ? records.join('; ') : 'none yet'}`;
}
