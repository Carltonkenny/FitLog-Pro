# Feature Slice Workflow

Every sprint task follows this vertical slice workflow:

1. **Restate & Cite:** Cite the Spec screen/section ID (e.g. S-13) and reference 2 existing files for architectural alignment.
2. **Plan & Wait:** Detail the data flow, failure modes, and 2 alternatives. Wait for owner approval if non-trivial.
3. **Tests First (TDD for Domain):** Write pure Dart domain unit tests first (Epley 1RM, volume calculation, streak logic, PR detection). Watch tests fail before writing production code.
4. **Implementation:** Keep pure Dart in `domain/` without Flutter/Drift imports. Implement Drift DAOs in `data/`. Implement Riverpod notifiers and UI in `presentation/`.
5. **Quality Verification:**
   - Run `dart format .`
   - Run `flutter analyze`
   - Run `flutter test`
   - Paste real terminal outputs.
6. **Runtime Verification:** Run on an Android emulator or device and capture screenshot evidence.
7. **Fresh-Context Review:** Inspect the diff for 5 key failure modes: process death mid-set, offline handling, timezone/midnight boundaries, double-tap protection, and locale number parsing.
