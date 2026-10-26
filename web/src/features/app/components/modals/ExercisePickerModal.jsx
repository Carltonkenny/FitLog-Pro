import React, { useMemo, useState } from 'react';
import { Check, Plus, Search, Star } from 'lucide-react';
import EscapeClose from '../../../../components/EscapeClose';
import ExerciseImage from '../../../../components/ExerciseImage';
import { WorkoutStore } from '../../../../lib/workoutStore';
import { EXERCISE_LIBRARY } from '../../../../lib/exercises.js';
import { fitsEquipment, recommendExercises } from '../../../../lib/recommend.js';
import { EQUIPMENT_OPTIONS, setEquipment, toggleFavorite, useUserData } from '../../../../lib/userData.js';

const GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
const PAGE = 30;

const chipBase = 'shrink-0 min-h-10 px-3.5 rounded-full text-xs font-medium border';
const chipOn = 'bg-emerald-500 text-zinc-950 border-emerald-500 font-semibold';
const chipOff = 'bg-zinc-900 text-zinc-300 border-white/[0.1] hover:border-white/[0.25]';

function Row({ ex, reasons, added, favorite, onAdd, onFavorite }) {
  return (
    <li className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3">
      <ExerciseImage id={ex.id} name={ex.name} size={52} />
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-white text-sm leading-tight">{ex.name}</h4>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          {ex.muscle} · {ex.equipment} · growth {ex.growthFatigueScore.toFixed(1)}
        </p>
        {reasons?.length > 0 && (
          <p className="mt-1 flex flex-wrap gap-1">
            {reasons.map((r) => (
              <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                {r}
              </span>
            ))}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onFavorite}
        aria-pressed={favorite}
        aria-label={`${favorite ? 'Remove favorite' : 'Favorite'}: ${ex.name}`}
        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-amber-300"
      >
        <Star className={`w-4 h-4 ${favorite ? 'fill-amber-300 text-amber-300' : ''}`} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onAdd}
        aria-label={`Add ${ex.name}`}
        className={`shrink-0 h-11 min-w-20 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
          added ? 'bg-emerald-500 text-zinc-950' : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500 hover:text-zinc-950'
        }`}
      >
        {added ? <Check className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
        {added ? 'Added' : 'Add'}
      </button>
    </li>
  );
}

export default function ExercisePickerModal({ isOpen, onClose, onSelectExercise, blueprint, currentIds = [] }) {
  const { memory } = useUserData();
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('All');
  const [mineOnly, setMineOnly] = useState(true);
  const [added, setAdded] = useState([]);
  const [shown, setShown] = useState(PAGE);

  const owned = mineOnly ? memory.equipment : [];
  const searching = search.trim().length > 0;

  const suggestions = useMemo(
    () =>
      isOpen && !searching
        ? recommendExercises({
            history: WorkoutStore.getHistory(),
            memory: { ...memory, equipment: owned },
            blueprint: blueprint || {},
            muscle: group === 'All' ? null : group,
            exclude: [...currentIds, ...added],
            limit: 6,
          })
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, searching, memory, owned.join(), blueprint, group, currentIds.join(), added.join()]
  );

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return EXERCISE_LIBRARY.filter((e) => !memory.avoided.includes(e.id))
      .filter((e) => group === 'All' || e.muscle === group)
      .filter((e) => fitsEquipment(e, owned))
      .filter((e) => !q || e.name.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q) || e.equipment.toLowerCase().includes(q))
      .sort((a, b) => b.growthFatigueScore - a.growthFatigueScore);
  }, [search, group, owned.join(), memory.avoided]);

  if (!isOpen) return null;

  const add = (ex) => {
    onSelectExercise(ex);
    setAdded((prev) => [...prev, ex.id]);
  };
  const close = () => {
    setAdded([]);
    setSearch('');
    setShown(PAGE);
    onClose();
  };
  const toggleGear = (g) => setEquipment(memory.equipment.includes(g) ? memory.equipment.filter((x) => x !== g) : [...memory.equipment, g]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Choose exercises" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-fadeIn">
      <EscapeClose onClose={close} />
      <div className="bg-[#12141a] border border-white/[0.1] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl h-[92dvh] sm:h-auto sm:max-h-[88vh] p-4 sm:p-5 space-y-3 flex flex-col shadow-2xl animate-popIn">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Choose exercises</h3>
            <p className="text-xs text-zinc-400">{EXERCISE_LIBRARY.length} exercises. Picks adapt to your goal, gear and history.</p>
          </div>
          <button type="button" onClick={close} aria-label="Done" className="h-10 px-4 rounded-xl bg-emerald-500 text-zinc-950 text-sm font-bold">
            Done{added.length ? ` (${added.length})` : ''}
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShown(PAGE); }}
            aria-label="Search exercises"
            placeholder="Search by name, muscle or equipment"
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-zinc-900 border border-white/[0.1] text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500"
          />
        </div>

        <div role="radiogroup" aria-label="Muscle group" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {GROUPS.map((g) => (
            <button key={g} type="button" role="radio" aria-checked={group === g} onClick={() => { setGroup(g); setShown(PAGE); }} className={`${chipBase} ${group === g ? chipOn : chipOff}`}>
              {g}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-400">My equipment:</span>
          {EQUIPMENT_OPTIONS.map((g) => (
            <button key={g} type="button" role="checkbox" aria-checked={memory.equipment.includes(g)} onClick={() => toggleGear(g)} className={`${chipBase} ${memory.equipment.includes(g) ? chipOn : chipOff}`}>
              {g}
            </button>
          ))}
          {memory.equipment.length > 0 && (
            <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 min-h-10 ml-1">
              <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
              Only these
            </label>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {suggestions.length > 0 && (
            <section aria-label="Suggested for you">
              <h4 className="text-xs font-semibold text-emerald-300 mb-2">Suggested for you</h4>
              <ul className="space-y-2">
                {suggestions.map(({ exercise, reasons }) => (
                  <Row key={exercise.id} ex={exercise} reasons={reasons} added={added.includes(exercise.id)} favorite={memory.favorites.includes(exercise.id)} onAdd={() => add(exercise)} onFavorite={() => toggleFavorite(exercise.id)} />
                ))}
              </ul>
            </section>
          )}

          <section aria-label="All exercises">
            <h4 className="text-xs font-semibold text-zinc-300 mb-2">
              {searching ? 'Results' : 'All exercises'} ({list.length})
            </h4>
            {list.length === 0 && <p className="text-sm text-zinc-400">No exercises match. Try another muscle group or turn off the equipment filter.</p>}
            <ul className="space-y-2">
              {list.slice(0, shown).map((ex) => (
                <Row key={ex.id} ex={ex} added={added.includes(ex.id)} favorite={memory.favorites.includes(ex.id)} onAdd={() => add(ex)} onFavorite={() => toggleFavorite(ex.id)} />
              ))}
            </ul>
            {list.length > shown && (
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className="mt-3 w-full h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium">
                Show more
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
