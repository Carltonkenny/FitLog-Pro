import React from 'react';
import { Trash2, Plus, Ghost, Zap } from 'lucide-react';
import { WorkoutStore } from '../../../../lib/workoutStore';
import { calculate1RM } from '../../../../lib/exercises.js';
import SetRow from './SetRow';
import ExerciseImage from '../../../../components/ExerciseImage';
import { formatWeight, useSettings } from '../../../../lib/settings';

export default function ExerciseCard({
  exercise,
  exIndex,
  isFocused,
  onFocus,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleSet,
}) {
  const { unit } = useSettings();
  const lastSession = WorkoutStore.getLastSessionForExercise(exercise.exerciseId);

  const ghost = lastSession?.bestSet;
  const ghost1RM = ghost ? calculate1RM(ghost.weight, ghost.reps) : 0;

  // Find if current completed sets beat the ghost
  const currentBestCompleted = (exercise.sets || [])
    .filter((s) => s.completed && Number(s.weight) > 0 && Number(s.reps) > 0)
    .reduce(
      (best, s) => {
        const e1rm = calculate1RM(s.weight, s.reps);
        return e1rm > best.e1rm ? { ...s, e1rm } : best;
      },
      { e1rm: 0, weight: 0, reps: 0 }
    );

  const isGhostDefeated = ghost1RM > 0 && currentBestCompleted.e1rm > ghost1RM;
  const e1rmDelta = isGhostDefeated ? (currentBestCompleted.e1rm - ghost1RM).toFixed(1) : 0;

  return (
    <div
      onClick={onFocus}
      className={`rounded-2xl transition-all duration-200 border ${
        isFocused
          ? 'bg-[#12141a] border-emerald-500/30 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/20'
          : 'bg-[#0f1115] border-white/[0.06] hover:border-white/[0.12]'
      } p-4 md:p-5 space-y-4`}
    >
      {/* Exercise Header */}
      <div className="flex items-start justify-between gap-3">
        <ExerciseImage id={exercise.exerciseId} name={exercise.exerciseName} equipment={exercise.equipment} size={48} hideIfMissing={false} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base tracking-tight">
              {exercise.exerciseName}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/[0.05]">
              {exercise.equipment}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Target: <span className="text-emerald-400">{exercise.targetMuscle}</span>
            {exercise.growthFatigueScore && (
              <span className="ml-2 text-zinc-400 font-mono">
                • Growth Score: {exercise.growthFatigueScore}/10
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          aria-label={`Remove ${exercise.exerciseName}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemoveExercise(exIndex);
          }}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/[0.05] transition"
          title="Remove Exercise"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Previous Session Delta Proof / Beat Your Ghost */}
      {ghost && (
        isGhostDefeated ? (
          <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-950/40 via-emerald-950/30 to-zinc-900/60 border border-emerald-500/40 text-xs flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/20 animate-pulse" />
              <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
                Ghost Defeated!
              </span>
              <span className="text-zinc-300 text-[11px] hidden sm:inline">
                {formatWeight(currentBestCompleted.weight, unit)} × {currentBestCompleted.reps} (e1RM: {currentBestCompleted.e1rm} kg)
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              +{e1rmDelta} kg 1RM
            </span>
          </div>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/[0.06] text-[11px] text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <Ghost className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>
                Ghost: <strong className="text-zinc-200">{formatWeight(ghost.weight ?? 0, unit)} × {ghost.reps ?? 0}</strong> ({ghost1RM} kg 1RM)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
              <span>🎯 Target:</span>
              <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-500/20 font-mono">
                {WorkoutStore.getNextSessionTarget(exercise.exerciseId, ghost.weight ?? 0, ghost.reps ?? 0, unit)}
              </span>
            </div>
          </div>
        )
      )}

      {/* Sets Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[280px]">
          <thead>
            <tr className="text-zinc-400 uppercase tracking-wider font-mono text-[10px] border-b border-white/[0.06]">
              <th className="pb-2 w-12 text-center">Set</th>
              <th className="pb-2 w-28">Weight ({unit})</th>
              <th className="pb-2 w-24">Reps</th>
              <th className="pb-2 text-right pr-2 min-w-[3.5rem]">Done</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {exercise.sets.map((set, setIndex) => (
              <SetRow
                key={set.id}
                set={set}
                exIndex={exIndex}
                setIndex={setIndex}
                onUpdateSet={onUpdateSet}
                onToggleSet={onToggleSet}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Bar: Add Set & Form Cue */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          aria-label={`Add set to ${exercise.exerciseName}`}
          onClick={(e) => {
            e.stopPropagation();
            onAddSet(exIndex);
          }}
          className="flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200 font-medium min-h-10 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Set</span>
        </button>

        <span className="text-[11px] text-zinc-400 max-w-xs truncate">
          {exercise.notes}
        </span>
      </div>
    </div>
  );
}
