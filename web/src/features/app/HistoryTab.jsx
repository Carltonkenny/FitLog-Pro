import React from 'react';
import { Calendar, TrendingUp, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export default function HistoryTab() {
  // Generate 52 weeks of GitHub-style heatmap blocks
  const weeks = Array.from({ length: 32 }, (_, i) => {
    return Array.from({ length: 7 }, (_, j) => {
      // simulate realistic workout distribution (3 to 5 days a week)
      const isWorkout = (i * 7 + j) % 3 === 0 || (i * 7 + j) % 5 === 0;
      const intensity = isWorkout ? ((i + j) % 3) + 1 : 0;
      return intensity;
    });
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#12141A] border border-[#242836]">
        <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
          Workout History & Consistency Matrix
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          GitHub-style 365-day training visualization backed by local SQLite & Supabase Cloud.
        </p>
      </div>

      {/* Heatmap Card */}
      <div className="p-5 rounded-2xl bg-[#12141A] border border-[#242836] space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold">148 WORKOUTS LOGGED THIS YEAR</span>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-[#161822]" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#00F59B]/30" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#00F59B]/60" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#00F59B]" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-[650px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((level, dIdx) => {
                  const colors = [
                    'bg-[#161822]',
                    'bg-[#00F59B]/30',
                    'bg-[#00F59B]/60',
                    'bg-[#00F59B]',
                  ];
                  return (
                    <div
                      key={dIdx}
                      className={`w-3 h-3 rounded-sm ${colors[level]} transition-colors`}
                      title={`Week ${wIdx + 1}, Day ${dIdx + 1}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Logged Sessions */}
      <div className="p-5 rounded-2xl bg-[#12141A] border border-[#242836] space-y-3">
        <span className="text-xs font-mono uppercase text-slate-400 font-bold block mb-2">
          Recent Completed Sessions
        </span>

        {[
          { title: 'Push Day (Chest, Shoulders & Triceps)', date: 'Oct 21, 2026', volume: '18,450 kg', sets: 14, duration: '48 min' },
          { title: 'Pull Day (Lats, Traps & Biceps)', date: 'Oct 19, 2026', volume: '16,200 kg', sets: 12, duration: '44 min' },
          { title: 'Legs & Core Day (Squat Focus)', date: 'Oct 17, 2026', volume: '22,100 kg', sets: 16, duration: '55 min' },
          { title: 'Upper Body Hypertrophy', date: 'Oct 15, 2026', volume: '17,800 kg', sets: 13, duration: '46 min' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[#161822] border border-[#222736] flex items-center justify-between hover:border-[#30374C] transition-colors"
          >
            <div>
              <span className="font-bold text-sm text-white font-['Outfit'] block">{item.title}</span>
              <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-400">
                <span>{item.date}</span>
                <span>•</span>
                <span className="text-[#00D4FF]">{item.duration}</span>
                <span>•</span>
                <span className="text-[#00F59B]">{item.sets} Sets</span>
              </div>
            </div>
            <span className="font-mono text-sm font-bold text-white tabular-nums">{item.volume}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
