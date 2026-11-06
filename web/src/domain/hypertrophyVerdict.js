import { calculate1RM, EXERCISE_LIBRARY } from '../lib/exercises.js';

/**
 * Pure domain logic for sports-science hypertrophy verdict, muscle balance, and junk volume analysis.
 * Zero UI/DOM dependencies for deterministic testing.
 */

// Volume Thresholds per muscle group per week (Dr. Mike Israetel / Renaissance Periodization standards)
export const VOLUME_THRESHOLDS = {
  NEGLECTED_MAX: 3,     // Under MV (< 4 sets/wk)
  MAINTENANCE_MAX: 9,   // MV (4-9 sets/wk)
  OPTIMAL_MAX: 20,      // MAV (10-20 sets/wk)
};

/**
 * Classifies weekly sets into clear physiological volume buckets.
 */
export function classifyMuscleVolume(setsCount = 0) {
  const count = Number(setsCount) || 0;
  if (count <= VOLUME_THRESHOLDS.NEGLECTED_MAX) {
    return {
      status: 'neglected',
      label: 'Under-Stimulated',
      color: '#71717a',
      bg: 'rgba(113, 113, 122, 0.15)',
      advice: 'Below Minimum Effective Volume. Minimal hypertrophy occurring.',
    };
  }
  if (count <= VOLUME_THRESHOLDS.MAINTENANCE_MAX) {
    return {
      status: 'maintenance',
      label: 'Maintenance',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      advice: 'Sufficient to preserve existing muscle tissue, but sub-optimal for visible growth.',
    };
  }
  if (count <= VOLUME_THRESHOLDS.OPTIMAL_MAX) {
    return {
      status: 'optimal_growth',
      label: 'Optimal Growth',
      color: '#00F59B',
      bg: 'rgba(0, 245, 155, 0.15)',
      advice: 'Maximum Adaptive Volume. Prime hypertrophic stimulus with high recovery return.',
    };
  }
  return {
    status: 'junk_volume',
    label: 'Junk / Overreaching',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    advice: 'Diminishing returns. Fatigue accumulation outpaces protein synthesis.',
  };
}

/**
 * Resolves muscle group for a given exercise name.
 */
export function getExerciseMuscleGroup(exerciseName) {
  if (!exerciseName) return 'chest';
  const match = EXERCISE_LIBRARY.find(
    (e) => e.name.toLowerCase() === exerciseName.toLowerCase() || e.id.toLowerCase() === exerciseName.toLowerCase()
  );
  if (match) return match.muscleGroup || 'chest';

  const lower = exerciseName.toLowerCase();
  if (lower.includes('bench') || lower.includes('chest') || lower.includes('fly') || lower.includes('push-up') || lower.includes('dip')) return 'chest';
  if (lower.includes('pull') || lower.includes('row') || lower.includes('lat') || lower.includes('deadlift') || lower.includes('chin')) return 'back';
  if (lower.includes('squat') || lower.includes('leg') || lower.includes('lunge') || lower.includes('calf') || lower.includes('quad') || lower.includes('hamstring')) return 'legs';
  if (lower.includes('shoulder') || lower.includes('press') || lower.includes('lateral') || lower.includes('delt')) return 'shoulders';
  if (lower.includes('curl') || lower.includes('tricep') || lower.includes('bicep') || lower.includes('skull')) return 'arms';
  return 'core';
}

/**
 * Detects junk volume (>12 sets for a single muscle group in a single workout session).
 */
export function detectJunkVolume(workout) {
  if (!workout || !Array.isArray(workout.exercises)) {
    return { hasJunkVolume: false, warnings: [] };
  }

  const muscleSets = {};
  for (const ex of workout.exercises) {
    const group = getExerciseMuscleGroup(ex.name || ex.exerciseName);
    const completedCount = (ex.sets || []).filter((s) => s.completed && Number(s.weight) >= 0 && Number(s.reps) > 0).length;
    muscleSets[group] = (muscleSets[group] || 0) + completedCount;
  }

  const warnings = [];
  for (const [group, count] of Object.entries(muscleSets)) {
    if (count > 12) {
      warnings.push({
        group,
        setsCount: count,
        message: `${count} sets performed on ${group.toUpperCase()} in one session. Hard science demonstrates that muscle protein synthesis plateaus after ~8-10 hard sets in a single workout. The remaining ${count - 10} sets were junk volume creating systemic fatigue without hypertrophy.`,
        remedy: `Cap ${group} to 6-10 sets per workout and redistribute remaining volume to a second session later in the week.`,
      });
    }
  }

  return {
    hasJunkVolume: warnings.length > 0,
    warnings,
  };
}

/**
 * Detects structural and posture muscle imbalances.
 */
