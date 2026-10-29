import React from 'react';
import {
  Sparkles,
  X,
  Clock,
  Zap,
  Calculator,
  Plus,
} from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import RoutinesBar from './RoutinesBar';
import { EXERCISE_LIBRARY } from '../../../../lib/exercises.js';
import { formatWeight, useSettings } from '../../../../lib/settings';

export default function ActiveWorkoutView({
  workoutTitle,
  setWorkoutTitle,
  sessionSeconds,
  formatTimer,
  volume,
  showAiSuggestion,
  setShowAiSuggestion,
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
}) {
  const { unit } = useSettings();
  return (
    <div className="space-y-6">
      {/* Optional AI Onboarding Suggestion Pop-up */}
      {showAiSuggestion && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-cyan-950/30 border border-emerald-500/30 p-4 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">Starter session: push day</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Edit the weights and reps, add or remove exercises, and tick sets off as you go. Want a plan built for
                  your goal and history? Ask the AI coach.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenCoach}
                    className="text-xs font-semibold px-4 min-h-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                  >
                    Ask the AI coach
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAiSuggestion(false)}
                    className="text-xs font-medium px-4 min-h-10 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200"
                  >
                    Keep this session
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setShowAiSuggestion(false)}
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <RoutinesBar exercises={exercises} onLoad={onLoadRoutine} />

      {/* Workout Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={workoutTitle}
            onChange={(e) => setWorkoutTitle(e.target.value)}
            aria-label="Workout name" className="w-full min-h-11 text-base sm:text-lg md:text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 transition"
          />
          <div className="flex items-center gap-4 text-xs text-zinc-400 mt-1">
            <span className="flex items-center gap-1 font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {formatTimer(sessionSeconds)}
            </span>
            <span className="flex items-center gap-1 font-mono tabular-nums">
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

      {/* Dynamic Rest Timer Bar */}
      {isRestActive && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="text-zinc-200 font-medium">Rest Interval Active:</span>
            <span className="font-mono text-emerald-300 font-bold tabular-nums text-sm">
              {restSeconds}s remaining
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestSeconds((s) => s + 30)}
              className="px-3 min-h-10 rounded-lg bg-white/[0.06] text-zinc-200 hover:text-white"
            >
              +30s
            </button>
            <button
              onClick={() => setIsRestActive(false)}
              className="px-3 min-h-10 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Exercises Cards List */}
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
      </div>

      {/* Add Exercise Button */}
      <div className="pt-2">
        <button
          onClick={onOpenPicker}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-zinc-900 to-cyan-500/10 border border-dashed border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add exercise ({EXERCISE_LIBRARY.length} to choose from)</span>
        </button>
      </div>
    </div>
  );
}
