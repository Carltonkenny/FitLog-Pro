// Input validation for the api function. Everything from the browser is untrusted: each field is checked,
// clamped or rejected here, and unknown fields are dropped. Erasable TypeScript only, so Node can run it.

export class ValidationError extends Error {}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SET_TYPES = new Set(['normal', 'warmup', 'drop', 'failure']);

export const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID.test(v);

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

function text(v: unknown, field: string, max: number, required = true): string | null {
  if (v === undefined || v === null || v === '') {
    if (required) throw new ValidationError(`${field} is required`);
    return null;
  }
  if (typeof v !== 'string') throw new ValidationError(`${field} must be text`);
  return v.trim().slice(0, max);
}

function num(v: unknown, field: string, min: number, max: number, opts: { int?: boolean; required?: boolean } = {}): number | null {
  if (v === undefined || v === null) {
    if (opts.required === false) return null;
    throw new ValidationError(`${field} is required`);
  }
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n) || n < min || n > max) throw new ValidationError(`${field} must be between ${min} and ${max}`);
  return opts.int ? Math.round(n) : Math.round(n * 100) / 100;
}

function date(v: unknown, field: string, required = true): string | null {
  if (v === undefined || v === null) {
    if (required) throw new ValidationError(`${field} is required`);
    return null;
  }
  const t = typeof v === 'string' ? Date.parse(v) : NaN;
  const dayMs = 86_400_000;
  if (!Number.isFinite(t) || t < Date.parse('2000-01-01') || t > Date.now() + dayMs) {
    throw new ValidationError(`${field} is not a valid date`);
  }
  return new Date(t).toISOString();
}

export type WorkoutInput = {
  workout: {
    title: string; started_at: string; completed_at: string | null;
    duration_seconds: number; volume_kg: number; total_sets: number;
  };
  sets: Array<{
    exercise_id: string; exercise_name: string; set_order: number; weight_kg: number; reps: number;
    is_completed: boolean; set_type: string; completed_at: string | null;
  }>;
  prs: Array<{
    exercise_id: string; exercise_name: string; weight_kg: number; reps: number; one_rep_max: number; achieved_at: string;
  }>;
};

/** Validates a workout upload. user_id, workout_id and set ids from the client are ignored on purpose. */
export function parseWorkout(body: unknown): WorkoutInput {
  if (!isObj(body) || !isObj(body.workout)) throw new ValidationError('workout is required');
  const w = body.workout;
  const sets = Array.isArray(body.sets) ? body.sets : [];
  const prs = Array.isArray(body.prs) ? body.prs : [];
  if (sets.length > 500) throw new ValidationError('too many sets');
  if (prs.length > 50) throw new ValidationError('too many records');

  return {
    workout: {
      title: text(w.title, 'title', 100) as string,
      started_at: date(w.started_at, 'started_at') as string,
      completed_at: date(w.completed_at, 'completed_at', false),
      duration_seconds: num(w.duration_seconds, 'duration_seconds', 0, 86400, { int: true }) as number,
      volume_kg: num(w.volume_kg, 'volume_kg', 0, 99_999_999) as number,
      total_sets: num(w.total_sets, 'total_sets', 0, 1000, { int: true }) as number,
    },
    sets: sets.map((s, i) => {
      if (!isObj(s)) throw new ValidationError(`sets[${i}] is invalid`);
      const type = typeof s.set_type === 'string' && SET_TYPES.has(s.set_type) ? s.set_type : 'normal';
      return {
        exercise_id: text(s.exercise_id, 'exercise_id', 100) as string,
        exercise_name: text(s.exercise_name, 'exercise_name', 150) as string,
        set_order: num(s.set_order, 'set_order', 1, 500, { int: true }) as number,
        weight_kg: num(s.weight_kg, 'weight_kg', 0, 1000) as number,
        reps: num(s.reps, 'reps', 0, 500, { int: true }) as number,
        is_completed: s.is_completed === true,
        set_type: type,
        completed_at: date(s.completed_at, 'completed_at', false),
      };
    }),
    prs: prs.map((p, i) => {
      if (!isObj(p)) throw new ValidationError(`prs[${i}] is invalid`);
      return {
        exercise_id: text(p.exercise_id, 'exercise_id', 100) as string,
        exercise_name: text(p.exercise_name, 'exercise_name', 150) as string,
        weight_kg: num(p.weight_kg, 'weight_kg', 0, 1000) as number,
        reps: num(p.reps, 'reps', 0, 500, { int: true }) as number,
        one_rep_max: num(p.one_rep_max, 'one_rep_max', 0, 2000) as number,
        achieved_at: date(p.achieved_at, 'achieved_at') as string,
      };
    }),
  };
}

const PROFILE_FIELDS: Record<string, (v: unknown) => unknown> = {
  full_name: (v) => text(v, 'full_name', 100, false),
  fitness_goal: (v) => text(v, 'fitness_goal', 40, false),
  experience_level: (v) => text(v, 'experience_level', 40, false),
  split_preference: (v) => text(v, 'split_preference', 40, false),
  body_weight_kg: (v) => num(v, 'body_weight_kg', 1, 500, { required: false }),
  target_weight_kg: (v) => num(v, 'target_weight_kg', 1, 500, { required: false }),
  body_fat_pct: (v) => num(v, 'body_fat_pct', 1, 80, { required: false }),
  daily_calorie_target: (v) => num(v, 'daily_calorie_target', 500, 10000, { int: true, required: false }),
  bench_1rm_kg: (v) => num(v, 'bench_1rm_kg', 1, 1000, { required: false }),
  weekly_volume_target_sets: (v) => num(v, 'weekly_volume_target_sets', 1, 200, { int: true, required: false }),
  onboarding_completed: (v) => v === true,
  routines: (v) => {
    if (!Array.isArray(v) || JSON.stringify(v).length > 90_000) throw new ValidationError('routines is invalid or too large');
    return JSON.stringify(v);
  },
  coach_memory: (v) => {
    if (!isObj(v) || JSON.stringify(v).length > 18_000) throw new ValidationError('coach_memory is invalid or too large');
    return JSON.stringify(v);
  },
};

/** Returns only allowed profile columns, validated. is_pro_member and ids can never be set from the API. */
export function parseProfile(body: unknown): Record<string, unknown> {
  if (!isObj(body)) throw new ValidationError('body must be an object');
  const out: Record<string, unknown> = {};
  for (const [key, check] of Object.entries(PROFILE_FIELDS)) {
    if (key in body) out[key] = check(body[key]);
  }
  return out;
}
