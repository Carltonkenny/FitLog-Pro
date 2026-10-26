import { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WorkoutStore } from '../../../lib/workoutStore';
import { buzz, getSettings } from '../../../lib/settings';
import { workoutStats } from '../../../lib/stats';

// Starter session. Weights and reps are replaced by the user's last logged session when one exists.
const STARTER_TEMPLATE = [
    {
      exerciseId: 'bench_press',
      exerciseName: 'Barbell Flat Bench Press',
      targetMuscle: 'Chest (Pecs)',
      equipment: 'Barbell',
      notes: 'Pinch shoulder blades into bench, 1s controlled pause at mid-chest',
      growthFatigueScore: 8.8,
      sets: [
        { id: 1, type: 'W', weight: 30.0, reps: 10, completed: false, isPR: false },
        { id: 2, type: '1', weight: 40.0, reps: 10, completed: false, isPR: false },
        { id: 3, type: '2', weight: 40.0, reps: 10, completed: false, isPR: false },
        { id: 4, type: '3', weight: 42.5, reps: 8, completed: false, isPR: false },
      ],
    },
    {
      exerciseId: 'lat_pulldown',
      exerciseName: 'Lat Pulldown (Neutral Grip)',
      targetMuscle: 'Back & Lats (V-Taper)',
      equipment: 'Cable Machine',
      notes: 'Drive elbows down toward back pockets, 2s slow lowering phase',
      growthFatigueScore: 9.3,
      sets: [
        { id: 1, type: '1', weight: 35.0, reps: 12, completed: false, isPR: false },
        { id: 2, type: '2', weight: 35.0, reps: 12, completed: false, isPR: false },
        { id: 3, type: '3', weight: 37.5, reps: 10, completed: false, isPR: false },
      ],
    },
    {
      exerciseId: 'bicep_curls',
      exerciseName: 'Dumbbell Bicep Curl',
      targetMuscle: 'Front Arm (Biceps)',
      equipment: 'Dumbbells',
      notes: 'Rotate pinky upward at peak contraction, zero hip momentum',
      growthFatigueScore: 9.2,
      sets: [
        { id: 1, type: '1', weight: 8.0, reps: 10, completed: false, isPR: false },
        { id: 2, type: '2', weight: 8.0, reps: 10, completed: false, isPR: false },
        { id: 3, type: '3', weight: 10.0, reps: 8, completed: false, isPR: false },
      ],
    },
  ];

// Bodyweight exercises start at 0 kg; everything else at the empty bar.
const startingWeight = (item) => (/bodyweight|pull-up/i.test(item.equipment || '') ? 0 : 20);

function buildStarterWorkout() {
  return STARTER_TEMPLATE.map((ex) => {
    const last = WorkoutStore.getLastSessionForExercise(ex.exerciseId);
    if (!last) return ex;
    return {
      ...ex,
      sets: ex.sets.map((s) => ({ ...s, weight: last.bestSet.weight, reps: last.bestSet.reps })),
    };
  });
}

