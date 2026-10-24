import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/tokens.dart';
import 'features/home/presentation/screens/home_dashboard_screen.dart';
import 'features/routines/presentation/screens/routines_screen.dart';
import 'features/history/presentation/screens/history_screen.dart';
import 'features/analytics/presentation/screens/progress_screen.dart';
import 'features/academy/presentation/screens/academy_screen.dart';
import 'features/profile/presentation/screens/body_stats_screen.dart';
import 'features/workout/presentation/screens/active_workout_screen.dart';
import 'features/onboarding/presentation/screens/onboarding_screen.dart';
import 'features/auth/presentation/screens/auth_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: FitLogApp()));
}

class FitLogApp extends StatefulWidget {
  final bool startAuthenticated;

  const FitLogApp({super.key, this.startAuthenticated = false});

  @override
  State<FitLogApp> createState() => _FitLogAppState();
}

class _FitLogAppState extends State<FitLogApp> {
  late bool _isAuthenticated = widget.startAuthenticated;
  late bool _hasCompletedOnboarding = widget.startAuthenticated;

  void _handleAuthSuccess(String email, String name) {
    setState(() {
      _isAuthenticated = true;
    });
  }

  void _handleOnboardingFinish() {
    setState(() {
      _hasCompletedOnboarding = true;
    });
  }

  void _handleSignOut() {
    setState(() {
      _isAuthenticated = false;
      _hasCompletedOnboarding = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FitLog Pro',
      debugShowCheckedModeBanner: false,
      theme: FitLogTheme.darkTheme,
      home: !_isAuthenticated
          ? AuthScreen(onAuthSuccess: _handleAuthSuccess)
          : (!_hasCompletedOnboarding
              ? OnboardingScreen(onFinish: _handleOnboardingFinish)
              : MainNavigationShell(onSignOut: _handleSignOut)),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  final VoidCallback? onSignOut;

  const MainNavigationShell({super.key, this.onSignOut});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  late final List<Widget> _screens = [
    HomeDashboardScreen(
      onStartWorkout: _startQuickWorkout,
      onNavigateProgress: () => setState(() => _currentIndex = 4),
      onOpenOnboarding: _openOnboarding,
      onNavigateAcademy: () => setState(() => _currentIndex = 2),
    ),
    const RoutinesScreen(),
    const AcademyScreen(),
    const HistoryScreen(),
    const ProgressAnalyticsScreen(),
  ];

  void _openOnboarding() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => OnboardingScreen(
          onFinish: () => Navigator.of(context).pop(),
        ),
      ),
    );
  }

  void _openBodyStats() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => const BodyStatsScreen(),
      ),
    );
  }

  void _startQuickWorkout() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => const ActiveWorkoutScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FitLogTokens.bg,
      appBar: AppBar(
        backgroundColor: FitLogTokens.bg,
        elevation: 0,
        title: const Row(
          children: [
            Text(
              'FITLOG',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 18,
                letterSpacing: 1.2,
                color: FitLogTokens.textPrimary,
              ),
            ),
            SizedBox(width: 6),
            Text(
              'PRO',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 18,
                letterSpacing: 1.2,
                color: FitLogTokens.accent,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline,
                color: FitLogTokens.textSecondary),
            tooltip: 'Body Stats & Profile',
            onPressed: _openBodyStats,
          ),
          TextButton.icon(
            onPressed: _openOnboarding,
            icon: const Icon(Icons.help_outline,
                size: 16, color: FitLogTokens.textSecondary),
            label: const Text(
              'Guide',
              style: TextStyle(color: FitLogTokens.textSecondary, fontSize: 12),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.flash_on, color: FitLogTokens.accent),
            tooltip: 'Active Workout',
            onPressed: _startQuickWorkout,
          ),
          if (widget.onSignOut != null)
            IconButton(
              icon: const Icon(Icons.logout,
                  size: 18, color: FitLogTokens.textSecondary),
              tooltip: 'Sign Out / Switch Account',
              onPressed: widget.onSignOut,
            ),
          const SizedBox(width: 8),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: FitLogTokens.surface,
          border: Border(top: BorderSide(color: Colors.white12, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: FitLogTokens.surface,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: FitLogTokens.accent,
          unselectedItemColor: FitLogTokens.textSecondary,
          selectedLabelStyle:
              const TextStyle(fontWeight: FontWeight.w900, fontSize: 11),
          unselectedLabelStyle:
              const TextStyle(fontWeight: FontWeight.w600, fontSize: 11),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.format_list_bulleted_outlined),
              activeIcon: Icon(Icons.format_list_bulleted),
              label: 'Routines',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.school_outlined),
              activeIcon: Icon(Icons.school),
              label: 'Academy',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.calendar_today_outlined),
              activeIcon: Icon(Icons.calendar_today),
              label: 'History',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.insights_outlined),
              activeIcon: Icon(Icons.insights),
              label: 'Progress',
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: FitLogTokens.accent,
        foregroundColor: FitLogTokens.onAccent,
        elevation: 4,
        onPressed: _startQuickWorkout,
        icon: const Icon(Icons.play_arrow_rounded, size: 24),
        label: const Text(
          'Start Push Day',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
        ),
      ),
    );
  }
}
