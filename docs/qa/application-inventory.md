# Application inventory

Source of truth: the code in `web/src` (read 2026-10-27) plus the running app. Backend behaviour comes from `web/functions` and `neon/schema.sql`. Where the app's behaviour is a **decision I inferred** rather than a written requirement, it is marked *(inferred)*. There are no written requirements or specs for the web app beyond the repo docs.

## 1. Routes
| Route | Screen | Access | Notes |
|---|---|---|---|
| `/` | Landing page | Anyone | Sections: hero, how it works (`#how-it-works`), coach (`#coach`), tools (`#tools`, includes `#calculator` and the anatomy explorer), pricing (`#pricing`), FAQ (`#faq`), final call to action, footer |
| `/onboarding` | Onboarding wizard (4 steps) | Signed-in user (or guest in dev mode) | Signed-out visitors are bounced to `/` with the sign-in dialog |
| `/app` | Main app, 5 tabs (not separate routes) | Signed-in user (or guest in dev mode) | Same guard as onboarding |
| `/simulator` | Legacy alias of `/app` | Same as `/app` | *(inferred: kept for old links)* |
| `/reset-password?token=...` | Opens the "choose a new password" dialog on the landing page, then rewrites the URL to `/` | Anyone with a valid emailed token | No token: nothing opens, URL still rewritten |
| any other path | Landing page | Anyone | SPA fallback |
| `/neon-auth/*` | Proxy to Neon Auth (dev: Vite, prod: Netlify rewrite) | n/a | Not a screen |
| `/manifest.webmanifest`, `/sw.js`, `/icons/*` | PWA assets | Anyone | Service worker registers in production builds only |

Backend (not screens, covered by `web/test/api.test.js` against a live database): `GET /health` (public), `GET|PUT /me`, `GET /workouts`, `PUT /workouts/:id`, `GET /records`, `POST /coach`, `POST /realtime/seal` (all need a Neon Auth JWT).

## 2. Screens, controls and states

### 2.1 Landing (`/`)
- **Navbar:** brand link, anchor links (How it works, AI coach, Tools, Pricing, FAQ), Sign in, Start free (or Open app when signed in), mobile menu button (`aria-expanded`), skip-to-content link.
- **Hero:** Start free, See how it works, trust list, interactive preview (4 set rows as checkboxes; completing all four shows "New personal record").
- **How it works / Coach / Pricing / Final CTA:** static content; Start free buttons.
- **Tools:** plate calculator (total-weight slider, reps slider, -5/-2.5/+2.5/+5 buttons, bar weight 20/15, estimated max), anatomy explorer (muscle chips).
- **FAQ:** six `<details>` items.
- **States:** signed-out, signed-in (Open app). No loading or error states.

### 2.2 Auth dialog (opens over the landing page)
- Modes: **signup** (name, email, password), **signin** (email, password, "Forgot password?"), **forgot** (email), **reset** (new password).
- Controls: close button, show/hide password, mode-switch links, submit, Google button (hidden unless `VITE_GOOGLE_AUTH=true`).
- Validation: name required; email must match `x@y.zz`; password 8+ characters for signup, reset and a non-empty password for signin. Errors appear after blur or submit, with `role="alert"`.
- States: idle, loading ("Working..."), error banner, notice banner (check inbox, password updated, reset link sent).
- Escape and the close button dismiss it. Focus lands on the first field.

### 2.3 Onboarding (`/onboarding`)
- Steps: goal (4 options), experience (3), split (4), body numbers (unit toggle kg/lb; body weight, target weight, best bench; all optional, max 300 kg / 500 kg equivalent).
- Controls: option cards (`role=radio`), Back, Continue / "Finish and start", "Skip for now", progress bar (`role=progressbar`).
- Behaviour: heading takes focus on each step; invalid numbers disable the submit; unit switch clears the numbers and changes limits; Finish saves the profile locally and (cloud mode) `PUT /me`, then opens `/app`.

### 2.4 App shell (`/app`)
- **Header:** back to home, session clock (Start/Resume, Pause, Restart), Studio/Mobile layout toggle, Finish Workout (disabled until a set is completed).
- **Navigation:** left sidebar (desktop width) or bottom bar (phone): Workout, Explorer, Progress, History, Settings, with `aria-current`.
- **Companion:** floating face button on every tab, opens a dialog panel.
- Skip link and an `h1` for the main region.

### 2.5 Workout tab
- Routines bar: Repeat last workout, saved routine chips (with delete), Save as routine (name field, Save, Cancel).
- Starter banner (dismiss, Ask the AI coach, Keep this session).
- Workout name field, clock, total lifted.
- Rest timer bar (`+30s`, `Skip`).
- Exercise cards: image (if present), name, target muscle, equipment, last session line, remove exercise, set rows (weight -/+/input, reps -/+/input, complete toggle, PR badge), Add Set.
- "Add exercise (N to choose from)" button.
- Phone only: "Plate Loader & Coach" drawer button.

### 2.6 Exercise picker (modal)
Search, muscle chips (All/Chest/Back/Legs/Shoulders/Arms/Core), equipment chips and "Only these", "Suggested for you" (6 with reasons), "All exercises" list (30 per page, Show more), favorite star, Add / Added, Done (n).

### 2.7 Explorer tab
Search, step 1 muscle group chips, step 2 sub-region chips, equipment pills, exercise rows with Add. States: results, no results.

### 2.8 Progress tab
Empty state (Log a workout button). With data: KPIs (total workouts, all-time volume, last 4 weeks, streak), top lifts, sets per muscle bars (`role=progressbar`).

### 2.9 History tab
Companion invitation button, list of past workouts (title, date label, duration, volume, exercise chips, "Waiting to sync" badge), empty state.

### 2.10 Settings tab
Profile card (email or "Guest on this device", goal, split, experience), weight unit radios, rest-time select, chime switch, vibration switch, install card (only when installable or on iOS), cloud sync status, Export my data, Sign out (signed-in only).

### 2.11 Companion panel
Header (name, Memory toggle, Close), chat log, quick chips (Build my plan, What should I train today?, Review my progress), photo attach (max 3, JPEG/PNG/WebP), message box, send, disclosure text. Memory view: name field, equipment checkboxes, favorites/avoiding chips, remembered notes with delete, Forget all.

### 2.12 Dialogs
Finish summary, restart confirm, exercise picker, session menu drawer (phone), auth dialog, companion. All have `role=dialog`; Escape closes them (companion too).

## 3. Persistence
`localStorage` keys: `fitlog_workout_history`, `fitlog_prs`, `fitlog_sync_queue`, `fitlog_profile`, `fitlog_settings`, `fitlog_userdata`, `fitlog_userdata_base`, `fitlog_session` (local-only mode). Everything else lives on the server per user.

## 4. Known gaps in the inventory
- No written requirements, so expected values come from code and tests, not a spec.
- Real sign-up, sign-in, email delivery and the Google flow cannot be exercised by automation (no accounts may be created), so those screens are tested against a **mocked** backend.
- Production-only features (service worker, Netlify headers, Netlify rewrite) are not reachable in the dev server.
