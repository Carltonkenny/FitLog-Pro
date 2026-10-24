# FitLog Pro — Final Design Brief (Variant A: Dark Performance)

**Status:** Approved by Owner (Ken) | **Date:** 21 Oct 2026  
**Selected Direction:** **Variant A · Dark Performance**

---

## 1. Direction Summary

FitLog Pro is built around **Variant A: Dark Performance**. 
Designed specifically for high-intensity gym environments where lighting is harsh or variable, readability at arm’s length is paramount, and fast, low-friction set logging is the core value proposition.

* **Personality:** High-contrast, utilitarian, athletic, distraction-free.
* **Core Philosophy:** Active workout is the product. Every critical set-logging action operates in the bottom thumb zone with 2 taps or fewer.
* **Primary Contrast Anchor:** Deep, near-black graphite background with intense neon lime accenting for active states and gold for personal record achievements.

---

## 2. Locked Design Tokens

All widgets and Flutter styling must derive strictly from these tokens. **No hardcoded hex codes, font sizes, or radii in widgets.**

### Color Palette
| Token Name | Hex Value | Semantic Role |
|---|---|---|
| `bg` | `#0B0B0C` | App background, maximum contrast & OLED power saving |
| `surface` | `#161618` | Exercise cards, navigation bar, modal sheets |
| `surface2` | `#202023` | Control fills, inactive input boxes, track bars |
| `textPrimary` | `#F4F4F5` | Primary headings, exercise titles, active numbers |
| `textSecondary` | `#8A8A90` | Subtitles, previous set reference, labels |
| `accent` | `#C6FF3D` | Primary action button, active focus, completed sets |
| `onAccent` | `#0B0B0C` | Text & icons on top of accent color |
| `prGold` | `#FFD24A` | Personal record highlights, badges, trophy glyphs |
| `danger` | `#FF5C5C` | Delete set, abandon workout, error alerts |

### Typography
* **Font Family:** `Inter` (via `google_fonts`)
* **Numerical Styling:** Strict **Tabular Figures** (`fontFeatures: [FontFeature.tabularFigures()]`) across all weights, reps, timers, and volume displays.
* **Type Scale:**
  * Display: 36–44 sp (bold/black, used for countdown digits & streak values)
  * Title: 20 sp (bold, screen headers)
  * Body: 16 sp (regular/semi-bold, exercise names & primary button copy)
  * Label: 13–14 sp (bold/semi-bold, set row inputs & table headers)
  * Caption: 11–12 sp (medium, previous set details & timestamps)

### Geometry & Shape
* `cardRadius`: `14.0` dp
* `controlRadius`: `10.0` dp
* `pillRadius`: `999.0` dp (used for chips and primary action buttons)
* `minTapTarget`: `48.0` dp (strictly enforced on all buttons & set checkmarks)
* `screenPadding`: `16.0` dp

---

## 3. Screen Specifications (Phase 2 Target)

1. **Active Workout (S-13):**
   * Grid layout: `SET | PREVIOUS | KG | REPS | ✓`
   * Editable numeric inputs with quick stepping and last-session pre-fill.
   * Auto-trigger rest timer sheet on set completion.
   * Collapsed upcoming exercise items with fast re-order and swap options.

2. **Rest Timer (S-14):**
   * Bottom sheet overlay with active countdown.
   * One-touch quick buttons: `−15s`, `+30s`, `Skip`.
   * Clear "Next Set" preview (exercise name, target weight & reps).

3. **PR Achievement Moment (S-16):**
   * Instant Epley 1RM calculation: $\text{1RM} = \text{weight} \times (1 + \text{reps} / 30)$.
   * High-contrast gold badge and trophy glyph.
   * Zero external heavy confetti libraries; smooth purposeful micro-animation.

4. **Home Dashboard (S-06):**
   * Current streak card with fire glyph and personal best tracker.
   * Monday to Sunday weekly workout frequency bars.
   * Quick summary matrix: Workouts this week, total volume (kg), total workouts, PRs this week.
   * Prominent thumb-zone "Start Workout" button.

5. **Analytics & Progress (S-18):**
   * 1RM Top Weight progression line chart via `fl_chart`.
   * Weekly volume bar chart.
   * Range chips: 1M, 3M, with 6M, 1Y, and All gated behind the Pro paywall bottom sheet.
