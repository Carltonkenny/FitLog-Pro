import React, { useState } from 'react';
import { Search, Dumbbell, Filter, Check, Info } from 'lucide-react';

export default function ExercisesTab() {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');

  const exercises = [
    { name: 'Barbell Bench Press', muscle: 'Chest', tier: 'Tier S', equipment: 'Barbell', sfr: 'High' },
    { name: 'Incline Dumbbell Press', muscle: 'Chest', tier: 'Tier S', equipment: 'Dumbbell', sfr: 'Very High' },
    { name: 'Low-to-High Cable Fly', muscle: 'Chest', tier: 'Tier A', equipment: 'Cable', sfr: 'Maximum' },
    { name: 'Weighted Chest Dip', muscle: 'Chest', tier: 'Tier S', equipment: 'Bodyweight', sfr: 'High' },
    { name: 'Chest-Supported T-Bar Row', muscle: 'Back', tier: 'Tier S', equipment: 'Machine', sfr: 'Maximum' },
    { name: 'Neutral Grip Lat Pulldown', muscle: 'Back', tier: 'Tier S', equipment: 'Cable', sfr: 'Very High' },
    { name: 'Conventional Deadlift', muscle: 'Back', tier: 'Tier S', equipment: 'Barbell', sfr: 'Moderate' },
    { name: 'Kelso Shrug', muscle: 'Back', tier: 'Tier A', equipment: 'Dumbbell', sfr: 'Maximum' },
    { name: 'Barbell Hack Squat', muscle: 'Legs', tier: 'Tier S', equipment: 'Barbell', sfr: 'Very High' },
    { name: 'Seated Leg Curl', muscle: 'Legs', tier: 'Tier S', equipment: 'Machine', sfr: 'Maximum' },
    { name: 'Romanian Deadlift (RDL)', muscle: 'Legs', tier: 'Tier S', equipment: 'Barbell', sfr: 'High' },
    { name: 'Bulgarian Split Squat', muscle: 'Legs', tier: 'Tier A', equipment: 'Dumbbell', sfr: 'High' },
    { name: 'Behind-the-Back Cable Lateral Raise', muscle: 'Shoulders', tier: 'Tier S', equipment: 'Cable', sfr: 'Maximum' },
    { name: 'Overhead Barbell Press', muscle: 'Shoulders', tier: 'Tier A', equipment: 'Barbell', sfr: 'Moderate' },
    { name: 'Reverse Pec Deck Fly', muscle: 'Shoulders', tier: 'Tier S', equipment: 'Machine', sfr: 'Very High' },
    { name: 'Bayesian Cable Curl', muscle: 'Arms', tier: 'Tier S', equipment: 'Cable', sfr: 'Maximum' },
    { name: 'Cross-Body Triceps Extension', muscle: 'Arms', tier: 'Tier S', equipment: 'Cable', sfr: 'Maximum' },
    { name: 'Incline Dumbbell Biceps Curl', muscle: 'Arms', tier: 'Tier A', equipment: 'Dumbbell', sfr: 'High' },
  ];

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#12141A] border border-[#242836] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
            333+ Science-Backed Exercise Library
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Categorized by Stimulus-to-Fatigue Ratio (SFR), primary tension angle, and equipment.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#181B26] border border-[#262C3D] text-white text-xs outline-none focus:border-[#00F59B]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms'].map((muscle) => (
          <button
            key={muscle}
            onClick={() => setSelectedMuscle(muscle)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              selectedMuscle === muscle
                ? 'bg-[#00F59B] text-black border-[#00F59B]'
                : 'bg-[#14161E] text-slate-400 border-[#222736] hover:text-white'
            }`}
          >
            {muscle}
          </button>
        ))}
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[#14161E] border border-[#222736] hover:border-[#343C52] transition-all flex items-center justify-between"
          >
            <div>
              <span className="font-bold text-sm text-white font-['Outfit'] block">{item.name}</span>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                <span className="text-[#00D4FF]">{item.muscle}</span>
                <span>•</span>
                <span>{item.equipment}</span>
                <span>•</span>
                <span className="text-[#00F59B]">SFR: {item.sfr}</span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1C202B] text-[#FFD026] border border-[#2E354A]">
              {item.tier}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
