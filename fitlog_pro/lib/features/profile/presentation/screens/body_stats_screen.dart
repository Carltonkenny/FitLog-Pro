import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';

class WeightLogEntry {
  final String dateText;
  final double weightKg;
  final double? changeKg;

  const WeightLogEntry({
    required this.dateText,
    required this.weightKg,
    this.changeKg,
  });
}

class BodyStatsScreen extends StatefulWidget {
  const BodyStatsScreen({super.key});

  @override
  State<BodyStatsScreen> createState() => _BodyStatsScreenState();
}

class _BodyStatsScreenState extends State<BodyStatsScreen> {
  final List<WeightLogEntry> _weightLogs = [];

  void _showLogWeightModal() {
    final controller = TextEditingController(text: '78.4');
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return Container(
          padding: EdgeInsets.fromLTRB(
            20,
            20,
            20,
            MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          decoration: const BoxDecoration(
            color: FitLogTokens.surface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            border:
                Border(top: BorderSide(color: FitLogTokens.accent, width: 2)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Log Body Weight',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: FitLogTokens.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: controller,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                autofocus: true,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: FitLogTokens.accent,
                ),
                decoration: InputDecoration(
                  suffixText: 'kg',
                  suffixStyle: const TextStyle(
                      color: FitLogTokens.textSecondary, fontSize: 16),
                  filled: true,
                  fillColor: FitLogTokens.surface2,
                  border: OutlineInputBorder(
                    borderRadius:
                        BorderRadius.circular(FitLogTokens.radiusControl),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  final val = double.tryParse(controller.text) ?? 78.4;
                  setState(() {
                    _weightLogs.insert(
                      0,
                      WeightLogEntry(
                        dateText: 'Just Now',
                        weightKg: val,
                        changeKg: 0.0,
                      ),
                    );
                  });
                  Navigator.of(ctx).pop();
                },
                child: const Text('Save Entry'),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FitLogTokens.bg,
      appBar: AppBar(
        backgroundColor: FitLogTokens.bg,
        elevation: 0,
        title: const Text(
          'Body Stats & Metrics',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: FitLogTokens.textPrimary,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: FitLogTokens.accent),
            tooltip: 'Log Weight',
            onPressed: _showLogWeightModal,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Current Metrics Grid
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: FitLogTokens.surface,
                    borderRadius:
                        BorderRadius.circular(FitLogTokens.radiusCard),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CURRENT WEIGHT',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                          color: FitLogTokens.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${_weightLogs.first.weightKg} kg',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: FitLogTokens.accent,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        '📉 -1.0 kg this month',
                        style: TextStyle(
                          fontSize: 11,
                          color: FitLogTokens.accent,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: FitLogTokens.surface,
                    borderRadius:
                        BorderRadius.circular(FitLogTokens.radiusCard),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'BODY FAT %',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                          color: FitLogTokens.textSecondary,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        '14.8%',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: FitLogTokens.textPrimary,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Athletic Range',
                        style: TextStyle(
                          fontSize: 11,
                          color: FitLogTokens.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          const Text(
            'WEIGHT HISTORY',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.0,
              color: FitLogTokens.textSecondary,
            ),
          ),
          const SizedBox(height: 10),

          // Log list
          if (_weightLogs.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: FitLogTokens.surface,
                borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                children: [
                  const Icon(Icons.monitor_weight_outlined,
                      size: 40, color: FitLogTokens.textSecondary),
                  const SizedBox(height: 12),
                  const Text(
                    'No weigh-ins logged yet',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: FitLogTokens.textPrimary),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Track your bodyweight regularly to calculate lean mass and energy trends.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 12, color: FitLogTokens.textSecondary),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _showLogWeightModal,
                    icon: const Icon(Icons.add),
                    label: const Text('Log First Weigh-in'),
                  ),
                ],
              ),
            )
          else
            for (final entry in _weightLogs)
              Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: FitLogTokens.surface,
                  borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
                  border: Border.all(color: Colors.white10),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      entry.dateText,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: FitLogTokens.textPrimary,
                      ),
                    ),
                    Row(
                      children: [
                        Text(
                          '${entry.weightKg} kg',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: FitLogTokens.textPrimary,
                          ),
                        ),
                        if (entry.changeKg != null) ...[
                          const SizedBox(width: 8),
                          Text(
                            entry.changeKg! < 0
                                ? '${entry.changeKg} kg'
                                : entry.changeKg! > 0
                                    ? '+${entry.changeKg} kg'
                                    : '0.0 kg',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: entry.changeKg! <= 0
                                  ? FitLogTokens.accent
                                  : FitLogTokens.danger,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
        ],
      ),
    );
  }
}
