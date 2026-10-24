# FitLog Pro — Senior Developer Guide & Standards

## 1. Prime Architecture Rules
- **Domain Layer (`features/*/domain/`):** Pure Dart only. Zero Flutter, zero Drift imports. All entities immutable.
- **Data Layer (`features/*/data/`):** Drift DAOs and repositories. All dates stored as UTC timestamps.
- **Design Tokens:** Strictly Variant A (Dark Performance). All widgets consume `FitLogTokens` from `core/theme/tokens.dart` or `Theme.of(context)`. Never use ad-hoc hex colors or hardcoded margins.
- **Deterministic Testing:** Always inject `AppClock`. Never call bare `DateTime.now()` directly in business logic.
- **Data Integrity:** Save on every completed set and on app lifecycle pause.

## 2. Common Commands
```bash
# Analyze code
flutter analyze

# Run pure Dart domain tests
flutter test test/unit/

# Run all tests
flutter test

# Code generation for Drift & Riverpod
dart run build_runner build --delete-conflicting-outputs
```

## 3. Core Units & Math
- Weight stored in kg (canonical), rounded to 0.01 at write.
- Epley 1RM formula: `weight * (1 + reps / 30.0)`
- Volume: `sum(weight * reps)` for completed sets only.
