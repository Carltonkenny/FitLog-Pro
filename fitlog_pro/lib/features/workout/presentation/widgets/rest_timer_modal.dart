import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';
import '../../domain/services/gym_motivator_service.dart';

class RestTimerModal extends StatefulWidget {
  final int initialSeconds;
  final String nextExercise;
  final String nextSetDetails;
  final VoidCallback onDismiss;

  const RestTimerModal({
    super.key,
    required this.initialSeconds,
    required this.nextExercise,
    required this.nextSetDetails,
    required this.onDismiss,
  });

  static void show(
    BuildContext context, {
    required int seconds,
    required String nextExercise,
    required String nextSetDetails,
  }) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => RestTimerModal(
        initialSeconds: seconds,
        nextExercise: nextExercise,
        nextSetDetails: nextSetDetails,
        onDismiss: () => Navigator.of(context).pop(),
      ),
    );
  }

  @override
  State<RestTimerModal> createState() => _RestTimerModalState();
}

class _RestTimerModalState extends State<RestTimerModal> {
  late int _remaining;
  Timer? _timer;
  late String _motivationalCue;

  @override
  void initState() {
    super.initState();
    _remaining = widget.initialSeconds;
    _motivationalCue = GymMotivatorService.getPostSetCue();
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remaining > 0) {
        setState(() => _remaining--);
      } else {
        _timer?.cancel();
        setState(() {
          _motivationalCue = GymMotivatorService.getTimerExpiredCue();
        });
      }
    });
  }

  void _adjustTime(int deltaSeconds) {
    setState(() {
      _remaining = (_remaining + deltaSeconds).clamp(0, 600);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mins = (_remaining ~/ 60).toString().padLeft(2, '0');
    final secs = (_remaining % 60).toString().padLeft(2, '0');
    final progress = widget.initialSeconds > 0
        ? (_remaining / widget.initialSeconds).clamp(0.0, 1.0)
        : 0.0;

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 36),
      decoration: const BoxDecoration(
        color: FitLogTokens.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(top: BorderSide(color: Colors.white12, width: 1)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 44,
            height: 5,
            decoration: BoxDecoration(
              color: FitLogTokens.textSecondary.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'REST INTERVAL',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
              color: FitLogTokens.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '$mins:$secs',
            style: const TextStyle(
              fontSize: 64,
              fontWeight: FontWeight.w900,
              color: FitLogTokens.accent,
            ),
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: FitLogTokens.surface2,
              valueColor:
                  const AlwaysStoppedAnimation<Color>(FitLogTokens.accent),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              OutlinedButton(
                onPressed: () => _adjustTime(-15),
                style: OutlinedButton.styleFrom(
                  backgroundColor: FitLogTokens.surface2,
                  foregroundColor: FitLogTokens.textPrimary,
                  side: BorderSide.none,
                  shape: const StadiumBorder(),
                ),
                child: const Text('−15s',
                    style: TextStyle(fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 14),
              ElevatedButton(
                onPressed: widget.onDismiss,
                style: ElevatedButton.styleFrom(
                  backgroundColor: FitLogTokens.accent,
                  foregroundColor: FitLogTokens.onAccent,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
                  shape: const StadiumBorder(),
                ),
                child: const Text('Skip',
                    style: TextStyle(fontWeight: FontWeight.w800)),
              ),
              const SizedBox(width: 14),
              OutlinedButton(
                onPressed: () => _adjustTime(30),
                style: OutlinedButton.styleFrom(
                  backgroundColor: FitLogTokens.surface2,
                  foregroundColor: FitLogTokens.textPrimary,
                  side: BorderSide.none,
                  shape: const StadiumBorder(),
                ),
                child: const Text('+30s',
                    style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: FitLogTokens.accent.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                  color: FitLogTokens.accent.withValues(alpha: 0.3), width: 1),
            ),
            child: Row(
              children: [
                const Icon(Icons.psychology,
                    color: FitLogTokens.accent, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _motivationalCue,
                    style: const TextStyle(
                      fontSize: 11,
                      color: FitLogTokens.accent,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: FitLogTokens.surface2,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
            ),
            child: Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: FitLogTokens.accent,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'NEXT',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: FitLogTokens.onAccent,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.nextExercise,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      Text(
                        widget.nextSetDetails,
                        style: const TextStyle(
                            color: FitLogTokens.textSecondary, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
