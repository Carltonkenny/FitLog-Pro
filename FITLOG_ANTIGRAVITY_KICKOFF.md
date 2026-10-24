# FitLog Pro: Antigravity Kickoff Brief

Version 1.0 | 21 Oct 2026 | Companion to `FitLog Pro Spec.docx` (called "the Spec")
Owner: Ken | Method: spec-driven, gated, human decides at every gate

---

## 0. How to use this document

1. Read this brief and the Spec completely before doing anything.
2. This brief governs **process**. The Spec governs **product scope**, except where §3 amendments are approved by the owner.
3. If the Spec is silent or ambiguous, ask the owner. Never guess scope.
4. Never skip a gate. At every `STOP` the owner must reply in chat before work continues.

## 1. Mission

**Phase 1 (this brief):** produce three comparable design-direction prototypes of FitLog Pro using identical mock data, then **STOP** for the owner's decision.
**Phase 2 (after the decision):** build the app from the Spec on the chosen direction, in gated sprints (§6).

Phase 1 is a design exercise. It contains no backend, no persistence, no auth, no ads, no billing.

## 2. Operating rules (copy into `AGENTS.md` at Gate 0)

1. Plan first. Every agent produces a plan artifact and waits for approval before editing code, unless the owner pre-approved the plan.
2. One vertical slice per task. Small commits, conventional commit messages (`feat:`, `fix:`, `test:`, `docs:`).
3. Never push to or merge into `main` without owner approval. Work on branches. Never delete branches, files outside the task, or git history.
4. Every task cites its source: a Spec section or screen ID (e.g. "S-13") or an approved amendment ID (e.g. "A-03").
5. No hardcoded colors, font sizes, spacing, or radii in widgets. Tokens only, from one file per theme.
6. Run `flutter analyze` and `flutter test` before declaring any task done. Report real output, not a summary of what should pass.
7. Terminal commands are limited to `flutter`, `dart`, `git`, and file operations in the workspace. Ask before anything else, including installing global tools.
8. Never put secrets or API keys in the repo or in client code.
9. Do not copy competitor screenshots, icons, copy, or layouts. Icons: Material or Phosphor only. Fonts: Inter or Poppins via `google_fonts`.
10. Verify before asserting: for any package version, store policy, price, or API model ID, look it up in current official docs and cite the source in the PR description.

## 3. Spec audit and proposed amendments

Present this table to the owner at Gate 0. Each row is a **proposal**. Apply nothing until the owner replies approve, reject, or modify per ID.

| ID | Spec says | Problem | Proposal |
|---|---|---|---|
| A-01 | "SQLite via Hive" for local storage | Hive is a NoSQL key-value store, not SQLite. History, volume, and PR queries need relational queries. | Use Drift (SQLite) for workout data. Keep SharedPreferences for settings. |
| A-02 | Body stats: S-19 says "Free feature", feature table says Pro only | Direct contradiction | Owner decides. Suggested: basic weight log free, long-range charts Pro. |
| A-03 | "WhatsApp ✅" in competitor table | No WhatsApp feature exists in the Spec | Remove the claim from v1 positioning, or add share-as-image-to-WhatsApp as a defined Pro feature. |
| A-04 | "Generous free tier" but 1 routine, fixed 90 s timer, 30-day visible history | Marketing claim contradicts the limits. The Spec also lists "no timer customization" as a competitor complaint. | Owner decides. Suggested: customizable rest timer free, 3 routines free. |
| A-05 | Firebase free tier "covers up to 50K users" | Free tier is quota-based (reads, writes, storage), not user-count-based. Cloud Functions need the Blaze plan. | Restate as quotas; verify current limits in Firebase docs. |
| A-06 | Play Billing fee "30%" | Subscription fees are lower for subscriptions. Verify current Play fee schedule. | Correct after verifying. |
| A-07 | Claude API called for AI tips; model `claude-sonnet-4-6` | Calling from the client exposes the API key. The model ID may be outdated. | Route through a backend proxy (Cloud Function) with auth and rate limits. Look up current model IDs at docs.claude.com and choose a small, cheap model. Move AI tips to v1.1 if the schedule slips. |
| A-08 | Autosave every 10 seconds | Up to 10 s of lost sets on a crash or process kill | Persist on every set completion and on app lifecycle pause. Test process death. |
| A-09 | Rest timer (S-14) | A Dart timer dies when the app is backgrounded | Use a scheduled notification or foreground service. Handle Android 12+ exact-alarm and notification permissions. |
| A-10 | Write 300 exercise instructions by hand | Large time sink | Evaluate an open-licensed dataset (verify license, e.g. free-exercise-db). Otherwise generate originals in reviewed batches. Ship the free tier's 50 first. |
| A-11 | Ads, 20 badges, plate calculator, Hindi UI, shimmer and Hero animations in v1 | Scope too wide for the timebox | Defer: ads, badges beyond 5, plate calculator, Hindi, Hero animations. |
| A-12 | Play Store launch in week 8 | New personal developer accounts may require a closed-testing period before production access | Verify the current rule at Gate 0. Recruit testers early. |
| A-13 | Dark mode is Pro-only | Theming should not be retrofitted | Build light and dark token sets from day one. Gate dark mode behind a feature flag. |
| A-14 | State management "Provider / Riverpod" | Ambiguous | Riverpod, decided. |
| A-15 | Revenue projections (5% conversion, 500 month-1 downloads) | No acquisition plan behind the numbers | Treat as non-binding. Do not optimize the build for them. |

