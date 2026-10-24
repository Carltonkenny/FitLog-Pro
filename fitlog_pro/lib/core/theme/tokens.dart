import 'package:flutter/material.dart';

/// Pure tokens for FitLog Pro — Direction A: Dark Performance
/// No widget should hardcode colors, spacing, or radii. All styling
/// must reference these constants or [ThemeData].
abstract final class FitLogTokens {
  // Background & Surface
  static const Color bg = Color(0xFF0B0B0C);
  static const Color surface = Color(0xFF161618);
  static const Color surface2 = Color(0xFF202023);

  // Text
  static const Color textPrimary = Color(0xFFF4F4F5);
  static const Color textSecondary = Color(0xFF8A8A90);

  // Primary Accent & Semantics
  static const Color accent = Color(0xFFC6FF3D); // Neon lime
  static const Color onAccent = Color(0xFF0B0B0C);
  static const Color prGold = Color(0xFFFFD24A); // PR badge & celebration
  static const Color danger = Color(0xFFFF5C5C); // Destructive actions

  // Geometry & Radii
  static const double radiusCard = 14.0;
  static const double radiusControl = 10.0;
  static const double radiusPill = 999.0;

  // Layout Spacing (4dp baseline grid)
  static const double spacing2 = 2.0;
  static const double spacing4 = 4.0;
  static const double spacing6 = 6.0;
  static const double spacing8 = 8.0;
  static const double spacing12 = 12.0;
  static const double spacing16 = 16.0;
  static const double spacing20 = 20.0;
  static const double spacing24 = 24.0;
  static const double spacing32 = 32.0;

  // Touch Accessibility
  static const double minTouchTarget = 48.0;
}
