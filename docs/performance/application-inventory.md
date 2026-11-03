# Application inventory (performance)

| Area | What exists | Performance note |
|---|---|---|
| Routes | `/` landing, `/onboarding`, `/app` (5 tabs in one route), `/reset-password` | App and onboarding are lazy chunks since this audit |
| JS | `index` 380 kB (118 kB gzip), `ProApp` 158 kB (45 kB gzip), `OnboardingFlow` 8 kB | Still one shared 380 kB chunk: React, Neon SDK, icons, landing |
| CSS | 72 kB (12.6 kB gzip), one file | Fine |
| Fonts | Google Fonts stylesheet: Inter (6 weights), JetBrains Mono (3), Outfit (4) | Render-blocking third-party CSS; see risk R2 |
| Images | `public/exercises/` is empty; landing/app use inline SVG icons | No image weight today |
| Third-party scripts | None. Fonts only | |
| State | `localStorage` (history, PRs, queue, draft, settings, user data) | Whole history is parsed from JSON; cached by raw string |
| Lists | History (was unbounded), picker (30 per page), explorer (filtered) | History now pages 30 at a time |
| Timers | Session clock (1 s interval while running), rest timer (1 s) | Both cleared on unmount |
| Network | Neon Auth (`/neon-auth/*`), API (`/me`, `/workouts`, `/records`, `/coach`, `/realtime/seal`) | `GET /workouts` limited to 200 |
| Service worker | `public/sw.js`, production only | Not measured |
| Tests | 54 unit/API tests, 127+ Playwright tests (mocked backend), axe audit | No load test, no performance gate in CI |
| Monitoring | None in the app | Add Sentry or similar before wider use |
