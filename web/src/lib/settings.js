import { useSyncExternalStore } from 'react';

const KEY = 'fitlog_settings';
const KG_PER_LB = 0.45359237;

export const REST_OPTIONS = [30, 45, 60, 90, 120, 150, 180, 240, 300];

const DEFAULTS = { unit: 'kg', restSeconds: 90, sound: true, haptics: true };

const listeners = new Set();
let current = read();

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      unit: saved.unit === 'lb' ? 'lb' : 'kg',
      restSeconds: REST_OPTIONS.includes(saved.restSeconds) ? saved.restSeconds : DEFAULTS.restSeconds,
      sound: saved.sound !== false,
      haptics: saved.haptics !== false,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

/** Current settings (a stable object until something changes). */
export const getSettings = () => current;

/** Merges a partial update, persists it and notifies subscribers. */
export function setSettings(patch) {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // Storage full or blocked: the setting still applies for this session.
  }
  listeners.forEach((fn) => fn());
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** React hook returning the live settings. */
export const useSettings = () => useSyncExternalStore(subscribe, getSettings);

const round = (n, places) => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

/** kg (canonical storage) to the number shown to the user. lb is rounded to 0.1. */
export const toDisplay = (kg, unit) => (unit === 'lb' ? round(kg / KG_PER_LB, 1) : round(kg, 2));

/** User-entered number back to kg, rounded to 0.01 as stored. */
export const fromDisplay = (value, unit) => round(unit === 'lb' ? value * KG_PER_LB : value, 2);

/** "62.5 kg" or "137.8 lb". */
export const formatWeight = (kg, unit) => `${toDisplay(kg, unit).toLocaleString()} ${unit}`;

/** Step used by the +/- buttons: 2.5 kg or 5 lb, returned in kg. */
export const stepKg = (unit) => (unit === 'lb' ? fromDisplay(5, 'lb') : 2.5);

/** Short vibration on set completion when the device supports it and the user allows it. */
export function buzz() {
  if (current.haptics && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
}
