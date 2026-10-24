import React from 'react';
import { Dumbbell, Layers, LineChart, History, Settings } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const items = [
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'library', label: 'Explorer', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'history', label: 'History & AI', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="sticky bottom-0 z-40 bg-[#0d0f14]/95 backdrop-blur-lg border-t border-white/[0.08] px-2 py-2 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
              isActive ? 'text-emerald-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
