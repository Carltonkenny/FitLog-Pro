import React, { useState, useMemo, useEffect } from 'react';
import {
  CASCADING_CATEGORIES,
  EXERCISE_LIBRARY,
  WorkoutStore,
} from '../../../../lib/workoutStore';
import {
  Search,
  Plus,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from 'lucide-react';
import EquipmentBadge from '../../../../components/EquipmentBadge';
import { formatWeight, useSettings } from '../../../../lib/settings';
import { formatWorkoutDate } from '../../../../lib/stats';

export default function CascadingExplorerView({ onAddExercise }) {
  const { unit } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState('chest');
  const [selectedSubregion, setSelectedSubregion] = useState('upper_chest');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState(new Set());
  const [expandedCueId, setExpandedCueId] = useState(null);

  const currentCategoryObj = useMemo(() => {
    return CASCADING_CATEGORIES.find((c) => c.id === selectedCategory) || CASCADING_CATEGORIES[0];
  }, [selectedCategory]);

  const currentSubregionObj = useMemo(() => {
    return (
      currentCategoryObj.subregions.find((s) => s.id === selectedSubregion) ||
      currentCategoryObj.subregions[0]
    );
  }, [currentCategoryObj, selectedSubregion]);

  // Dynamically compute equipment options available in this muscle category
  const dynamicEquipmentOptions = useMemo(() => {
    const allExercisesInCat = currentCategoryObj.subregions.flatMap((s) => s.exercises);
    const counts = { all: allExercisesInCat.length };

    allExercisesInCat.forEach((ex) => {
      const eq = (ex.equipment || '').toLowerCase();
      let key = 'Other';
      if (eq.includes('barbell')) key = 'Barbell';
      else if (eq.includes('dumbbell')) key = 'Dumbbells';
      else if (eq.includes('cable')) key = 'Cable';
      else if (eq.includes('smith')) key = 'Smith';
      else if (eq.includes('machine')) key = 'Machine';
      else if (eq.includes('bodyweight') || eq.includes('pull-up')) key = 'Bodyweight';
      counts[key] = (counts[key] || 0) + 1;
    });

    const options = [{ id: 'all', label: `All (${counts.all})` }];
    ['Barbell', 'Dumbbells', 'Cable', 'Machine', 'Smith', 'Bodyweight'].forEach((k) => {
      if (counts[k] && counts[k] > 0) {
        options.push({ id: k.toLowerCase(), label: `${k} (${counts[k]})` });
      }
    });
    return options;
  }, [currentCategoryObj]);

  // Reset selected equipment if it does not exist for the new muscle category
  useEffect(() => {
    if (
      selectedEquipment !== 'all' &&
      !dynamicEquipmentOptions.some((opt) => opt.id === selectedEquipment)
    ) {
      setSelectedEquipment('all');
    }
  }, [dynamicEquipmentOptions, selectedEquipment]);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return EXERCISE_LIBRARY.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.targetMuscle.toLowerCase().includes(q) ||
          ex.muscle.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q)
      );
    }

    return currentSubregionObj.exercises.filter((ex) => {
      if (selectedEquipment === 'all') return true;
      return ex.equipment.toLowerCase().includes(selectedEquipment.toLowerCase());
    });
  }, [searchQuery, currentSubregionObj, selectedEquipment]);

  const handleAdd = (ex) => {
    onAddExercise(ex);
    setAddedIds((prev) => new Set([...prev, ex.id]));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(ex.id);
        return next;
      });
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Global Search */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Exercise Library</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                {EXERCISE_LIBRARY.length} exercises
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Browse targeted exercises by muscle group, anatomy, and apparatus.
            </p>
          </div>
        </div>

        {/* Global Instant Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises, cues, target muscles, or equipment..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition shadow-inner"
          />
        </div>
      </div>

      {!searchQuery && (
        <>
          {/* Primary Muscle Group */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 shrink-0">
                Muscle Group
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                {currentCategoryObj.plainName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {CASCADING_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubregion(cat.subregions[0].id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-center text-xs font-semibold transition border whitespace-nowrap active:scale-95 ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-bold'
                      : 'bg-zinc-900 text-zinc-300 border-white/[0.06] hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Target Anatomy Sub-regions */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 shrink-0">
                Target Sub-region
              </span>
              <span className="text-xs text-zinc-400 sm:text-right">
                {currentSubregionObj.description}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentCategoryObj.subregions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubregion(sub.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition border whitespace-nowrap active:scale-95 ${
                    selectedSubregion === sub.id
                      ? 'bg-zinc-800 text-emerald-400 border-emerald-500/40 shadow-sm font-semibold'
                      : 'bg-zinc-900/60 text-zinc-400 border-white/[0.05] hover:text-zinc-200'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Equipment Filter */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Equipment:
            </span>
            {dynamicEquipmentOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedEquipment(opt.id)}
                className={`text-[11px] px-3 py-1 rounded-full capitalize transition whitespace-nowrap shrink-0 active:scale-95 ${
                  selectedEquipment === opt.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 border border-white/[0.06] hover:text-zinc-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Exercises Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 shrink-0">
            Available Exercises ({filteredExercises.length})
          </span>
          <span className="text-[10px] font-mono text-zinc-500 shrink-0">
            Ranked by Hypertrophy Efficiency
          </span>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3.5">
          {filteredExercises.map((ex) => {
            const isAdded = addedIds.has(ex.id);
            const isCueExpanded = expandedCueId === ex.id;

            return (
              <div
                key={ex.id}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] hover:border-emerald-500/30 transition space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <EquipmentBadge equipment={ex.equipment} size={44} />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition leading-snug">
                        {ex.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs">
                        <span className="text-zinc-400">{ex.equipment}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-emerald-400 font-medium">{ex.targetMuscle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Growth Score Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ★ {ex.growthFatigueScore || 9.0}
                    </span>
                  </div>
                </div>

                {/* Previous History Recall Badge */}
                {(() => {
                  const last = WorkoutStore.getLastSessionForExercise(ex.id);
                  if (!last) return null;
                  return (
                    <div className="px-3 py-2 rounded-xl bg-zinc-950/70 border border-white/[0.05] text-[11px] text-zinc-300 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-zinc-400 min-w-0">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">
                          History: <strong className="text-white font-mono">{formatWeight(last.bestSet.weight, unit)} × {last.bestSet.reps}</strong>
                        </span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400/90 shrink-0">
                        {formatWorkoutDate(last.timestamp)}
                      </span>
                    </div>
                  );
                })()}

                {/* Form Guidance & Mind-Muscle Cue */}
                {ex.cue && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setExpandedCueId(isCueExpanded ? null : ex.id)}
                      className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition"
                    >
                      <span>Form guidance & setup cue</span>
                      {isCueExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isCueExpanded && (
                      <p className="mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-white/[0.04] text-[11px] text-zinc-300 leading-relaxed italic">
                        "{ex.cue}"
                      </p>
                    )}
                  </div>
                )}

                {/* 1-Tap Add to Workout Button */}
                <button
                  type="button"
                  onClick={() => handleAdd(ex)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition active:scale-95 border flex items-center justify-center gap-1.5 ${
                    isAdded
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 border-emerald-500/20'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Added to Workout!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Add to Session</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