export function useWorkoutLogger(initialGoal = 'muscle_growth') {
  const [workoutTitle, setWorkoutTitle] = useState(
    initialGoal === 'strength'
      ? 'Raw Strength & Power Session (Chest & Back)'
      : 'Muscle Growth Session (Chest, Shoulders & Arms)'
  );

  const [exercises, setExercises] = useState(buildStarterWorkout);

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const currentFocusedExercise = exercises[activeExerciseIndex] || exercises[0];

  // Rest Timer state
  const [restSeconds, setRestSeconds] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isRestActive && restSeconds > 0) {
      timer = setInterval(() => setRestSeconds((s) => s - 1), 1000);
    } else if (restSeconds === 0 && isRestActive) {
      setIsRestActive(false);
      try {
        if (!getSettings().sound) return;
        const audio = new AudioContext();
        const osc = audio.createOscillator();
        osc.connect(audio.destination);
        osc.frequency.value = 600;
        osc.start();
        osc.stop(audio.currentTime + 0.2);
      } catch (e) {
        // audio fallback
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRestActive, restSeconds]);

  const triggerRestTimer = (sec = getSettings().restSeconds) => {
    setRestSeconds(sec);
    setIsRestActive(true);
  };

  const toggleSet = (exIndex, setIndex, onStartSession) => {
    if (onStartSession) onStartSession();
    setActiveExerciseIndex(exIndex);

    setExercises((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const targetSet = copy[exIndex].sets[setIndex];
      targetSet.completed = !targetSet.completed;

      if (targetSet.completed) {
        triggerRestTimer(getSettings().restSeconds);
        buzz();
        const isPR = WorkoutStore.checkIsPR(
          copy[exIndex].exerciseId,
          targetSet.weight,
          targetSet.reps
        );
        targetSet.isPR = isPR;

        if (isPR) {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10b981', '#3b82f6', '#f59e0b'],
          });
        }
      }
      return copy;
    });
  };

  const updateSet = (exIndex, setIndex, field, value) => {
    setExercises((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      // Keep values inside the cloud column limits (weight < 10,000 kg) and sane for a human lift.
      const limits = { weight: [0, 1000], reps: [0, 200] };
      const [min, max] = limits[field] || [0, Infinity];
      const n = Number(value);
      copy[exIndex].sets[setIndex][field] = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : 0;
      return copy;
    });
  };

  const addSet = (exIndex) => {
    setExercises((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const lastSet = copy[exIndex].sets[copy[exIndex].sets.length - 1];
      const newId = copy[exIndex].sets.length + 1;
      copy[exIndex].sets.push({
        id: newId,
        type: String(newId),
        weight: lastSet ? lastSet.weight : 20.0,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
        isPR: false,
      });
      return copy;
    });
  };

  const removeSet = (exIndex, setIndex) => {
    setExercises((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (copy[exIndex].sets.length > 1) {
        copy[exIndex].sets.splice(setIndex, 1);
      }
      return copy;
    });
  };

  const removeExercise = (exIndex) => {
    setExercises((prev) => {
      const copy = [...prev];
      copy.splice(exIndex, 1);
      return copy;
    });
    if (activeExerciseIndex >= exercises.length - 1) {
      setActiveExerciseIndex(0);
    }
  };

  /** Adds an exercise. `opts.sets` / `opts.reps` override the defaults; weights come from the last session. */
  const addExercise = (exerciseItem, opts = {}) => {
    const last = WorkoutStore.getLastSessionForExercise(exerciseItem.id);
    const weight = last ? last.bestSet.weight : startingWeight(exerciseItem);
    const reps = opts.reps || (last ? last.bestSet.reps : 10);
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: exerciseItem.id,
        exerciseName: exerciseItem.name,
        targetMuscle: exerciseItem.targetMuscle,
        equipment: exerciseItem.equipment,
        notes: exerciseItem.cue || 'Controlled tempo, focus on mind-muscle connection',
        growthFatigueScore: exerciseItem.growthFatigueScore,
        sets: Array.from({ length: opts.sets || 3 }, (_, i) => ({
          id: i + 1,
          type: String(i + 1),
          weight,
          reps,
          completed: false,
          isPR: false,
        })),
      },
    ]);
  };

  /** After saving: same exercises, fresh sets, weights pre-filled from the session just logged. */
  const startFreshWorkout = () => {
    setExercises((prev) =>
      prev.map((ex) => {
        const last = WorkoutStore.getLastSessionForExercise(ex.exerciseId);
        return {
          ...ex,
          sets: ex.sets.map((s) => ({
            ...s,
            completed: false,
            isPR: false,
            ...(last ? { weight: last.bestSet.weight, reps: last.bestSet.reps } : {}),
          })),
        };
      })
    );
    setActiveExerciseIndex(0);
    setIsRestActive(false);
    setRestSeconds(0);
  };

  /** Replaces the current workout with `items`: [{ item (library entry), sets, reps }]. */
  const loadPlan = (title, items) => {
    setWorkoutTitle(title);
    setActiveExerciseIndex(0);
    setExercises(
      items.map(({ item, sets, reps }) => {
        const last = WorkoutStore.getLastSessionForExercise(item.id);
        const weight = last ? last.bestSet.weight : startingWeight(item);
        return {
          exerciseId: item.id,
          exerciseName: item.name,
          targetMuscle: item.targetMuscle,
          equipment: item.equipment,
          notes: item.cue || 'Controlled tempo, focus on the target muscle',
          growthFatigueScore: item.growthFatigueScore,
          sets: Array.from({ length: sets }, (_, i) => ({
            id: i + 1,
            type: String(i + 1),
            weight,
            reps,
            completed: false,
            isPR: false,
          })),
        };
      })
    );
  };

  const resetAllSets = () => {
    setExercises((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.forEach((ex) => {
        ex.sets.forEach((s) => {
          s.completed = false;
          s.isPR = false;
        });
      });
      return copy;
    });
  };

  const stats = useMemo(() => workoutStats(exercises), [exercises]);

  return {
    workoutTitle,
    setWorkoutTitle,
    exercises,
    activeExerciseIndex,
    setActiveExerciseIndex,
    currentFocusedExercise,
    restSeconds,
    setRestSeconds,
    isRestActive,
    setIsRestActive,
    stats,
    toggleSet,
    updateSet,
    addSet,
    removeSet,
    removeExercise,
    addExercise,
    loadPlan,
    startFreshWorkout,
    resetAllSets,
  };
}