## 4. Phase map and gates

| Gate | Name | Output | Who decides |
|---|---|---|---|
| G0 | Intake | Spec audit (§3) answered, open questions answered, repo and rules files created | Owner |
| G1 | Design brief | `design/brief.md` approved | Owner |
| G2 | Variants built | 3 branches, 15 screenshots, scorecard drafts | Reviewer agent, then owner |
| G3 | **Decision** | Owner picks A, B, C, or a named hybrid | **Owner only** |
| G4 | Foundation | Boilerplate on `main`, winning tokens locked, CI green | Owner |
| S1 to S4 | Sprints (§6) | Demoable build per sprint | Owner |

### G0 checklist
- Read the Spec and this brief. Reply with a 10-line summary of the product and anything unclear.
- Present §3 for approval.
- Ask the owner: app ID / package name, final app name (trademark and Play Store search is the owner's job), target Android versions, whether Canva or Figma MCPs are connected.
- Create the files listed in §8.
- STOP.

## 5. Phase 1 detail: design variants

### 5.1 Shared shell (orchestrator agent, on `main`, before branching)
- `flutter create` project with the approved app ID. Packages: `flutter_riverpod`, `google_fonts`, `fl_chart`. Nothing else.
- `lib/mock/models.dart`: plain Dart classes (`Workout`, `ExerciseBlock`, `SetRow`, `PersonalRecord`). No logic beyond constructors.
- `lib/mock/mock_data.dart`: the fixture in §5.2, **identical for all variants**.
- `design/` folder with `brief.md`, `compare/`, and `scorecard.md`.
- Commit to `main`, then create three git worktrees: `design-a-dark`, `design-b-light`, `design-c-bold`.

### 5.2 Fixture (same data in every variant)

**Active workout:** "Push day", elapsed `00:42:18`, 14 sets total, 2 completed.

| Exercise | Previous session | Current |
|---|---|---|
| Barbell bench press | 80×8, 80×8, 80×7 | S1 82.5×8 done, S2 82.5×8 done, S3 82.5×(empty) focused |
| Incline dumbbell press | 28×10 ×3 | 3 sets pending |
| Cable fly | 15×12 ×3 | 3 sets pending |
| Triceps pushdown | 30×12 ×3 | 3 sets pending |
| Lateral raise | 10×15 ×2 | 2 sets pending |

Rest timer: 90 s default, state shows 01:12 remaining. New PR on bench: 82.5×8, estimated 1RM 104.5 kg (Epley), previous best 101.3 kg.

**Home:** greeting by time of day, streak 5 days (best 12), week bars Mon to Sun `[1,0,1,1,0,1,0]`, workouts this week 4, volume this week 18,450 kg, total workouts 63, recent PRs: Bench 82.5×8, Deadlift 140×5.

**Progress (bench press):** weekly top weight over 12 weeks `[70, 72.5, 72.5, 75, 75, 77.5, 77.5, 80, 80, 80, 82.5, 82.5]`; volume per week `[4200, 4500, 4350, 4800, 5000, 4900, 5200, 5400, 5300, 5600, 5750, 5900]`. Range chips 1M, 3M, 6M, 1Y, All, with **3M and beyond shown as locked Pro** to test paywall styling.

### 5.3 Agent roster (use Manager view; run B1 to B3 in parallel)

| Agent | Scope | Edits code? |
|---|---|---|
| Orchestrator | G0 to G1, shell (§5.1), spawns the others, collects results | Shell only |
| Builder A / B / C | One variant each, in its own worktree | Yes, own branch only |
| Browser agent | Runs each variant, captures screenshots | No |
| Design reviewer | Fresh context, never saw the builders' reasoning. Scores against §5.6. | No |

Builders must not read each other's branches. Variants must not converge.

### 5.4 Variant specs (starting values)

Hex values are starting points. **Compute actual contrast ratios in a test**, fix any failure (body text needs 4.5:1, large text and UI components 3:1), and record each deviation in the PR.

**A. Dark performance**
| Token | Value |
|---|---|
| bg / surface / surface-2 | #0B0B0C / #161618 / #202023 |
| text / text-secondary | #F4F4F5 / #8A8A90 |
| accent / on-accent | #C6FF3D / #0B0B0C |
| PR gold / danger | #FFD24A / #FF5C5C |
| radius (card / control / pill) | 14 / 10 / 999 |
| font | Inter, tabular figures on all numerals |
| density | tight: 48 dp rows, 16 dp screen padding |

**B. Clean light**
| Token | Value |
|---|---|
| bg / surface / field | #F7F8FA / #FFFFFF / #F1F3F6 |
| text / text-secondary | #14171F / #6B7280 |
| accent / on-accent | #1A73E8 / #FFFFFF |
| PR gold (text-safe) | #9A6700 |
| radius (card / control) | 16 / 12 |
| font | Inter |
| density | airy: 52 dp rows, 20 dp screen padding |

**C. Bold and warm**
| Token | Value |
|---|---|
| bg / block / ink | #FFF1DC / #FFC93C / #1B1410 |
| ink-secondary | #6B4E1E |
| accent / on-accent | #D63A12 / #FFFFFF (verify AA) |
| radius (card / control) | 22 / 16 |
| font | Poppins, heavy weights for numerals and headings |
| density | chunky: 52 dp rows, 16 dp padding, saturated color blocks per exercise |

**Type scale (all variants, adjust per direction):** display 36 to 44, title 20, body 16, label 13, caption 12. Spacing on a 4 dp base. Each variant ships `tokens.dart` (raw values) and `app_theme.dart` (`ThemeData` built only from tokens), with a structure that supports a second mode later.

### 5.5 Screens and required states (per variant)

1. **Active workout (S-13), three states:**
   - (a) mid-workout, bench S3 focused
   - (b) rest timer bottom sheet open (S-14), with next-set preview and -15 / +30 / Skip
   - (c) PR achieved moment on a completed set (subtle, no confetti library)
   Constraints: set row is `SET | PREVIOUS | KG | REPS | ✓`; every tap target at least 48 dp; weight and reps steppers usable one-handed; primary actions in the bottom thumb zone; completed rows visibly distinct without relying on color alone.
2. **Home (S-10):** per fixture.
3. **Progress (S-18):** line chart (weight) and bar chart (volume) via `fl_chart`, PR marker, locked range chips.

Total: 5 screenshots per variant, 15 overall, saved to `design/compare/<variant>/` with names `01-active.png`, `02-rest.png`, `03-pr.png`, `04-home.png`, `05-progress.png`. Capture at a phone viewport (about 390×844). If a browser run is not possible, use `flutter run` on a device or emulator and capture there.

### 5.6 Design review checklist (reviewer agent scores each item 1 to 5 per variant)

1. One-handed set logging: count taps to log a set; target is 2 or fewer.
2. Legibility at arm's length in bright light (numerals large, contrast measured).
3. Distinct identity: does it avoid looking like a default Material template or a clone of Hevy or Strong?
4. Hierarchy: one clear primary action per screen; one accent color doing real work.
5. Consistency: all spacing, color, and type from tokens, with zero hardcoded values (grep to prove it).
6. States designed: default, focused, completed, locked, empty.
7. Accessibility: AA contrast measured, tap targets, text scale 130% without overflow, semantics labels on icon buttons.
8. Maintainability: widget count, token count, estimated effort to extend to 25 screens.

Output `design/scorecard.md`: a side-by-side table, one paragraph of rationale per variant, and a **recommendation labeled as the reviewer's opinion**. The owner decides at G3.

### 5.7 Phase 1 prohibitions
No Firebase, Hive, Drift, auth, ads, billing, or network calls. No shared code between variants beyond `models.dart` and `mock_data.dart`. No merging. No polishing beyond the five screens. Target: 1 to 2 days of work.

## 6. Phase 2: build plan (starts only after G3 and G4)

Build on the chosen variant's tokens and theme. Follow the Spec screen by screen, with approved amendments applied. Each sprint ends with: `flutter analyze` clean, tests green, a run on a physical Android device, a short demo script, and owner sign-off.

| Sprint | Length | Scope | Exit criteria |
|---|---|---|---|
| S0 Foundation (G4) | 3 to 4 days | Folder structure (feature-first), Drift schema from Spec §6, Riverpod wiring, theme from winner, CI (analyze + test), seeded exercise table, `AGENTS.md` updated | App launches, DB migrates, CI green |
| S1 Core loop | 2 weeks | S-10 minimal, S-11, S-13, S-14, S-15, S-16, S-17. Persist on every set. Background-safe rest timer. | Log a full 5-exercise workout, kill the app mid-set, relaunch with zero data loss |
| S2 Insights | 2 weeks | PRs, S-18, S-19, S-20, templates (S-12), streaks, 3-screen onboarding (compressed from S-03 to S-09) | Charts match hand-computed values; PR logic unit-tested |
| S3 Cloud and money | 2 weeks | Auth, Firestore sync (UUIDs, soft deletes, last-write-wins), Crashlytics, CSV export, paywall (S-25) with Play Billing or RevenueCat | Offline-to-online sync verified on device; purchase tested in the Play sandbox |
| S4 Launch | 2 weeks | AI tips behind a backend proxy (or defer), polish, store listing, privacy policy, closed testing, production release | Release checklist (Spec §13) complete |

Pure-Dart unit tests are mandatory for volume, Epley 1RM, PR detection, and streak logic. Those bugs destroy user trust.

## 7. Engineering principles

Paraphrased from Garry Tan's public gstack project (MIT, github.com/garrytan/gstack). Installing gstack gives the fuller versions, but nothing here depends on it.

1. **Search before building.** Before writing a feature, check (a) established patterns and the standard package, (b) what is currently popular and why, treating it with suspicion, (c) first principles. Prefer reasoning from first principles when the first two disagree with what the product needs.
2. **Boil the lake, inside the scope.** AI makes completeness cheap, so within an approved scope do the complete job: edge cases, error states, tests. Do not take shortcuts to save minutes. Scope itself stays tight (see A-11); completeness applies inside it.
3. **Three lenses before build.** For every sprint and major feature, review the plan from the product lens (is this the smallest thing that delivers the value?), the design lens (does it hold up to §5.6?), and the engineering lens (data model, failure modes, tests).
4. **Review before ship.** A separate reviewer agent examines every PR for production bugs, not style.
5. **Test in a real runtime.** UI work is verified by running it and capturing screenshots, not by reading the code.
6. **Ship small.** One reviewable PR per slice, always releasable.
7. **Taste is a decision, not a default.** If an output looks like a generic template, it fails review.

## 8. Tooling

**Files to create at G0** (Antigravity reads `AGENTS.md` at the project root and the `.agents/` folder; some older docs show `.agent/`, so match what the app's own Rules, Skills, and Workflows panels show). Do **not** add `.agents/` to `.gitignore`.
- `AGENTS.md`: §2 and §7, under about 12,000 characters (rule files have a size cap).
- `.agents/rules/design.md`: §5.4 token discipline and §5.6 checklist.
- `.agents/workflows/variant-build.md`: plan, tokens, three screens, analyze, screenshots, report.
- `.agents/workflows/feature.md`: plan, tests first, implement, analyze and test, run, screenshot, PR.
- `.agents/workflows/review.md`: reviewer-agent procedure.

**MCP servers** (owner connects; the agent requests them, never installs silently):
- Required: the Dart and Flutter MCP server; Context7 (current package docs).
- Optional for design phase: Canva or Figma, for moodboards and reference extraction only. The Flutter code stays the single source of truth for the design.
- Later: Firebase MCP (S3), GitHub MCP (PR workflow).

**Skills:** gstack planning, review, QA, and ship skills if installable in this environment (check its README for the Antigravity or `.agents/skills/` setup), plus any UI/UX design-review skill the owner installs. If a skill is missing, apply §5.6 and §7 directly.

## 9. Definition of done for Phase 1

- Three branches run, each with the five states.
- Fifteen screenshots in `design/compare/`.
- `design/scorecard.md` complete with measured contrast values and the grep proof for zero hardcoded styles.
- A summary posted to the owner with run instructions per variant.
- **STOP.** Wait for the owner's pick at G3. Do not begin G4.
