import 'dart:convert';
import 'package:http/http.dart' as http;

/// Service for in-gym intelligent AI coaching.
/// Supports Google Gemini 1.5 Flash with zero-latency clinical fallback
/// for offline or keyless use.
class GeminiCoachService {
  static String? _apiKey;

  static void setApiKey(String key) {
    _apiKey = key.trim();
  }

  static String? get apiKey => _apiKey;
  static bool get hasApiKey => _apiKey != null && _apiKey!.isNotEmpty;

  /// Clinical, evidence-based offline fallback responses
  static String _getOfflineClinicalResponse(
      String query, String? currentExercise) {
    final lower = query.toLowerCase();

    if (lower.contains('busy') ||
        lower.contains('taken') ||
        lower.contains('occupied') ||
        lower.contains('alternative') ||
        lower.contains('swap')) {
      if (currentExercise != null &&
          currentExercise.toLowerCase().contains('bench')) {
        return '🔄 Equipment Busy Swap:\n\n'
            '1. Incline Dumbbell Press (Hits upper clavicular head, natural joint path)\n'
            '2. Machine Chest Press (Safe to failure, identical pectoralis recruitment)\n'
            '3. Weighted Dips or Push-ups (High motor-unit recruitment)\n\n'
            '💡 Biomechanics Tip: Dumbbells allow greater stretch at the bottom without stressing the rotator cuff.';
      } else if (currentExercise != null &&
          currentExercise.toLowerCase().contains('squat')) {
        return '🔄 Squat Rack Busy Swap:\n\n'
            '1. Leg Press (45-degree angle, high quad tension)\n'
            '2. Bulgarian Split Squats (Single-leg stability, intense glute/quad recruitment)\n'
            '3. Goblet Squats with heavy dumbbell';
      }
      return '🔄 Quick Substitution Protocol:\n\n'
          '1. Find a dumbbell or cable variation matching the same movement plane (push/pull/hinge).\n'
          '2. Match the target rep range: 8–12 reps with 2 reps in reserve (RIR 2).\n'
          '3. Keep your rest interval constant to preserve workout volume.';
    }

    if (lower.contains('pain') ||
        lower.contains('hurt') ||
        lower.contains('shoulder') ||
        lower.contains('back')) {
      return '⚠️ Injury Prevention Alert:\n\n'
          '1. Immediate Action: Stop the exercise if you experience sharp, localized joint pain.\n'
          '2. Shoulder Relief: Switch to a neutral grip (palms facing each other) or dumbbell floor press to limit extension.\n'
          '3. Lower Back Relief: Replace standing barbell work with chest-supported rows or seated cable movements.';
    }

    if (lower.contains('time') ||
        lower.contains('hurry') ||
        lower.contains('quick') ||
        lower.contains('short') ||
        lower.contains('20') ||
        lower.contains('25')) {
      return '⚡ Express Workout Condensation (25 Min Protocol):\n\n'
          '1. Drop isolation exercises; focus only on the 2 main compound lifts.\n'
          '2. Switch to Antagonist Supersets: Pair Chest Press with Cable Rows (zero waiting).\n'
          '3. Use Rest-Pause Sets: 1 heavy set of 8, rest 15s, perform 3 more reps to maintain effective hypertrophy volume in half the time.';
    }

    return '🤖 FitLog AI Coach:\n\n'
        'Focus on progressive overload: If you achieved all target reps on your last set, increase the load by 2.5 kg today. '
        'Keep rest intervals between 60–90 seconds for optimal hypertrophic stimulus while maintaining strict mechanical tension.';
  }

  /// Sends the prompt to Google Gemini 1.5 Flash API, or falls back gracefully
  static Future<String> askCoach({
    required String query,
    String? currentExercise,
    String? currentRoutine,
  }) async {
    final trimmedKey = _apiKey?.trim();

    if (trimmedKey == null || trimmedKey.isEmpty) {
      // Fast clinical fallback
      return _getOfflineClinicalResponse(query, currentExercise);
    }

    try {
      final url = Uri.parse(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      );

      final prompt = '''
You are FitLog Pro's elite in-gym strength & conditioning AI coach.
Context:
- Current routine: ${currentRoutine ?? 'Push / Upper Body'}
- Current exercise: ${currentExercise ?? 'Barbell Bench Press'}
User gym question: "$query"

Guidelines:
- Give a brief, punchy, high-leverage response for someone currently in the gym between sets.
- Maximum 3-4 bullet points.
- Plain language, zero corporate fluff.
- Reference biomechanics and practical gym substitutions if equipment is busy or joints hurt.
''';

      final response = await http
          .post(
            url,
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': trimmedKey,
            },
            body: jsonEncode({
              'contents': [
                {
                  'parts': [
                    {'text': prompt}
                  ]
                }
              ],
              'generationConfig': {
                'temperature': 0.7,
                'maxOutputTokens': 250,
              }
            }),
          )
          .timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final candidates = data['candidates'];
        if (candidates is List && candidates.isNotEmpty) {
          final firstCandidate = candidates.first;
          if (firstCandidate is Map<String, dynamic>) {
            final content = firstCandidate['content'];
            if (content is Map<String, dynamic>) {
              final parts = content['parts'];
              if (parts is List && parts.isNotEmpty) {
                final firstPart = parts.first;
                if (firstPart is Map<String, dynamic>) {
                  final text = firstPart['text'] as String?;
                  if (text != null && text.trim().isNotEmpty) {
                    return text.trim();
                  }
                }
              }
            }
          }
        }
      }

      // If API returns an error or status != 200, fallback cleanly
      return _getOfflineClinicalResponse(query, currentExercise);
    } catch (_) {
      // In case of timeout or offline, always return clinical response
      return _getOfflineClinicalResponse(query, currentExercise);
    }
  }
}
