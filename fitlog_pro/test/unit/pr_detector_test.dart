import 'package:flutter_test/flutter_test.dart';
import 'package:fitlog_pro/features/workout/domain/entities/workout_set.dart';
import 'package:fitlog_pro/features/workout/domain/usecases/pr_detector.dart';

void main() {
  group('PRDetector Tests', () {
    test('First workout set ever for an exercise is always a PR', () {
      const currentSet = WorkoutSet(
        setOrder: 1,
        weightKg: 80.0,
        reps: 8,
        isCompleted: true,
      );

      final isPR = PRDetector.isNewRecord(
        candidateSet: currentSet,
        historicalSets: [],
      );

      expect(isPR, isTrue);
    });

    test('Higher weight with same or more reps is a PR', () {
      const candidate = WorkoutSet(
        setOrder: 2,
        weightKg: 82.5,
        reps: 8,
        isCompleted: true,
      );

      final List<WorkoutSet> history = [
        const WorkoutSet(
            setOrder: 1, weightKg: 80.0, reps: 8, isCompleted: true),
        const WorkoutSet(
            setOrder: 2, weightKg: 80.0, reps: 8, isCompleted: true),
      ];

      final isPR = PRDetector.isNewRecord(
        candidateSet: candidate,
        historicalSets: history,
      );

      expect(isPR, isTrue);
    });

    test('Same weight with fewer reps is NOT a PR', () {
      const candidate = WorkoutSet(
        setOrder: 3,
        weightKg: 80.0,
        reps: 6,
        isCompleted: true,
      );

      final List<WorkoutSet> history = [
        const WorkoutSet(
            setOrder: 1, weightKg: 80.0, reps: 8, isCompleted: true),
      ];

      final isPR = PRDetector.isNewRecord(
        candidateSet: candidate,
        historicalSets: history,
      );

      expect(isPR, isFalse);
    });

    test('Tie with existing PR does NOT count as a new PR', () {
      const candidate = WorkoutSet(
        setOrder: 2,
        weightKg: 80.0,
        reps: 8,
        isCompleted: true,
      );

      final List<WorkoutSet> history = [
        const WorkoutSet(
            setOrder: 1, weightKg: 80.0, reps: 8, isCompleted: true),
      ];

      final isPR = PRDetector.isNewRecord(
        candidateSet: candidate,
        historicalSets: history,
      );

      expect(isPR, isFalse);
    });

    test('Warmup or incomplete set is never considered a PR', () {
      const incompleteCandidate = WorkoutSet(
        setOrder: 1,
        weightKg: 100.0,
        reps: 10,
        isCompleted: false,
      );

      const warmupCandidate = WorkoutSet(
        setOrder: 1,
        weightKg: 100.0,
        reps: 10,
        isCompleted: true,
        type: SetType.warmup,
      );

      expect(
        PRDetector.isNewRecord(
            candidateSet: incompleteCandidate, historicalSets: []),
        isFalse,
      );
      expect(
        PRDetector.isNewRecord(
            candidateSet: warmupCandidate, historicalSets: []),
        isFalse,
      );
    });
  });
}
