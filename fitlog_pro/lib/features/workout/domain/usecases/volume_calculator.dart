import '../entities/workout_set.dart';

/// Pure Dart logic for calculating total workout volume.
/// Volume is the sum of (weight in kg * reps) across completed sets only.
abstract final class VolumeCalculator {
  static double calculateTotal(List<WorkoutSet> sets) {
    var total = 0.0;
    for (final set in sets) {
      if (set.isCompleted && set.weightKg > 0 && set.reps > 0) {
        total += set.weightKg * set.reps;
      }
    }
    return double.parse(total.toStringAsFixed(2));
  }
}
