# Codebase Analysis Progress

To continue in a new chat: "Continue codebase analysis - read `analysis/codebase-analysis-progress.md`, then proceed with the next phase."

## Settings
- Project root: `C:\Users\mail2\OneDrive\Desktop\Tabor\Tabor_projects\Fitlog_webapp` (web app in `web/`, schema in `supabase/`)
- Goal: prepare the web app for publishing. Technical focus only. Defaults used.
- Out of scope: `fitlog_pro/` (Flutter), design dossiers.

## Completed
- Phase 1 Discovery and Architecture: `project-overview.md`, `architecture-analysis.md`
- Phase 3 (partial) Recommendations: `technical-recommendations.md` (publish checklist)
- Dead code scan: `code-analysis-report.md`

## Not done
- Phase 2 deep dives per component (`workoutStore.js` exercise database, `useWorkoutLogger`, analytics, explorer). Ask before starting.
- `comprehensive-codebase-guide.md`, `developer-onboarding-guide.md`.

## Key findings
- Active shell is `ProApp`; `FullApp` and 5 tab files are dead.
- Cloud sync implemented in `web/src/lib/cloudSync.js`; untested with a real signed-in account.
- Gemini key is client-side; must move to an Edge Function before launch.
