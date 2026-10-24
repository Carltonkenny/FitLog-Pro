import 'package:flutter_test/flutter_test.dart';
import 'package:fitlog_pro/features/workout/domain/entities/workout_set.dart';
import 'package:fitlog_pro/features/workout/domain/usecases/volume_calculator.dart';

void main() {
  group('VolumeCalculator Tests', () {
    test('calculates correct volume summing only completed sets', () {
      const sets = [
        WorkoutSet(
            id: '1', setOrder: 1, weightKg: 82.5, reps: 8, isCompleted: true),
        WorkoutSet(
            id: '2', setOrder: 2, weightKg: 82.5, reps: 8, isCompleted: true),
        WorkoutSet(
            id: '3',
            setOrder: 3,
            weightKg: 82.5,
            reps: 8,
            isCompleted: false), // Incomplete
      ];

      // 82.5 * 8 = 660, 660 * 2 = 1320
      final total = VolumeCalculator.calculateTotal(sets);
      expect(total, equals(1320.0));
    });

    test('empty list returns 0.0', () {
      expect(VolumeCalculator.calculateTotal([]), equals(0.0));
    });

    test('ignores sets with zero or negative weights or reps', () {
      const sets = [
        WorkoutSet(
            id: '1', setOrder: 1, weightKg: 0.0, reps: 10, isCompleted: true),
        WorkoutSet(
            id: '2', setOrder: 2, weightKg: 50.0, reps: 0, isCompleted: true),
      ];
      expect(VolumeCalculator.calculateTotal(sets), equals(0.0));
    });
  });
}
