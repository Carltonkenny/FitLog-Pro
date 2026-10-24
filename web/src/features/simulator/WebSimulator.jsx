import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Minus,
  CheckCircle2,
  Flame,
  Sparkles,
  ArrowLeft,
  Settings,
  X,
  Save,
  Check,
  History,
  TrendingUp,
  Award,
  ChevronRight,
  Clock,
  Trash2,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  EXERCISE_LIBRARY,
  WorkoutStore,
  calculate1RM,
} from '../../lib/workoutStore';

export default function WebSimulator({ blueprint, session, onBack, onUpdateBlueprint }) {
  // Navigation inside the app: 'active_workout', 'workout_summary', 'history', 'settings'
  const [subView, setSubView] = useState('active_workout');

  // Exercise Picker Modal state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Active workout state
  const [workoutTitle, setWorkoutTitle] = useState('Chest & Back Hypertrophy');
  const [exercises, setExercises] = useState([
    {
      exerciseId: 'bench_press',
      exerciseName: 'Barbell Bench Press',
      targetMuscle: 'Chest',
      sets: [
        { id: 1, weight: 40.0, reps: 10, completed: true, isPR: false },
        { id: 2, weight: 40.0, reps: 10, completed: true, isPR: false },
        { id: 3, weight: 40.0, reps: 11, completed: false, isPR: true },
      ],
    },
    {
      exerciseId: 'lat_pulldown',
      exerciseName: 'Lat Pulldown',
      targetMuscle: 'Back',
      sets: [
        { id: 1, weight: 35.0, reps: 12, completed: true, isPR: false },
        { id: 2, weight: 37.5, reps: 10, completed: false, isPR: true },
      ],
    },
    {
      exerciseId: 'bicep_curls',
      exerciseName: 'Dumbbell Bicep Curl',
      targetMuscle: 'Arms',
      sets: [
        { id: 1, weight: 8.0, reps: 10, completed: false, isPR: false },
        { id: 2, weight: 8.0, reps: 10, completed: false, isPR: false },
      ],
    },
  ]);

  // Timers
  const [elapsedSeconds, setElapsedSeconds] = useState(1320); // 22 mins
  const [restSeconds, setRestSeconds] = useState(90);
  const [restRunning, setRestRunning] = useState(false);

  // Completed workout summary cache
  const [lastFinishedWorkout, setLastFinishedWorkout] = useState(null);

  // History state
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    setHistoryList(WorkoutStore.getHistory());
  }, [subView]);

  // Elapsed & Rest Timers
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      if (restRunning && restSeconds > 0) {
        setRestSeconds((r) => r - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [restRunning, restSeconds]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle set completion and trigger live PR check & rest timer
  const toggleSet = (exIndex, setIndex) => {
    const updated = [...exercises];
    const targetSet = updated[exIndex].sets[setIndex];
    const nextCompleted = !targetSet.completed;
    targetSet.completed = nextCompleted;

    if (nextCompleted) {
      // Trigger rest timer
      setRestSeconds(90);
      setRestRunning(true);

      // Check for PR
      const isPR = WorkoutStore.checkIsPR(
        updated[exIndex].exerciseId,
        targetSet.weight,
        targetSet.reps
      );
      if (isPR) {
        targetSet.isPR = true;
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#00F59B', '#00D4FF', '#FFD026'],
        });
      }
    }

    setExercises(updated);
  };

  // Quick weight adjustment for a set
  const adjustWeight = (exIndex, setIndex, delta) => {
    const updated = [...exercises];
    const target = updated[exIndex].sets[setIndex];
    target.weight = Math.max(0, Math.round((target.weight + delta) * 10) / 10);
    target.isPR = WorkoutStore.checkIsPR(
      updated[exIndex].exerciseId,
      target.weight,
      target.reps
    );
    setExercises(updated);
  };

  // Quick reps adjustment for a set
  const adjustReps = (exIndex, setIndex, delta) => {
    const updated = [...exercises];
    const target = updated[exIndex].sets[setIndex];
    target.reps = Math.max(1, target.reps + delta);
    target.isPR = WorkoutStore.checkIsPR(
      updated[exIndex].exerciseId,
      target.weight,
      target.reps
    );
    setExercises(updated);
  };

  // Add set to an exercise
  const addSet = (exIndex) => {
    const updated = [...exercises];
    const currentSets = updated[exIndex].sets;
    const last = currentSets[currentSets.length - 1] || { weight: 20, reps: 10 };
    currentSets.push({
      id: currentSets.length + 1,
      weight: last.weight,
      reps: last.reps,
      completed: false,
      isPR: WorkoutStore.checkIsPR(updated[exIndex].exerciseId, last.weight, last.reps),
    });
    setExercises(updated);
  };

  // Remove exercise from workout
  const removeExercise = (exIndex) => {
    setExercises((prev) => prev.filter((_, idx) => idx !== exIndex));
  };

  // Add new exercise from library modal
  const handlePickExercise = (ex) => {
    // Check if already in workout
    if (exercises.some((e) => e.exerciseId === ex.id)) {
      setIsPickerOpen(false);
      return;
    }
    const lastSession = WorkoutStore.getLastSessionForExercise(ex.id);
    const initialWeight = lastSession?.bestSet?.weight || 20.0;
    const initialReps = lastSession?.bestSet?.reps || 10;

    setExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetMuscle: ex.muscle,
        sets: [
          { id: 1, weight: initialWeight, reps: initialReps, completed: false, isPR: false },
          { id: 2, weight: initialWeight, reps: initialReps, completed: false, isPR: false },
          { id: 3, weight: initialWeight, reps: initialReps, completed: false, isPR: false },
        ],
      },
    ]);
    setIsPickerOpen(false);
  };

  // Finish Workout
  const handleFinishWorkout = () => {
    const totalCompleted = exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    );
    const volume = exercises.reduce((acc, ex) => {
      return (
        acc +
        ex.sets
          .filter((s) => s.completed)
          .reduce((sum, s) => sum + s.weight * s.reps, 0)
      );
    }, 0);

    const result = WorkoutStore.saveWorkout({
      title: workoutTitle,
      volumeKg: volume,
      durationSeconds: elapsedSeconds,
      exercises: exercises,
    });

    setLastFinishedWorkout({
      ...result.savedRecord,
      newPRsFound: result.newPRsFound,
      totalCompletedSets: totalCompleted,
    });

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#00F59B', '#00D4FF', '#FFD026'],
    });

    setSubView('workout_summary');
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] p-3 sm:p-6 flex flex-col items-center justify-center font-['Inter']">
      <div className="w-full max-w-xl rounded-2xl bg-[#12141A] border border-[#242836] p-4 sm:p-6 shadow-2xl flex flex-col space-y-4 relative">
        
        {/* Top App Bar with Navigation Pills */}
        <div className="flex items-center justify-between border-b border-[#242836] pb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Landing</span>
          </button>

          {/* Subview Pills */}
          <div className="flex items-center gap-1 bg-[#181B26] p-1 rounded-xl border border-[#262C3D]">
            <button
              onClick={() => setSubView('active_workout')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                subView === 'active_workout'
                  ? 'bg-[#00F59B] text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Workout
            </button>
            <button
              onClick={() => setSubView('history')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                subView === 'history'
                  ? 'bg-[#00F59B] text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              History
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00F59B] animate-pulse" />
            <span className="font-mono text-[11px] text-[#00F59B] font-bold hidden sm:inline">
              LIVE DIARY
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: ACTIVE WORKOUT LOGGER (THE REAL GYM DIARY) */}
        {/* ========================================================================= */}
        {subView === 'active_workout' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Header: Session Title & Rest Timer */}
            <div className="flex items-center justify-between bg-[#161822] p-3 rounded-xl border border-[#262C3D]">
              <div>
                <input
                  type="text"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  className="bg-transparent text-white font-['Outfit'] font-black text-lg outline-none w-full"
                />
                <span className="text-[11px] font-mono text-[#00D4FF]">
                  Elapsed: {formatTimer(elapsedSeconds)}
                </span>
              </div>

              {/* Live Rest Timer */}
              <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-[#101218] border border-[#2A3144]">
                <Clock className="w-4 h-4 text-[#00D4FF]" />
                <div className="text-right">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">Rest</span>
                  <span className="font-mono text-base font-bold text-[#00D4FF] tabular-nums leading-none">
                    {formatTimer(restSeconds)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 ml-1">
                  <button
                    onClick={() => setRestSeconds((r) => r + 30)}
                    className="px-1 py-0.2 rounded bg-[#1C202B] text-[8px] font-mono text-slate-300"
                  >
                    +30
                  </button>
                  <button
                    onClick={() => setRestSeconds((r) => Math.max(0, r - 15))}
                    className="px-1 py-0.2 rounded bg-[#1C202B] text-[8px] font-mono text-slate-300"
                  >
                    -15
                  </button>
                </div>
              </div>
            </div>

            {/* List of Exercises in Today's Workout */}
            <div className="space-y-4">
              {exercises.map((ex, exIdx) => {
                const lastSession = WorkoutStore.getLastSessionForExercise(ex.exerciseId);
                const nextTarget = WorkoutStore.getNextSessionTarget(
                  ex.exerciseId,
                  lastSession?.bestSet?.weight,
                  lastSession?.bestSet?.reps
                );

                return (
                  <div
                    key={ex.exerciseId}
                    className="rounded-2xl bg-[#14161E] border border-[#242836] p-4 space-y-3"
                  >
                    {/* Exercise Header & Progress Target Pill */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-['Outfit'] font-extrabold text-base text-white">
                            {ex.exerciseName}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1C202B] text-slate-400">
                            {ex.targetMuscle}
                          </span>
                        </div>

                        {/* Session-to-Session Comparison Bar (THE CORE PROBLEM SOLVED) */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-mono">
                          <span className="text-slate-400">
                            Last: <strong className="text-white">{lastSession?.bestSet ? `${lastSession.bestSet.weight} kg × ${lastSession.bestSet.reps}` : 'None logged'}</strong>
                          </span>
                          <span className="text-slate-600">→</span>
                          <span className="text-[#00F59B] bg-[#00F59B]/10 px-2 py-0.5 rounded border border-[#00F59B]/25">
                            {nextTarget}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeExercise(exIdx)}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                        title="Remove exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sets Table */}
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-12 text-[10px] font-mono uppercase text-slate-500 px-2">
                        <span className="col-span-1">#</span>
                        <span className="col-span-5">Weight (kg)</span>
                        <span className="col-span-4">Reps</span>
                        <span className="col-span-2 text-right">Log</span>
                      </div>

                      {ex.sets.map((set, setIdx) => (
                        <div
                          key={set.id}
                          className={`grid grid-cols-12 items-center p-2 rounded-xl border transition-all ${
                            set.completed
                              ? 'bg-[#00F59B]/10 border-[#00F59B]/40 text-white'
                              : 'bg-[#181A24] border-[#222533] text-slate-300'
                          }`}
                        >
                          <span className="col-span-1 font-mono font-bold text-xs">{set.id}</span>
                          
                          {/* Weight Stepper */}
                          <div className="col-span-5 flex items-center gap-1.5">
                            <button
                              onClick={() => adjustWeight(exIdx, setIdx, -2.5)}
                              className="w-6 h-6 rounded bg-[#202433] hover:bg-[#2A3044] text-xs font-mono flex items-center justify-center text-slate-300"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs font-bold text-[#00D4FF] tabular-nums">
                              {set.weight} kg
                            </span>
                            <button
                              onClick={() => adjustWeight(exIdx, setIdx, 2.5)}
                              className="w-6 h-6 rounded bg-[#202433] hover:bg-[#2A3044] text-xs font-mono flex items-center justify-center text-slate-300"
                            >
                              +
                            </button>
                          </div>

                          {/* Reps Stepper */}
                          <div className="col-span-4 flex items-center gap-1.5">
                            <button
                              onClick={() => adjustReps(exIdx, setIdx, -1)}
                              className="w-6 h-6 rounded bg-[#202433] hover:bg-[#2A3044] text-xs font-mono flex items-center justify-center text-slate-300"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs font-bold text-white tabular-nums">
                              {set.reps}
                            </span>
                            <button
                              onClick={() => adjustReps(exIdx, setIdx, 1)}
                              className="w-6 h-6 rounded bg-[#202433] hover:bg-[#2A3044] text-xs font-mono flex items-center justify-center text-slate-300"
                            >
                              +
                            </button>
                            {set.isPR && (
                              <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-[#FFD026]/10 text-[#FFD026] border border-[#FFD026]/30 ml-1">
                                PR
                              </span>
                            )}
                          </div>

                          {/* Checkmark Button */}
                          <div className="col-span-2 flex justify-end">
                            <button
                              onClick={() => toggleSet(exIdx, setIdx)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                set.completed
                                  ? 'bg-[#00F59B] text-black shadow-md shadow-[#00F59B]/25'
                                  : 'border border-slate-600 hover:border-slate-400'
                              }`}
                            >
                              {set.completed && <Check className="w-4 h-4 stroke-[3]" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Set Button */}
                    <button
                      onClick={() => addSet(exIdx)}
                      className="w-full py-2 rounded-xl bg-[#1A1D27] hover:bg-[#222736] border border-[#282E40] text-slate-400 hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#00F59B]" />
                      <span>Add Set</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions: Add Exercise & Finish Workout */}
            <div className="space-y-3 pt-2">
              <button
                id="workout-add-exercise-btn"
                onClick={() => setIsPickerOpen(true)}
                className="w-full py-3 rounded-xl bg-[#181B26] hover:bg-[#222738] border border-[#2B3145] text-slate-200 font-bold text-xs uppercase font-mono flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4 text-[#00D4FF]" />
                <span>+ Add Exercise to Workout</span>
              </button>

              <button
                id="workout-finish-btn"
                onClick={handleFinishWorkout}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00F59B] to-[#00D485] hover:opacity-95 text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#00F59B]/20 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-black" />
                <span>Finish Workout & Log Progress</span>
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: POST-WORKOUT PROGRESSION SUMMARY (THE CORE PROOF) */}
        {/* ========================================================================= */}
        {subView === 'workout_summary' && lastFinishedWorkout && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center mx-auto text-[#00F59B] mb-2">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white font-['Outfit']">Workout Logged!</h3>
              <p className="text-xs text-slate-400 font-mono">
                {lastFinishedWorkout.totalCompletedSets} sets completed • {lastFinishedWorkout.volumeKg.toLocaleString()} kg total volume
              </p>
            </div>

            {/* PRs Achieved Alert */}
            {lastFinishedWorkout.newPRsFound && lastFinishedWorkout.newPRsFound.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#FFD026]/10 border border-[#FFD026]/30 space-y-1">
                <span className="text-xs font-mono font-bold text-[#FFD026] flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>NEW PERSONAL RECORDS CRUSHED TODAY:</span>
                </span>
                <div className="space-y-1 pt-1">
                  {lastFinishedWorkout.newPRsFound.map((pr, i) => (
                    <div key={i} className="text-xs text-white flex justify-between font-mono">
                      <span>{pr.exerciseName}</span>
                      <strong className="text-[#FFD026]">{pr.weight} kg × {pr.reps} (1RM: {pr.oneRepMax} kg)</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Next Session Progression Matrix */}
            <div className="rounded-xl bg-[#14161E] border border-[#242836] p-4 space-y-3">
              <span className="text-xs font-mono uppercase text-slate-300 font-bold block border-b border-[#222533] pb-2">
                Your Next Session Progression Targets:
              </span>

              <div className="space-y-2">
                {lastFinishedWorkout.exercises.map((ex) => {
                  const completed = ex.sets.filter((s) => s.completed);
                  const best = completed.length > 0 ? completed[completed.length - 1] : ex.sets[0];
                  const nextAim = WorkoutStore.getNextSessionTarget(ex.exerciseId, best.weight, best.reps);

                  return (
                    <div key={ex.exerciseId} className="p-2.5 rounded-lg bg-[#181A24] border border-[#222533] text-xs">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-white font-['Outfit']">{ex.exerciseName}</span>
                        <span className="font-mono text-slate-400">Done: {best.weight} kg × {best.reps}</span>
                      </div>
                      <div className="text-[#00F59B] font-mono text-[11px] font-semibold flex items-center gap-1">
                        <span>→</span>
                        <span>{nextAim}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setSubView('active_workout')}
              className="w-full py-3.5 rounded-xl bg-[#00F59B] text-black font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              Start New Workout Session
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: HISTORICAL SESSIONS & COMPARISONS */}
        {/* ========================================================================= */}
        {subView === 'history' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                Logged Workout History ({historyList.length})
              </span>
              <button
                onClick={() => setSubView('active_workout')}
                className="text-xs font-mono text-[#00F59B] hover:underline"
              >
                + Back to Active Workout
              </button>
            </div>

            <div className="space-y-3">
              {historyList.map((wo) => (
                <div key={wo.id} className="p-4 rounded-xl bg-[#161822] border border-[#242836] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#222533] pb-2">
                    <div>
                      <span className="font-bold text-sm text-white font-['Outfit'] block">{wo.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">{wo.date}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#00D4FF]">
                      {wo.volumeKg.toLocaleString()} kg
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    {wo.exercises.map((e, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300">
                        <span>{e.exerciseName}</span>
                        <span className="text-slate-400">
                          {e.sets.filter((s) => s.completed).length} sets ({e.sets[0]?.weight} kg)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EXERCISE PICKER MODAL */}
        {/* ========================================================================= */}
        {isPickerOpen && (
          <div className="absolute inset-0 bg-[#0E1015]/95 rounded-2xl p-4 z-30 flex flex-col justify-between border border-[#2E354A] animate-fadeIn">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#242836] pb-2">
                <span className="font-bold text-sm text-white font-['Outfit']">Add Exercise to Session</span>
                <button onClick={() => setIsPickerOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Bench, Lat Pulldown, Curls..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#161822] border border-[#262C3D] text-white text-xs outline-none focus:border-[#00F59B]"
                />
              </div>

              {/* Exercise Items */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {EXERCISE_LIBRARY.filter((ex) =>
                  ex.name.toLowerCase().includes(pickerSearch.toLowerCase())
                ).map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => handlePickExercise(ex)}
                    className="p-2.5 rounded-xl bg-[#161822] border border-[#222533] hover:border-[#00F59B]/50 hover:bg-[#1C202B] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-xs text-white block">{ex.name}</span>
                      <span className="text-[10px] font-mono text-[#00D4FF]">{ex.muscle} • {ex.category}</span>
                    </div>
                    <Plus className="w-4 h-4 text-[#00F59B]" />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsPickerOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#1A1D27] text-slate-400 text-xs font-mono"
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
