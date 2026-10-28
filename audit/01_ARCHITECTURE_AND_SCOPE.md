# FitLog Pro: Architecture & Scope Specification
## `audit/01_ARCHITECTURE_AND_SCOPE.md`

---

### 1. System Architecture Overview

FitLog Pro utilizes a dual-client, local-first architecture coupled with a unified Supabase Cloud Brain ("The Brain"):

```
┌────────────────────────────────────────────────────────────────────────┐
│               SUPABASE CLOUD BRAIN (PostgreSQL 15)                     │
│  • Project ID: fczhckzsynzfomytkgym                                    │
│  • Row-Level Security (auth.uid = user_id)                             │
│  • Tables: profiles, workouts, workout_sets, personal_records, stats   │
└──────────────────┬──────────────────────────────────┬──────────────────┘
                   │ (Realtime Sync & JWT Auth)       │
                   ▼                                  ▼
       ┌────────────────────────┐         ┌──────────────────────────────┐
       │     FLUTTER CLIENT     │         │       REACT WEB STUDIO       │
       │  • Pure Dart Domain    │         │  • React 18 + Vite 6 + TW4   │
       │  • Drift SQLite DB     │         │  • 3-Column Master-Detail    │
       │  • Riverpod State      │         │  • Single-Column Mobile PWA  │
       │  • Android / Play Store│         │  • Local-First WorkoutStore  │
       └────────────────────────┘         └──────────────────────────────┘
```

#### A. Mobile Core (`fitlog_pro/`)
- **Language / Framework:** Dart 3.13.5 / Flutter 3.47.7.
- **State Management:** Riverpod 2.6.1 (`StateNotifier` and `AsyncNotifier`).
- **Local Persistence:** Drift 2.29.0 (relational SQLite engine) providing zero-latency in-gym logging with automatic schema migrations.
- **Design Tokens:** Strictly Variant A (Dark Performance) encapsulated in `lib/core/theme/tokens.dart`.
- **Clock Injection:** `AppClock` injected into all business logic for deterministic testing across midnight and leap-year boundaries.

#### B. Web Studio & Mobile PWA (`web/`)
- **Language / Framework:** React 18.3.1 / Vite 6.4.5 / Tailwind CSS v4.
- **Responsive Modes:**
  - **Laptop / Desktop Studio ($\ge 1024\text{px}$):** Fluid 3-Column Master-Detail Layout:
    - *Left Column (Navigation & Blueprint):* Split schedule, current streak, goal KPI, quick navigation.
    - *Center Column (Active Workout Diary):* Exercise cards, set steppers, PR flags, session timer, AI recommendations.
    - *Right Column (Biomechanical Visualizer):* Live Epley 1RM curve and equipment load guides (Olympic barbell sleeve with color-coded plates).
  - **Mobile PWA ($< 1024\text{px}$):** Single-column layout with thumb-zone ergonomics, slide-up visualizer drawer, and 48dp minimum tap targets.
- **Client Cache & Sync:** `WorkoutStore` providing synchronous offline writes to `localStorage` and asynchronous queued synchronization to Supabase upon reconnection.

#### C. Database Schema & RLS Policies (`supabase/schema.sql`)
- **Profiles (`public.profiles`):** Primary user record, onboarding blueprints, goal preferences, daily calorie targets, and Pro subscription flags.
- **Workouts (`public.workouts`):** Relational workout aggregates with timestamps, total volume in kg, durations, and soft-delete flags (`deleted_at`).
- **Workout Sets (`public.workout_sets`):** Individual set telemetry capturing exercise ID, set order, weight in kg, reps, set type (`normal`, `warmup`, `drop`, `failure`), and completion status.
- **Personal Records (`public.personal_records`):** All-time highest Epley 1RM calculations for every exercise.
- **Body Stats (`public.body_stats`):** Periodic body weight and body fat percentage trend records.

---

