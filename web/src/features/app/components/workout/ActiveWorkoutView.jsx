import React from 'react';
import {
  Clock,
  Zap,
  Calculator,
  Plus,
  Pencil,
  CheckCircle2,
  Trash2,
  Dumbbell,
  Sparkles,
} from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import RoutinesBar from './RoutinesBar';
import WalkthroughCard from './WalkthroughCard';
import { EXERCISE_LIBRARY } from '../../../../lib/exercises.js';
import { formatWeight, useSettings } from '../../../../lib/settings';

const PRESET_TITLES = ['Push A', 'Pull A', 'Legs A', 'Upper 1', 'Lower 1', 'Full Body'];

export default function ActiveWorkoutView({
  workoutTitle,
  setWorkoutTitle,
  sessionSeconds,
  formatTimer,
  volume,
  showWalkthrough,
  onDismissWalkthrough,
  exercises,
  activeExerciseIndex,
  setActiveExerciseIndex,
  layoutMode,
  setMobileDrawerOpen,
  onOpenCoach,
  onLoadRoutine,
  isRestActive,
  restSeconds,
  setRestSeconds,
  setIsRestActive,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleSet,
  onOpenPicker,
  onFinishWorkout,
  onDiscardWorkout,
  canFinish,
}) {
  const { unit } = useSettings();

  const starterRoutines = [
    {
      title: 'Push Day (Chest, Shoulders & Triceps)',
      items: [
        { item: EXERCISE_LIBRARY.find((e) => e.id === 'bench_press') || EXERCISE_LIBRARY[0], sets: 3, reps: 10 },
        { item: EXERCISE_LIBRARY.find((e) => e.id === 'incline_dumbbell_press') || EXERCISE_LIBRARY[1], sets: 3, reps: 10 },
        { item: EXERCISE_LIBRARY.find((e) => e.id === 'lateral_raises') || EXERCISE_LIBRARY[2], sets: 3, reps: 12 },
      ],
    },
    {
      title: 'Pull Day (Back & Biceps)',
      items: [
        { item: EXERCISE_LIBRARY.find((e) => e.id === 'lat_pulldown') || EXERCISE_LIBRARY[0], sets: 3, reps: 10 },
        { item: EXERCISE_LIBRARY.find((e) => e.id === 'bicep_curls') || EXERCISE_LIBRARY[1], sets: 3, reps: 10 },
        { item: EXERCISE_LIBRARY.find((e) => e.id === 'cable_face_pulls') || EXERCISE_LIBRARY[2], sets: 3, reps: 12 },
      ],
    },
    {
      title: 'Leg Day (Quads & Hamstrings)',
      items: [
        { item: EXERCISE_LIBRARY.find((e) => e.id === 'squat') || EXERCISE_LIBRARY[0], sets: 3, reps: 8 },
        { item: EXERCISE_LIBRARY.find((e) => e.id === 'leg_press') || EXERCISE_LIBRARY[1], sets: 3, reps: 10 },
        { item: EXERCISE_LIBRARY.find((e) => e.id === 'romanian_deadlift') || EXERCISE_LIBRARY[2], sets: 3, reps: 10 },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Walkthrough Carousel (Dismissable, stored in localStorage) */}
      {showWalkthrough && <WalkthroughCard onDismiss={onDismissWalkthrough} />}

      {/* 2. Saved Routines Bar */}
      <RoutinesBar exercises={exercises} onLoad={onLoadRoutine} />

      {/* 3. Workout Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 group">
            <input
              type="text"
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
              aria-label="Workout name"
              className="flex-1 min-h-11 text-base sm:text-lg md:text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 focus:outline-none transition"
            />
            <Pencil className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 pointer-events-none transition shrink-0" aria-hidden="true" />
          </div>

          {/* Quick preset tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-1 -mx-1 px-1 no-scrollbar">
            {PRESET_TITLES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setWorkoutTitle(t)}
                className={`text-[11px] px-2.5 py-0.5 rounded-full border transition active:scale-95 shrink-0 ${
                  workoutTitle === t
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                    : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-white/[0.08]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2">
            <span className="flex items-center gap-1.5 font-mono tabular-nums text-emerald-300/90 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {formatTimer(sessionSeconds)}
            </span>
            <span className="flex items-center gap-1.5 font-mono tabular-nums text-amber-300/90 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {formatWeight(volume, unit)} total lifted
            </span>
          </div>
        </div>

        {/* Mobile Drawer Trigger (Mobile view only) */}
        {layoutMode === 'mobile' && (
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-4 min-h-10 rounded-lg bg-zinc-900 border border-white/[0.1] text-emerald-400 hover:bg-zinc-800 transition active:scale-95"
          >
            <Calculator className="w-4 h-4" />
            <span>Plate Loader & Coach</span>
          </button>
        )}
      </div>

      {/* 4. Dynamic Rest Timer Bar */}
      {isRestActive && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-lg shadow-emerald-950/30 text-xs backdrop-blur-sm animate-popIn">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-200 font-medium">Rest interval:</span>
            <span className="font-mono text-emerald-300 font-bold tabular-nums text-base">
              {restSeconds}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestSeconds((s) => s + 30)}
              className="px-3 min-h-10 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 text-zinc-100 font-semibold transition"
            >
              +30s
            </button>
            <button
              onClick={() => setIsRestActive(false)}
              className="px-3 min-h-10 rounded-xl bg-red-500/20 hover:bg-red-500/30 active:scale-95 text-red-200 font-semibold border border-red-500/30 transition"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* 5. Clean Slate Empty State OR Exercises Cards List */}
      {exercises.length === 0 ? (
        <div className="p-8 rounded-2xl bg-zinc-900/60 border border-dashed border-white/[0.12] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Start an Empty Workout</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Add the exercises you want to perform today, or pick one of the quick starter routines below.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onOpenPicker}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition active:scale-95 shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Exercises</span>
            </button>
            <button
              type="button"
              onClick={onOpenCoach}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-semibold text-xs border border-white/[0.08] transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Ask Coach for a Plan</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <span className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Or pick a starter routine:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {starterRoutines.map((r) => (
                <button
                  key={r.title}
                  type="button"
                  onClick={() => onLoadRoutine(r.title, r.items)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white transition active:scale-95"
                >
                  {r.title.split(' ')[0]} Day
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {exercises.map((exercise, exIndex) => (
            <ExerciseCard
              key={exercise.exerciseId + exIndex}
              exercise={exercise}
              exIndex={exIndex}
              isFocused={activeExerciseIndex === exIndex}
              onFocus={() => setActiveExerciseIndex(exIndex)}
              onRemoveExercise={onRemoveExercise}
              onAddSet={onAddSet}
              onRemoveSet={onRemoveSet}
              onUpdateSet={onUpdateSet}
              onToggleSet={onToggleSet}
            />
          ))}

          {/* Add Exercise Button */}
          <div className="pt-1">
            <button
              onClick={onOpenPicker}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-zinc-900 to-cyan-500/10 border border-dashed border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add exercise ({EXERCISE_LIBRARY.length} to choose from)</span>
            </button>
          </div>

          {/* Bottom Thumb-Zone Session Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onDiscardWorkout}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Discard Workout</span>
            </button>

            <button
              type="button"
              onClick={onFinishWorkout}
              disabled={!canFinish}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition active:scale-95 shadow-md ${
                canFinish
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>Finish Workout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
