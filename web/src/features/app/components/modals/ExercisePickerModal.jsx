import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { EXERCISE_LIBRARY } from '../../../../lib/workoutStore';

export default function ExercisePickerModal({
  isOpen,
  onClose,
  onSelectExercise,
}) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = EXERCISE_LIBRARY.filter(
    (ex) =>
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141a] border border-white/[0.1] rounded-2xl max-w-xl w-full p-5 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div>
            <h3 className="font-bold text-white text-base">Select Movement to Add</h3>
            <p className="text-xs text-zinc-400">Choose from 333+ categorized exercises</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercise by name or muscle (e.g. Incline, Cable, Squat)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.map((ex) => (
            <div
              key={ex.id}
              onClick={() => {
                onSelectExercise(ex);
                onClose();
              }}
              className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] hover:border-emerald-500/30 hover:bg-zinc-800/60 transition cursor-pointer flex items-center justify-between group"
            >
              <div>
                <h4 className="font-bold text-white text-xs group-hover:text-emerald-400 transition">
                  {ex.name}
                </h4>
                <span className="text-[11px] text-zinc-400">
                  {ex.muscle} • {ex.equipment}
                </span>
              </div>
              <button className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition">
                + Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
