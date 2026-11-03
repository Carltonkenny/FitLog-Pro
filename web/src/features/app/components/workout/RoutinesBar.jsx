import React, { useState } from 'react';
import { BookmarkPlus, History as HistoryIcon, X } from 'lucide-react';
import { EXERCISE_LIBRARY } from '../../../../lib/exercises.js';
import { WorkoutStore } from '../../../../lib/workoutStore';
import { addRoutine, deleteRoutine, useUserData } from '../../../../lib/userData.js';

const byId = new Map(EXERCISE_LIBRARY.map((e) => [e.id, e]));

/** Turns saved exercises ({ exerciseId, exerciseName, sets, reps }) into the items the logger loads. */
export function toPlanItems(list) {
  return list.map((e) => ({
    item: byId.get(e.exerciseId) || { id: e.exerciseId, name: e.exerciseName, targetMuscle: 'Custom', equipment: 'Any' },
    sets: e.sets,
    reps: e.reps,
  }));
}

const chip = 'shrink-0 min-h-10 px-3.5 rounded-full text-xs font-medium border border-white/[0.1] bg-zinc-900 text-zinc-200 hover:border-emerald-500/50 flex items-center gap-1.5';

/** One-tap ways to start a workout: repeat the last one, or load a saved routine. */
export default function RoutinesBar({ exercises, onLoad }) {
  const { routines } = useUserData();
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const last = WorkoutStore.getHistory()[0];

  const save = (e) => {
    e.preventDefault();
    const ok = addRoutine(
      name,
      exercises.map((ex) => ({ exerciseId: ex.exerciseId, exerciseName: ex.exerciseName, sets: ex.sets.length, reps: ex.sets[0]?.reps || 10 }))
    );
    if (!ok) return setError('Enter a name and add at least one exercise.');
    setNaming(false);
    setName('');
    setError('');
  };

  const loadLast = () =>
    onLoad(
      last.title,
      toPlanItems(
        (last.exercises || [])
          .filter((e) => (e.sets || []).length > 0)
          .map((e) => ({ exerciseId: e.exerciseId, exerciseName: e.exerciseName, sets: e.sets.length, reps: e.sets[0].reps || 10 }))
      )
    );

  return (
    <section aria-label="Routines" className="space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {last && (
          <button type="button" onClick={loadLast} className={chip}>
            <HistoryIcon className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            Repeat last workout
          </button>
        )}
        {routines.map((r) => (
          <span key={r.id} className={`${chip} !pr-1`}>
            <button type="button" onClick={() => onLoad(r.name, toPlanItems(r.exercises))} className="min-h-10">
              {r.name}
            </button>
            <button
              type="button"
              aria-label={`Delete routine ${r.name}`}
              onClick={() => window.confirm(`Delete the routine "${r.name}"?`) && deleteRoutine(r.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </span>
        ))}
        {exercises.length > 0 && !naming && (
          <button type="button" onClick={() => setNaming(true)} className={`${chip} text-emerald-300`}>
            <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
            Save as routine
          </button>
        )}
      </div>

      {naming && (
        <form onSubmit={save} className="flex items-center gap-2">
          <label htmlFor="routine-name" className="sr-only">Routine name</label>
          <input
            id="routine-name"
            autoFocus
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name it, e.g. Push day"
            className="flex-1 min-w-0 h-11 px-3 rounded-xl bg-zinc-900 border border-white/[0.1] text-sm text-white placeholder:text-zinc-400 focus:border-emerald-500"
          />
          <button type="submit" className="h-11 px-4 rounded-xl bg-emerald-500 text-zinc-950 text-sm font-bold">Save</button>
          <button type="button" onClick={() => { setNaming(false); setError(''); }} className="h-11 px-3 rounded-xl text-zinc-300 hover:bg-white/[0.06] text-sm">Cancel</button>
        </form>
      )}
      {error && <p role="alert" className="text-xs text-amber-300">{error}</p>}
    </section>
  );
}
