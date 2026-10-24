import 'package:flutter_test/flutter_test.dart';
import 'package:fitlog_pro/features/workout/domain/entities/workout_set.dart';
import 'package:fitlog_pro/features/workout/domain/usecases/epley_calculator.dart';
import 'package:fitlog_pro/features/workout/domain/usecases/pr_detector.dart';
import 'package:fitlog_pro/features/workout/domain/usecases/streak_tracker.dart';
import 'package:fitlog_pro/features/workout/domain/usecases/volume_calculator.dart';

void main() {
  group('Extreme Stress & Jailbreak Edge Tests', () {
    test(
        'Epley Calculator: Extreme superhuman load (1000 kg x 30 reps) does not overflow or produce NaN',
        () {
      final res = EpleyCalculator.calculate(weightKg: 1000.0, reps: 30);
      expect(res, equals(2000.0));
      expect(res.isFinite, isTrue);
      expect(res.isNaN, isFalse);
    });

    test(
        'Epley Calculator: 1 million reps does not crash or throw unhandled error',
        () {
      final res = EpleyCalculator.calculate(weightKg: 20.0, reps: 1000000);
      expect(res.isFinite, isTrue);
      expect(res, greaterThan(20.0));
    });

    test(
        'Epley Calculator: Negative weight or reps strictly throws ArgumentError',
        () {
      expect(
        () => EpleyCalculator.calculate(weightKg: -50.0, reps: 10),
        throwsArgumentError,
      );
      expect(
        () => EpleyCalculator.calculate(weightKg: 100.0, reps: -5),
        throwsArgumentError,
      );
    });

    test(
        'PR Detector: Scalability stress test against 5,000 historical sets executes in < 50ms',
        () {
      final largeHistory = List.generate(
        5000,
        (i) => WorkoutSet(
          setOrder: i + 1,
          weightKg: 50.0 + (i % 50),
          reps: 8 + (i % 5),
          isCompleted: true,
        ),
      );

      final stopwatch = Stopwatch()..start();
      const candidate = WorkoutSet(
        setOrder: 5001,
        weightKg: 105.0,
        reps: 12,
        isCompleted: true,
      );

      final isPR = PRDetector.isNewRecord(
        candidateSet: candidate,
        historicalSets: largeHistory,
      );
      stopwatch.stop();

      expect(isPR, isTrue);
      expect(stopwatch.elapsedMilliseconds, lessThan(50));
    });

    test(
        'PR Detector: Floating point precision tie (82.50 vs 82.50) is never falsely crowned as PR',
        () {
      final history = [
        const WorkoutSet(
            setOrder: 1, weightKg: 82.5, reps: 8, isCompleted: true),
      ];

      const tieCandidate = WorkoutSet(
        setOrder: 2,
        weightKg: 82.5,
        reps: 8,
        isCompleted: true,
      );

      final isPR = PRDetector.isNewRecord(
        candidateSet: tieCandidate,
        historicalSets: history,
      );

      expect(isPR, isFalse);
    });

    test(
        'Streak Tracker: 365 consecutive days across leap year midnight boundaries calculates 365',
        () {
      final now = DateTime(2026, 10, 21, 23, 59, 59);
      final workoutDays = List.generate(
        365,
        (i) => now.subtract(Duration(days: i)),
      );

      final streak = StreakTracker.calculateStreak(
        workoutDatesUtc: workoutDays,
        referenceDateUtc: now,
      );

      expect(streak, equals(365));
    });

    test(
        'Volume Calculator: Mixed corrupted sets (negative/zero/uncompleted) are safely ignored',
        () {
      final sets = [
        const WorkoutSet(
            setOrder: 1, weightKg: -100.0, reps: 10, isCompleted: true),
        const WorkoutSet(
            setOrder: 2, weightKg: 100.0, reps: -5, isCompleted: true),
        const WorkoutSet(
            setOrder: 3, weightKg: 80.0, reps: 10, isCompleted: false),
        const WorkoutSet(
            setOrder: 4, weightKg: 80.0, reps: 10, isCompleted: true), // 800 kg
      ];

      final total = VolumeCalculator.calculateTotal(sets);
      expect(total, equals(800.0));
    });
  });
}
