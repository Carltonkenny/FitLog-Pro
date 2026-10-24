import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'tokens.dart';

abstract final class FitLogTheme {
  static ThemeData get darkTheme {
    final baseTextTheme =
        GoogleFonts.interTextTheme(ThemeData.dark().textTheme);

    // Apply strict Tabular Figures across all text styles
    final tabularTextTheme = baseTextTheme.copyWith(
      displayLarge: baseTextTheme.displayLarge?.copyWith(
        color: FitLogTokens.textPrimary,
        fontWeight: FontWeight.w900,
        fontFeatures: const [FontFeature.tabularFigures()],
      ),
      headlineMedium: baseTextTheme.headlineMedium?.copyWith(
        color: FitLogTokens.textPrimary,
        fontWeight: FontWeight.w800,
        fontFeatures: const [FontFeature.tabularFigures()],
      ),
      titleLarge: baseTextTheme.titleLarge?.copyWith(
        color: FitLogTokens.textPrimary,
        fontWeight: FontWeight.w700,
        fontSize: 20,
      ),
      bodyLarge: baseTextTheme.bodyLarge?.copyWith(
        color: FitLogTokens.textPrimary,
        fontSize: 16,
      ),
      bodyMedium: baseTextTheme.bodyMedium?.copyWith(
        color: FitLogTokens.textSecondary,
        fontSize: 14,
      ),
      labelLarge: baseTextTheme.labelLarge?.copyWith(
        color: FitLogTokens.textPrimary,
        fontWeight: FontWeight.w700,
        fontFeatures: const [FontFeature.tabularFigures()],
      ),
      labelSmall: baseTextTheme.labelSmall?.copyWith(
        color: FitLogTokens.textSecondary,
        fontWeight: FontWeight.w600,
        fontSize: 11,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: FitLogTokens.bg,
      colorScheme: const ColorScheme.dark(
        surface: FitLogTokens.surface,
        onSurface: FitLogTokens.textPrimary,
        primary: FitLogTokens.accent,
        onPrimary: FitLogTokens.onAccent,
        error: FitLogTokens.danger,
        onError: Colors.white,
      ),
      textTheme: tabularTextTheme,
      cardTheme: CardThemeData(
        color: FitLogTokens.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: FitLogTokens.accent,
          foregroundColor: FitLogTokens.onAccent,
          minimumSize: const Size(double.infinity, FitLogTokens.minTouchTarget),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(FitLogTokens.radiusPill),
          ),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}
