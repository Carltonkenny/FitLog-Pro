/// Pure Dart business logic for estimating 1RM using the Epley equation:
/// `1RM = weight * (1 + reps / 30)`
///
/// Units: weight in kg, rounded to 0.01 at output.
abstract final class EpleyCalculator {
  /// Calculates estimated 1 Rep Max in kg.
  /// - If [reps] is 0, returns 0.0.
  /// - If [reps] is 1, returns [weightKg].
  /// - Negative inputs throw [ArgumentError].
  static double calculate({
    required double weightKg,
    required int reps,
  }) {
    if (weightKg < 0) {
      throw ArgumentError.value(
          weightKg, 'weightKg', 'Weight cannot be negative');
    }
    if (reps < 0) {
      throw ArgumentError.value(reps, 'reps', 'Reps cannot be negative');
    }
    if (reps == 0 || weightKg == 0) {
      return 0.0;
    }
    if (reps == 1) {
      return double.parse(weightKg.toStringAsFixed(2));
    }

    final raw = weightKg * (1.0 + (reps / 30.0));
    return double.parse(raw.toStringAsFixed(2));
  }
}
