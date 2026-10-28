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
    // Parsing the whole history on every call was the main render cost (about 6 ms at 500 workouts,
    // once per exercise card). Reuse the parsed copy while the stored text is unchanged.
    const raw = localStorage.getItem('fitlog_workout_history') || '[]';
    if (raw === historyRaw) return historyParsed;
    let list = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      return [];
    }
    // One-time cleanup: earlier builds seeded a fake "3 days ago" workout into every new account.
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
      // Only sets that were actually done count; planned-but-skipped sets must not become "last session".
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
    // One-time cleanup of the fake records earlier builds seeded ("3 days ago").
    const real = Object.fromEntries(Object.entries(prs).filter(([, pr]) => pr.date !== '3 days ago'));
    if (Object.keys(real).length !== Object.keys(prs).length) {
      localStorage.setItem('fitlog_prs', JSON.stringify(real));
    }
    return real;
  },

  // Check if a set qualifies as a new personal best
  checkIsPR(exerciseId, weight, reps) {
    if (!weight || !reps) return false;
    const current1RM = calculate1RM(weight, reps);
    const prs = this.getPersonalRecords();
    const existing = prs[exerciseId];
    if (!existing) return true;
    return current1RM > existing.oneRepMax;
  },

  // Save workout locally (local-first) and mark as pending sync if offline
  saveWorkout(workoutData) {
    const history = this.getHistory();
    const prs = this.getPersonalRecords();

    // Check for new PRs
    let newPRsFound = [];
    workoutData.exercises?.forEach((ex) => {
      ex.sets?.forEach((set) => {
        if (set.completed && set.weight > 0 && set.reps > 0) {
          const oneRepMax = calculate1RM(set.weight, set.reps);
          const currentPR = prs[ex.exerciseId];
          if (!currentPR || oneRepMax > currentPR.oneRepMax) {
            prs[ex.exerciseId] = {
              weight: set.weight,
              reps: set.reps,
              oneRepMax: oneRepMax,
              achievedAt: Date.now(),
            };
            newPRsFound.push({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              weight: set.weight,
              reps: set.reps,
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
      volumeKg: workoutData.volumeKg || 0,
      durationSeconds: workoutData.durationSeconds || 0,
      exercises: workoutData.exercises,
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
