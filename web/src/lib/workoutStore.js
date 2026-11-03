import { CloudSync } from './cloudSync.js';
import { calculate1RM } from './exercises.js';

import { formatWeight, stepKg } from './settings.js';
// ==============================================================================
// FitLog Pro: Local-First Workout, Exercise Library & Progressive Overload Engine
// Emil Kowalski Design Engineering & Plain-English Domain Architecture
// ==============================================================================

export { calculate1RM, CASCADING_CATEGORIES, EXERCISE_LIBRARY } from './exercises.js';

// ------------------------------------------------------------------------------
// WORKOUT STORE WITH OFFLINE QUEUE & AUTO-SYNC
// ------------------------------------------------------------------------------
let historyRaw = null;
let historyParsed = [];

export const WorkoutStore = {
  // Get all completed workouts, newest first. Empty for a new user.
  getHistory() {
    const raw = localStorage.getItem('fitlog_workout_history') || '[]';
    if (raw === historyRaw) return historyParsed;
    let list = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      return [];
    }
    const cleaned = list.filter((w) => w.id !== 'wo_hist_prev');
    if (cleaned.length !== list.length) {
      localStorage.setItem('fitlog_workout_history', JSON.stringify(cleaned));
    }
    historyRaw = localStorage.getItem('fitlog_workout_history') || '[]';
    historyParsed = cleaned;
    return cleaned;
  },

  // Get previous session details for an exercise to display the comparison delta
  getLastSessionForExercise(exerciseId) {
    const history = this.getHistory();
    for (const wo of history) {
      const match = wo.exercises?.find((e) => e.exerciseId === exerciseId);
      const done = (match?.sets || []).filter((s) => s.completed !== false);
      if (done.length > 0) {
        return {
          workoutTitle: wo.title,
          timestamp: wo.timestamp,
          sets: done,
          bestSet: done.reduce((prev, curr) => (curr.weight > prev.weight ? curr : prev), done[0]),
        };
      }
    }
    return null;
  },

  // Compute progressive overload target in simple plain English
  getNextSessionTarget(exerciseId, lastWeight, lastReps, unit = 'kg') {
    if (!lastWeight || !lastReps) return 'Aim for 3 sets of 8–12 reps with good form';
    if (lastReps >= 12) {
      const step = stepKg(unit);
      return `Target: ${formatWeight(Number(lastWeight) + step, unit)} for 8–10 reps (+${formatWeight(step, unit)})`;
    }
    return `Target: ${formatWeight(Number(lastWeight), unit)} for ${Number(lastReps) + 1} reps (+1 rep)`;
  },

  // Get Personal Records keyed by exerciseId. Empty for a new user.
  getPersonalRecords() {
    let prs = {};
    try {
      prs = JSON.parse(localStorage.getItem('fitlog_prs') || '{}') || {};
    } catch {
      return {};
    }
    const real = Object.fromEntries(Object.entries(prs).filter(([, pr]) => pr.date !== '3 days ago'));
    if (Object.keys(real).length !== Object.keys(prs).length) {
      localStorage.setItem('fitlog_prs', JSON.stringify(real));
    }
    return real;
  },

  // Check if a set qualifies as a new personal best
  checkIsPR(exerciseId, weight, reps, setType = 'normal') {
    // Warmup sets ('W' or 'warmup') can NEVER be a personal record
    if (setType === 'W' || setType === 'warmup') return false;
    const numWeight = Number(weight);
    const numReps = Number(reps);
    if (isNaN(numWeight) || isNaN(numReps) || numWeight <= 0 || numReps <= 0) return false;

    const current1RM = calculate1RM(numWeight, numReps);
    if (current1RM <= 0) return false;

    const prs = this.getPersonalRecords();
    const existing = prs[exerciseId];
    if (!existing) return true;

    // Strict overload check: must strictly exceed existing 1RM to avoid false floating-point ties
    return current1RM > (existing.oneRepMax + 0.05);
  },

  // Save workout locally (local-first) and mark as pending sync if offline
  saveWorkout(workoutData) {
    const history = this.getHistory();
    const prs = this.getPersonalRecords();

    // Check for new PRs (excluding warmups)
    let newPRsFound = [];
    workoutData.exercises?.forEach((ex) => {
      ex.sets?.forEach((set) => {
        const isWarmup = set.type === 'W' || set.type === 'warmup';
        if (!isWarmup && set.completed && set.weight > 0 && set.reps > 0) {
          const oneRepMax = calculate1RM(set.weight, set.reps);
          const currentPR = prs[ex.exerciseId];
          if (!currentPR || oneRepMax > (currentPR.oneRepMax + 0.05)) {
            prs[ex.exerciseId] = {
              weight: Number(set.weight),
              reps: Number(set.reps),
              oneRepMax: oneRepMax,
              achievedAt: Date.now(),
            };
            newPRsFound.push({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              weight: Number(set.weight),
              reps: Number(set.reps),
              oneRepMax: oneRepMax,
            });
          }
        }
      });
    });

    const cloud = CloudSync.isEnabled();

    const savedRecord = {
      id: crypto.randomUUID(),
      title: workoutData.title || 'Logged Workout',
      timestamp: Date.now(),
      volumeKg: Number(workoutData.volumeKg) || 0,
      durationSeconds: Number(workoutData.durationSeconds) || 0,
      exercises: workoutData.exercises || [],
      newPRs: newPRsFound,
      synced: !cloud,
      pendingSync: cloud,
    };

    const updatedHistory = [savedRecord, ...history];
    localStorage.setItem('fitlog_workout_history', JSON.stringify(updatedHistory));
    localStorage.setItem('fitlog_prs', JSON.stringify(prs));

    // Queue first, then flush: a closed tab or dropped connection never loses a workout.
    if (cloud) {
      const queue = JSON.parse(localStorage.getItem('fitlog_sync_queue') || '[]');
      queue.push(savedRecord);
      localStorage.setItem('fitlog_sync_queue', JSON.stringify(queue));
      CloudSync.flush();
    }

    return {
      savedRecord,
      newPRsFound,
    };
  },

  // Calculate current active training streak in days
  getStreak() {
    const history = this.getHistory();
    if (!history || history.length === 0) return 0;

    const daySet = new Set();
    for (const item of history) {
      if (item.timestamp) {
        const d = new Date(item.timestamp);
        const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        daySet.add(dayKey);
      }
    }

    const today = new Date();
    const toDayKey = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let streak = 0;
    let checkDate = new Date(today);

    // If not worked out today, check if yesterday was worked out to maintain active streak
    let checkKey = toDayKey(checkDate);
    if (!daySet.has(checkKey)) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkKey = toDayKey(checkDate);
      if (!daySet.has(checkKey)) return 0;
    }

    while (daySet.has(checkKey)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkKey = toDayKey(checkDate);
    }
    return streak;
  },

  // User preferences persistence (unit, rest duration)
  getPreferences() {
    try {
      const raw = localStorage.getItem('fitlog_preferences');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // fallback
    }
    return { unit: 'kg', restDuration: 90, sound: true, haptics: true };
  },

  savePreferences(prefs) {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem('fitlog_preferences', JSON.stringify(updated));
      return updated;
    } catch (e) {
      return prefs;
    }
  },

  // Push the pending queue to the API (see cloudSync.js)
  flushSyncQueue() {
    return CloudSync.flush();
  },

  // Get active sync status
  getSyncStatus() {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const queue = JSON.parse(localStorage.getItem('fitlog_sync_queue') || '[]');
    return {
      isOnline,
      pendingCount: queue.length,
      statusLabel: !CloudSync.isEnabled()
        ? 'Saved on this device'
        : !isOnline
          ? `Offline. ${queue.length} workout${queue.length === 1 ? '' : 's'} waiting to sync`
          : queue.length > 0
            ? `Syncing ${queue.length} workout${queue.length === 1 ? '' : 's'}`
            : 'All workouts synced',
    };
  },
};
