import React from 'react';
import { Minus, Plus, Check, Trophy } from 'lucide-react';

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
        {set.completed && <span className="sr-only">completed</span>}
      </td>

      {/* Weight Input */}
      <td className="py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Decrease weight"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSet(exIndex, setIndex, 'weight', Math.max(0, set.weight - 2.5));
            }}
            className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center active:scale-95 transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            inputMode="decimal"
            aria-label={`Weight in kilograms, set ${setIndex + 1}`}
            step="0.5"
            min="0"
            max="1000"
            value={set.weight}
            onChange={(e) => onUpdateSet(exIndex, setIndex, 'weight', e.target.value)}
            className="w-16 h-9 px-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-center font-mono font-semibold text-white focus:border-emerald-500 focus:outline-none tabular-nums"
          />
          <button
            aria-label="Increase weight"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSet(exIndex, setIndex, 'weight', Math.min(1000, set.weight + 2.5));
            }}
            className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </td>

      {/* Reps Input */}
      <td className="py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Decrease reps"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSet(exIndex, setIndex, 'reps', Math.max(1, set.reps - 1));
            }}
            className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center active:scale-95 transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="200"
            aria-label={`Reps, set ${setIndex + 1}`}
            value={set.reps}
            onChange={(e) => onUpdateSet(exIndex, setIndex, 'reps', e.target.value)}
            className="w-14 h-9 px-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-center font-mono font-semibold text-white focus:border-emerald-500 focus:outline-none tabular-nums"
          />
          <button
            aria-label="Increase reps"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSet(exIndex, setIndex, 'reps', set.reps + 1);
            }}
            className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </td>

      {/* Complete Checkmark & PR Badge */}
      <td className="py-2.5 text-right pr-2">
        <div className="flex items-center justify-end gap-2">
          {set.isPR && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 ">
              <Trophy className="inline w-3 h-3 -mt-0.5 mr-0.5" aria-hidden="true" />PR
            </span>
          )}
          <button
            aria-label={`${set.completed ? 'Mark set' : 'Complete set'} ${setIndex + 1}${set.completed ? ' as not done' : ''}`}
            aria-pressed={set.completed}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSet(exIndex, setIndex);
            }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${
              set.completed
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-500 border border-white/[0.06]'
            }`}
          >
            <Check className={`w-5 h-5 stroke-[3] transition-transform duration-200 ${set.completed ? 'scale-100' : 'scale-75'}`} />
          </button>
        </div>
      </td>
    </tr>
  );
}
