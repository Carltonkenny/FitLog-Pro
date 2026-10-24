import 'package:flutter_test/flutter_test.dart';
import 'package:fitlog_pro/features/workout/domain/usecases/streak_tracker.dart';

void main() {
  group('StreakTracker Tests', () {
    test('calculates 5-day streak correctly ending today', () {
      final today = DateTime.utc(2026, 10, 21, 10, 0, 0);
      final dates = [
        DateTime.utc(2026, 10, 17, 9, 0, 0),
        DateTime.utc(2026, 10, 18, 14, 0, 0),
        DateTime.utc(2026, 10, 19, 8, 30, 0),
        DateTime.utc(2026, 10, 20, 18, 0, 0),
        DateTime.utc(2026, 10, 21, 7, 0, 0), // Today
      ];

      final streak = StreakTracker.calculateStreak(
        workoutDatesUtc: dates,
        referenceDateUtc: today,
      );
      expect(streak, equals(5));
    });

    test(
        'preserves active streak if workout has not been logged yet today but was yesterday',
        () {
      final today = DateTime.utc(2026, 10, 21, 10, 0, 0);
      final dates = [
        DateTime.utc(2026, 10, 18, 14, 0, 0),
        DateTime.utc(2026, 10, 19, 8, 30, 0),
        DateTime.utc(2026, 10, 20, 18, 0, 0), // Yesterday
      ];

      final streak = StreakTracker.calculateStreak(
        workoutDatesUtc: dates,
        referenceDateUtc: today,
      );
      expect(streak, equals(3));
    });

    test('multiple workouts on same day count as single streak day', () {
      final today = DateTime.utc(2026, 10, 21, 20, 0, 0);
      final dates = [
        DateTime.utc(2026, 10, 20, 9, 0, 0),
        DateTime.utc(2026, 10, 21, 9, 0, 0), // Morning workout
        DateTime.utc(2026, 10, 21, 18, 0, 0), // Evening workout
      ];

      final streak = StreakTracker.calculateStreak(
        workoutDatesUtc: dates,
        referenceDateUtc: today,
      );
      expect(streak, equals(2));
    });

    test('gap in days breaks streak', () {
      final today = DateTime.utc(2026, 10, 21, 10, 0, 0);
      final dates = [
        DateTime.utc(2026, 10, 15, 9, 0, 0),
        DateTime.utc(2026, 10, 16, 9, 0, 0),
        // Missed 17, 18, 19
        DateTime.utc(2026, 10, 20, 9, 0, 0),
        DateTime.utc(2026, 10, 21, 9, 0, 0),
      ];

      final streak = StreakTracker.calculateStreak(
        workoutDatesUtc: dates,
        referenceDateUtc: today,
      );
      expect(streak, equals(2));
    });
  });
}
