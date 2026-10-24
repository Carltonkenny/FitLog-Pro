import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';

class WorkoutSummaryScreen extends StatelessWidget {
  final String title;
  final String duration;
  final double volumeKg;
  final int totalSets;
  final int prCount;

  const WorkoutSummaryScreen({
    super.key,
    required this.title,
    required this.duration,
    required this.volumeKg,
    required this.totalSets,
    required this.prCount,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Workout Summary'),
        backgroundColor: FitLogTokens.bg,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(FitLogTokens.spacing16),
        children: [
          const SizedBox(height: 12),
          const Center(
            child: Text('💪', style: TextStyle(fontSize: 48)),
          ),
          const SizedBox(height: 8),
          Center(
            child: Text(
              '$title Complete!',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
            ),
          ),
          const SizedBox(height: 4),
          const Center(
            child: Text(
              'Persisted to Drift local database',
              style: TextStyle(color: FitLogTokens.textSecondary, fontSize: 13),
            ),
          ),
          const SizedBox(height: 24),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.5,
            children: [
              _buildMetricCard('Duration', duration, FitLogTokens.accent),
              _buildMetricCard(
                  'Total Volume',
                  '${volumeKg.toStringAsFixed(0)} kg',
                  FitLogTokens.textPrimary),
              _buildMetricCard(
                  'Sets Logged', '$totalSets sets', FitLogTokens.textPrimary),
              _buildMetricCard(
                  'Records Broken', '$prCount PR 🏆', FitLogTokens.prGold),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: FitLogTokens.surface,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'SESSION NOTES',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                    color: FitLogTokens.textSecondary,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Bench press felt explosive. Smashed 82.5 kg for 8 clean reps. Progressive overload targets achieved.',
                  style: TextStyle(fontSize: 13, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Return to Home'),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, Color valueColor) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: FitLogTokens.surface,
        borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value,
            style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.w900, color: valueColor),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
                fontSize: 11, color: FitLogTokens.textSecondary),
          ),
        ],
      ),
    );
  }
}
