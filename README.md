# FitLog Pro: Enterprise Workout Diary & AI Biomechanics Engine

FitLog Pro is a local-first, progressive overload workout tracker and AI biomechanics coach running seamlessly on both Laptop (3-Column Master-Detail Studio) and Mobile (Bottom Thumb-Zone PWA).

---

## 🌟 Key Features

1. **Sub-2-Second Thumb Logging**: Complete sets, step weights and reps, calculate Olympic barbell sleeve plates without mental math, and track estimated 1RM PRs.
2. **100% Device Compatibility**:
   - **Laptop Studio ($\ge 1024\text{px}$)**: 3-column Master-Detail layout (Left: Navigation & Blueprint, Center: Active Workout Diary, Right: Olympic Barbell Sleeve & 1RM Curve).
   - **Mobile PWA ($< 1024\text{px}$)**: Single-column thumb-zone interface with bottom navigation and slide-up plate calculator drawer.
3. **History-Aware Gemini AI Coach**: Deeply integrated into the Workout History tab; analyzes logged training sessions, volume deltas, and personal records to detect plateaus and prescribe micro-loading overload targets.
4. **Cascading 3-Step Movement Library (333+ Exercises)**: Body Part $\rightarrow$ Target Anatomy $\rightarrow$ Movements ranked by Growth-to-Fatigue efficiency score with equipment filters.
5. **Plain-English Copywriting**: Zero intimidating medical jargon (e.g. "Hypertrophy" $\rightarrow$ "Muscle Growth", "SFR" $\rightarrow$ "Growth vs. Fatigue Score").
6. **Local-First Offline Continuity**: Instant writes to client cache with automatic background synchronization to Supabase PostgreSQL upon reconnection.

---

## 🚀 Quickstart for Product Managers & Developers

```bash
# 1. Clone repository and navigate to web app
cd web

# 2. Install dependencies (if fresh clone)
npm install

# 3. Run unit and domain tests
npm test

# 4. Build production bundle
npm run build

# 5. Launch local development server
npm run dev
# Live at: http://localhost:5173
```

---

## 📂 Architecture Overview

```
web/src/features/app/
├── ProApp.jsx                                    # Lean conductor container (~210 lines)
├── hooks/
│   ├── useSessionControls.js                     # Universal session clock & controls
│   └── useWorkoutLogger.js                       # Active workout state, volume, PR calculations
├── components/
│   ├── layout/
│   │   ├── SessionHeader.jsx                     # Top bar, active session timer, layout switcher
│   │   ├── StudioSidebar.jsx                     # Left navigation column & blueprint card
│   │   ├── StudioVisualizer.jsx                  # Right visualizer column (Barbell sleeve & 1RM)
│   │   ├── MobileDrawer.jsx                      # Slide-up bottom sheet for mobile visualizer
│   │   └── MobileBottomNav.jsx                   # Sticky bottom thumb-zone nav
│   ├── workout/
│   │   ├── ActiveWorkoutView.jsx                 # Active workout logger & exercises list
│   │   ├── ExerciseCard.jsx                      # Individual exercise card with sets table
│   │   └── SetRow.jsx                            # Set row with weight/rep steppers & PR check
│   ├── explorer/
│   │   └── CascadingExplorerView.jsx             # 3-step waterfall & instant multi-field search
│   ├── analytics/
│   │   └── AnalyticsView.jsx                     # 1RM curves, volume breakdown, consistency KPI
│   ├── history/
│   │   ├── HistoryView.jsx                       # Completed session timeline
│   │   └── GeminiHistoryCoach.jsx                # History-aware AI coach reading real logs
│   ├── settings/
│   │   └── SettingsView.jsx                      # Unit toggle (kg/lb), rest duration, cloud status
│   └── modals/
│       ├── FinishModal.jsx                       # Workout celebration modal & PR summary
│       ├── RestartModal.jsx                      # Restart session safeguard confirmation
│       └── ExercisePickerModal.jsx               # Quick search modal to add movements
```

---

## 🧪 Verification & Evidence
Full product documentation, executive business pitch, and high-resolution visual evidence are compiled in:
👉 [PRODUCT_DOSSIER.md](./PRODUCT_DOSSIER.md)

---
© 2026 FitLog Pro Engineering.
