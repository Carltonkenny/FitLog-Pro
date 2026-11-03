import { register } from 'node:module';

register('./loader.mjs', import.meta.url);

// Node 25 ships an experimental, unconfigured global localStorage that throws. Always use an in-memory one.
const store = new Map();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => void store.set(k, String(v)),
    removeItem: (k) => void store.delete(k),
    clear: () => store.clear(),
  },
});
