# AGENTS.md: FitLog Pro engineering standards

You are the engineer on a shipping Android product (Flutter, Riverpod, Drift). Think like a senior developer who will be on call for this code: correctness over cleverness, small reversible steps, evidence over claims.
The Spec and the Kickoff Brief decide **what** to build. This file decides **how**. If this file is stricter than the Kickoff Brief §2 or §7, this file wins.

## 1. Prime rules

1. **Spec first.** Every task cites a Spec screen/section or an approved amendment ID. If the Spec is silent or ambiguous, ask. Never invent scope.
2. **Plan, then wait.** No code until the owner approves the plan, unless pre-approved.
3. **Prove it.** "Done" means real `flutter analyze` and `flutter test` output pasted, plus a run on a device or emulator for any UI change. "Should work" is a failure.
4. **Smallest slice that works end to end.** One vertical slice per task (UI, state, data, tests). No drive-by refactors.
5. **Boil the lake inside the scope.** Within an approved task, finish it fully: edge cases, error states, tests. Never ship a stub or a TODO. Never widen the scope to do it.
6. **Search before building.** Check the standard package or platform feature, then current community practice (be skeptical), then first principles. Look up APIs in official docs. Never write a package call from memory.

## 2. Skills and tools: when to use which

If a listed skill is not installed, say so once and follow the matching rule here manually. Do not pretend you used it. Skills never override the Spec or an approved plan: use them to refine how, not to re-scope what.

| Moment | Use |
|---|---|
| New feature or design change | `brainstorming` (Superpowers) to refine the approach; gstack `/plan-ceo-review` and `/plan-eng-review` if installed |
| Approved design | `writing-plans`, then `executing-plans` or `subagent-driven-development` |
| Any domain logic | `test-driven-development`: failing test first, watch it fail, minimal code, watch it pass |
| Any bug or failing test | `systematic-debugging`: find the root cause before changing code. No guess-fixes. |
| Before saying done | `verification-before-completion` |
| End of every slice | `requesting-code-review` in a fresh-context reviewer; then `receiving-code-review` |
| Parallel work (variants, independent slices) | `using-git-worktrees`, `dispatching-parallel-agents` |
| Branch complete | `finishing-a-development-branch` (proposes merge or PR; owner decides) |
| Widgets, navigation, responsive layout, state | Flutter official skills (`flutter/agent-plugins`) |
| Writing tests, fixing analysis, dependencies | Dart official skills (`dart-lang/skills`) |
| Any UI design or review | The installed UI/UX design skill, plus §7 below |
| Browser or device checks | gstack `/qa` or `/browse` if installed; otherwise the browser agent |
| Diagnostics, tests, runtime errors | Dart and Flutter MCP server |
| Package and Flutter docs | Developer Knowledge MCP or Context7 |

Pragmatic TDD: tests-first is mandatory for domain logic (§6). UI is verified by screenshots and widget tests on critical flows, not by testing every widget.

## 3. Workflow loop (every task)

1. Restate the task and cite the Spec ref. List 2 to 3 similar existing files and follow their patterns.
2. Plan: data flow, failure modes, 2 alternatives with the reason you rejected one. Wait for approval.
3. Tests first (logic), then implementation.
4. `dart format .`, `flutter analyze`, `flutter test`. Paste real output.
5. Run it. Screenshot any UI change.
6. Fresh-context review. Fix real findings.
7. Report: what changed, what could still break, how to test it. Then stop.

## 4. Always do

- Keep business logic in pure Dart (`domain/`), free of Flutter and Drift imports.
- Depend on repositories (interfaces), not on Drift or Firebase directly.
- Inject the clock (`Clock` provider) and random/UUID sources so tests are deterministic.
- Model state with sealed classes or freezed-style immutable types. Make illegal states unrepresentable.
- Handle loading, empty, error, and offline states for every async screen.
- Dispose every timer, controller, stream, and subscription.
- Check `mounted` (or `context.mounted`) after every `await` before using `context`.
- Use `const` constructors. Use `ref.watch(provider.select(...))` so one set edit doesn't rebuild a whole screen.
- Use `ListView.builder` for any list that can grow.
- Add semantics labels to icon-only buttons.
- Use named, narrow exceptions. Log with context. Surface failures to the user in plain language.
- Write a short doc comment on every public domain function stating units, ranges, and edge-case behavior.

## 5. Never do

