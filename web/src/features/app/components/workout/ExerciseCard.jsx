import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { WorkoutStore } from '../../../../lib/workoutStore';
import SetRow from './SetRow';

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
  const lastSession = WorkoutStore.getLastSessionForExercise(exercise.exerciseId);

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
        <div>
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
              <span className="ml-2 text-zinc-500 font-mono">
                • Growth Score: {exercise.growthFatigueScore}/10
              </span>
            )}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveExercise(exIndex);
          }}
          className="text-zinc-500 hover:text-red-400 p-1 transition"
          title="Remove Exercise"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Previous Session Delta Proof */}
      {lastSession && (
        <div className="px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-white/[0.05] text-[11px] text-zinc-400 flex items-center justify-between">
          <span>
            Last Session: <strong className="text-zinc-200">{lastSession.bestSet.weight} kg × {lastSession.bestSet.reps} reps</strong>
          </span>
          <span className="text-emerald-400 font-medium">
            {WorkoutStore.getNextSessionTarget(
              exercise.exerciseId,
              lastSession.bestSet.weight,
              lastSession.bestSet.reps
            )}
          </span>
        </div>
      )}

      {/* Sets Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-zinc-500 uppercase tracking-wider font-mono text-[10px] border-b border-white/[0.06]">
              <th className="pb-2 w-12 text-center">Set</th>
              <th className="pb-2 w-28">Weight (kg)</th>
              <th className="pb-2 w-24">Reps</th>
              <th className="pb-2 text-right pr-2">Done</th>
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
          onClick={(e) => {
            e.stopPropagation();
            onAddSet(exIndex);
          }}
          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium py-1 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Set</span>
        </button>

        <span className="text-[11px] text-zinc-500 max-w-xs truncate">
          {exercise.notes}
        </span>
      </div>
    </div>
  );
}
