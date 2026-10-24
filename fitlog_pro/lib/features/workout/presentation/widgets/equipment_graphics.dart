import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';

/// Renders a 2D procedural graphic of an Olympic Barbell Sleeve with color-coded IWF plates.
class OlympicBarbellSleeveWidget extends StatelessWidget {
  final double totalWeightKg;
  final double barWeightKg;

  const OlympicBarbellSleeveWidget({
    super.key,
    required this.totalWeightKg,
    this.barWeightKg = 20.0,
  });

  @override
  Widget build(BuildContext context) {
    final perSide = (totalWeightKg - barWeightKg) > 0
        ? (totalWeightKg - barWeightKg) / 2.0
        : 0.0;
    final plates = _calculatePlates(perSide);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: FitLogTokens.surface2,
        borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.fitness_center,
                      size: 16, color: FitLogTokens.accent),
                  const SizedBox(width: 8),
                  Text(
                    'OLYMPIC BAR (${barWeightKg.toInt()} kg)',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: FitLogTokens.textSecondary,
                    ),
                  ),
                ],
              ),
              Text(
                '${perSide.toStringAsFixed(perSide.truncateToDouble() == perSide ? 1 : 2)} kg / side',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: FitLogTokens.accent,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // 2D Barbell Canvas
          SizedBox(
            height: 90,
            width: double.infinity,
            child: CustomPaint(
              painter: _BarbellSleevePainter(plates: plates),
            ),
          ),
          const SizedBox(height: 10),
          // Text legend of plate stack
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              for (final p in plates)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _getPlateColor(p).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: _getPlateColor(p), width: 1),
                  ),
                  child: Text(
                    '${p.toStringAsFixed(p.truncateToDouble() == p ? 0 : 2)} kg',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: _getPlateColor(p),
                    ),
                  ),
                ),
              if (plates.isEmpty)
                const Text(
                  'Empty bar (20 kg)',
                  style: TextStyle(
                      fontSize: 11, color: FitLogTokens.textSecondary),
                ),
            ],
          ),
        ],
      ),
    );
  }

  static List<double> _calculatePlates(double weightPerSide) {
    const available = [25.0, 20.0, 15.0, 10.0, 5.0, 2.5, 1.25];
    final result = <double>[];
    var rem = weightPerSide;

    for (final plate in available) {
      while (rem >= plate - 0.001) {
        result.add(plate);
        rem -= plate;
      }
    }
    return result;
  }

  static Color _getPlateColor(double weight) {
    if (weight >= 25.0) return const Color(0xFFFF3B30); // Red
    if (weight >= 20.0) return const Color(0xFF007AFF); // Blue
    if (weight >= 15.0) return const Color(0xFFFFCC00); // Yellow
    if (weight >= 10.0) return const Color(0xFF34C759); // Green
    if (weight >= 5.0) return const Color(0xFFE5E5EA); // White
    if (weight >= 2.5) return const Color(0xFF8E8E93); // Black / Dark
    return const Color(0xFFC7C7CC); // Silver 1.25kg
  }
}

class _BarbellSleevePainter extends CustomPainter {
  final List<double> plates;

  _BarbellSleevePainter({required this.plates});

