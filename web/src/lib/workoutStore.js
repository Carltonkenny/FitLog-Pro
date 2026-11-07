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

/**
 * Resilient helper to match an exercise by id, name, or normalized slug.
 */
function exerciseMatches(ex, query) {
  if (!ex || !query) return false;
  const q = String(query).trim().toLowerCase();
  const exId = String(ex.exerciseId || ex.id || '').trim().toLowerCase();
  const exName = String(ex.exerciseName || ex.name || '').trim().toLowerCase();

  if (exId === q || exName === q) return true;

  const normalize = (str) => str.replace(/[^a-z0-9]/g, '');
  const cleanQ = normalize(q);
  if (cleanQ && (normalize(exId) === cleanQ || normalize(exName) === cleanQ)) return true;

  return false;
}

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
  getLastSessionForExercise(exerciseIdOrName) {
    const history = this.getHistory();
    for (const wo of history) {
      const match = wo.exercises?.find((e) => exerciseMatches(e, exerciseIdOrName));
      const done = (match?.sets || []).filter((s) => s.completed !== false && Number(s.weight) >= 0 && Number(s.reps) > 0);
      if (done.length > 0) {
        const best = done.reduce((prev, curr) => {
          if (Number(curr.weight) > Number(prev.weight)) return curr;
          if (Number(curr.weight) === Number(prev.weight) && Number(curr.reps) > Number(prev.reps)) return curr;
          return prev;
        }, done[0]);

        return {
          workoutTitle: wo.title,
          timestamp: wo.timestamp,
          sets: done,
          bestSet: best,
          exerciseId: match.exerciseId || match.id,
          exerciseName: match.exerciseName || match.name,
        };
      }
    }
    return null;
  },

  // Get full chronological session history for a specific exercise
  getExerciseHistory(exerciseIdOrName) {
    const history = this.getHistory();
    const sessions = [];
    let exerciseId = null;
    let exerciseName = null;
    let totalSets = 0;
    let totalVolumeKg = 0;
    let allTimeBest = { weight: 0, reps: 0, oneRepMax: 0, achievedAt: null };

    // Newest first
    for (const wo of history) {
      const match = wo.exercises?.find((e) => exerciseMatches(e, exerciseIdOrName));
      if (!match) continue;

      if (!exerciseId) exerciseId = match.exerciseId || match.id;
      if (!exerciseName) exerciseName = match.exerciseName || match.name;

      const doneSets = (match.sets || []).filter(
        (s) => s.completed !== false && Number(s.weight) >= 0 && Number(s.reps) > 0
      );

      if (doneSets.length > 0) {
        totalSets += doneSets.length;
        const sessionVolume = doneSets.reduce((sum, s) => sum + Number(s.weight) * Number(s.reps), 0);
        totalVolumeKg += sessionVolume;

        const sessionBest = doneSets.reduce((prev, curr) => {
          if (Number(curr.weight) > Number(prev.weight)) return curr;
          if (Number(curr.weight) === Number(prev.weight) && Number(curr.reps) > Number(prev.reps)) return curr;
          return prev;
        }, doneSets[0]);

        const session1RM = calculate1RM(sessionBest.weight, sessionBest.reps);
        if (session1RM > allTimeBest.oneRepMax) {
          allTimeBest = {
            weight: Number(sessionBest.weight),
            reps: Number(sessionBest.reps),
            oneRepMax: session1RM,
            achievedAt: wo.timestamp,
          };
        }

        sessions.push({
          workoutId: wo.id,
          workoutTitle: wo.title,
          timestamp: wo.timestamp,
          sets: doneSets,
          bestSet: sessionBest,
          best1RM: session1RM,
          volumeKg: Math.round(sessionVolume),
        });
      }
    }

    if (!sessions.length) return null;

    sessions.sort((a, b) => b.timestamp - a.timestamp);

    return {
      exerciseId: exerciseId || String(exerciseIdOrName),
      exerciseName: exerciseName || String(exerciseIdOrName),
      totalSessions: sessions.length,
      totalSets,
      totalVolumeKg: Math.round(totalVolumeKg),
      allTimeBest,
      lastSession: sessions[0],
      sessions,
    };
  },

  // Aggregates EVERY distinct exercise ever logged across user history
  getAllExercisesHistory() {
    const history = this.getHistory();
    const map = new Map();

    // Iterate through workouts (newest to oldest)
    for (const wo of history) {
      for (const ex of wo.exercises || []) {
        const id = ex.exerciseId || ex.id || String(ex.exerciseName || ex.name).toLowerCase().replace(/[^a-z0-9]/g, '_');
        const name = ex.exerciseName || ex.name || id;
        const doneSets = (ex.sets || []).filter(
          (s) => s.completed !== false && Number(s.weight) >= 0 && Number(s.reps) > 0
        );

        if (!doneSets.length) continue;

        const sessionVolume = doneSets.reduce((sum, s) => sum + Number(s.weight) * Number(s.reps), 0);
        const sessionBest = doneSets.reduce((prev, curr) => {
          if (Number(curr.weight) > Number(prev.weight)) return curr;
          if (Number(curr.weight) === Number(prev.weight) && Number(curr.reps) > Number(prev.reps)) return curr;
          return prev;
        }, doneSets[0]);
        const session1RM = calculate1RM(sessionBest.weight, sessionBest.reps);

        if (!map.has(id)) {
          map.set(id, {
            exerciseId: id,
            exerciseName: name,
            targetMuscle: ex.targetMuscle || 'Muscle Group',
            equipment: ex.equipment || 'Gym Gear',
            timesPerformed: 1,
            firstPerformedAt: wo.timestamp,
            lastPerformedAt: wo.timestamp,
            lastWeight: Number(sessionBest.weight),
            lastReps: Number(sessionBest.reps),
            last1RM: session1RM,
            bestWeight: Number(sessionBest.weight),
            bestReps: Number(sessionBest.reps),
            best1RM: session1RM,
            totalSets: doneSets.length,
            totalVolumeKg: Math.round(sessionVolume),
            recentSessions: [
              {
                date: new Date(wo.timestamp).toISOString().slice(0, 10),
                title: wo.title,
                timestamp: wo.timestamp,
                setsCount: doneSets.length,
                bestWeight: Number(sessionBest.weight),
                bestReps: Number(sessionBest.reps),
                best1RM: session1RM,
              },
            ],
          });
        } else {
          const entry = map.get(id);
          entry.timesPerformed += 1;
          entry.totalSets += doneSets.length;
          entry.totalVolumeKg += Math.round(sessionVolume);
          entry.firstPerformedAt = Math.min(entry.firstPerformedAt, wo.timestamp);

          if (wo.timestamp > entry.lastPerformedAt) {
            entry.lastPerformedAt = wo.timestamp;
            entry.lastWeight = Number(sessionBest.weight);
            entry.lastReps = Number(sessionBest.reps);
            entry.last1RM = session1RM;
          }

          if (session1RM > entry.best1RM) {
            entry.best1RM = session1RM;
            entry.bestWeight = Number(sessionBest.weight);
            entry.bestReps = Number(sessionBest.reps);
          }

          entry.recentSessions.push({
            date: new Date(wo.timestamp).toISOString().slice(0, 10),
            title: wo.title,
            timestamp: wo.timestamp,
            setsCount: doneSets.length,
            bestWeight: Number(sessionBest.weight),
            bestReps: Number(sessionBest.reps),
            best1RM: session1RM,
          });
        }
      }
    }

    const result = Array.from(map.values()).map((entry) => {
      entry.recentSessions.sort((a, b) => b.timestamp - a.timestamp);
      entry.recentSessions = entry.recentSessions.slice(0, 5);
      return entry;
    });

    return result.sort((a, b) => b.lastPerformedAt - a.lastPerformedAt);
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
