import React from 'react';
import { Minus, Plus, Check, Trophy } from 'lucide-react';
import { fromDisplay, stepKg, toDisplay, useSettings } from '../../../../lib/settings';

const MAX_KG = 1000;
const MAX_REPS = 200;

const stepperClass =
  'w-9 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center';
const inputClass =
  'h-10 px-1 rounded-lg bg-zinc-900 border border-white/[0.1] text-center font-mono font-semibold text-white focus:border-emerald-500 tabular-nums';

export default function SetRow({ set, exIndex, setIndex, onUpdateSet, onToggleSet }) {
  const { unit } = useSettings();
  const n = setIndex + 1;
  const weightShown = toDisplay(set.weight, unit);

  const changeWeight = (kg) => onUpdateSet(exIndex, setIndex, 'weight', Math.min(MAX_KG, Math.max(0, kg)));

  return (
    <tr className={`group transition-colors ${set.completed ? 'bg-emerald-950/20' : ''}`}>
      {/* Set label */}
      <td className="py-2 text-center">
        <span
          className={`inline-block w-6 h-6 rounded-md font-mono text-xs font-bold leading-6 ${
            set.type === 'W' ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-800 text-zinc-300'
          }`}
        >
          {set.type}
        </span>
        {set.completed && <span className="sr-only">completed</span>}
      </td>

      {/* Weight */}
      <td className="py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Decrease weight, set ${n}`}
            onClick={(e) => {
              e.stopPropagation();
              changeWeight(set.weight - stepKg(unit));
            }}
            className={stepperClass}
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <input
            type="number"
            inputMode="decimal"
            aria-label={`Weight in ${unit === 'lb' ? 'pounds' : 'kilograms'}, set ${n}`}
            step={unit === 'lb' ? 5 : 0.5}
            min="0"
            max={toDisplay(MAX_KG, unit)}
            value={weightShown}
            onChange={(e) => changeWeight(fromDisplay(Number(e.target.value) || 0, unit))}
            className={`w-14 ${inputClass}`}
          />
          <button
            type="button"
            aria-label={`Increase weight, set ${n}`}
            onClick={(e) => {
              e.stopPropagation();
              changeWeight(set.weight + stepKg(unit));
            }}
            className={stepperClass}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </td>

      {/* Reps */}
      <td className="py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Decrease reps, set ${n}`}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSet(exIndex, setIndex, 'reps', Math.max(1, set.reps - 1));
            }}
            className={stepperClass}
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <input
            type="number"
            inputMode="numeric"
            aria-label={`Reps, set ${n}`}
            min="0"
            max={MAX_REPS}
            value={set.reps}
            onChange={(e) => onUpdateSet(exIndex, setIndex, 'reps', e.target.value)}
            className={`w-11 ${inputClass}`}
          />
          <button
            type="button"
            aria-label={`Increase reps, set ${n}`}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSet(exIndex, setIndex, 'reps', Math.min(MAX_REPS, set.reps + 1));
            }}
            className={stepperClass}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </td>

      {/* Complete + PR badge */}
      <td className="py-2 text-right pr-1">
        <div className="flex items-center justify-end gap-2">
          {set.isPR && (
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              <Trophy className="inline w-3 h-3 -mt-0.5 mr-0.5" aria-hidden="true" />
              PR
            </span>
          )}
          <button
            type="button"
            aria-label={`${set.completed ? 'Undo set' : 'Complete set'} ${n}`}
            aria-pressed={set.completed}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSet(exIndex, setIndex);
            }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-150 ${
              set.completed
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-white/[0.08]'
            }`}
          >
            <Check
              className={`w-5 h-5 stroke-[3] transition-transform duration-200 ${set.completed ? 'scale-100' : 'scale-75'}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </td>
    </tr>
  );
}
