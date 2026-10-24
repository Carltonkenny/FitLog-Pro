import 'dart:math';

/// Provides evidence-based motivational, breathing, and performance cues
/// during active gym sessions after set completions and timer expirations.
class GymMotivatorService {
  static final Random _random = Random();

  static const List<String> _postSetCues = [
    'Crisp lockout! Deep nasal breathing: in 4 seconds, out 4 seconds to lower heart rate.',
    'Solid effort. Focus on maintaining identical bar path on the next round.',
    'Mechanical tension achieved. Your muscle fibers received the growth signal.',
    'Great tempo. Shake out the arms and let the lactic acid clear.',
    'Set logged! Hydrate with a quick sip and stay dialed in.',
    'High quality reps. Zero momentum, pure muscular control.',
    'Clean execution! ATP stores are already replenishing.',
    'Strong focus. Consistent sets like this are where progressive overload happens.',
  ];

  static const List<String> _prBeatenCues = [
    '🏆 NEW PERSONAL RECORD! You just moved more weight than ever before in your life!',
    '🏆 PR CRUSHED! Your estimated 1RM just bumped up. Hard work paying off in real time.',
    '🏆 RECORD BROKEN! Progressive overload proven. That strength is permanent.',
  ];

  static const List<String> _timerExpiredCues = [
    '⏱ Rest interval complete. Muscles are 95% ATP-recharged—own this next set!',
    '⏱ Time to work. Step up to the bar with authority and full intent.',
    '⏱ Primed and ready. Lock in your grip and drive through the floor.',
    '⏱ Rest is over. Maintain your tight brace and explosive concentric push.',
    '⏱ Clock zeroed. Visualize your first rep and execute.',
  ];

  static const List<String> _supersetCues = [
    '⚡ Superset pace! Moving straight to the antagonist exercise saves 15 minutes of gym time.',
    '⚡ Zero rest transition! Keep your breathing steady as you switch stations.',
    '⚡ High density round complete! Take full advantage of the 90-second recovery now.',
  ];

  /// Get random post-set motivational cue
  static String getPostSetCue({bool isPR = false}) {
    if (isPR) {
      return _prBeatenCues[_random.nextInt(_prBeatenCues.length)];
    }
    return _postSetCues[_random.nextInt(_postSetCues.length)];
  }

  /// Get random timer expiration call-to-action
  static String getTimerExpiredCue() {
    return _timerExpiredCues[_random.nextInt(_timerExpiredCues.length)];
  }

  /// Get superset transition cue
  static String getSupersetCue() {
    return _supersetCues[_random.nextInt(_supersetCues.length)];
  }
}
