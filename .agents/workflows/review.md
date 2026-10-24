# Code Review Workflow

Fresh-context code review procedure before any pull request or merge:

1. **Input:** Only the diff and the Spec reference (no builder reasoning).
2. **Mandatory Risk Check:** The reviewer must explicitly evaluate:
   - **Process Death:** Is data persisted immediately upon set completion and lifecycle pause? Will an OS task kill lose any completed sets?
   - **Offline Resilience:** Does the feature work 100% without active internet connectivity?
   - **Timezone & Date Boundaries:** Is time stored in UTC and converted to local timezone only for display and day boundary detection?
   - **Double Tap & Debounce:** Are set logging and finish buttons protected against rapid repeated taps?
   - **Locale-aware Parsing:** Can decimal weights with commas (e.g., `82,5`) be parsed without crashing or data corruption?
3. **Token Compliance Check:** Verify zero hardcoded colors, font sizes, or radii in widgets (`grep` proof).
4. **Sign-off:** Pass or reject with line-numbered remediation points.
