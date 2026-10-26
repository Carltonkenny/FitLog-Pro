import React from 'react';
import { Calendar, Clock, History as HistoryIcon } from 'lucide-react';
import { WorkoutStore } from '../../../../lib/workoutStore';
import { formatWeight, useSettings } from '../../../../lib/settings';
import { formatWorkoutDate } from '../../../../lib/stats';
import PetAvatar from '../../../companion/PetAvatar';
import { petMood } from '../../../../lib/companionActions.js';
import { useUserData } from '../../../../lib/userData.js';

export default function HistoryView({ onOpenCompanion }) {
  const { unit } = useSettings();
  const { memory } = useUserData();
  const history = WorkoutStore.getHistory();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">History</h2>
        <p className="text-xs text-zinc-400">
          Everything you have logged.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenCompanion}
        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/70 border border-emerald-500/30 hover:border-emerald-400 text-left"
      >
        <PetAvatar mood={petMood(history)} size={44} />
        <span className="flex-1">
          <span className="block text-sm font-semibold text-white">Ask {memory.petName} about your training</span>
          <span className="block text-xs text-zinc-400">It reads this history and builds your next plan.</span>
        </span>
      </button>

      <section aria-label="Past workouts" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            Past workouts ({history.length})
          </h3>
        </div>

        {history.length === 0 && (
          <div className="p-8 rounded-2xl bg-zinc-900/60 border border-dashed border-white/[0.12] text-center space-y-2">
            <HistoryIcon className="w-8 h-8 text-emerald-400 mx-auto" aria-hidden="true" />
            <h4 className="text-base font-bold text-white">No workouts yet</h4>
            <p className="text-sm text-zinc-400">Finish a workout and it will show up here.</p>
          </div>
        )}

        {history.map((wo) => (
          <article
            key={wo.id}
            className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] hover:border-emerald-500/30 transition space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm">{wo.title}</h4>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-zinc-400" aria-hidden="true" />
                    {formatWorkoutDate(wo.timestamp)}
                  </span>
                  <span aria-hidden="true">•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-zinc-400" aria-hidden="true" />
                    {Math.max(1, Math.round((wo.durationSeconds || 0) / 60))} min
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {formatWeight(wo.volumeKg || 0, unit)}
                </span>
                <div className="text-[10px] text-zinc-400 font-mono">Total volume</div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.04] flex flex-wrap gap-2">
              {wo.exercises?.map((e, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-white/[0.04]"
                >
                  <strong className="text-white font-medium">{e.exerciseName}</strong>
                  <span className="text-zinc-400"> · {e.sets?.length || 0} sets</span>
                </span>
              ))}
              {wo.pendingSync && (
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Waiting to sync
                </span>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
