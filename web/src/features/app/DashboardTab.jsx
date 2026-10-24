import React from 'react';
import { Flame, Trophy, TrendingUp, Calendar, Play, ChevronRight, CheckCircle2, Award } from 'lucide-react';

export default function DashboardTab({ blueprint, onStartWorkout }) {
  // Weekly consistency data (Mon to Sun)
  const weekDays = [
    { day: 'Mon', completed: true, title: 'Push Day' },
    { day: 'Tue', completed: true, title: 'Pull Day' },
    { day: 'Wed', completed: false, title: 'Rest' },
    { day: 'Thu', completed: true, title: 'Legs Day' },
    { day: 'Fri', completed: true, title: 'Upper Day' },
    { day: 'Sat', completed: false, title: 'Active Today' },
    { day: 'Sun', completed: false, title: 'Rest' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141722] via-[#10121A] to-[#141722] border border-[#242836] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-[#00F59B] uppercase font-semibold">
            {blueprint?.split_preference || 'Push-Pull-Legs'} Protocol Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] mt-1">
            Ready to Push, Athlete?
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Targeting {blueprint?.fitness_goal || 'Hypertrophy'} • Today is Chest, Shoulders & Triceps focus.
          </p>
        </div>

        <button
          id="dashboard-start-workout-btn"
          onClick={onStartWorkout}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00F59B] to-[#00D485] hover:opacity-95 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00F59B]/25 transition-all transform hover:-translate-y-0.5"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>Start Active Workout</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#12141A] border border-[#242836]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-mono">Current Streak</span>
            <Flame className="w-4 h-4 text-[#FF3366]" />
          </div>
          <div className="text-2xl font-black text-white font-['Outfit'] tabular-nums">5 Days</div>
          <span className="text-[10px] font-mono text-slate-500">Best: 12 Days</span>
        </div>

        <div className="p-4 rounded-xl bg-[#12141A] border border-[#242836]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-mono">Weekly Volume</span>
            <TrendingUp className="w-4 h-4 text-[#00D4FF]" />
          </div>
          <div className="text-2xl font-black text-[#00D4FF] font-['Outfit'] tabular-nums">18,450 kg</div>
          <span className="text-[10px] font-mono text-[#00F59B]">+8.4% vs last week</span>
        </div>

        <div className="p-4 rounded-xl bg-[#12141A] border border-[#242836]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-mono">Sessions</span>
            <Calendar className="w-4 h-4 text-[#FFD026]" />
          </div>
          <div className="text-2xl font-black text-white font-['Outfit'] tabular-nums">4 / 5</div>
          <span className="text-[10px] font-mono text-slate-500">80% of goal</span>
        </div>

        <div className="p-4 rounded-xl bg-[#12141A] border border-[#242836]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-mono">Body Weight</span>
            <Trophy className="w-4 h-4 text-[#00F59B]" />
          </div>
          <div className="text-2xl font-black text-[#00F59B] font-['Outfit'] tabular-nums">
            {blueprint?.body_weight_kg || 76.5} kg
          </div>
          <span className="text-[10px] font-mono text-slate-500">Goal: {blueprint?.target_weight_kg || 80} kg</span>
        </div>
      </div>

      {/* Week Consistency Strip */}
      <div className="p-5 rounded-2xl bg-[#12141A] border border-[#242836]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase text-slate-400 font-bold">Weekly Consistency Tracker</span>
          <span className="text-xs font-mono text-[#00F59B]">4 Completed</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center transition-all ${
                item.completed
                  ? 'bg-[#00F59B]/10 border-[#00F59B]/40 text-white'
                  : 'bg-[#161822] border-[#222736] text-slate-500'
              }`}
            >
              <span className="text-[11px] font-mono font-bold block">{item.day}</span>
              <div className="my-1.5 flex justify-center">
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#00F59B]" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-700 block" />
                )}
              </div>
              <span className="text-[9px] font-mono truncate block text-slate-400">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Personal Records (PRs) */}
      <div className="p-5 rounded-2xl bg-[#12141A] border border-[#242836]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#FFD026]" />
            <span>Recent Personal Records (Epley Telemetry)</span>
          </span>
          <span className="text-xs font-mono text-slate-500">Last 14 Days</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { exercise: 'Barbell Bench Press', weight: '82.5 kg × 8', oneRepMax: '104.5 kg 1RM', date: 'Yesterday' },
            { exercise: 'Conventional Deadlift', weight: '140.0 kg × 5', oneRepMax: '163.3 kg 1RM', date: '3 days ago' },
            { exercise: 'Incline Dumbbell Press', weight: '32.0 kg × 9', oneRepMax: '41.6 kg 1RM', date: '5 days ago' },
          ].map((pr, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#161922] border border-[#262C3D] space-y-1">
              <span className="text-xs font-bold text-white font-['Outfit'] block truncate">{pr.exercise}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-[#00D4FF] font-mono">{pr.weight}</span>
                <span className="text-[10px] font-mono text-[#00F59B] font-semibold">{pr.oneRepMax}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 block">{pr.date}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
