import React, { useState } from 'react';
import { classifyMuscleVolume } from '../../../../domain/hypertrophyVerdict.js';

/**
 * 2-Sided Anatomical Muscle Heatmap (Front & Back)
 * Renders anatomical muscle groups with dynamic SVG fills based on weekly set volume.
 * Zero external SVG dependencies; pure responsive vector craft with Emil Kowalski transitions.
 */

export default function MuscleHeatmap({ weeklyMuscleSets = {}, onSelectGroup, selectedGroup }) {
  const [viewSide, setViewSide] = useState('both'); // 'both' | 'front' | 'back'
  const [hoveredGroup, setHoveredGroup] = useState(null);

  const activeFocus = selectedGroup || hoveredGroup;

  const getMuscleColor = (group) => {
    const sets = weeklyMuscleSets[group] || 0;
    const classification = classifyMuscleVolume(sets);
    if (sets === 0) return '#27272a'; // zinc-800 default idle
    return classification.color;
  };

  const getMuscleGlow = (group) => {
    const sets = weeklyMuscleSets[group] || 0;
    if (sets >= 10 && sets <= 20) return 'drop-shadow(0 0 6px rgba(0,245,155,0.45))';
    if (sets > 20) return 'drop-shadow(0 0 6px rgba(239,68,68,0.5))';
    return 'none';
  };

  const handleGroupClick = (group) => {
    if (onSelectGroup) {
      onSelectGroup(selectedGroup === group ? null : group);
    }
  };

  return (
    <div className="bg-[#0f1117] border border-white/[0.08] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-100 tracking-wide uppercase">
              Anatomical Muscle Heatmap
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
              LIVE STIMULUS
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Color mapped to weekly hypertrophy volume (RP Hypertrophy Model).
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-zinc-900/90 rounded-lg border border-white/[0.06] self-start sm:self-auto">
          {['both', 'front', 'back'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewSide(mode)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md capitalize transition-all ${
                viewSide === mode
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Muscle Focus Info Banner */}
      {activeFocus && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-white/[0.08] transition-all duration-200">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: getMuscleColor(activeFocus) }}
            />
            <div>
              <span className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
                {activeFocus}
              </span>
              <p className="text-[11px] text-zinc-400">
                {classifyMuscleVolume(weeklyMuscleSets[activeFocus] || 0).advice}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-mono font-bold text-zinc-100">
              {weeklyMuscleSets[activeFocus] || 0} <span className="text-xs font-normal text-zinc-400">sets</span>
            </div>
            <span
              className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: classifyMuscleVolume(weeklyMuscleSets[activeFocus] || 0).bg,
                color: classifyMuscleVolume(weeklyMuscleSets[activeFocus] || 0).color,
              }}
            >
              {classifyMuscleVolume(weeklyMuscleSets[activeFocus] || 0).label}
            </span>
          </div>
        </div>
      )}

      {/* SVG Canvas Area */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
        {/* FRONT BODY */}
        {(viewSide === 'both' || viewSide === 'front') && (
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase mb-2">
              Anterior (Front)
            </span>
            <svg
              viewBox="0 0 200 360"
              className="w-44 h-80 max-h-[340px] select-none cursor-pointer"
              aria-label="Front Anatomy Heatmap"
            >
              {/* Head / Neck neutral */}
              <circle cx="100" cy="28" r="16" fill="#1f242d" stroke="#333b47" strokeWidth="1.5" />
              <rect x="94" y="44" width="12" height="12" rx="2" fill="#1f242d" />

              {/* Traps */}
              <polygon
                points="84,48 94,48 94,60 80,62"
                fill={getMuscleColor('back')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('back')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('back')}
                className="transition-colors duration-200 hover:brightness-125"
              />
              <polygon
                points="116,48 106,48 106,60 120,62"
                fill={getMuscleColor('back')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('back')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('back')}
                className="transition-colors duration-200 hover:brightness-125"
              />

              {/* Shoulders (Anterior Deltoids) */}
              <path
                d="M 64 64 C 64 58, 80 56, 82 68 C 82 78, 64 82, 64 64 Z"
                fill={getMuscleColor('shoulders')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('shoulders') }}
                onMouseEnter={() => setHoveredGroup('shoulders')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('shoulders')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <path
                d="M 136 64 C 136 58, 118 56, 118 68 C 118 78, 136 82, 136 64 Z"
                fill={getMuscleColor('shoulders')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('shoulders') }}
                onMouseEnter={() => setHoveredGroup('shoulders')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('shoulders')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Pectorals (Chest) */}
              <path
                d="M 83 66 C 96 66, 98 78, 98 94 C 84 96, 76 90, 80 72 Z"
                fill={getMuscleColor('chest')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('chest') }}
                onMouseEnter={() => setHoveredGroup('chest')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('chest')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <path
                d="M 117 66 C 104 66, 102 78, 102 94 C 116 96, 124 90, 120 72 Z"
                fill={getMuscleColor('chest')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('chest') }}
                onMouseEnter={() => setHoveredGroup('chest')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('chest')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Arms (Biceps) */}
              <path
                d="M 62 82 C 60 96, 56 112, 60 122 C 66 122, 70 106, 68 84 Z"
                fill={getMuscleColor('arms')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('arms') }}
                onMouseEnter={() => setHoveredGroup('arms')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('arms')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <path
                d="M 138 82 C 140 96, 144 112, 140 122 C 134 122, 130 106, 132 84 Z"
                fill={getMuscleColor('arms')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('arms') }}
                onMouseEnter={() => setHoveredGroup('arms')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('arms')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Forearms */}
              <path
                d="M 58 126 C 52 142, 50 160, 52 170 C 56 170, 62 152, 62 126 Z"
                fill={getMuscleColor('arms')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('arms')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('arms')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <path
                d="M 142 126 C 148 142, 150 160, 148 170 C 144 170, 138 152, 138 126 Z"
                fill={getMuscleColor('arms')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('arms')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('arms')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Abdominals (Core) */}
              <rect
                x="88"
                y="98"
                width="11"
                height="14"
                rx="2"
                fill={getMuscleColor('core')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('core')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('core')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <rect
                x="101"
                y="98"
                width="11"
                height="14"
                rx="2"
                fill={getMuscleColor('core')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('core')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('core')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <rect
                x="88"
                y="114"
                width="11"
                height="14"
                rx="2"
                fill={getMuscleColor('core')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('core')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('core')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <rect
                x="101"
                y="114"
                width="11"
                height="14"
                rx="2"
                fill={getMuscleColor('core')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('core')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('core')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <rect
                x="90"
                y="130"
                width="9"
                height="12"
                rx="2"
                fill={getMuscleColor('core')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('core')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('core')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <rect
                x="101"
                y="130"
                width="9"
                height="12"
                rx="2"
                fill={getMuscleColor('core')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('core')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('core')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Quadriceps (Legs) */}
              <path
                d="M 80 156 C 76 190, 78 224, 84 246 C 96 244, 98 214, 96 158 Z"
                fill={getMuscleColor('legs')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('legs') }}
                onMouseEnter={() => setHoveredGroup('legs')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('legs')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <path
                d="M 120 156 C 124 190, 122 224, 116 246 C 104 244, 102 214, 104 158 Z"
                fill={getMuscleColor('legs')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('legs') }}
                onMouseEnter={() => setHoveredGroup('legs')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('legs')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Knees neutral */}
              <ellipse cx="88" cy="254" rx="6" ry="5" fill="#1f242d" stroke="#333b47" strokeWidth="1" />
              <ellipse cx="112" cy="254" rx="6" ry="5" fill="#1f242d" stroke="#333b47" strokeWidth="1" />

              {/* Anterior Calves (Tibialis & Gastrocnemius front) */}
              <path
                d="M 82 262 C 80 286, 82 312, 85 328 C 91 328, 93 300, 93 262 Z"
                fill={getMuscleColor('legs')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('legs')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('legs')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <path
                d="M 118 262 C 120 286, 118 312, 115 328 C 109 328, 107 300, 107 262 Z"
                fill={getMuscleColor('legs')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('legs')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('legs')}
                className="transition-all duration-200 hover:brightness-125"
              />
            </svg>
          </div>
        )}

        {/* BACK BODY */}
        {(viewSide === 'both' || viewSide === 'back') && (
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase mb-2">
              Posterior (Back)
            </span>
            <svg
              viewBox="0 0 200 360"
              className="w-44 h-80 max-h-[340px] select-none cursor-pointer"
              aria-label="Back Anatomy Heatmap"
            >
              {/* Head / Neck neutral */}
              <circle cx="100" cy="28" r="16" fill="#1f242d" stroke="#333b47" strokeWidth="1.5" />

              {/* Trapezius */}
              <path
                d="M 100 44 L 82 56 L 76 66 L 96 86 L 100 90 L 104 86 L 124 66 L 118 56 Z"
                fill={getMuscleColor('back')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('back') }}
                onMouseEnter={() => setHoveredGroup('back')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('back')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Rear Deltoids */}
              <path
                d="M 64 64 C 64 56, 76 58, 76 72 C 72 82, 64 80, 64 64 Z"
                fill={getMuscleColor('shoulders')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('shoulders') }}
                onMouseEnter={() => setHoveredGroup('shoulders')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('shoulders')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <path
                d="M 136 64 C 136 56, 124 58, 124 72 C 128 82, 136 80, 136 64 Z"
                fill={getMuscleColor('shoulders')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('shoulders') }}
                onMouseEnter={() => setHoveredGroup('shoulders')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('shoulders')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Triceps */}
              <path
                d="M 62 82 C 60 96, 56 112, 60 124 C 66 122, 68 108, 66 82 Z"
                fill={getMuscleColor('arms')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('arms') }}
                onMouseEnter={() => setHoveredGroup('arms')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('arms')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <path
                d="M 138 82 C 140 96, 144 112, 140 124 C 134 122, 132 108, 134 82 Z"
                fill={getMuscleColor('arms')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('arms') }}
                onMouseEnter={() => setHoveredGroup('arms')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('arms')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Latissimus Dorsi (Lats) */}
              <path
                d="M 76 80 C 70 100, 76 126, 88 136 C 96 124, 96 98, 96 88 Z"
                fill={getMuscleColor('back')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('back') }}
                onMouseEnter={() => setHoveredGroup('back')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('back')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <path
                d="M 124 80 C 130 100, 124 126, 112 136 C 104 124, 104 98, 104 88 Z"
                fill={getMuscleColor('back')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('back') }}
                onMouseEnter={() => setHoveredGroup('back')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('back')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Lower Back / Erector Spinae */}
              <path
                d="M 92 118 L 108 118 L 106 146 L 94 146 Z"
                fill={getMuscleColor('back')}
                stroke="#18181b"
                strokeWidth="1"
                onMouseEnter={() => setHoveredGroup('back')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('back')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Glutes (Legs/Gluteal complex) */}
              <path
                d="M 78 148 C 76 172, 86 186, 99 184 C 99 160, 92 148, 78 148 Z"
                fill={getMuscleColor('legs')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('legs') }}
                onMouseEnter={() => setHoveredGroup('legs')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('legs')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <path
                d="M 122 148 C 124 172, 114 186, 101 184 C 101 160, 108 148, 122 148 Z"
                fill={getMuscleColor('legs')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('legs') }}
                onMouseEnter={() => setHoveredGroup('legs')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('legs')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Hamstrings (Posterior Legs) */}
              <path
                d="M 80 188 C 76 214, 78 238, 84 250 C 94 250, 96 226, 96 188 Z"
                fill={getMuscleColor('legs')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('legs') }}
                onMouseEnter={() => setHoveredGroup('legs')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('legs')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <path
                d="M 120 188 C 124 214, 122 238, 116 250 C 106 250, 104 226, 104 188 Z"
                fill={getMuscleColor('legs')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('legs') }}
                onMouseEnter={() => setHoveredGroup('legs')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('legs')}
                className="transition-all duration-200 hover:brightness-125"
              />

              {/* Calves (Gastrocnemius & Soleus) */}
              <path
                d="M 81 262 C 77 284, 80 306, 85 328 C 93 328, 95 304, 93 262 Z"
                fill={getMuscleColor('legs')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('legs') }}
                onMouseEnter={() => setHoveredGroup('legs')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('legs')}
                className="transition-all duration-200 hover:brightness-125"
              />
              <path
                d="M 119 262 C 123 284, 120 306, 115 328 C 107 328, 105 304, 107 262 Z"
                fill={getMuscleColor('legs')}
                stroke="#18181b"
                strokeWidth="1.5"
                style={{ filter: getMuscleGlow('legs') }}
                onMouseEnter={() => setHoveredGroup('legs')}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => handleGroupClick('legs')}
                className="transition-all duration-200 hover:brightness-125"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/[0.06] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 shrink-0" />
          <span className="text-zinc-400">&lt;4 sets (Under MEV)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span className="text-zinc-400">4-9 sets (Maintenance)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(0,245,155,0.4)]" />
          <span className="text-emerald-400 font-medium">10-20 sets (Optimal MAV)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
          <span className="text-red-400">&gt;20 sets (Junk Volume)</span>
        </div>
      </div>
    </div>
  );
}

