import React from 'react';
import { Calculator, X } from 'lucide-react';

export default function MobileDrawer({
  isOpen,
  onClose,
  currentFocusedExercise,
}) {
  if (!isOpen) return null;

  const activeWeight = currentFocusedExercise?.sets?.[0]?.weight || 40;

  const computePlatesPerSide = (targetWeight, barWeight = 20) => {
    if (targetWeight <= barWeight) return [];
    let remPerSide = (targetWeight - barWeight) / 2;
    const standardPlates = [
      { weight: 20, color: 'bg-blue-600 text-white', label: '20' },
      { weight: 10, color: 'bg-emerald-600 text-white', label: '10' },
      { weight: 5, color: 'bg-zinc-200 text-zinc-950 font-bold', label: '5' },
      { weight: 2.5, color: 'bg-zinc-800 text-white', label: '2.5' },
      { weight: 1.25, color: 'bg-amber-600 text-white', label: '1.25' },
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
      <div className="bg-[#12141a] border-t border-white/[0.1] rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Barbell Sleeve & Gemini Coach</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barbell Graphic */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-white/[0.06] flex items-center px-4 overflow-hidden relative">
          <div className="w-5 h-10 bg-zinc-600 rounded-l-md border-r-2 border-zinc-400" />
          <div className="flex items-center gap-1 ml-1">
            {computePlatesPerSide(activeWeight).map((plate, idx) => (
              <div
                key={idx}
                className={`w-4 h-12 rounded flex items-center justify-center text-[9px] font-bold ${plate.color}`}
              >
                <span className="rotate-90">{plate.label}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 h-3 bg-zinc-500 rounded-r-full ml-1" />
        </div>

        {/* Form Cue */}
        <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.06] text-xs text-zinc-300">
          <strong className="text-emerald-400 block mb-1">
            {currentFocusedExercise?.exerciseName}:
          </strong>
          "{currentFocusedExercise?.notes}"
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
        >
          Done & Return to Workout
        </button>
      </div>
    </div>
  );
}
