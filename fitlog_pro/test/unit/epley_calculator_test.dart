import 'package:flutter_test/flutter_test.dart';
import 'package:fitlog_pro/features/workout/domain/usecases/epley_calculator.dart';

void main() {
  group('EpleyCalculator Tests', () {
    test('calculates accurate 1RM for standard set (82.5 kg x 8 reps)', () {
      // 82.5 * (1 + 8/30) = 82.5 * 1.26666... = 104.5
      final result = EpleyCalculator.calculate(weightKg: 82.5, reps: 8);
      expect(result, equals(104.5));
    });

    test('1 rep returns the weight itself exactly', () {
      final result = EpleyCalculator.calculate(weightKg: 100.0, reps: 1);
      expect(result, equals(100.0));
    });

    test('0 reps or 0 weight returns 0.0', () {
      expect(EpleyCalculator.calculate(weightKg: 80.0, reps: 0), equals(0.0));
      expect(EpleyCalculator.calculate(weightKg: 0.0, reps: 10), equals(0.0));
    });

    test('decimal weight rounding is preserved to 2 decimal places', () {
      // 77.25 * (1 + 7/30) = 77.25 * 1.23333333 = 95.275 -> 95.28
      final result = EpleyCalculator.calculate(weightKg: 77.25, reps: 7);
      expect(result, equals(95.28));
    });

    test('throws ArgumentError for negative inputs', () {
      expect(() => EpleyCalculator.calculate(weightKg: -10, reps: 5),
          throwsArgumentError);
      expect(() => EpleyCalculator.calculate(weightKg: 50, reps: -2),
          throwsArgumentError);
    });
  });
}
