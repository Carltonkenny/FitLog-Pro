import { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WorkoutStore } from '../../../lib/workoutStore';

export function useWorkoutLogger(initialGoal = 'muscle_growth') {
  const [workoutTitle, setWorkoutTitle] = useState(
    initialGoal === 'strength'
      ? 'Raw Strength & Power Session (Chest & Back)'
      : 'Muscle Growth Session (Chest, Shoulders & Arms)'
  );

  const [exercises, setExercises] = useState([
    {
      exerciseId: 'bench_press',
      exerciseName: 'Barbell Flat Bench Press',
      targetMuscle: 'Chest (Pecs)',
      equipment: 'Barbell',
      notes: 'Pinch shoulder blades into bench, 1s controlled pause at mid-chest',
      growthFatigueScore: 8.8,
      sets: [
        { id: 1, type: 'W', weight: 30.0, reps: 10, completed: true, isPR: false },
        { id: 2, type: '1', weight: 40.0, reps: 10, completed: true, isPR: false },
        { id: 3, type: '2', weight: 40.0, reps: 10, completed: true, isPR: false },
        { id: 4, type: '3', weight: 42.5, reps: 8, completed: false, isPR: true },
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
        { id: 1, type: '1', weight: 35.0, reps: 12, completed: true, isPR: false },
        { id: 2, type: '2', weight: 35.0, reps: 12, completed: true, isPR: false },
        { id: 3, type: '3', weight: 37.5, reps: 10, completed: false, isPR: true },
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
        { id: 1, type: '1', weight: 8.0, reps: 10, completed: true, isPR: false },
        { id: 2, type: '2', weight: 8.0, reps: 10, completed: false, isPR: false },
        { id: 3, type: '3', weight: 10.0, reps: 8, completed: false, isPR: true },
      ],
    },
  ]);

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

  const triggerRestTimer = (sec = 90) => {
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
        triggerRestTimer(90);
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

  const addExercise = (exerciseItem) => {
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: exerciseItem.id,
        exerciseName: exerciseItem.name,
        targetMuscle: exerciseItem.targetMuscle,
        equipment: exerciseItem.equipment,
        notes: exerciseItem.cue || 'Controlled tempo, focus on mind-muscle connection',
        growthFatigueScore: exerciseItem.growthFatigueScore,
        sets: [
          { id: 1, type: '1', weight: 20.0, reps: 10, completed: false, isPR: false },
          { id: 2, type: '2', weight: 20.0, reps: 10, completed: false, isPR: false },
          { id: 3, type: '3', weight: 20.0, reps: 10, completed: false, isPR: false },
        ],
      },
    ]);
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

  const stats = useMemo(() => {
    let volume = 0;
    let completedSetsCount = 0;
    let totalSetsCount = 0;

    exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        totalSetsCount++;
        if (s.completed && s.weight > 0 && s.reps > 0) {
          volume += s.weight * s.reps;
          completedSetsCount++;
        }
      });
    });

    return {
      volume,
      completedSetsCount,
      totalSetsCount,
      progressPercent: totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0,
    };
  }, [exercises]);

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
    resetAllSets,
  };
}
