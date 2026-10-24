import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';
import '../../../workout/domain/services/gym_motivator_service.dart';

class HomeDashboardScreen extends StatelessWidget {
  final VoidCallback onStartWorkout;
  final VoidCallback onNavigateProgress;
  final VoidCallback? onOpenOnboarding;
  final VoidCallback? onNavigateAcademy;

  const HomeDashboardScreen({
    super.key,
    required this.onStartWorkout,
    required this.onNavigateProgress,
    this.onOpenOnboarding,
    this.onNavigateAcademy,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FitLogTokens.bg,
      appBar: AppBar(
        title: const Text('FitLog Pro'),
        backgroundColor: FitLogTokens.bg,
        elevation: 0,
        actions: [
          if (onOpenOnboarding != null)
            IconButton(
              icon: const Icon(Icons.auto_awesome, color: FitLogTokens.accent),
              tooltip: 'AI Plan Setup & Goals',
              onPressed: onOpenOnboarding,
            ),
          IconButton(
            icon: const Icon(Icons.analytics_outlined,
                color: FitLogTokens.textSecondary),
            onPressed: onNavigateProgress,
            tooltip: 'View Analytics',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(FitLogTokens.spacing16),
        children: [
          // Greeting & Welcome Header
          const Text(
            'Welcome to FitLog Pro',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: FitLogTokens.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            GymMotivatorService.getPostSetCue(),
            style: const TextStyle(
              color: FitLogTokens.textSecondary,
              fontSize: 12,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 18),

          // Primary Workout Target Card (Thumb Zone)
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: FitLogTokens.surface,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
              border: Border.all(
                color: FitLogTokens.accent.withValues(alpha: 0.6),
                width: 1.5,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: FitLogTokens.accent.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'TODAY\'S WORKOUT TARGET',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.8,
                          color: FitLogTokens.accent,
                        ),
                      ),
                    ),
                    const Text(
                      '⏱ ~50 min',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: FitLogTokens.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                const Text(
                  'Push Day (Chest, Shoulders & Triceps)',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: FitLogTokens.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  '5 exercises · Bench Press, Incline DB, Cable Fly, Triceps, Delts',
                  style: TextStyle(
                      fontSize: 12, color: FitLogTokens.textSecondary),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: onStartWorkout,
                    child: const Text('Start Workout Now'),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Streak & Consistency Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: FitLogTokens.surface,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
              border: Border.all(color: Colors.white10),
            ),
            child: const Row(
              children: [
                Text('🔥', style: TextStyle(fontSize: 32)),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '0 Days Active Streak',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: FitLogTokens.textPrimary,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Complete your workout today to ignite your 1-day streak!',
                        style: TextStyle(
                            fontSize: 11, color: FitLogTokens.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Personalized AI Plan Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: FitLogTokens.surface,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Active Training Blueprint',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: FitLogTokens.textPrimary,
                      ),
                    ),
                    if (onOpenOnboarding != null)
                      TextButton(
                        onPressed: onOpenOnboarding,
                        child: const Text('Edit Blueprint',
                            style: TextStyle(
                                fontSize: 11, color: FitLogTokens.accent)),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  '4-Day Hypertrophy Split · 90s Clinical Rest Intervals',
                  style: TextStyle(fontSize: 12, color: FitLogTokens.accent),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Prescribed based on ACSM guidelines (2x weekly frequency per muscle group for 48% higher muscle protein synthesis).',
                  style: TextStyle(
                      fontSize: 11, color: FitLogTokens.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Academy Education Teaser Card
          if (onNavigateAcademy != null)
            GestureDetector(
              onTap: onNavigateAcademy,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: FitLogTokens.surface2,
                  borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
                  border: Border.all(color: Colors.white12),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.school, color: FitLogTokens.accent, size: 28),
                    SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Anatomy & Equipment Academy',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              color: FitLogTokens.textPrimary,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Learn what exercises do to your body & movement synergies.',
                            style: TextStyle(
                                fontSize: 11,
                                color: FitLogTokens.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    Icon(Icons.chevron_right,
                        color: FitLogTokens.textSecondary),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
