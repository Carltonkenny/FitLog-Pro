import React from 'react';
import {
  Dumbbell,
  Layers,
  LineChart,
  History,
  Settings,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { WorkoutStore } from '../../../../lib/workoutStore';
import { computeStreak } from '../../../../lib/stats';

export default function StudioSidebar({
  activeTab,
  setActiveTab,
  workoutStats,
  blueprint,
  syncStatus,
}) {
  const streak = computeStreak(WorkoutStore.getHistory());
  const navItems = [
    {
      id: 'workout',
      label: 'Active Workout',
      icon: Dumbbell,
      badge: `${workoutStats.completedSetsCount}/${workoutStats.totalSetsCount}`,
    },
    { id: 'library', label: 'Exercise Explorer', icon: Layers, badge: '333+' },
    { id: 'analytics', label: 'Progress', icon: LineChart, badge: null },
    { id: 'history', label: 'History & AI Coach', icon: History, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.08] p-4 flex flex-col justify-between shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] bg-[#0c0e12]/60 backdrop-blur-sm">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <nav aria-label="Main" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3 min-h-11 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Blueprint Summary Card */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Your plan</span>
            </div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
              Active
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Primary Goal</span>
              <span className="text-zinc-200 font-medium capitalize">
                {blueprint?.goal === 'strength' ? 'Raw strength' : blueprint?.goal ? 'Muscle growth' : blueprint?.fitness_goal || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Target Split</span>
              <span className="text-zinc-200 font-medium">{blueprint?.split_preference || 'Not set'}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Current streak</span>
              <span className="text-emerald-400 font-medium font-mono">{streak} day{streak === 1 ? '' : 's'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06]">
            <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
              <span>This workout</span>
              <span className="text-emerald-400 font-mono font-medium">
                {workoutStats.progressPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${workoutStats.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sync indicator */}
      <div className="pt-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            {syncStatus.isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-[11px]">{syncStatus.statusLabel}</span>
          </div>
          <span aria-hidden="true" className={`w-2 h-2 rounded-full ${syncStatus.pendingCount > 0 || !syncStatus.isOnline ? 'bg-amber-400' : 'bg-emerald-500'}`} />
        </div>
      </div>
    </aside>
  );
}
