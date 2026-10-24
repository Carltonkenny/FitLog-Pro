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

export default function StudioSidebar({
  activeTab,
  setActiveTab,
  workoutStats,
  blueprint,
  syncStatus,
}) {
  const navItems = [
    {
      id: 'workout',
      label: 'Active Workout',
      icon: Dumbbell,
      badge: `${workoutStats.completedSetsCount}/${workoutStats.totalSetsCount}`,
    },
    { id: 'library', label: 'Exercise Explorer', icon: Layers, badge: '333+' },
    { id: 'analytics', label: 'Progress Analytics', icon: LineChart, badge: 'Live' },
    { id: 'history', label: 'History & AI Coach', icon: History, badge: 'AI' },
    { id: 'settings', label: 'App Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.08] p-4 flex flex-col justify-between shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] bg-[#0c0e12]/60 backdrop-blur-sm">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
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
              <span>Your Blueprint</span>
            </div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
              Active
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Primary Goal</span>
              <span className="text-zinc-200 font-medium capitalize">
                {blueprint?.goal === 'strength' ? 'Raw Strength' : 'Muscle Growth'}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Target Split</span>
              <span className="text-zinc-200 font-medium">4 Days / Week</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Current Streak</span>
              <span className="text-emerald-400 font-medium font-mono">🔥 3 Sessions</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06]">
            <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
              <span>Today's Progress</span>
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

      {/* Cloud Brain Sync Indicator */}
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
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
        </div>
      </div>
    </aside>
  );
}
