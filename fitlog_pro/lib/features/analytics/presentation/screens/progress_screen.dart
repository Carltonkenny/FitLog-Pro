import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';

class ProgressAnalyticsScreen extends StatefulWidget {
  const ProgressAnalyticsScreen({super.key});

  @override
  State<ProgressAnalyticsScreen> createState() =>
      _ProgressAnalyticsScreenState();
}

class _ProgressAnalyticsScreenState extends State<ProgressAnalyticsScreen> {
  String _selectedExercise = 'Barbell Bench Press';
  String _selectedRange = '1M';

  final List<double> _benchTopWeights = [
    70,
    72.5,
    72.5,
    75,
    75,
    77.5,
    77.5,
    80,
    80,
    80,
    82.5,
    82.5
  ];
  final List<double> _weeklyVolumes = [
    4200,
    4500,
    4350,
    4800,
    5000,
    4900,
    5200,
    5400,
    5300,
    5600,
    5750,
    5900
  ];

  void _showPaywallModal(String range) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: FitLogTokens.surface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            border:
                Border(top: BorderSide(color: FitLogTokens.accent, width: 2)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('💎', style: TextStyle(fontSize: 40)),
              const SizedBox(height: 8),
              const Text(
                'Unlock FitLog Pro',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 6),
              const Text(
                'Long-range historical analytics beyond 3 months, unlimited routines, and advanced muscle recovery tracking.',
                textAlign: TextAlign.center,
                style:
                    TextStyle(color: FitLogTokens.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Start 7-Day Free Trial (\$4.99/mo)'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Maybe Later',
                    style: TextStyle(color: FitLogTokens.textSecondary)),
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
      appBar: AppBar(
        title: const Text('Progress & Analytics'),
        backgroundColor: FitLogTokens.bg,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(FitLogTokens.spacing16),
        children: [
          // Exercise Selector Dropdown
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: FitLogTokens.surface,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusControl),
              border: Border.all(color: Colors.white12),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedExercise,
                dropdownColor: FitLogTokens.surface,
                isExpanded: true,
                style: const TextStyle(
                  color: FitLogTokens.textPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                ),
                items: [
                  'Barbell Bench Press',
                  'Barbell Deadlift',
                  'Barbell Back Squat'
                ]
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedExercise = val);
                },
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Range Selector Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildRangeChip('1M', false),
                _buildRangeChip('3M', false),
                _buildRangeChip('6M', true),
                _buildRangeChip('1Y', true),
                _buildRangeChip('All', true),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 1RM Trend Line Chart Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: FitLogTokens.surface,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'TOP WEIGHT / 1RM (KG)',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                        color: FitLogTokens.textSecondary,
                      ),
                    ),
                    Text(
                      '104.5 kg Est. 1RM',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: FitLogTokens.accent,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 150,
                  width: double.infinity,
                  child: CustomPaint(
                    painter: _SimpleLineChartPainter(
                      data: _benchTopWeights,
                      lineColor: FitLogTokens.accent,
                      prColor: FitLogTokens.prGold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Weekly Volume Bar Chart Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: FitLogTokens.surface,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'WEEKLY VOLUME (KG)',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                        color: FitLogTokens.textSecondary,
                      ),
                    ),
                    Text(
                      'Total: 18,450 kg',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: FitLogTokens.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 120,
                  width: double.infinity,
                  child: CustomPaint(
                    painter: _SimpleBarChartPainter(
                      data: _weeklyVolumes,
                      barColor: FitLogTokens.accent,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // PR Milestone Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: FitLogTokens.surface2,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
              border: Border.all(color: Colors.white12),
            ),
            child: const Row(
              children: [
                Text('🏆', style: TextStyle(fontSize: 28)),
                SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Current Record: 82.5 kg × 8',
                      style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 14,
                          color: FitLogTokens.prGold),
                    ),
                    Text(
                      'Est. 1RM: 104.5 kg · Broken this week',
                      style: TextStyle(
                          fontSize: 12, color: FitLogTokens.textSecondary),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRangeChip(String label, bool isPro) {
    final active = _selectedRange == label;
    return GestureDetector(
      onTap: () {
        if (isPro) {
          _showPaywallModal(label);
        } else {
          setState(() => _selectedRange = label);
        }
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: active ? FitLogTokens.accent : FitLogTokens.surface,
          borderRadius: BorderRadius.circular(FitLogTokens.radiusPill),
          border:
              Border.all(color: active ? FitLogTokens.accent : Colors.white12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color:
                    active ? FitLogTokens.onAccent : FitLogTokens.textSecondary,
              ),
            ),
            if (isPro) ...[
              const SizedBox(width: 4),
              const Icon(Icons.lock,
                  size: 12, color: FitLogTokens.textSecondary),
            ],
          ],
        ),
      ),
    );
  }
}

class _SimpleLineChartPainter extends CustomPainter {
  final List<double> data;
  final Color lineColor;
  final Color prColor;

  _SimpleLineChartPainter({
    required this.data,
    required this.lineColor,
    required this.prColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final paintLine = Paint()
      ..color = lineColor
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final gridPaint = Paint()
      ..color = Colors.white10
      ..strokeWidth = 1;

    for (var i = 1; i <= 3; i++) {
      final y = size.height * (i / 4);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    final minVal = data.reduce((a, b) => a < b ? a : b);
    final maxVal = data.reduce((a, b) => a > b ? a : b);
    final range = (maxVal - minVal) == 0 ? 1.0 : (maxVal - minVal);

    final path = Path();
    final stepX = size.width / (data.length - 1);

    for (var i = 0; i < data.length; i++) {
      final x = i * stepX;
      final y =
          size.height - ((data[i] - minVal) / range * (size.height - 24) + 12);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    canvas.drawPath(path, paintLine);

    // Draw PR dot at the last point
    final lastX = (data.length - 1) * stepX;
    final lastY =
        size.height - ((data.last - minVal) / range * (size.height - 24) + 12);
    final dotPaint = Paint()..color = prColor;
    canvas.drawCircle(Offset(lastX, lastY), 6, dotPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class _SimpleBarChartPainter extends CustomPainter {
  final List<double> data;
  final Color barColor;

  _SimpleBarChartPainter({required this.data, required this.barColor});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final maxVal = data.reduce((a, b) => a > b ? a : b);
    final barWidth = (size.width / data.length) * 0.65;
    final spacing = (size.width - (barWidth * data.length)) / (data.length + 1);

    for (var i = 0; i < data.length; i++) {
      final x = spacing + i * (barWidth + spacing);
      final barH = (data[i] / maxVal) * size.height;
      final y = size.height - barH;

      final isLast = i == data.length - 1;
      final paint = Paint()
        ..color = isLast ? barColor : barColor.withValues(alpha: 0.35);

      final rrect = RRect.fromRectAndRadius(
        Rect.fromLTWH(x, y, barWidth, barH),
        const Radius.circular(4),
      );
      canvas.drawRRect(rrect, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
