import React, { useState, useMemo } from 'react';
import {
  CASCADING_CATEGORIES,
  EXERCISE_LIBRARY,
} from '../../../../lib/workoutStore';
import {
  Search,
  Plus,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function CascadingExplorerView({ onAddExercise }) {
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

  const equipmentOptions = ['all', 'Barbell', 'Dumbbells', 'Cable', 'Machine', 'Bodyweight'];

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
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Cascading Movement Library</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {EXERCISE_LIBRARY.length} movements
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ranked by Growth-to-Fatigue efficiency. Select muscle group, anatomical sub-region, or search directly.
          </p>
        </div>

        {/* Global Instant Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises, cues, or equipment..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition"
          />
        </div>
      </div>

      {!searchQuery && (
        <>
          {/* STEP 1: PRIMARY MUSCLE GROUPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Step 1: Choose Primary Muscle Group
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                {currentCategoryObj.plainName}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CASCADING_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubregion(cat.subregions[0].id);
                  }}
                  className={`px-2 py-2 rounded-xl text-center text-[11px] sm:text-xs font-semibold transition border truncate ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-bold'
                      : 'bg-zinc-900 text-zinc-300 border-white/[0.06] hover:bg-zinc-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: ANATOMICAL SUB-REGIONS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Step 2: Choose Target Region & Anatomy
              </span>
              <span className="text-[11px] text-zinc-400">
                {currentSubregionObj.description}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentCategoryObj.subregions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubregion(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
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

          {/* EQUIPMENT FILTER PILLS */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Equipment:
            </span>
            {equipmentOptions.map((eq) => (
              <button
                key={eq}
                onClick={() => setSelectedEquipment(eq)}
                className={`text-[11px] px-2.5 py-0.5 rounded-full capitalize transition whitespace-nowrap ${
                  selectedEquipment === eq
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-900 text-zinc-400 border border-white/[0.04] hover:text-zinc-200'
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </>
      )}

      {/* STEP 3: RATED MOVEMENTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Step 3: Highly Rated Movements ({filteredExercises.length} available)
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Ranked by Growth vs. Fatigue Score
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredExercises.map((ex) => {
            const isAdded = addedIds.has(ex.id);
            const isCueExpanded = expandedCueId === ex.id;

            return (
              <div
                key={ex.id}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] hover:border-emerald-500/30 transition space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition">
                      {ex.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-zinc-400">{ex.equipment}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-[11px] text-emerald-400">{ex.targetMuscle}</span>
                    </div>
                  </div>

                  {/* Growth-to-Fatigue Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ★ {ex.growthFatigueScore || 9.2}
                    </span>
                    <div className="text-[9px] text-zinc-500 font-mono mt-0.5">Growth Score</div>
                  </div>
                </div>

                {/* Plain-English Rating & Efficiency meter */}
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/[0.04] space-y-1.5 text-xs">
                  <div className="flex flex-col gap-0.5 text-zinc-300">
                    <span className="text-zinc-400 text-[11px]">Biomechanics Advantage:</span>
                    <span className="text-emerald-300 font-medium leading-tight">{ex.plainRating}</span>
                  </div>
                  {ex.bestAngle && (
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/[0.04]">
                      <span>Optimal Setup:</span>
                      <span className="text-zinc-200">{ex.bestAngle}</span>
                    </div>
                  )}
                </div>

                {/* Form Cue Collapsible */}
                {ex.cue && (
                  <div>
                    <button
                      onClick={() => setExpandedCueId(isCueExpanded ? null : ex.id)}
                      className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition"
                    >
                      <span>Form guidance & mind-muscle cues</span>
                      {isCueExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isCueExpanded && (
                      <p className="mt-1.5 p-2.5 rounded-lg bg-zinc-950 border border-white/[0.04] text-[11px] text-zinc-300 leading-relaxed italic">
                        "{ex.cue}"
                      </p>
                    )}
                  </div>
                )}

                {/* 1-Tap Add to Workout Button */}
                <button
                  onClick={() => handleAdd(ex)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition active:scale-95 border flex items-center justify-center gap-1.5 ${
                    isAdded
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 border-emerald-500/20'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Workout!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>+ Add to Current Session</span>
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