export function calculateMuscleBalance(weeklySets = {}) {
  const chest = weeklySets.chest || 0;
  const back = weeklySets.back || 0;
  const legs = weeklySets.legs || 0;
  const shoulders = weeklySets.shoulders || 0;

  const warnings = [];

  // Chest vs Back imbalance (Anterior vs Posterior Thoracic)
  if (chest > 8 && back > 0 && chest / back > 1.4) {
    warnings.push({
      type: 'chest_back_ratio',
      title: 'Anterior Chest Dominance',
      message: `You logged ${chest} chest sets vs only ${back} back sets this week (Ratio: ${(chest / back).toFixed(1)}:1). This creates internal humerus rotation, forward shoulder slump, and rotator cuff impingement.`,
      remedy: 'Increase horizontal pulling (Barbell Rows, Chest-Supported Rows) to achieve a 1:1 or 1:1.2 pull-to-push ratio.',
    });
  } else if (back > 10 && chest > 0 && back / chest > 1.8) {
    warnings.push({
      type: 'back_chest_ratio',
      title: 'Posterior Pull Dominance',
      message: `Back volume (${back} sets) significantly outpaces anterior pressing (${chest} sets).`,
      remedy: 'Add 2-4 sets of incline pressing or floor press to maintain clavicular chest balance.',
    });
  }

  // Upper vs Lower body imbalance
  const upperSets = chest + back + shoulders + (weeklySets.arms || 0);
  if (upperSets > 24 && legs < 6) {
    warnings.push({
      type: 'upper_lower_ratio',
      title: 'Neglected Lower Body Foundation',
      message: `Upper body volume is ${upperSets} sets while legs have only ${legs} sets. Lower body training drives the largest systemic growth hormone and test stimulus.`,
      remedy: 'Incorporate at least one heavy knee-flexion and one hip-hinge compound movement (Squat, RDL, or Leg Press).',
    });
  }

  return {
    isImbalanced: warnings.length > 0,
    warnings,
    ratios: {
      chestToBack: back > 0 ? Number((chest / back).toFixed(2)) : chest,
      upperToLower: legs > 0 ? Number((upperSets / legs).toFixed(2)) : upperSets,
    },
  };
}

/**
 * Calculates the comprehensive, unvarnished Hypertrophy Stimulus Score (0-100) and Verdict.
 */
export function calculateStimulusVerdict(activeWorkout, history = []) {
  if (!activeWorkout || !Array.isArray(activeWorkout.exercises) || activeWorkout.exercises.length === 0) {
    return {
      score: 0,
      grade: 'N/A',
      effectiveSets: 0,
      ghostDefeatedCount: 0,
      junkVolumeDetected: false,
      unvarnishedTruth: 'No active lifting data logged yet. Complete sets to generate your hypertrophy verdict.',
    };
  }

  let totalCompletedSets = 0;
  let ghostDefeatedCount = 0;
  let totalGhostComparisons = 0;
  let totalVolumeKg = 0;

  // Flatten previous historical best lifts for ghost comparisons
  const historicalBest = {};
  for (const prev of history) {
    for (const ex of prev.exercises || []) {
      const exName = (ex.name || ex.exerciseName || '').toLowerCase();
      for (const s of ex.sets || []) {
        if (s.completed && s.weight > 0 && s.reps > 0) {
          const e1rm = calculate1RM(s.weight, s.reps);
          if (!historicalBest[exName] || e1rm > historicalBest[exName].oneRepMax) {
            historicalBest[exName] = {
              weight: s.weight,
              reps: s.reps,
              oneRepMax: e1rm,
            };
          }
        }
      }
    }
  }

  for (const ex of activeWorkout.exercises) {
    const exName = (ex.name || ex.exerciseName || '').toLowerCase();
    const ghost = historicalBest[exName];
    let exerciseBeatGhost = false;

    for (const s of ex.sets || []) {
      if (s.completed && Number(s.weight) >= 0 && Number(s.reps) > 0) {
        totalCompletedSets++;
        totalVolumeKg += Number(s.weight) * Number(s.reps);

        if (ghost) {
          const current1RM = calculate1RM(s.weight, s.reps);
          if (current1RM > ghost.oneRepMax) {
            exerciseBeatGhost = true;
          }
        }
      }
    }

    if (ghost) {
      totalGhostComparisons++;
      if (exerciseBeatGhost) {
        ghostDefeatedCount++;
      }
    }
  }

  // Base score from effective completed working sets (capped at 20 sets for max score)
  let score = Math.min(60, totalCompletedSets * 5);

  // Progressive overload bonus (up to 30 points)
  if (totalGhostComparisons > 0) {
    const ghostRatio = ghostDefeatedCount / totalGhostComparisons;
    score += Math.round(ghostRatio * 30);
  } else if (totalCompletedSets >= 6) {
    // First session baseline bonus
    score += 20;
  }

  // Junk volume penalty
  const junkCheck = detectJunkVolume(activeWorkout);
  if (junkCheck.hasJunkVolume) {
    score = Math.max(25, score - 20);
  }

  // Clamping score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine Grade
  let grade = 'C';
  if (score >= 90) grade = 'S';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';

  // Construct unvarnished truth statement
  const parts = [];
  if (ghostDefeatedCount > 0) {
    parts.push(`You defeated ${ghostDefeatedCount} historical ghost target(s), proving true progressive overload.`);
  } else if (totalGhostComparisons > 0) {
    parts.push('You matched or stayed slightly under historical PR targets today. Next session, focus on +1 rep or +1.5kg.');
  }

  if (junkCheck.hasJunkVolume) {
    parts.push(`⚠️ JUNK VOLUME PENALTY: ${junkCheck.warnings[0].message}`);
  } else if (totalCompletedSets >= 8 && totalCompletedSets <= 18) {
    parts.push('Volume was in the scientific sweet-spot (8–18 total working sets). Zero junk volume detected.');
  }

  if (totalCompletedSets < 6) {
    parts.push('Workout volume was brief. Ensure you hit at least 2 high-intensity working sets per targeted muscle group.');
  }

  return {
    score,
    grade,
    effectiveSets: totalCompletedSets,
    ghostDefeatedCount,
    totalVolumeKg: Math.round(totalVolumeKg),
    junkVolumeDetected: junkCheck.hasJunkVolume,
    junkWarnings: junkCheck.warnings,
    unvarnishedTruth: parts.join(' ') || 'Session completed. Baseline stimulus recorded.',
  };
}
