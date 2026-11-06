import React, { useState } from 'react';
import { X } from 'lucide-react';
import { EXERCISE_LIBRARY } from '../../lib/exercises.js';
import {
  EQUIPMENT_OPTIONS,
  clearNotes,
  deleteNote,
  setEquipment,
  setPetName,
  toggleAvoided,
  toggleFavorite,
  useUserData,
} from '../../lib/userData.js';

const nameOf = (id) => EXERCISE_LIBRARY.find((e) => e.id === id)?.name || id;

/** Lets the user see, edit and erase everything the companion remembers about them. */
export default function MemoryPanel() {
  const { memory } = useUserData();
  const [name, setName] = useState(memory.petName);

  const toggleGear = (g) =>
    setEquipment(memory.equipment.includes(g) ? memory.equipment.filter((x) => x !== g) : [...memory.equipment, g]);

  const chip = 'inline-flex items-center gap-1 min-h-9 px-3 rounded-full text-xs bg-zinc-800 text-zinc-200 border border-white/[0.08]';

  return (
    <div className="p-4 space-y-4 text-xs overflow-y-auto">
      {/* Permanent Athlete Profile */}
      <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/[0.08] space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-zinc-200 font-semibold flex items-center gap-1.5">
            <span>👤</span> Athlete Profile
          </p>
          {memory.athleteProfile?.name ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Locked & Saved
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400">
              Not Enrolled
            </span>
          )}
        </div>
        {memory.athleteProfile?.name ? (
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2 rounded-xl bg-zinc-950/60 border border-white/[0.04]">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Name</span>
              <span className="text-zinc-200 font-semibold">{memory.athleteProfile.name}</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/60 border border-white/[0.04]">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Age</span>
              <span className="text-zinc-200 font-semibold">{memory.athleteProfile.age ? `${memory.athleteProfile.age} yrs` : 'Not set'}</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/60 border border-white/[0.04] col-span-2">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Occupation / Lifestyle</span>
              <span className="text-zinc-200 font-medium truncate block">{memory.athleteProfile.occupation || 'Not set'}</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/60 border border-white/[0.04] col-span-2">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Primary Target</span>
              <span className="text-zinc-200 font-medium truncate block">{memory.athleteProfile.goal || 'Hypertrophy & Strength'}</span>
            </div>
          </div>
        ) : (
          <p className="text-zinc-400 text-xs leading-relaxed">
            Not enrolled yet. Start talking to Coach Marcus or use the voice onboarding walkthrough to set up your profile.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="pet-name" className="text-zinc-300 font-medium block mb-1">Companion name</label>
        <input
          id="pet-name"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setPetName(name)}
          className="w-full h-11 px-3 rounded-xl bg-zinc-950 border border-white/[0.1] text-white"
        />
      </div>

      <fieldset>
        <legend className="text-zinc-300 font-medium mb-1">Equipment you have</legend>
        <p className="text-zinc-400 mb-2">Suggestions only use what you pick. Leave all off to see everything.</p>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map((g) => {
            const on = memory.equipment.includes(g);
            return (
              <button
                key={g}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggleGear(g)}
                className={`${chip} ${on ? '!bg-emerald-500 !text-zinc-950 font-semibold' : ''}`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </fieldset>

      {[
        ['Favorites', memory.favorites, toggleFavorite],
        ['Avoiding', memory.avoided, toggleAvoided],
      ].map(([label, ids, toggle]) =>
        ids.length ? (
          <div key={label}>
            <p className="text-zinc-300 font-medium mb-1">{label}</p>
            <div className="flex flex-wrap gap-2">
              {ids.map((id) => (
                <button key={id} type="button" onClick={() => toggle(id)} aria-label={`Remove ${nameOf(id)} from ${label.toLowerCase()}`} className={chip}>
                  {nameOf(id)}
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        ) : null
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-zinc-300 font-medium">Things {memory.petName} remembers</p>
          {memory.notes.length > 0 && (
            <button type="button" onClick={clearNotes} className="text-zinc-400 hover:text-white underline underline-offset-2 min-h-9 px-1">
              Forget all
            </button>
          )}
        </div>
        {memory.notes.length === 0 ? (
          <p className="text-zinc-400">Nothing yet. Tell {memory.petName} about your gear, schedule or goals and it will remember.</p>
        ) : (
          <ul className="space-y-1.5">
            {memory.notes.map((n, i) => (
              <li key={`${i}-${n}`} className="flex items-start justify-between gap-2 rounded-lg bg-zinc-900 border border-white/[0.06] px-3 py-2 text-zinc-200">
                <span>{n}</span>
                <button type="button" onClick={() => deleteNote(i)} aria-label={`Forget: ${n}`} className="shrink-0 w-8 h-8 -mr-1 -mt-1 flex items-center justify-center rounded text-zinc-400 hover:text-white">
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
