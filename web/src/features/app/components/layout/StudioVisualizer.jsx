import React, { useMemo } from 'react';
import { Calculator, LineChart, Sparkles, CheckCircle2 } from 'lucide-react';
import { calculate1RM } from '../../../../lib/workoutStore';

export default function StudioVisualizer({ currentFocusedExercise }) {
  const focusedActiveWeight = useMemo(() => {
    if (!currentFocusedExercise || !currentFocusedExercise.sets) return 40;
    const completedOrFirst =
      currentFocusedExercise.sets.find((s) => s.completed && s.weight > 0) ||
      currentFocusedExercise.sets[0];
    return completedOrFirst?.weight || 40;
  }, [currentFocusedExercise]);

  const focusedActiveReps = useMemo(() => {
    if (!currentFocusedExercise || !currentFocusedExercise.sets) return 10;
    const completedOrFirst =
      currentFocusedExercise.sets.find((s) => s.completed && s.reps > 0) ||
      currentFocusedExercise.sets[0];
    return completedOrFirst?.reps || 10;
  }, [currentFocusedExercise]);

  // Olympic Barbell Plate Engine
  const computePlatesPerSide = (targetWeight, barWeight = 20) => {
    if (targetWeight <= barWeight) return [];
    let remPerSide = (targetWeight - barWeight) / 2;
    const standardPlates = [
      { weight: 20, color: 'bg-blue-600 border-blue-400 text-white', label: '20' },
      { weight: 10, color: 'bg-emerald-600 border-emerald-400 text-white', label: '10' },
      { weight: 5, color: 'bg-zinc-200 border-zinc-400 text-zinc-950 font-bold', label: '5' },
      { weight: 2.5, color: 'bg-zinc-800 border-zinc-600 text-white', label: '2.5' },
      { weight: 1.25, color: 'bg-amber-600 border-amber-400 text-white', label: '1.25' },
    ];
    const plates = [];
    for (const p of standardPlates) {
      while (remPerSide >= p.weight) {
        plates.push(p);
        remPerSide = Math.round((remPerSide - p.weight) * 100) / 100;
      }
    }
    return plates;
  };

  const estimatedMaxLift = calculate1RM(focusedActiveWeight, focusedActiveReps);

  return (
    <aside tabIndex={0} aria-label="Plate loader and coach" className="w-80 lg:w-96 border-l border-white/[0.08] p-4 space-y-5 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#0c0e12]/60 backdrop-blur-sm">
      {/* Olympic Barbell Sleeve Visualizer */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white">Olympic Barbell Visualizer</h4>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {focusedActiveWeight} kg
          </span>
        </div>

        <p className="text-[11px] text-zinc-400">
          Standard 20kg barbell sleeve. Load these exact plates on <strong>each side</strong>:
        </p>

        {/* Barbell Sleeve Graphic */}
        <div className="h-16 bg-zinc-950 rounded-xl border border-white/[0.06] flex items-center px-4 overflow-hidden relative">
          <div className="w-5 h-10 bg-zinc-600 rounded-l-md border-r-2 border-zinc-400" />
          <div className="flex items-center gap-1 ml-1">
            {computePlatesPerSide(focusedActiveWeight).map((plate, idx) => (
              <div
                key={idx}
                className={`w-4 h-12 rounded flex items-center justify-center text-[9px] font-bold shadow-md ${plate.color}`}
                title={`${plate.label} kg plate`}
              >
                <span className="rotate-90">{plate.label}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 h-3 bg-zinc-500 rounded-r-full ml-1" />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {computePlatesPerSide(focusedActiveWeight).map((plate, idx) => (
            <span
              key={idx}
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${plate.color}`}
            >
              {plate.label} kg
            </span>
          ))}
        </div>
      </div>

      {/* Live Estimated 1RM Strength Curve */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <LineChart className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white">Estimated 1-Rep Max Curve</h4>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400">
            {estimatedMaxLift} kg
          </span>
        </div>

        <p className="text-[11px] text-zinc-400">
          Based on {focusedActiveWeight} kg × {focusedActiveReps} reps using the standard Epley strength curve.
        </p>

        {/* SVG 1RM Strength Curve */}
        <div className="h-28 w-full bg-zinc-950/80 rounded-xl p-2 relative flex items-end justify-between border border-white/[0.04]">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 80">
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 10 20 Q 80 40 190 70"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 10 20 Q 80 40 190 70 L 190 80 L 10 80 Z"
              fill="url(#curveGradient)"
            />
            <circle cx="80" cy="40" r="4" fill="#10b981" />
          </svg>
          <div className="absolute top-2 left-2 text-[9px] font-mono text-zinc-400">
            1RM: {estimatedMaxLift} kg
          </div>
          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-zinc-400">
            10 Reps: {focusedActiveWeight} kg
          </div>
        </div>
      </div>

      {/* Gemini Biomechanics Coach Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-zinc-900 border border-emerald-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white">Gemini Biomechanics Cue</h4>
        </div>

        <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-white/[0.05]">
          <strong className="text-emerald-400 block mb-1">
            {currentFocusedExercise?.exerciseName || 'Form Focus'}:
          </strong>
          "{currentFocusedExercise?.notes || 'Control the eccentric phase for 2 seconds, keep joints aligned, avoid bouncing.'}"
        </div>

        <div className="space-y-1.5 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Shoulders pinned back to protect rotator cuff</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Feet flat on floor for ground reaction force</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
