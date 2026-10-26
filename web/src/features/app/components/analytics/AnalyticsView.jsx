import React from 'react';
import {
  TrendingUp,
} from 'lucide-react';
import { WorkoutStore } from '../../../../lib/workoutStore';

export default function AnalyticsView() {
  const prs = WorkoutStore.getPersonalRecords();
  const history = WorkoutStore.getHistory();

  // Dynamic calculation from history
  const totalVolumeAllTime = history.reduce((sum, wo) => sum + (wo.volumeKg || 0), 0);
  const totalSessionsCount = history.length;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Progressive Overload Analytics
        </h2>
        <p className="text-xs text-zinc-400">
          Concrete lifting metrics. Review your Estimated 1-Rep Max curves, muscle volume targets, and session-to-session progression proof.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            🔥 3 Days
          </div>
        </div>
      </div>

      {/* 1RM Trend Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            name: 'Barbell Flat Bench Press',
            max: `${prs.bench_press?.oneRepMax || 54} kg`,
            weight: `${prs.bench_press?.weight || 40} kg × ${prs.bench_press?.reps || 10} reps`,
            delta: '+4.5 kg vs 3 wks ago',
          },
          {
            name: 'Lat Pulldown',
            max: `${prs.lat_pulldown?.oneRepMax || 49} kg`,
            weight: `${prs.lat_pulldown?.weight || 35} kg × ${prs.lat_pulldown?.reps || 12} reps`,
            delta: '+2.5 kg vs 2 wks ago',
          },
          {
            name: 'Dumbbell Bicep Curl',
            max: `${prs.bicep_curls?.oneRepMax || 13} kg`,
            weight: `${prs.bicep_curls?.weight || 10} kg × ${prs.bicep_curls?.reps || 8} reps`,
            delta: '+1.5 kg vs last week',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-white/[0.08] space-y-2 hover:border-emerald-500/30 transition"
          >
            <span className="text-xs text-zinc-400">{stat.name}</span>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-2xl font-bold text-white font-mono tracking-tight">{stat.max}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">
                Est. 1RM
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">Best Set: {stat.weight}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium pt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stat.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Muscle Volume Breakdown */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Weekly Muscle Group Volume</h3>
          <span className="text-xs text-zinc-400 font-mono">Target: 14–18 Sets / Muscle</span>
        </div>

        <div className="space-y-3.5 text-xs">
          {[
            { muscle: 'Chest (Pectorals)', current: 12, target: 16, color: 'bg-emerald-500' },
            { muscle: 'Back & Lats (V-Taper)', current: 14, target: 16, color: 'bg-cyan-500' },
            { muscle: 'Arms (Biceps & Triceps)', current: 10, target: 14, color: 'bg-blue-500' },
            { muscle: 'Shoulders (Delts)', current: 8, target: 12, color: 'bg-amber-500' },
            { muscle: 'Legs & Glutes', current: 12, target: 16, color: 'bg-purple-500' },
          ].map((group, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-zinc-300">
                <span>{group.muscle}</span>
                <span className="font-mono text-zinc-400">
                  {group.current} / {group.target} sets
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${group.color} rounded-full transition-all duration-500`}
                  style={{ width: `${(group.current / group.target) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
