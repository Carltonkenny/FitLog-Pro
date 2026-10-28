/** A saved workout in the shape WorkoutStore writes. Used to seed localStorage; nothing here is real user data. */
export const workout = (i: number, title: string, extra: Record<string, unknown> = {}) => ({
  id: `00000000-0000-4000-8000-00000000000${i}`,
  title,
  timestamp: Date.now() - i * 86_400_000,
  volumeKg: 1200 * i,
  durationSeconds: 1800,
  exercises: [{ exerciseId: 'barbell-flat-bench-press', exerciseName: 'Barbell Flat Bench Press', targetMuscle: 'Chest', sets: [{ id: 1, type: '1', weight: 40, reps: 10, completed: true }] }],
  newPRs: [],
  synced: true,
  pendingSync: false,
  ...extra,
});
