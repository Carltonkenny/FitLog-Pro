# FitLog Pro: Project Overview

Scope: the React web app in `web/` plus `supabase/schema.sql`. The Flutter app in `fitlog_pro/` is a separate codebase and is not covered.

## Stack
| Layer | Technology |
|---|---|
| UI | React 18, Vite 6, Tailwind CSS 4 (`@tailwindcss/vite`), lucide-react icons |
| Animation | CSS transitions and keyframes (`web/src/styles/theme.css`), GSAP and canvas-confetti as dependencies |
| Backend | Supabase (Auth, Postgres with row-level security) via `@supabase/supabase-js` |
| AI | Gemini 2.0 Flash called directly from the browser (`GeminiHistoryCoach.jsx`) |
| Hosting target | Netlify (`netlify.toml`: base `web`, publish `dist`, SPA redirect) |
| Tests | `node web/test/domain_and_sync.test.js` (no framework; currently crashes on Node 25) |

## Layout
```
web/
  index.html            entry (loads src/main.jsx)
  src/
    main.jsx            React root, imports styles/theme.css
    App.jsx             view state machine: landing | onboarding | app, auth guard
    lib/
      supabaseClient.js Supabase client, AuthService, isCloudConfigured, authRequired
      workoutStore.js   exercise database (333+), history/PR store, sync status
      cloudSync.js      queue flush to Supabase (workouts, workout_sets, personal_records)
    features/
      landing/          marketing page and section components
      auth/             AuthModal
      onboarding/       4-step blueprint builder
      app/              ProApp (active shell), hooks/, components/{layout,workout,explorer,analytics,history,settings,modals}
    components/         shared pieces (EscapeClose)
    styles/theme.css    tokens, motion, focus, reduced-motion
supabase/schema.sql     5 tables, RLS policies, triggers, indexes (idempotent)
```

## Environment variables (`web/.env`, gitignored)
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`, and the dev-only `VITE_SKIP_AUTH`.
Anything prefixed `VITE_` is bundled into the browser JavaScript and is public.

## Entry points
- Browser: `index.html` -> `src/main.jsx` -> `App.jsx`
- Routes are manual (`history.pushState`): `/`, `/onboarding`, `/app`. Netlify's catch-all redirect serves `index.html` for all of them.