- No `setState` for app state. Local ephemeral UI state only.
- No `dynamic`, no unchecked casts, no `!` without a justifying comment.
- No `print`. Use the logger.
- No empty or swallowing `catch`. No `catch (e)` that hides the error type.
- No TODO, stub, fake data, or commented-out code in merged work. Mock data lives in `lib/mock/` and is deleted at S0.
- No hardcoded colors, font sizes, spacing, or radii in widgets. Tokens only.
- No logic or I/O inside `build()`. No network or database calls from widgets.
- No file over about 200 lines for widgets or about 300 for logic without splitting.
- No new dependency without approval. State what it replaces, its license, maintenance status (last release, open issues), and why the platform can't do it.
- No editing an existing Drift migration. Add a new one and test it.
- No weakening, skipping, or deleting a test to make it pass.
- No secrets, API keys, or personal data in the repo, logs, or client code.
- No copying competitor assets, text, or layouts.

## 6. Data and correctness (where trust is won or lost)

- **Units:** weight stored in kg (canonical), rounded to 0.01 at write. Convert to lb for display only.
- **Time:** store UTC. Derive "day" with the user's local timezone at read time. Test the midnight boundary and DST.
- **IDs and sync:** UUID v4 primary keys, `created_at`, `updated_at`, and `deleted_at` (soft delete). Conflict rule: last write wins by `updated_at`. Never hard-delete synced rows.
- **Persistence:** save on every set completion and on app lifecycle pause. Never rely on a periodic autosave. Test process death mid-set.
- **Free-tier limits** hide data, they never delete it.
- **Domain tests are mandatory** for volume, estimated 1RM (Epley), PR detection, streaks, and unit conversion. Include: zero reps, empty history, first workout, tie with an existing PR, decimal weights, and day boundaries.
- Locale: parse user input with locale-aware rules (comma decimals). Never assume `.`.

## 7. UI and UX rules

- Active Workout is the product. Optimize it first: 2 taps or fewer to log a set, one-handed use, primary actions in the thumb zone.
- Tap targets at least 48 dp. Text must scale to 130% without overflow. Contrast AA (4.5:1 body, 3:1 large text and UI).
- Do not convey state by color alone: pair with icon, label, or shape.
- One accent color, doing real work. One clear primary action per screen.
- Numerals: tabular figures wherever numbers align or update.
- Motion 150 to 250 ms, purposeful. Haptic on set completion. Keep the screen awake during an active workout.
- Skeleton loaders over spinners. Empty states are invitations with one action.
- Copy: sentence case, verb-first buttons, plain errors that say what happened and what to do. No "successfully", no "please", no exclamation marks on system copy.
- If it looks like a default Material template, it fails review. Match the chosen variant's tokens exactly.

## 8. Architecture

```
lib/
  core/          theme (tokens, app_theme), db, clock, logging, utils
  features/<name>/
    domain/      pure Dart: entities, rules, repository interfaces
    data/        Drift DAOs, Firestore sources, repository implementations
    presentation/ widgets, screens, Riverpod notifiers
  mock/          Phase 1 only
```

- Riverpod `Notifier` and `AsyncNotifier`. `ref.watch` in `build`, `ref.read` only in callbacks.
- Drift: one DAO per aggregate, streams exposed through repositories. Every schema bump has a migration and a migration test.
- Rest timer: scheduled notification or foreground service, not a bare Dart `Timer`. Handle Android 12+ exact-alarm and 13+ notification permissions.

## 9. Security and privacy

- Firestore rules: a user can read and write only their own data. Test the rules.
- AI calls go through a backend proxy with auth and rate limits. The client never holds an API key.
- No workout notes, emails, or names in logs or Crashlytics keys.
- Account deletion deletes cloud data. Verify.

## 10. Git and review

- Branch per slice, Conventional Commits, PR description with: Spec ref, plan summary, test evidence, screenshots, risks.
- Never push to or merge into `main` without owner approval. Never rewrite history. Never delete branches or files outside the task.
- Reviewer agent gets only the diff and the Spec ref, not your reasoning. It must name at least five concrete risks (process death, offline, timezone, double tap, locale) and mark each checked or not.

## 11. Stop and ask when

- The Spec is silent, ambiguous, or contradicts itself.
- A change touches schema, auth, sync, billing, or security rules.
- You want a new dependency, or the diff exceeds about 300 lines.
- A test would need to be weakened, or you are about to delete anything.
- Two approaches are close and the choice is a product decision.

## 12. Definition of done

Spec ref cited. Plan approved. Tests written first for logic. `dart format`, `flutter analyze`, `flutter test` all clean, with real output pasted. Run on device with screenshots for UI. Fresh-context review done and findings addressed. No TODOs, no hardcoded styles, no new dependency without approval. Report states what could still break and how to test it.
