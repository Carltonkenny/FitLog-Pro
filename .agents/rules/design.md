# Design Rule: FitLog Pro Token Discipline & Quality Checklist

## 1. Token Rules (Variant A: Dark Performance)
- Every widget must consume colors, radii, typography, and spacing from `tokens.dart` or `Theme.of(context)`.
- Never use inline `Color(0x...)`, `Colors.green`, `EdgeInsets.all(17)`, or `BorderRadius.circular(15)`.
- Numeric values must use tabular figures (`fontFeatures: [FontFeature.tabularFigures()]`) to prevent layout jitter during timers or live updates.
- One accent color (`#C6FF3D`) doing real work; PR gold (`#FFD24A`) reserved strictly for achievements.

## 2. Touch & Accessibility Checklist
- All interactive targets must be at least 48x48 dp.
- Body text contrast must maintain AA (4.5:1 ratio minimum).
- Icon-only buttons must have an explicit `semanticsLabel`.
- Text scaling up to 130% without clipping or layout overflows.

## 3. Active Workout Discipline
- Maximum 2 taps to log a set.
- Controls located in the thumb zone (bottom half of screen).
- Completed rows must be distinct through icons/borders, never by color alone.
