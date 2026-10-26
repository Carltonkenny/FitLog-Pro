import React from 'react';
import {
  History,
  Calendar,
  Clock,
} from 'lucide-react';
import { WorkoutStore } from '../../../../lib/workoutStore';
import GeminiHistoryCoach from './GeminiHistoryCoach';

export default function HistoryView() {
  const history = WorkoutStore.getHistory();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Workout History & Gemini Intelligence</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Your historical sessions, volume logs, and PR achievements paired with real-time AI progression insights.
        </p>
      </div>

      {/* GEMINI HISTORY COACH (Shifted here to leverage real history) */}
      <GeminiHistoryCoach />

      {/* SESSION TIMELINE */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Recorded Workout Sessions ({history.length})
          </span>
          <span className="text-[10px] font-mono text-emerald-400">
            Local Database & Cloud Synced
          </span>
        </div>

        {history.map((wo) => (
          <div
            key={wo.id}
            className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] hover:border-emerald-500/30 transition space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{wo.title}</h4>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    {wo.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    {Math.round((wo.durationSeconds || 0) / 60)} mins
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {wo.volumeKg.toLocaleString()} kg
                </span>
                <div className="text-[10px] text-zinc-500 font-mono">Total Volume</div>
              </div>
            </div>

            {/* Exercise Badges */}
            <div className="pt-2 border-t border-white/[0.04] flex flex-wrap gap-2">
              {wo.exercises?.map((e, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-white/[0.04] flex items-center gap-1.5"
                >
                  <strong className="text-white font-medium">{e.exerciseName}</strong>
                  <span className="text-zinc-500">({e.sets?.length || 3} sets)</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