  @override
  void paint(Canvas canvas, Size size) {
    final centerY = size.height / 2;

    // 1. Draw Shaft (bar extending to the left)
    final shaftPaint = Paint()..color = const Color(0xFF55555C);
    canvas.drawRect(
      Rect.fromLTWH(0, centerY - 6, 40, 12),
      shaftPaint,
    );

    // 2. Draw Collar (thick stopper)
    final collarPaint = Paint()..color = const Color(0xFF8E8E93);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(38, centerY - 24, 14, 48),
        const Radius.circular(3),
      ),
      collarPaint,
    );

    // 3. Draw Sleeve (spindle where plates slide on)
    final sleevePaint = Paint()..color = const Color(0xFF707078);
    canvas.drawRect(
      Rect.fromLTWH(52, centerY - 10, size.width - 52, 20),
      sleevePaint,
    );

    // 4. Draw Loaded Plates
    var currentX = 56.0;

    for (final plate in plates) {
      final color = OlympicBarbellSleeveWidget._getPlateColor(plate);
      final plateHeight = _heightForPlate(plate);
      final plateWidth = _widthForPlate(plate);

      final platePaint = Paint()..color = color;
      final borderPaint = Paint()
        ..color = Colors.black45
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.2;

      final plateRect = Rect.fromLTWH(
        currentX,
        centerY - (plateHeight / 2),
        plateWidth,
        plateHeight,
      );

      // Plate body
      canvas.drawRRect(
        RRect.fromRectAndRadius(plateRect, const Radius.circular(3)),
        platePaint,
      );
      // Plate rim border
      canvas.drawRRect(
        RRect.fromRectAndRadius(plateRect, const Radius.circular(3)),
        borderPaint,
      );

      currentX += plateWidth + 3.0;
      if (currentX > size.width - 30) break; // Don't overflow canvas
    }

    // 5. Draw End Cap
    final endCapPaint = Paint()..color = const Color(0xFF48484A);
    canvas.drawCircle(Offset(size.width - 15, centerY), 9, endCapPaint);
  }

  double _heightForPlate(double weight) {
    if (weight >= 25.0) return 76.0;
    if (weight >= 20.0) return 72.0;
    if (weight >= 15.0) return 64.0;
    if (weight >= 10.0) return 56.0;
    if (weight >= 5.0) return 46.0;
    if (weight >= 2.5) return 38.0;
    return 30.0;
  }

  double _widthForPlate(double weight) {
    if (weight >= 25.0) return 14.0;
    if (weight >= 20.0) return 13.0;
    if (weight >= 15.0) return 11.0;
    if (weight >= 10.0) return 9.0;
    if (weight >= 5.0) return 8.0;
    if (weight >= 2.5) return 6.0;
    return 5.0;
  }

  @override
  bool shouldRepaint(covariant _BarbellSleevePainter oldDelegate) =>
      oldDelegate.plates != plates;
}

/// Renders a 2D procedural graphic of a Rubber Hex Dumbbell.
class DumbbellVisualWidget extends StatelessWidget {
  final double weightKg;

