// Pure mapping between the local workout shape and the API rows. No network or browser APIs.

// A phone with a wrong date must not make the server reject the workout for good: clamp to the range it accepts.
const FLOOR = Date.parse('2000-01-02');
const toIso = (ts) => new Date(Math.min(Date.now(), Math.max(FLOOR, ts || Date.now()))).toISOString();

export function toRows(record, userId) {
  const started = record.timestamp - (record.durationSeconds || 0) * 1000;
  const workout = {
    id: record.id,
    user_id: userId,
    title: String(record.title || 'Logged Workout').slice(0, 100),
    started_at: toIso(started),
    completed_at: toIso(record.timestamp),
    // The database rejects anything over 24 h; a clock left running overnight must not block sync forever.
    duration_seconds: Math.min(86400, Math.max(0, Math.round(record.durationSeconds || 0))),
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


/** Rebuilds the local workout shape from an API workout row with its workout_sets. */
export function fromRow(row) {
  const groups = new Map();
  [...(row.workout_sets || [])]
    .sort((a, b) => a.set_order - b.set_order)
    .forEach((s) => {
      const g = groups.get(s.exercise_id) || { exerciseId: s.exercise_id, exerciseName: s.exercise_name, sets: [] };
      g.sets.push({
        id: g.sets.length + 1,
        type: s.set_type === 'warmup' ? 'W' : String(g.sets.length + 1),
        weight: Number(s.weight_kg),
        reps: s.reps,
        completed: s.is_completed,
        isPR: false,
      });
      groups.set(s.exercise_id, g);
    });
  return {
    id: row.id,
    title: row.title,
    timestamp: new Date(row.completed_at || row.started_at).getTime(),
    volumeKg: Number(row.volume_kg),
    durationSeconds: row.duration_seconds,
    exercises: [...groups.values()],
    newPRs: [],
    synced: true,
    pendingSync: false,
  };
}
