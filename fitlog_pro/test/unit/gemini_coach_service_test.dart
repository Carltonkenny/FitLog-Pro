import 'package:flutter_test/flutter_test.dart';
import 'package:fitlog_pro/features/workout/domain/services/gemini_coach_service.dart';

void main() {
  group('GeminiCoachService Offline & Fallback Tests', () {
    setUp(() {
      GeminiCoachService.setApiKey('');
    });

    tearDownAll(() {
      GeminiCoachService.setApiKey('');
    });

    test('Falls back to clinical substitution when equipment is busy',
        () async {
      final response = await GeminiCoachService.askCoach(
        query: 'Bench press is taken, what is the best alternative?',
        currentExercise: 'Barbell Bench Press',
      );

      expect(response, contains('Equipment Busy Swap'));
      expect(response, contains('Incline Dumbbell Press'));
    });

    test('Provides injury prevention protocol for shoulder or back pain',
        () async {
      final response = await GeminiCoachService.askCoach(
        query: 'My front shoulder hurts during pressing',
        currentExercise: 'Barbell Bench Press',
      );

      expect(response, contains('Injury Prevention Alert'));
      expect(response, contains('Shoulder Relief'));
    });

    test('Condenses session when user is in a hurry', () async {
      final response = await GeminiCoachService.askCoach(
        query: 'I only have 20 minutes left today',
        currentExercise: 'Barbell Bench Press',
      );

      expect(response, contains('Express Workout Condensation'));
      expect(response, contains('Antagonist Supersets'));
    });

    test('Sets and retrieves API key correctly', () {
      expect(GeminiCoachService.hasApiKey, isFalse);
      GeminiCoachService.setApiKey('AIzaSyDummyTestKey12345');
      expect(GeminiCoachService.hasApiKey, isTrue);
      expect(GeminiCoachService.apiKey, equals('AIzaSyDummyTestKey12345'));
    });
  });
}
