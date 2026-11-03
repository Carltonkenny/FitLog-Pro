# Architecture review (performance view)

Read from the repository on 2026-10-28. Nothing here is measured unless it says so.

## Request path
Browser → Netlify (static files, `/neon-auth/*` rewrite) → Neon Auth (sign-in, JWT) and → Neon Function `api` (Hono + `pg` pool) → Neon Postgres. The AI coach adds one hop: `api` → Gemini.

- **Front end:** React 18 + Vite + Tailwind 4, one SPA, routes chosen from `window.location.pathname` in `src/App.jsx`. No router library, no server-side rendering. Landing, onboarding and the app were one 545 kB bundle; they are now three chunks (landing 380 kB, app 158 kB, onboarding 8 kB, before gzip).
- **Local-first:** a finished workout is written to `localStorage` first, then pushed through a queue (`src/lib/cloudSync.js`). Screens never wait for the network.
- **API:** 7 routes, every query filtered by the verified user id. Workout upload is one transaction (upsert, delete old sets, bulk-insert sets, insert records). `GET /workouts` is two queries (no N+1).
- **Database:** indexes exist for the hot paths: `workouts(user_id, started_at DESC)`, `workout_sets(workout_id)`, `personal_records(user_id, exercise_id)`, and a unique key on records.
- **Caching:** hashed `/assets/*` are `immutable` for a year; `/sw.js` is `no-cache`. Good.
- **Realtime:** `@neon/realtime` sealed queries; client re-pulls on change.

## Performance-critical paths
1. Landing first paint (marketing traffic).
2. Opening `/app` and logging a set (the product).
3. History/Progress with many saved workouts (all data is in the browser).
4. Workout upload and pull (Neon round trips).
5. AI coach call (Gemini latency, up to 6 MB request body with photos).

## Not available / not done
- No production-like dataset, no APM, no real-user monitoring (Sentry is configured as an MCP but not installed in the app).
- No load test was run: the only live backend is your real Neon project, so I did not hit it with traffic.
- Lighthouse itself was not installed; I measured the same Core Web Vitals directly in the browser (see `performance-report.md`).