### 2. User Roles and Permissions

| Role | Capabilities | Data Isolation Model |
|---|---|---|
| **Anonymous / Guest** | Onboarding preview, interactive landing page plate calculator, science academy, exploration of all 333+ exercise movements. | Local ephemeral cache only; zero cloud reads/writes. |
| **Free-Tier Athlete** | Unlimited local offline logging, up to 3 synced sessions/week, access to all 333+ exercises, 1RM Epley curves, standard timer. | RLS enforced: `auth.uid() = user_id`. History older than 30 days hidden in cloud view. |
| **Pro Subscriber** | Unlimited cloud synchronization, multi-device handoff, History-Aware Gemini Biomechanics Coach, advanced volume heatmaps, CSV exports. | RLS enforced: `auth.uid() = user_id`. `profiles.is_pro_member = TRUE`. |
| **Service Role (Backend)**| Cloud functions, background analytics rollups, automated database maintenance. | Bypasses RLS only via Supabase `service_role` secret key. |

---

### 3. Critical Business Operations & Invariants

1. **Weight Canonical Unit:** All weights are canonically stored in kilograms rounded to two decimal places (0.01 kg). Imperial (lbs) is calculated strictly at display time (`weight_kg * 2.20462`).
2. **Time and Date Canonical Representation:** All timestamps are generated and stored in UTC ISO-8601 format. Local calendar days are derived at read time using the client's timezone to guarantee midnight boundary integrity.
3. **Epley 1-Rep Max Formula:** $\text{1RM} = \text{Weight} \times (1 + \frac{\text{Reps}}{30.0})$.
   - Invariant: A lift with 1 rep returns the weight itself ($100 \times (1 + 1/30) = 100.0$).
   - Invariant: Any set with $\le 0$ reps or $\le 0$ weight evaluates strictly to $0.0$.
4. **Personal Record (PR) Qualification:**
   - Invariant: A set marked as warmup (`type: 'W'` or `'warmup'`) is **strictly disqualified** from PR detection.
   - Invariant: To qualify as a new PR, the estimated 1RM must strictly exceed the previous record by at least $0.05\text{ kg}$ to prevent floating-point precision ties.
5. **Streak Maintenance:**
   - Multiple workouts on the same calendar day count as a single active streak day.
   - If no workout is logged today, an active streak is preserved if a workout was logged yesterday. A 24-hour absence beyond yesterday resets the streak to 0.

---

### 4. Sensitive Data & Trust Boundaries

```
[Browser / Mobile Client]  ──(JWT in Authorization Header)──► [Supabase Edge / PostgreSQL]
      ▲                                                              │
      │ (Local Storage: Encrypted on mobile via Keychain/Keystore)   │ (PostgreSQL RLS)
      ▼                                                              ▼
[Local Client State]                                         [Isolated User Partition]
```

- **Trust Boundary 1 (Client to Supabase):** Clients transmit a Supabase Auth JWT. The PostgreSQL query planner injects `auth.uid()` into every SQL query. Unauthenticated or cross-user queries return 0 rows.
- **Trust Boundary 2 (Client to Gemini AI):** Direct client API calls must only pass in-gym queries without personal names or emails. The production recommendation routes calls through an authenticated Cloud Function.
- **Trust Boundary 3 (Local-First Offline Storage):** Sensitive health and workout telemetry is stored in sandboxed application directories (`Drift SQLite` on Android and origin-isolated `localStorage` on Web).

---

### 5. Scope Limitations & Blocked Environments

1. **Google Play In-App Billing:** Physical sandbox purchases cannot be verified in a headless development terminal; verified synthetically via feature flag simulation.
2. **Production Firebase Blaze Plan Cloud Functions:** Live cloud function deployment requires Google Cloud service account keys not committed to source control.
3. **Live Cellular Signal Basement Simulation:** Simulated via browser `offline` event handlers and Playwright network emulation.
