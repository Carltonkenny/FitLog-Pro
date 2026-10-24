---
name: emil-kowalski-design
description: Emil Kowalski design engineering principles for silky animations, micro-interactions, typography, and tactical UI craftsmanship.
---

# Emil Kowalski Design Engineering System

## Core Philosophy
Interfaces should feel physical, tactile, and responsive to the millisecond. No generic AI templates or sluggish transitions.

### 1. Motion & Physics
- Fast ease-out spring: `cubic-bezier(0.16, 1, 0.3, 1)`
- Smooth interactive snap: `cubic-bezier(0.32, 0.72, 0, 1)`
- Timing: 150ms-240ms. Never use slow 500ms+ linear fades.
- Instant press down feedback: `active:scale-[0.98]` on buttons.

### 2. Typography & Numbers
- Large headlines: tight tracking (`letter-spacing: -0.03em`).
- Numerals: tabular figures (`tabular-nums`) for timers, weights, and reps.
- Plain English first: explain concepts simply, demoting technical jargon.

### 3. Depth & Surfaces
- Hairline borders: `border border-white/[0.08]` over heavy shadows.
- Subtle top highlight: `inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`.
- Fluid master-detail on desktop, thumb-zone ergonomics on mobile.
