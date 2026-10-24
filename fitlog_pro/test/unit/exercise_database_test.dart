import 'package:flutter_test/flutter_test.dart';
import 'package:fitlog_pro/features/exercises/domain/entities/exercise.dart';
import 'package:fitlog_pro/features/exercises/data/exercise_database.dart';

void main() {
  group('ExerciseDatabase Tests', () {
    test('Library contains 300+ anatomically classified exercises', () {
      expect(ExerciseDatabase.totalCount, greaterThanOrEqualTo(300));
      // ignore: avoid_print
      print('Exercise Library Count: ${ExerciseDatabase.totalCount}');
    });

    test('All muscle groups are represented with non-empty lists', () {
      for (final mg in MuscleGroup.values) {
        final matches = ExerciseDatabase.filter(muscleGroup: mg);
        expect(matches.isNotEmpty, isTrue,
            reason: 'Muscle group ${mg.displayName} has 0 exercises');
      }
    });

    test('All equipment types are represented with non-empty lists', () {
      for (final eq in EquipmentType.values) {
        final matches = ExerciseDatabase.filter(equipment: eq);
        expect(matches.isNotEmpty, isTrue,
            reason: 'Equipment type ${eq.displayName} has 0 exercises');
      }
    });

    test('Search filter properly matches exercise names and descriptions', () {
      final benchMatches = ExerciseDatabase.filter(query: 'bench press');
      expect(benchMatches.isNotEmpty, isTrue);

      final latMatches = ExerciseDatabase.filter(query: 'pulldown');
      expect(latMatches.isNotEmpty, isTrue);

      final isolationChest = ExerciseDatabase.filter(
        muscleGroup: MuscleGroup.chest,
        mechanic: ExerciseMechanic.isolation,
      );
      expect(isolationChest.isNotEmpty, isTrue);
    });
  });
}
