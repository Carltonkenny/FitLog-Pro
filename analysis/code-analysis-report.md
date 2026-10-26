# Dead Code and Unused Import Report

Mode: conservative, report only. **Nothing has been deleted or modified.** Method: import-graph scan of `web/src` (44 JS/JSX/TS files) plus manual checks. Dynamic imports and string-based references were checked; none exist for the files below.

## A. Unreachable files (high confidence)
Nothing in the app imports these, so they never ship in the bundle.

| File | Lines | Why unreachable | Risk of removing |
|---|---|---|---|
| `src/features/app/FullApp.jsx` | 196 | Old app shell, replaced by `ProApp`. Importer: none | None |
| `src/features/app/DashboardTab.jsx` | 144 | Imported only by `FullApp` | None |
| `src/features/app/ExercisesTab.jsx` | 104 | Imported only by `FullApp` | None |
| `src/features/app/HistoryTab.jsx` | 99 | Imported only by `FullApp` | None |
| `src/features/app/SettingsTab.jsx` | 192 | Imported only by `FullApp` | None |
| `src/features/app/WorkoutTab.jsx` | 316 | Imported only by `FullApp` | None |
| `src/features/simulator/WebSimulator.jsx` | 676 | No importer | None |
| `src/features/handoff/HandoffScreen.jsx` | 144 | No importer (mobile deep-link handoff) | None |

Subtotal: about 1,870 lines (a third of the 5.9k-line source tree).
Note: `SettingsTab` and `HandoffScreen` contain the `fitlogpro://auth/callback?token=...` deep link that puts an access token in a URL. Removing them also removes that pattern.

## B. Vite template leftovers (high confidence)
`src/main.ts`, `src/counter.ts`, `src/style.css`, `src/assets/{hero.png,typescript.svg,vite.svg}`. `index.html` loads only `main.jsx`; nothing references these. `public/icons.svg` is also unreferenced.

## C. Duplicate hosting pages (medium confidence)
`netify.html` (typo) and `netlify.html` at the repo root are standalone pages, not part of the Vite build. Confirm they are not served before removing.

## D. Unused imports (high confidence, 50 names)
All are `lucide-react` icons except `calculate1RM` in `WebSimulator.jsx`. Counts by file, live files only:
- `AnalyticsView.jsx`: Award, BarChart3, LineChart
- `CascadingExplorerView.jsx`: Sparkles
- `GeminiHistoryCoach.jsx`: TrendingUp, Award, Layers
- `HistoryView.jsx`: Zap, Award, ChevronRight
- `SettingsView.jsx`: Volume2, Smartphone, Check
- `landing/Hero.jsx`: Zap; `Navbar.jsx`: ShieldCheck, User; `ComparisonMatrix.jsx`: ShieldAlert
- `PlateCalculator.jsx`: Plus, Minus, Info, Sparkles; `ScienceAcademy.jsx`: Layers, Sparkles
- The remaining names are in files from section A and disappear if those files are removed.

Impact: negligible at runtime (the bundler drops unused icons); cleanup is for readability and lint cleanliness.

## E. Other findings
- All dependencies in `package.json` are in use (`gsap` drives the landing Hero animation; `canvas-confetti` is used by the live app). Nothing to remove there.
- Main bundle is 604 KB (176 KB gzip). A single chunk; code-splitting `landing` and `app` would help first load.
- `public/hero_gym.jpg` (732 KB) and `public/anatomy_biomechanics.jpg` (852 KB) are the heaviest assets; compress or convert to WebP before launch.

## Proposed cleanup plan (needs your approval)
1. Commit current work first so everything is reversible.
2. Remove section A and B files in one commit; run `npm run build`.
3. Remove unused imports in section D; run `npm run build`.
4. Optionally compress the two images.

Rollback: `git revert` of each commit.
