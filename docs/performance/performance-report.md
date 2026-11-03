# Performance report

**Verdict: good for a beta, not yet proven for scale.** The front end is light and fast on a desktop. On a throttled phone, the app's median LCP is 3.1 s, over the 2.5 s "good" line. Backend load, p95/p99 latency and real-user numbers were **not measured**, so I cannot say it is production-ready for heavy traffic.

## How I measured
- Production build served by `vite preview`, built against fake backend hosts and mocked in the browser, so these are **front-end lab numbers** (no real network to Neon).
- Microsoft Edge 155, fresh browser context per run, 7 runs per cell, medians shown with the range.
- "Phone" = 412×915, CPU slowed 4×, Fast 4G (1.6 Mbit/s, 150 ms). "Desktop" = 1366×768, no throttling.
- LCP, CLS, FCP and long tasks come from the browser's own `PerformanceObserver`. TBT is the sum of long-task time over 50 ms, a lab diagnostic, **not** INP. Field Core Web Vitals (75th percentile of real users) were not available.
- Reproduce: in `web`, set `NEON_AUTH_BASE_URL=https://auth.mock.invalid/neon-auth NEON_FUNCTION_API_BASE_URL=https://api.mock.invalid NEON_REALTIME_URL=` then `npm run build:perf && npm run perf` (writes `docs/performance/results/measurements.json`).

## Before and after (median; range in brackets)
| Page / profile | LCP before → after | FCP before → after | TBT before → after | Transfer before → after |
|---|---|---|---|---|
| Landing, desktop | 576 → 632 ms | 496 → 572 ms | 0 → 0 | 176 → 130 kB |
| App, desktop | 464 → 496 ms | 464 → 496 ms | 0 → 0 | 182 → 177 kB |
| Landing, phone | 2472 → 2212 ms (after: 2148–3904) | 2228 → 1976 ms | 107 → 253 ms (after: 90–991) | 175 → 130 kB |
| App, phone | 3520 → 3140 ms (after: 2588–8092) | 2856 → 2520 ms | 153 → 95 ms | 175 → 130 kB* |

Desktop LCP "after" is a little higher in the medians; the ranges overlap (desktop landing 492–1000 ms before, 576–1160 ms after), so I treat desktop as unchanged. CLS was 0 in every run except one app run at 0.1. TTFB was 7 to 16 ms (local server, not meaningful for production).

\* On the phone profile the app chunk loads after the page is "loaded", so this transfer figure is for the first screen; the chunk adds about 45 kB gzip.

Thresholds: LCP good ≤ 2.5 s, INP good ≤ 200 ms, CLS good ≤ 0.1. The phone landing is at the line; the phone app is over it. One run reached 8.1 s, so the variance is large; I would not quote a single number.

## Update: fonts self-hosted (the audit's top remaining item)
`theme.css` still pulled Google Fonts through a CSS `@import` (a render-blocking chain) in addition to `index.html`; both are gone. Fonts now come from our own domain as 3 variable files (118 kB total) instead of 11 static files (210 kB) from Google. The CSP no longer allows Google font hosts.

| Page / profile | LCP | FCP | TBT | Spread of LCP |
|---|---|---|---|---|
| Landing, desktop | 632 → **424 ms** | 572 → 340 ms | 0 | 356–804 ms |
| App, desktop | 496 → **372 ms** | 496 → 372 ms | 0 | 344–880 ms |
| Landing, phone | 2212 → 2272 ms | 1976 → 1940 ms | 253 → 139 ms | 2120–2472 ms |
| App, phone | 3140 → **2636 ms** | 2520 → 2536 ms | 95 → 117 ms | 2536–2900 ms (was 2588–8092) |

The phone app is now within about 0.1 s of the 2.5 s "good" line and far steadier. The "Transfer" column in earlier tables did not include Google's fonts (browsers report 0 bytes for cross-origin files), so transfer sizes before and after are **not comparable**; the font weight (210 kB → 118 kB) is the comparable figure.

## Interactions with 500 saved workouts (desktop, unthrottled)
| Action | Before | After |
|---|---|---|
| Complete a set (3 samples) | 175 / 115 / 128 ms | 143 / 129 / 99 ms |
| Switch to History | **859 ms** | 116 ms |
| Switch to Settings (after History) | **648 ms** | 96 ms |
| Explorer / Progress / Workout | 179 / 112 / 167 ms | 147 / 98 / 118 ms |
| Worst single event | **520 ms** | 88 ms |

Cause: the History tab drew all 500 workouts. Fix: 30 at a time with a "Show more" button (`HistoryView.jsx`).

## Memory
200 tab switches on the 500-workout dataset: JS heap 5.6 MB → 6.1 MB after forced garbage collection, 755 DOM nodes. No leak signal in this test. I did not run a multi-hour session.

## Back end and database (read, not load-tested)
- `GET /workouts` is two queries, no N+1; `limit` is capped at 500. Indexes cover the hot queries.
- Workout upload used one insert per set; it is now one `unnest` insert (saves up to N−1 round trips). Not timed against Neon; correctness is covered by the live API test (54 of 54 unit and API tests pass).
- `/health` no longer queries the database.
- **Not measured:** p50/p95/p99, throughput, error rate under load, connection-pool behaviour, Gemini latency. A safe load test needs a separate Neon branch (Neon branches are cheap and copy-on-write); I did not create one without your say-so.

## What changed in code (all re-tested)
Lazy-loaded app and onboarding chunks; History paging; bulk set insert; no-query `/health`. The correctness fixes from the repo audit are listed in the commit message.

## Not checked
Lighthouse scores, real-user data, the service worker, Firefox/Safari, a real phone, image/media pipeline (there are no images yet), Gemini photo requests, and the font-loading cost in isolation (risk R2).

## Next steps, in order
1. (Done) Self-host the fonts.
2. Create a Neon branch and run a short load test on `GET /workouts` and `PUT /workouts/:id` (k6 or autocannon).
3. Add Sentry (browser tracing) so you get real-user Web Vitals.
4. Add a CI budget: fail the build if the shared chunk grows past about 400 kB.
