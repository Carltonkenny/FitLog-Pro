import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { WorkoutStore } from '../../../../lib/workoutStore';
import { formatWeight, useSettings } from '../../../../lib/settings';
import {
  WEEKLY_SET_TARGET,
  computeStreak,
  topLifts,
  weeklyMuscleSets,
  workoutsInLastDays,
} from '../../../../lib/stats';

const BAR_COLORS = {
  Chest: 'bg-emerald-500',
  Back: 'bg-cyan-500',
  Legs: 'bg-purple-500',
  Shoulders: 'bg-amber-500',
  Arms: 'bg-blue-500',
  Core: 'bg-rose-500',
};

function Kpi({ label, value, tone = 'text-white' }) {
  return (
    <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/[0.06]">
      <span className="text-[11px] text-zinc-400">{label}</span>
      <div className={`text-xl font-bold font-mono mt-0.5 ${tone}`}>{value}</div>
    </div>
  );
}

export default function AnalyticsView({ onStartWorkout }) {
  const { unit } = useSettings();
  const history = WorkoutStore.getHistory();

  if (history.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Progress</h2>
        <div className="p-8 rounded-2xl bg-zinc-900/60 border border-dashed border-white/[0.12] text-center space-y-3">
          <BarChart3 className="w-8 h-8 text-emerald-400 mx-auto" aria-hidden="true" />
          <h3 className="text-base font-bold text-white">Your progress will appear here</h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            Finish your first workout and you will see your estimated max lifts, weekly volume per muscle and your
            streak.
          </p>
          {onStartWorkout && (
            <button
              type="button"
              onClick={onStartWorkout}
              className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm"
            >
              Log a workout
            </button>
          )}
        </div>
      </div>
    );
  }

  const totalVolume = history.reduce((sum, wo) => sum + (wo.volumeKg || 0), 0);
  const streak = computeStreak(history);
  const last28 = workoutsInLastDays(history, 28);
  const lifts = topLifts(history, 3);
  const muscles = weeklyMuscleSets(history);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Progress</h2>
        <p className="text-xs text-zinc-400">
          Calculated from your logged workouts. Estimated max uses the Epley formula: weight × (1 + reps ÷ 30).
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
<<<<<<< HEAD
        <Kpi label="Total workouts" value={history.length} />
        <Kpi label="All-time volume" value={formatWeight(totalVolume, unit)} tone="text-emerald-400" />
        <Kpi label="Last 4 weeks" value={`${last28} workout${last28 === 1 ? '' : 's'}`} tone="text-cyan-400" />
        <Kpi label="Current streak" value={`${streak} day${streak === 1 ? '' : 's'}`} tone="text-amber-400" />
=======
        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/[0.06]">
          <span className="text-[11px] text-zinc-400">Total Workouts</span>
          <div className="text-xl font-bold text-white font-mono mt-0.5">
            {totalSessionsCount}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/[0.06]">
          <span className="text-[11px] text-zinc-400">All-Time Volume</span>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
            {(totalVolumeAllTime / 1000).toFixed(1)} tons
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/[0.06]">
          <span className="text-[11px] text-zinc-400">Overload Consistency</span>
          <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5">
            94%
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/[0.06]">
          <span className="text-[11px] text-zinc-400">Current Streak</span>
          <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
            🔥 {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
          </div>
        </div>
>>>>>>> feat/local-enhancements-and-audit
      </div>

      <section aria-label="Top lifts" className="space-y-2">
        <h3 className="text-sm font-bold text-white">Your top lifts</h3>
        {lifts.length === 0 ? (
          <p className="text-sm text-zinc-400">Complete a set with weight and reps to see your estimated max.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {lifts.map((l) => (
              <div
                key={l.exerciseId}
                className="p-4 rounded-2xl bg-zinc-900/80 border border-white/[0.08] space-y-2 hover:border-emerald-500/30 transition"
              >
                <span className="text-xs text-zinc-400">{l.name}</span>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-2xl font-bold text-white font-mono tracking-tight">
                    {formatWeight(l.oneRm, unit)}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">
                    Est. max
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Best set: {formatWeight(l.weight, unit)} × {l.reps} reps
                </div>
                <div className="text-[11px] text-zinc-300 flex items-center gap-1 font-medium pt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>
                    {l.deltaKg === null
                      ? 'Log it again to see your trend'
                      : `${l.deltaKg >= 0 ? '+' : ''}${formatWeight(l.deltaKg, unit)} since first session`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Weekly muscle volume" className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white">Sets per muscle, last 7 days</h3>
          <span className="text-xs text-zinc-400 font-mono">Goal: {WEEKLY_SET_TARGET} sets</span>
        </div>
        <div className="space-y-3.5 text-xs">
          {muscles.map(({ muscle, sets }) => (
            <div key={muscle} className="space-y-1">
              <div className="flex justify-between text-zinc-300">
                <span>{muscle}</span>
                <span className="font-mono text-zinc-400">
                  {sets} / {WEEKLY_SET_TARGET} sets
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`${muscle} sets this week`}
                aria-valuemin={0}
                aria-valuemax={WEEKLY_SET_TARGET}
                aria-valuenow={Math.min(sets, WEEKLY_SET_TARGET)}
                className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full ${BAR_COLORS[muscle]} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, (sets / WEEKLY_SET_TARGET) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
