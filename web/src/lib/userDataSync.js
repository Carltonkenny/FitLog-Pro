import { api, isCloudConfigured } from './neonClient.js';
import { getUserData, mergeUserData, normalize, onUserDataChange, replaceUserData } from './userData.js';

// Uploads routines and companion memory to the user's profile and restores them on a new device.
// Both sides keep their own edits: when they differ, routines and memory notes are merged, never replaced.

// `base` is what both sides looked like after the last successful sync. It lets the merge tell "added" from "deleted".
const BASE_KEY = 'fitlog_userdata_base';
const readBase = () => {
  try {
    return normalize(JSON.parse(localStorage.getItem(BASE_KEY) || '{}'));
  } catch {
    return normalize({});
  }
};
const writeBase = (d) => {
  try {
    localStorage.setItem(BASE_KEY, JSON.stringify(d));
  } catch {
    // Storage full: the next sync treats everything as new, which is safe (nothing is deleted).
  }
};

let started = false;
let timer = null;
let warned = false;

const warnOnce = (msg) => {
  if (!warned) console.warn('User data sync:', msg);
  warned = true;
};

/** Uploads the current routines and memory. */
export async function pushUserData() {
  const d = getUserData();
  try {
    await api('/me', { method: 'PUT', body: { routines: d.routines, coach_memory: { ...d.memory, updatedAt: d.updatedAt } } });
    writeBase(d);
  } catch (err) {
    warnOnce(err.code || err.message);
  }
}

/** Downloads cloud data and merges it with this device's copy, then uploads the merged result if it changed. */
export async function pullUserData() {
  if (!isCloudConfigured || navigator.onLine === false) return;
  let profile;
  try {
    ({ profile } = await api('/me'));
  } catch (err) {
    return warnOnce(err.code || err.message);
  }
  const cloudAt = Number(profile?.coach_memory?.updatedAt) || 0;
  const cloud = { routines: profile?.routines, memory: profile?.coach_memory, updatedAt: cloudAt };
  const local = getUserData();
  const merged = mergeUserData(local, cloud, readBase());
  // Compare normalized copies, or the cloud's extra updatedAt field would always look like a difference
  // and every pull would push, which would trigger another live update, forever.
  const same = (x, y) => JSON.stringify([x.routines, x.memory]) === JSON.stringify([y.routines, y.memory]);
  const changedHere = !same(merged, local);
  const changedThere = !same(merged, normalize(cloud));
  if (changedHere) replaceUserData(merged);
  if (changedThere) await pushUserData();
  else writeBase(merged);
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
