# FitLog Pro: Product, Market and Security Audit

> Written while the backend was Supabase. The backend has since moved to Neon (see `launch-guide.md` and `technical-recommendations.md`). Product, market and competitor sections are unaffected; the security findings SEC-02, SEC-05..08 and SEC-09 are replaced by the Neon design (API-side checks, no browser-visible secrets).

Date: 2026-10-26 · Branch: `chore/web-publish-prep` · Scope: `web/` and `supabase/` (the Flutter app in `fitlog_pro/` was not audited).
Legend: **[V]** verified in the repo or by a run, **[I]** inference, **[U]** unknown / not tested.

## A. Executive summary
FitLog Pro is a web workout tracker: log sets in two taps, offline-first, estimated-max PR detection, progress screens, and an AI coach that reads history and optional photos and returns a loadable weekly plan. [V] Maturity: late prototype / pre-beta. Core logging, sync code, settings, auth and the coach work in local testing [V]; nothing has been validated with real users or real signed-in accounts against the live project [U].
Strengths: fast, accessible logging UI; offline-first; honest data (no fake history); plan-from-photo coach is uncommon in trackers. Weaknesses: web-only in a mobile-first category (no PWA install yet), no routines/templates, unproven demand, unfinished backend steps (migration and Edge Function not deployed).

## B. Scorecard (overall 58 / 100, low confidence)
| Area | /10 | Evidence and uncertainty |
|---|---|---|
| Problem severity and clarity | 5 | Logging is a real habit, but the free incumbents (Hevy, Strong) already solve it well. No demand evidence for this product. |
| Actual user value | 6 | Logging works end to end [V]. Coach plan is useful only if answers are good (one live plan checked, one test image). |
| Differentiation | 6 | Offline-first plus photo/plan coach. Photo value is a hypothesis, not validated. |
| UX and usability | 7 | 48px primary action, validation, empty states, keyboard and screen-reader support [V]. No real-user testing [U]. |
| Feature completeness | 5 | Missing: saved routines, custom exercises, history charts over time, CSV import, PWA install, account deletion. |
| Technical architecture | 6 | Clean local-first design, small modules. Single 568 KB bundle, hand-rolled routing, no type checking. |
| Code quality / maintainability | 6 | 14 unit tests now [V], no CI, no linter, no TypeScript. |
| Security posture | 6 | Strong basics [V]; open items below (migration, function deploy, no abuse limits beyond Supabase defaults). |
| Reliability and performance | 5 | Sync verified only by unit tests and code reading [U]. No error monitoring. |
| Commercial potential | 4 | Crowded, price-anchored category; no billing built. |
| Market readiness | 4 | Needs real-account test, legal pages, PWA, deploy. |

Top reasons users reject it: (1) web app, not a store app, so no home-screen presence unless PWA is added; (2) no saved routines, so repeat workouts need rebuilding; (3) unknown trust in a new app that holds their training log.
Top reasons it succeeds: (1) works offline and fast; (2) AI plan from your own history and photos; (3) generous free product against paywalled rivals.
Verdict: **promising but needs substantial work**. It is a good prototype of a feature set; it is not yet a validated business.
Evidence that would change this: retention of 20+ real users over 4 weeks; usage rate of the photo feature; willingness-to-pay test.

