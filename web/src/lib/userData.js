import { useSyncExternalStore } from 'react';

// Per-user data that is not a workout: saved routines and what the companion knows about you.
// Stored locally, uploaded to the signed-in user's profile by userDataSync.js.
// Everything read from storage, the cloud or the AI is untrusted, so `normalize` re-validates it.

const KEY = 'fitlog_userdata';

export const LIMITS = { routines: 30, routineExercises: 20, notes: 40, noteChars: 140, nameChars: 40, ids: 60 };
export const EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbells', 'Cables', 'Machines', 'Bodyweight'];

const str = (v, max) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');
const int = (v, min, max, fallback) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const idList = (v) => [...new Set((Array.isArray(v) ? v : []).map((x) => str(x, 80)).filter(Boolean))].slice(0, LIMITS.ids);

/** Validates and trims any user-data object. Always returns a complete, safe shape. */
export function normalize(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const m = r.memory && typeof r.memory === 'object' ? r.memory : {};
  const favorites = idList(m.favorites);
  return {
    updatedAt: Number.isFinite(r.updatedAt) ? r.updatedAt : 0,
    routines: (Array.isArray(r.routines) ? r.routines : [])
      .map((x) => ({
        id: str(x?.id, 60) || `r_${Math.random().toString(36).slice(2, 10)}`,
        name: str(x?.name, LIMITS.nameChars),
        exercises: (Array.isArray(x?.exercises) ? x.exercises : [])
          .map((e) => ({
            exerciseId: str(e?.exerciseId, 100),
            exerciseName: str(e?.exerciseName, 150),
            sets: int(e?.sets, 1, 10, 3),
            reps: int(e?.reps, 1, 100, 10),
          }))
          .filter((e) => e.exerciseId && e.exerciseName)
          .slice(0, LIMITS.routineExercises),
      }))
      .filter((x) => x.name && x.exercises.length > 0)
      .slice(0, LIMITS.routines),
    memory: {
      petName: str(m.petName, 20) || 'Buddy',
      equipment: (Array.isArray(m.equipment) ? m.equipment : []).filter((e) => EQUIPMENT_OPTIONS.includes(e)),
      favorites,
      avoided: idList(m.avoided).filter((id) => !favorites.includes(id)),
      notes: (Array.isArray(m.notes) ? m.notes : []).map((n) => str(n, LIMITS.noteChars)).filter(Boolean).slice(-LIMITS.notes),
    },
  };
}

const listeners = new Set();
let current = read();

function read() {
  try {
    return normalize(JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch {
    return normalize({});
  }
}

export const getUserData = () => current;

function commit(next, { touch = true } = {}) {
  current = normalize({ ...next, updatedAt: touch ? Date.now() : next.updatedAt });
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // Storage full or blocked: the change still applies for this session.
  }
  listeners.forEach((fn) => fn({ touched: touch }));
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** Subscribe to changes. `touched` is false when the data came from the cloud (so it is not re-uploaded). */
export const onUserDataChange = subscribe;

/** React hook returning the live user data. */
export const useUserData = () => useSyncExternalStore((fn) => subscribe(fn), getUserData);

/** Replaces everything with cloud data, without marking it as a local edit. */
export const replaceUserData = (cloud) => commit(normalize(cloud), { touch: false });

/** Clears local data (used on sign-out so accounts never mix). */
export function resetUserData() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to clean up
  }
  current = normalize({});
  listeners.forEach((fn) => fn({ touched: false }));
}

// ---- routines -------------------------------------------------------------------------------

/** Saves a routine from `exercises`: [{ exerciseId, exerciseName, sets, reps }]. Returns false if invalid. */
export function addRoutine(name, exercises) {
  const draft = normalize({ routines: [{ id: `r_${Date.now().toString(36)}`, name, exercises }] }).routines[0];
  if (!draft) return false;
  commit({ ...current, routines: [draft, ...current.routines.filter((r) => r.name.toLowerCase() !== draft.name.toLowerCase())] });
  return true;
}

export const deleteRoutine = (id) => commit({ ...current, routines: current.routines.filter((r) => r.id !== id) });

// ---- companion memory ---------------------------------------------------------------------

const withMemory = (patch) => commit({ ...current, memory: { ...current.memory, ...patch } });

export const setPetName = (name) => withMemory({ petName: name });
export const setEquipment = (list) => withMemory({ equipment: list });

/** Marks an exercise as a favorite (clears "avoid"), or removes it from favorites. */
export function toggleFavorite(id) {
  const { favorites, avoided } = current.memory;
  const on = favorites.includes(id);
  withMemory({ favorites: on ? favorites.filter((x) => x !== id) : [...favorites, id], avoided: avoided.filter((x) => x !== id) });
}

/** Marks an exercise as one to avoid (clears "favorite"), or removes it from the avoid list. */
export function toggleAvoided(id) {
  const { favorites, avoided } = current.memory;
  const on = avoided.includes(id);
  withMemory({ avoided: on ? avoided.filter((x) => x !== id) : [...avoided, id], favorites: favorites.filter((x) => x !== id) });
}

/** Adds short facts the companion learned. Skips duplicates; the oldest are dropped past the limit. */
export function addNotes(notes) {
  const have = new Set(current.memory.notes.map((n) => n.toLowerCase()));
  const fresh = [];
  for (const raw of Array.isArray(notes) ? notes : []) {
    const n = str(raw, LIMITS.noteChars);
    if (!n || have.has(n.toLowerCase())) continue; // also skips repeats inside this same batch
    have.add(n.toLowerCase());
    fresh.push(n);
    if (fresh.length === 3) break;
  }
  if (fresh.length) withMemory({ notes: [...current.memory.notes, ...fresh] });
  return fresh;
}

export const deleteNote = (index) => withMemory({ notes: current.memory.notes.filter((_, i) => i !== index) });
export const clearNotes = () => withMemory({ notes: [] });
