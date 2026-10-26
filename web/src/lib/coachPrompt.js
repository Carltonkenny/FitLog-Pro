import { calculate1RM, EXERCISE_LIBRARY } from './workoutStore';

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

/** System instruction shared by chat and plan requests. */
export function buildSystem({ withPhotos, wantsPlan }) {
  return [
    "You are FitLog Pro's strength coach. Use plain English, no medical jargon.",
    'Base every recommendation on the athlete data provided. Quote real numbers from it. All weights are in kg.',
    'You are not a doctor. Do not diagnose injuries or medical conditions, and tell the athlete to see a professional for pain.',
    withPhotos
      ? 'Photos may show a physique, a posture or lifting form, or gym equipment. Only describe what is clearly visible and relevant to training. Say so when a photo is unclear. Never estimate body-fat percentage or comment on attractiveness. If a photo shows no person or equipment, say that.'
      : '',
    wantsPlan
      ? `Return a plan as JSON matching the schema. Prefer exercises from this list where they fit, using the exact names: ${LIBRARY_NAMES.slice(0, 80).join('; ')}. Use 3 to 6 exercises per day and a sensible number of days for the athlete's experience.`
      : 'Answer in at most 5 short sentences unless the athlete asks for detail.',
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
