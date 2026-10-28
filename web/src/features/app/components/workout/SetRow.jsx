import React from 'react';
import { Minus, Plus, Check } from 'lucide-react';

export default function SetRow({
  set,
  exIndex,
  setIndex,
  onUpdateSet,
  onToggleSet,
}) {
  return (
    <tr className={`group transition-colors ${set.completed ? 'bg-emerald-950/10' : ''}`}>
      {/* Set Label */}
      <td className="py-2.5 text-center">
        <span
          className={`inline-block w-6 h-6 rounded-md font-mono text-xs font-bold leading-6 ${
            set.type === 'W'
              ? 'bg-amber-500/20 text-amber-300'
              : 'bg-zinc-800 text-zinc-300'
          }`}
        >
          {set.type}
        </span>
      </td>

      {/* Weight Input */}
      <td className="py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Decrease weight by 2.5 kg"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSet(exIndex, setIndex, 'weight', Math.max(0, Number((set.weight - 2.5).toFixed(1))));
            }}
            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center active:scale-95 transition"
          >
            <Minus className="w-3 h-3" />
          </button>
          <input
            type="number"
            step="0.5"
            min="0"
            aria-label={`Set ${set.type} weight in kilograms`}
            value={set.weight}
            onChange={(e) => onUpdateSet(exIndex, setIndex, 'weight', e.target.value)}
            className="w-14 px-2 py-1 rounded bg-zinc-900 border border-white/[0.08] text-center font-mono font-semibold text-white focus:border-emerald-500 focus:outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label="Increase weight by 2.5 kg"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSet(exIndex, setIndex, 'weight', Number((set.weight + 2.5).toFixed(1)));
            }}
            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center active:scale-95 transition"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </td>

      {/* Reps Input */}
      <td className="py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Decrease reps by 1"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSet(exIndex, setIndex, 'reps', Math.max(1, set.reps - 1));
            }}
            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center active:scale-95 transition"
          >
            <Minus className="w-3 h-3" />
          </button>
          <input
            type="number"
            min="1"
            aria-label={`Set ${set.type} reps`}
            value={set.reps}
            onChange={(e) => onUpdateSet(exIndex, setIndex, 'reps', e.target.value)}
            className="w-12 px-2 py-1 rounded bg-zinc-900 border border-white/[0.08] text-center font-mono font-semibold text-white focus:border-emerald-500 focus:outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label="Increase reps by 1"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSet(exIndex, setIndex, 'reps', set.reps + 1);
            }}
            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center active:scale-95 transition"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </td>

      {/* Complete Checkmark & PR Badge */}
      <td className="py-2.5 text-right pr-2">
        <div className="flex items-center justify-end gap-2">
          {set.isPR && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 animate-pulse">
              PR!
            </span>
          )}
          <button
            type="button"
            aria-label={set.completed ? `Mark Set ${set.type} incomplete` : `Mark Set ${set.type} complete`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSet(exIndex, setIndex);
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 ${
              set.completed
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-500 border border-white/[0.06]'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </td>
    </tr>
  );
}