## C. Market research (sources dated 2026 unless noted; most are vendor or competitor blogs, so treat as directional)
- Size: fitness apps about $12.1B in 2025 projected to $33.6B by 2033 (Grand View Research, via secondary sites); Statista narrower, about $9.2B for 2026; health and fitness apps earned over $5B in 2024, about three quarters from subscriptions (Business of Apps). In-app spending grew 13% in 2025 while downloads grew 0.8% (Sensor Tower, cited secondhand). Estimates vary widely; no defensible TAM/SAM for a niche web tracker. [I]
- Retention is the category's weak spot: pooled dropout of 43% in app-based health interventions (JMIR meta-analysis, 2020, not workout-specific); median trial-to-paid conversion about 39.9% for health and fitness (RevenueCat, cited secondhand).
- AI is widely marketed but often shallow: many apps use a one-time questionnaire; Fitbod is described as adapting to in-app data but ignoring external recovery signals (fast.io, RapidNative: promotional reviews). I found no credible source for photo-based plan generation in mainstream trackers, which suggests either a gap or low demand [U].
- User complaints (anecdotal, aggregator sites): Strong losing data above 1,000 workouts and slow development; Hevy price gating and no "next field" button between inputs; one user dislikes needing internet to log (justuseapp, macpowerusers forum).
Sources: [Jefit comparison](https://www.jefit.com/blog/fitbod-vs-strong-vs-jefit-vs-hevy) · [SensAI Hevy review](https://www.sensai.fit/blog/hevy-review-2026) · [Boostcamp](https://www.boostcamp.app/best/workout-apps) · [Hevy reviews](https://justuseapp.com/en/app/1458862350/hevy-gym-trainingstagebuch/reviews) · [MPU forum thread](https://talk.macpowerusers.com/t/gym-iphone-app-recommendation/32667) · [Feed.fm trends](https://blog.feed.fm/digital-fitness-in-2026-workout-and-wellness-trend-report) · [fast.io AI apps](https://fast.io/resources/best-ai-fitness-apps-2026/) · [Fitbudd statistics](https://www.fitbudd.com/post/fitness-app-statistics) · [Business of Apps](https://businessofapps.com/?p=88929).
Most promising first segment (hypothesis): self-coached intermediate lifters who dislike paywalls and want a plan built from their own numbers. Highest-value problem: "what do I do next session, and did I progress?"

## D. Competitors (prices from 2026 blogs; verify in the stores)
| | Hevy | Strong | Fitbod | JEFIT | FitLog Pro |
|---|---|---|---|---|---|
| Free tier | Yes, 4 routines cap | Yes, capped | No | Yes | Yes (everything, early access) |
| Paid | about $3-4/mo, $75 lifetime | $4.99/mo, $99.99 lifetime | about $16/mo, $80-96/yr | Elite $69.99/yr | none built |
| Saved routines | Yes | Yes | Auto-generated | Yes | **No** |
| AI plan | No (unknown) | No (unknown) | Yes | Algorithmic plan | Yes, with photos |
| Offline | Reported to need internet (one user) | Unknown | Unknown | Unknown | **Yes** [V] |
| Native app / widgets / wearables | Yes | Yes | Yes | Yes | **No (web only)** |
| Social feed | Yes | No | No | Yes | No |
Learn from (underlying value, not branding): saved routines (the table-stakes gap); "Next" key between inputs for faster entry; CSV export (already have JSON); history that stays fast at 1,000+ workouts.
Do not copy: social feed, wearable integrations, big exercise-video library: costly and off-strategy.

## E. Roadmap
**P0**: apply the security migration; deploy the Edge Function with the secret; real-account end-to-end and cross-user test; re-enable email confirmation; privacy and terms pages; account deletion.
**P1**: saved routines; PWA manifest and service worker; Enter-to-next-field in set entry; coach quality evaluation with 10 real histories; CI (build, test, audit, secret scan); error monitoring.
**P2**: charts over time; CSV import; recovery-aware plan adjustments; paid tier only after retention evidence.
Acceptance and validation: each P1 item needs a user-visible check (e.g. routine saved and reloaded on a second device) and a metric (week-4 retention, sets logged per user per week).

## F. Security findings
| ID | Finding | Sev | Status |
|---|---|---|---|
| SEC-01 | No security headers or CSP on the site (CWE-693) | Medium | **Fixed** in `netlify.toml`; verified against the prod build (no CSP violations, fonts and Supabase work) |
| SEC-02 | Edge Function trusted unverified JWT contents (CWE-345); a forged user ID could bypass limits if "Verify JWT" were off | Medium | **Fixed in code** (verifies via Supabase Auth); not run: no Deno/deploy access [U] |
| SEC-03 | Full session including refresh token duplicated into a second `localStorage` key; stale copy could look signed-in (CWE-922) | Low | **Fixed**, plus cleanup of old copies; prod guard retested |
| SEC-04 | Production build with missing Supabase settings silently ran with no real accounts (fail-open) | Medium | **Fixed** (shows a "not configured" screen); logic reviewed, not browser-tested [U] |
| SEC-05 | `profiles.is_pro_member` writable by the user via the API (mass assignment, CWE-915); latent until billing exists | Medium (latent) | **Migration written, not applied** |
| SEC-06 | `SECURITY DEFINER` function without pinned `search_path` (CWE-427 class) | Low | Migration written, not applied |
| SEC-07 | A user could attach sets to another user's workout ID (integrity only; victim cannot see them) | Low | Migration written, not applied |
| SEC-08 | No DB-level numeric limits (bad client data can poison a row or fail sync) | Low | Migration written, not applied |
| SEC-09 | Gemini key in client JS | High if deployed as-is | Mitigated: key is excluded from prod bundles [V: 0 matches]; production path goes through the Edge Function once deployed. Rotate the key, it was shared in chat |
| SEC-10 | No account deletion (privacy obligation), no MFA, no CI secret scanning, default Supabase auth rate limits only, implicit (not PKCE) auth flow | Medium | Open (recommendations) |
Checked and clean: no `dangerouslySetInnerHTML`/`eval`/`innerHTML` [V]; AI output rendered as text [V]; `npm audit` 0 vulnerabilities [V]; no `.env` files, keys or secrets in tracked files or git history [V]; the two keys in the code are empty placeholders [V]; no admin routes exist in this repo (Supabase dashboard is the only admin surface) [V]; RLS enabled with owner-only policies on all five tables [V by reading; live cross-user test not run].

## G. Changes made this audit
`web/test/*` (14 tests, loader), `lib/exercises.js` + `lib/syncRows.js` (pure split for testing), `lib/supabaseClient.js` (no session mirroring), `main.jsx` (fail-closed), `netlify.toml` (headers), `supabase/functions/gemini-coach/index.ts` (verified auth), `supabase/migrations/20261026_security_hardening.sql` (new, not applied). Test 4 of the legacy suite was changed on purpose: it asserted seeded fake data, which was removed as a bug.

## H. Verification
Build: pass (baseline pass). Unit tests: 14/14 pass (baseline: failing, then crashed on Node 25). `npm audit`: 0 vulnerabilities. Secret scan (tracked files and history): clean. CSP: pass on prod build. Auth guard on prod build: pass. **Not tested**: live RLS cross-user access; Edge Function runtime; email confirm and password-reset flows; sync against the live DB with a real account; load and performance; backup restore; automated E2E; rate-limit behaviour; any admin escalation (no admin code).

## I. Remaining risks
Migration unapplied (SEC-05..08); Edge Function undeployed; key rotation pending; email confirmation currently off in your project; no legal pages; no CI; unvalidated demand.

## J. Recommendation
Worth continuing as a focused product, not yet as a business. Target first: self-coached intermediate lifters. Top three improvements: saved routines, PWA install, coach quality evaluation. Differentiator to pursue: offline-first plus a plan built from your own history and photos. Most urgent security step: apply the migration and deploy the function. Stop: building more landing/marketing surface and unverified claims; do not build billing yet. Next five actions: 1) apply migration and deploy function, rotate key; 2) run a real two-account test (sync, RLS); 3) add routines and PWA; 4) recruit 10-20 lifters for a 4-week trial; 5) add CI and error monitoring.
