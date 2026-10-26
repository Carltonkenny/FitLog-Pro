import { supabase, isCloudConfigured } from './supabaseClient.js';
import { getUserData, onUserDataChange, replaceUserData } from './userData.js';

// Uploads routines and companion memory to the user's profile row and restores them on a new device.
// Rule: the copy with the newer `updatedAt` wins. Needs the `routines` and `coach_memory` columns
// from supabase/migrations/20261026_security_hardening.sql; without them it fails quietly and the
// data simply stays on this device.

let started = false;
let timer = null;
let warned = false;

const warnOnce = (msg) => {
  if (!warned) console.warn('User data sync:', msg);
  warned = true;
};

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id || null;
}

/** Uploads the current routines and memory. */
export async function pushUserData() {
  const uid = await currentUserId();
  if (!uid) return;
  const d = getUserData();
  const { error } = await supabase
    .from('profiles')
    .update({ routines: d.routines, coach_memory: { ...d.memory, updatedAt: d.updatedAt } })
    .eq('id', uid);
  if (error) warnOnce(error.message);
}

/** Downloads cloud data; adopts it if newer than the local copy, otherwise uploads the local copy. */
export async function pullUserData() {
  if (!isCloudConfigured || navigator.onLine === false) return;
  const uid = await currentUserId();
  if (!uid) return;
  const { data, error } = await supabase.from('profiles').select('routines, coach_memory').eq('id', uid).maybeSingle();
  if (error) return warnOnce(error.message);
  const cloudAt = Number(data?.coach_memory?.updatedAt) || 0;
  const local = getUserData();
  if (cloudAt > local.updatedAt) {
    replaceUserData({ routines: data.routines, memory: data.coach_memory, updatedAt: cloudAt });
  } else if (local.updatedAt > cloudAt) {
    await pushUserData();
  }
}

/** Starts uploading local edits (debounced). Safe to call more than once. */
export function startUserDataSync() {
  if (started || !isCloudConfigured) return;
  started = true;
  onUserDataChange(({ touched }) => {
    if (!touched) return;
    clearTimeout(timer);
    timer = setTimeout(() => pushUserData().catch((e) => warnOnce(e.message)), 1500);
  });
}
