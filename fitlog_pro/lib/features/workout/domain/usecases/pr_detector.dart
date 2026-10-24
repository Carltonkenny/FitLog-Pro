import '../entities/workout_set.dart';
import 'epley_calculator.dart';

/// Pure Dart PR detection engine.
///
/// Evaluates candidate set against historical sets using estimated 1RM and absolute weight.
/// Warmup sets and incomplete sets are strictly ignored.
abstract final class PRDetector {
  static bool isNewRecord({
    required WorkoutSet candidateSet,
    required List<WorkoutSet> historicalSets,
  }) {
    if (!candidateSet.isCompleted || candidateSet.type == SetType.warmup) {
      return false;
    }

    if (candidateSet.weightKg <= 0 || candidateSet.reps <= 0) {
      return false;
    }

    final validHistory = historicalSets.where(
      (s) =>
          s.isCompleted &&
          s.type != SetType.warmup &&
          s.weightKg > 0 &&
          s.reps > 0,
    );

    if (validHistory.isEmpty) {
      return true;
    }

    final candidateOneRm = EpleyCalculator.calculate(
      weightKg: candidateSet.weightKg,
      reps: candidateSet.reps,
    );

    var highestHistoricalOneRm = 0.0;
    var highestHistoricalWeight = 0.0;

    for (final past in validHistory) {
      final oneRm = EpleyCalculator.calculate(
        weightKg: past.weightKg,
        reps: past.reps,
      );
      if (oneRm > highestHistoricalOneRm) {
        highestHistoricalOneRm = oneRm;
      }
      if (past.weightKg > highestHistoricalWeight) {
        highestHistoricalWeight = past.weightKg;
      }
    }

    // Must strictly exceed historical 1RM or top weight (tie is not a new PR)
    final beatsOneRm = candidateOneRm > (highestHistoricalOneRm + 0.01);
    final beatsTopWeight =
        candidateSet.weightKg > (highestHistoricalWeight + 0.01) &&
            candidateSet.reps >= 1;

    return beatsOneRm || beatsTopWeight;
  }
}
