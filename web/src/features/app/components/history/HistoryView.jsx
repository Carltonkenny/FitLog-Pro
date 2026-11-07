import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  History as HistoryIcon,
  Search,
  Trophy,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { WorkoutStore } from '../../../../lib/workoutStore';
import { formatWeight, useSettings } from '../../../../lib/settings';
import { formatWorkoutDate } from '../../../../lib/stats';
import PetAvatar from '../../../companion/PetAvatar';
import { petMood } from '../../../../lib/companionActions.js';
import { useUserData } from '../../../../lib/userData.js';

const PAGE = 30;

export default function HistoryView({ onOpenCompanion }) {
  const { unit } = useSettings();
  const { memory } = useUserData();
  const history = WorkoutStore.getHistory();

  // Mode: 'workouts' | 'exercises'
  const [viewMode, setViewMode] = useState('workouts');
  const [shown, setShown] = useState(PAGE);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);

  // Aggregate all exercises ever performed
  const allExercises = useMemo(() => {
    return WorkoutStore.getAllExercisesHistory();
  }, [history]);

  // Filter exercises by search query
  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return allExercises;
    const q = searchQuery.toLowerCase();
    return allExercises.filter(
      (e) =>
        e.exerciseName.toLowerCase().includes(q) ||
        (e.targetMuscle && e.targetMuscle.toLowerCase().includes(q))
    );
  }, [allExercises, searchQuery]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Training History</h2>
          <p className="text-xs text-zinc-400">
            Complete record of your workouts and every exercise you have ever performed.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-zinc-900/90 rounded-xl border border-white/[0.08] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('workouts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'workouts'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Workouts ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('exercises')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'exercises'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Exercise Index ({allExercises.length})
          </button>
        </div>
      </div>

      {/* AI Coach Banner */}
      <button
        type="button"
        onClick={onOpenCompanion}
        className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/70 border border-emerald-500/30 hover:border-emerald-400 text-left transition"
      >
        <PetAvatar mood={petMood(history)} size={44} />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-white">Ask {memory.petName} about your history</span>
          <span className="block text-xs text-zinc-400">
            Remembers every exercise you have done, your PRs, and your volume progression.
          </span>
        </span>
      </button>

      {/* ------------------------------------------------------------- */}
      {/* 1. WORKOUTS VIEW                                              */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'workouts' && (
        <section aria-label="Past workouts" className="space-y-3">
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

          {history.slice(0, shown).map((wo) => {
            const isExpanded = expandedWorkoutId === wo.id;
            return (
              <article
                key={wo.id}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] hover:border-emerald-500/30 transition space-y-3"
              >
                <div
                  onClick={() => setExpandedWorkoutId(isExpanded ? null : wo.id)}
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{wo.title}</h4>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
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

                {/* Exercise Pills */}
                <div className="pt-2 border-t border-white/[0.04] flex flex-wrap gap-2">
                  {wo.exercises?.map((e, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-white/[0.04]"
                    >
                      <strong className="text-white font-medium">{e.exerciseName || e.name}</strong>
                      <span className="text-zinc-400"> · {(e.sets || []).length} sets</span>
                    </span>
                  ))}
                  {wo.pendingSync && (
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Waiting to sync
                    </span>
                  )}
                </div>

                {/* Expanded Detailed Sets Breakdown */}
                {isExpanded && (
                  <div className="pt-3 border-t border-white/[0.08] space-y-3 animate-fadeIn">
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                      Set-by-Set Performance
                    </h5>
                    <div className="space-y-3">
                      {wo.exercises?.map((ex, exIdx) => (
                        <div key={exIdx} className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04] space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                            <span>{ex.exerciseName || ex.name}</span>
                            <span className="text-[11px] font-mono text-zinc-400">
                              {(ex.sets || []).filter((s) => s.completed).length} completed
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {(ex.sets || []).map((s, sIdx) => (
                              <div
                                key={sIdx}
                                className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center justify-between ${
                                  s.completed
                                    ? 'bg-zinc-800/80 text-zinc-200 border border-white/[0.06]'
                                    : 'bg-zinc-900/40 text-zinc-400'
                                }`}
                              >
                                <span>Set {sIdx + 1}:</span>
                                <span className="font-bold text-white">
                                  {formatWeight(s.weight, unit)} × {s.reps}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {history.length > shown && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE)}
              className="w-full py-3 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition"
            >
              Load more workouts
            </button>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. EXERCISE INDEX & MEMORY VIEW                               */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'exercises' && (
        <section aria-label="Exercise History Catalog" className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises you've performed..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              Showing {filteredExercises.length} of {allExercises.length} tracked exercises
            </span>
            <span className="font-mono text-[11px]">Sorted by recently trained</span>
          </div>

          {filteredExercises.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900/60 border border-dashed border-white/[0.12] text-center space-y-2">
              <Dumbbell className="w-8 h-8 text-zinc-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No exercises found</h4>
              <p className="text-sm text-zinc-400">
                {searchQuery ? 'Try another search term' : 'Complete your first workout to build your history.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExercises.map((ex) => {
                const isExpanded = expandedExerciseId === ex.exerciseId;
                const detailed = isExpanded ? WorkoutStore.getExerciseHistory(ex.exerciseId) : null;

                return (
                  <div
                    key={ex.exerciseId}
                    className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] hover:border-emerald-500/30 transition space-y-3"
                  >
                    <div
                      onClick={() => setExpandedExerciseId(isExpanded ? null : ex.exerciseId)}
                      className="flex items-start justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm tracking-tight">
                            {ex.exerciseName}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-white/[0.05]">
                            {ex.timesPerformed} session{ex.timesPerformed === 1 ? '' : 's'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          Target: <span className="text-emerald-400">{ex.targetMuscle}</span>
                          <span className="mx-1.5">•</span>
                          <span>Last: {formatWorkoutDate(ex.lastPerformedAt)} ({formatWeight(ex.lastWeight, unit)} × {ex.lastReps})</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1 text-amber-300 font-mono font-bold text-sm">
                          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{formatWeight(ex.bestWeight, unit)} × {ex.bestReps}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Est. 1RM: {ex.best1RM} kg
                        </div>
                      </div>
                    </div>

                    {/* Detailed Exercise Sessions Timeline */}
                    {isExpanded && detailed && (
                      <div className="pt-3 border-t border-white/[0.08] space-y-2.5 animate-fadeIn">
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                          <span className="uppercase text-emerald-400 font-bold">Historical Sessions</span>
                          <span>Total Volume: {formatWeight(detailed.totalVolumeKg, unit)}</span>
                        </div>

                        <div className="space-y-2">
                          {detailed.sessions.map((s, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-3 rounded-xl bg-black/40 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div>
                                <span className="font-semibold text-zinc-200 text-xs">
                                  {s.workoutTitle}
                                </span>
                                <div className="text-[11px] text-zinc-400 font-mono">
                                  {formatWorkoutDate(s.timestamp)}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {s.sets.map((set, setIdx) => (
                                  <span
                                    key={setIdx}
                                    className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[11px] border border-white/[0.06]"
                                  >
                                    {formatWeight(set.weight, unit)} × {set.reps}
                                  </span>
                                ))}
                                <span className="text-[11px] text-emerald-400 font-mono font-bold ml-1">
                                  Top: {formatWeight(s.bestSet.weight, unit)} × {s.bestSet.reps}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
