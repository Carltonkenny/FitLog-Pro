/// Pure Dart calculation of consecutive workout day streaks.
///
/// Days are compared using local year, month, and day to ensure midnight boundary accuracy.
abstract final class StreakTracker {
  static int calculateStreak({
    required List<DateTime> workoutDatesUtc,
    required DateTime referenceDateUtc,
  }) {
    if (workoutDatesUtc.isEmpty) return 0;

    // Normalize to date-only strings (YYYY-MM-DD)
    final uniqueDays = <String>{};
    for (final d in workoutDatesUtc) {
      final local = d.toLocal();
      uniqueDays.add(
          '${local.year}-${local.month.toString().padLeft(2, '0')}-${local.day.toString().padLeft(2, '0')}');
    }

    final refLocal = referenceDateUtc.toLocal();
    var checkDate = DateTime(refLocal.year, refLocal.month, refLocal.day);

    String dateKey(DateTime dt) =>
        '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';

    var streak = 0;
    // If no workout today, check if yesterday was logged to preserve ongoing streak
    if (!uniqueDays.contains(dateKey(checkDate))) {
      checkDate = checkDate.subtract(const Duration(days: 1));
      if (!uniqueDays.contains(dateKey(checkDate))) {
        return 0;
      }
    }

    // Count consecutive days backwards
    while (uniqueDays.contains(dateKey(checkDate))) {
      streak++;
      checkDate = checkDate.subtract(const Duration(days: 1));
    }

    return streak;
  }
}
