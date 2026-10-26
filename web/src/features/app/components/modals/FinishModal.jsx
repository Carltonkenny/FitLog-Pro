import React from 'react';
import EscapeClose from '../../../../components/EscapeClose';
import { Award } from 'lucide-react';
import { formatWeight, useSettings } from '../../../../lib/settings';

export default function FinishModal({
  isOpen,
  workout,
  formatTimer,
  onClose,
}) {
  const { unit } = useSettings();
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Workout complete" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <EscapeClose onClose={onClose} />
      <div className="bg-[#12141a] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-popIn">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Workout Complete!</h3>
          <p className="text-xs text-zinc-400">
            Outstanding effort! Your workout volume and personal records are saved.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.06]">
            <span className="text-zinc-400">Total Volume</span>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              {formatWeight(workout?.volumeKg || 0, unit)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.06]">
            <span className="text-zinc-400">Duration</span>
            <div className="text-base font-bold font-mono text-zinc-200 mt-0.5">
              {formatTimer(workout?.durationSeconds || 0)}
            </div>
          </div>
        </div>

        {workout?.newPRs && workout.newPRs.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>New Personal Records Broken:</span>
            </span>
            {workout.newPRs.map((pr, idx) => (
              <div key={idx} className="text-xs text-zinc-200 flex justify-between">
                <span>{pr.exerciseName}</span>
                <strong className="text-amber-400 font-mono">
                  {formatWeight(pr.weight, unit)} × {pr.reps} reps (est. max {formatWeight(pr.oneRepMax, unit)})
                </strong>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition active:scale-95 shadow-md shadow-emerald-500/20"
        >
          View in Workout History
        </button>
      </div>
    </div>
  );
}
