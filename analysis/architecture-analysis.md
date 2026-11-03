# Architecture Analysis

## Application flow
```
Landing --(Get Started)--> AuthModal --(session)--> Onboarding --> ProApp
                                  ^                                  |
                                  +------ authRequired guard --------+
```
- `App.jsx` holds `view`, `session`, `blueprint`, `authReady`.
- `authRequired = isCloudConfigured && !(DEV && VITE_SKIP_AUTH)`. When true, `/app` and `/onboarding` redirect signed-out users to the landing page with the sign-in dialog open.
- Sessions arrive through `AuthService.onAuthStateChange` (also handles the Google OAuth redirect) and are mirrored into `localStorage['fitlog_session']`.

## Data flow: logging a workout
1. `useWorkoutLogger` holds the active workout in React state (exercises, sets, volume, PR flags).
2. Finish: `ProApp.handleFinishWorkout` calls `WorkoutStore.saveWorkout`.
3. `saveWorkout` writes the record (UUID id) to `localStorage` history, updates local PRs, and, when cloud is configured, appends the record to `fitlog_sync_queue` and calls `CloudSync.flush()`.
4. `CloudSync.flush` (single-flight): for each queued record, upsert `workouts`, delete then insert `workout_sets`, insert `personal_records`. Successes leave the queue and flip `synced` in history; failures stay queued. The `online` event and `ProApp` mount trigger retries.
5. Sync status for the UI comes from `WorkoutStore.getSyncStatus()` and a `fitlog:sync` window event.

## Data model (`supabase/schema.sql`)
`profiles` (1:1 with `auth.users`, auto-created by trigger), `workouts`, `workout_sets`, `personal_records`, `body_stats`. All tables have RLS enabled with owner-only policies. `updated_at` triggers on profiles, workouts and sets.

## Layout and state patterns
- Responsive shell: `ProApp` chooses a 3-column studio at >=1024px or a single column with bottom nav; the user can override via a toggle.
- State is local React state plus `localStorage`. There is no global store or router.
- Design tokens live in `styles/theme.css` as CSS variables, but most components use hard-coded Tailwind color values (`bg-[#12141a]`, `emerald-500`). Tokens are defined, not consumed consistently.

## Security posture
- RLS isolates users in the database. The anon/publishable key is designed to be public.
- Gemini API key is bundled in client JavaScript (`VITE_GEMINI_API_KEY`). Anyone can extract and reuse it.
- Auth errors surface to the user; fake local sessions exist only when no Supabase key is configured.
- No server-side code in the repo (no Edge Functions yet).
