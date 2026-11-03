# Code Analysis and Cleanup Progress

To continue in a new chat: "Continue code analysis - read `analysis/code-analysis-progress.md`, then proceed with the next phase."

## Settings
- Scope: `web/src`, conservative (unused imports, unreachable files). Exclusions: `fitlog_pro/`, `node_modules`, `dist`.
- Safety: report only. No code deleted or modified by this analysis. Backup strategy: commit first, one commit per cleanup step, rollback with `git revert`.

## Phases
- [x] Discovery
- [x] Scanning (import-graph script over 44 files)
- [x] Analysis and review: see `code-analysis-report.md`
- [ ] **Cleanup: awaiting your explicit approval** of the plan at the end of the report

## Findings summary
- 8 unreachable files (about 1,870 lines): `FullApp`, `DashboardTab`, `ExercisesTab`, `HistoryTab`, `SettingsTab`, `WorkoutTab`, `WebSimulator`, `HandoffScreen`
- Vite template leftovers: `main.ts`, `counter.ts`, `style.css`, 3 assets
- 50 unused imports (49 lucide icons, 1 `calculate1RM`)
- No unused dependencies (`gsap` and `canvas-confetti` are used)
