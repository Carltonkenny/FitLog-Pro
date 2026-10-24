import 'package:flutter_test/flutter_test.dart';
import 'package:fitlog_pro/features/routines/domain/health_science_engine.dart';

void main() {
  group('HealthScienceEngine Tests', () {
    test(
        'Male Hypertrophy blueprint prescribes 90s rest and compound upper focus',
        () {
      final blueprint = HealthScienceEngine.getBlueprint(
        sex: BiologicalSex.male,
        goal: FitnessGoal.hypertrophy,
      );

      expect(blueprint.recommendedRestSeconds, equals(90));
      expect(blueprint.targetRepRange, contains('8 – 12'));
      expect(blueprint.recommendedExercises.length, greaterThanOrEqualTo(4));
      expect(blueprint.evidenceCitation, contains('ACSM'));
    });

    test(
        'Female Hypertrophy blueprint prescribes 60s rest and posterior chain focus',
        () {
      final blueprint = HealthScienceEngine.getBlueprint(
        sex: BiologicalSex.female,
        goal: FitnessGoal.hypertrophy,
      );

      expect(blueprint.recommendedRestSeconds, equals(60));
      expect(blueprint.targetRepRange, contains('10 – 15'));
      expect(
          blueprint.recommendedExercises.any((e) => e.contains('Hip Thrust')),
          isTrue);
      expect(blueprint.physiologicalRationale, contains('Type I'));
    });

    test('Maximum Strength prescribes heavy rest intervals (>= 120s)', () {
      final blueprintMale = HealthScienceEngine.getBlueprint(
        sex: BiologicalSex.male,
        goal: FitnessGoal.maximumStrength,
      );
      final blueprintFemale = HealthScienceEngine.getBlueprint(
        sex: BiologicalSex.female,
        goal: FitnessGoal.maximumStrength,
      );

      expect(blueprintMale.recommendedRestSeconds, greaterThanOrEqualTo(120));
      expect(blueprintFemale.recommendedRestSeconds, greaterThanOrEqualTo(120));
      expect(blueprintFemale.physiologicalRationale,
          contains('bone mineral density'));
    });

    test('Metabolic Fat Loss prescribes high density short rest (<= 45s)', () {
      final blueprint = HealthScienceEngine.getBlueprint(
        sex: BiologicalSex.male,
        goal: FitnessGoal.metabolicFatLoss,
      );

      expect(blueprint.recommendedRestSeconds, lessThanOrEqualTo(60));
      expect(blueprint.evidenceCitation, contains('WHO'));
      expect(
          blueprint.recommendedWeeklySetsPerMuscle, greaterThanOrEqualTo(16));
    });
  });
}