  const DumbbellVisualWidget({super.key, required this.weightKg});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: FitLogTokens.surface2,
        borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
        border: Border.all(color: Colors.white12),
      ),
      child: Row(
        children: [
          // 2D Dumbbell CustomPaint
          SizedBox(
            width: 110,
            height: 54,
            child: CustomPaint(
              painter: _DumbbellPainter(weightKg: weightKg),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'HEX RUBBER DUMBBELL',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                    color: FitLogTokens.textSecondary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '${weightKg.toStringAsFixed(weightKg.truncateToDouble() == weightKg ? 0 : 1)} kg Pair',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: FitLogTokens.accent,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Knurled steel handle · Dual balanced hex heads',
                  style: TextStyle(
                      fontSize: 11, color: FitLogTokens.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DumbbellPainter extends CustomPainter {
  final double weightKg;

  _DumbbellPainter({required this.weightKg});

  @override
  void paint(Canvas canvas, Size size) {
    final centerY = size.height / 2;
    final handlePaint = Paint()..color = const Color(0xFF8E8E93);
    final knurlPaint = Paint()..color = const Color(0xFF636366);
    final bellPaint = Paint()..color = const Color(0xFF2C2C2E);
    final rimPaint = Paint()
      ..color = FitLogTokens.accent.withValues(alpha: 0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    // Handle
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(20, centerY - 5, size.width - 40, 10),
        const Radius.circular(2),
      ),
      handlePaint,
    );

    // Knurling bands
    for (var i = 0; i < 5; i++) {
      canvas.drawLine(
        Offset(35 + i * 8.0, centerY - 5),
        Offset(35 + i * 8.0, centerY + 5),
        knurlPaint,
      );
    }

    // Left Hex Head
    final leftRect = Rect.fromLTWH(4, 4, 22, size.height - 8);
    canvas.drawRRect(
        RRect.fromRectAndRadius(leftRect, const Radius.circular(6)), bellPaint);
    canvas.drawRRect(
        RRect.fromRectAndRadius(leftRect, const Radius.circular(6)), rimPaint);

    // Right Hex Head
    final rightRect = Rect.fromLTWH(size.width - 26, 4, 22, size.height - 8);
    canvas.drawRRect(
        RRect.fromRectAndRadius(rightRect, const Radius.circular(6)),
        bellPaint);
    canvas.drawRRect(
        RRect.fromRectAndRadius(rightRect, const Radius.circular(6)), rimPaint);

    // Center text stamp
    final tp = TextPainter(
      text: TextSpan(
        text: '${weightKg.toInt()}',
        style: const TextStyle(
          color: FitLogTokens.accent,
          fontSize: 9,
          fontWeight: FontWeight.w900,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(canvas, Offset(11, centerY - tp.height / 2));
    tp.paint(canvas, Offset(size.width - 21, centerY - tp.height / 2));
  }

  @override
  bool shouldRepaint(covariant _DumbbellPainter oldDelegate) =>
      oldDelegate.weightKg != weightKg;
}

/// Renders a 2D procedural graphic of a Cable Machine Weight Stack with an inserted pin.
class CableStackVisualWidget extends StatelessWidget {
  final double selectedWeightKg;

  const CableStackVisualWidget({super.key, required this.selectedWeightKg});

  @override
  Widget build(BuildContext context) {
    const totalPlates = 15;
    const plateIncrement = 5.0; // 5kg per plate
    final activeIndex =
        (selectedWeightKg / plateIncrement).clamp(1, totalPlates).toInt();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: FitLogTokens.surface2,
        borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
        border: Border.all(color: Colors.white12),
      ),
      child: Row(
        children: [
          // 2D Cable Stack CustomPaint
          SizedBox(
            width: 80,
            height: 100,
            child: CustomPaint(
              painter: _CableStackPainter(
                totalPlates: totalPlates,
                selectedPlateIndex: activeIndex,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'SELECTORIZED CABLE STACK',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                    color: FitLogTokens.textSecondary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '${selectedWeightKg.toInt()} kg (Plate #$activeIndex)',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: FitLogTokens.accent,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Magnetic selector pin engaged at plate #$activeIndex of $totalPlates',
                  style: const TextStyle(
                      fontSize: 11, color: FitLogTokens.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CableStackPainter extends CustomPainter {
  final int totalPlates;
  final int selectedPlateIndex;

  _CableStackPainter({
    required this.totalPlates,
    required this.selectedPlateIndex,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Dual guide rods
    final rodPaint = Paint()
      ..color = const Color(0xFF636366)
      ..strokeWidth = 2.0;
    canvas.drawLine(Offset(size.width * 0.25, 0),
        Offset(size.width * 0.25, size.height), rodPaint);
    canvas.drawLine(Offset(size.width * 0.75, 0),
        Offset(size.width * 0.75, size.height), rodPaint);

    // Center cable wire
    final cablePaint = Paint()
      ..color = const Color(0xFF8E8E93)
      ..strokeWidth = 1.5;
    canvas.drawLine(Offset(size.width / 2, 0),
        Offset(size.width / 2, size.height), cablePaint);

    final plateHeight = (size.height - 10) / totalPlates;

    for (var i = 1; i <= totalPlates; i++) {
      final y = size.height - (i * plateHeight);
      final isSelected = i == selectedPlateIndex;
      final isAboveSelected = i <= selectedPlateIndex;

      final platePaint = Paint()
        ..color = isSelected
            ? FitLogTokens.accent.withValues(alpha: 0.3)
            : (isAboveSelected
                ? const Color(0xFF3A3A3C)
                : const Color(0xFF242426));

      final borderPaint = Paint()
        ..color = isSelected ? FitLogTokens.accent : Colors.black45
        ..style = PaintingStyle.stroke
        ..strokeWidth = isSelected ? 1.5 : 0.8;

      final rrect = RRect.fromRectAndRadius(
        Rect.fromLTWH(8, y, size.width - 16, plateHeight - 2),
        const Radius.circular(2),
      );

      canvas.drawRRect(rrect, platePaint);
      canvas.drawRRect(rrect, borderPaint);

      // Draw Yellow Selector Pin on the active plate
      if (isSelected) {
        final pinPaint = Paint()..color = FitLogTokens.prGold;
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(size.width - 12, y + (plateHeight / 2) - 2.5, 12, 5),
            const Radius.circular(2),
          ),
          pinPaint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant _CableStackPainter oldDelegate) =>
      oldDelegate.selectedPlateIndex != selectedPlateIndex;
}
