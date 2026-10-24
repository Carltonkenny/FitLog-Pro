import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';

class PastWorkoutSession {
  final String title;
  final String dateText;
  final int day;
  final int month;
  final int year;
  final String duration;
  final int volumeKg;
  final int totalSets;
  final bool hasPR;
  final List<String> exerciseSummaries;

  const PastWorkoutSession({
    required this.title,
    required this.dateText,
    required this.day,
    required this.month,
    required this.year,
    required this.duration,
    required this.volumeKg,
    required this.totalSets,
    required this.hasPR,
    required this.exerciseSummaries,
  });
}

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  // Calendar view controls
  bool _isYearlyView = false;
  final int _selectedYear = 2026;
  int _selectedMonth = 10; // October
  int? _selectedDay = 21;
  String _activeFilter = 'All'; // 'All', 'PRs Only', 'Heavy (>20k)'

  final List<String> _monthNames = const [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  // Workouts per month count for 2026 yearly heatmap
  final Map<int, int> _yearlyMonthlyCounts = const {
    1: 12,
    2: 14,
    3: 16,
    4: 15,
    5: 18,
    6: 14,
    7: 17,
    8: 15,
    9: 16,
    10: 9,
    11: 0,
    12: 0,
  };

  final Set<int> _activeDaysOctober = const {2, 5, 7, 9, 12, 14, 16, 19, 21};

  final List<PastWorkoutSession> _sessions = const [
    PastWorkoutSession(
      title: 'Push Day',
      dateText: 'Wednesday, 21 Oct 2026',
      day: 21,
      month: 10,
      year: 2026,
      duration: '46 min',
      volumeKg: 18450,
      totalSets: 14,
      hasPR: true,
      exerciseSummaries: [
        'Barbell Bench Press: 82.5 kg × 8 (PR), 82.5 kg × 8, 80 kg × 8',
        'Incline Dumbbell Press: 28 kg × 10 (3 sets)',
        'Cable Fly: 15 kg × 12 (3 sets)',
        'Triceps Pushdown: 30 kg × 12 (3 sets)',
        'Lateral Raise: 10 kg × 15 (2 sets)',
      ],
    ),
    PastWorkoutSession(
      title: 'Pull Day',
      dateText: 'Monday, 19 Oct 2026',
      day: 19,
      month: 10,
      year: 2026,
      duration: '52 min',
      volumeKg: 21300,
      totalSets: 15,
      hasPR: false,
      exerciseSummaries: [
        'Barbell Deadlift: 140 kg × 5, 140 kg × 5, 130 kg × 5',
        'Lat Pulldown: 65 kg × 10 (3 sets)',
        'Seated Cable Row: 60 kg × 10 (3 sets)',
        'Barbell Bicep Curl: 35 kg × 10 (3 sets)',
        'Face Pulls: 25 kg × 15 (3 sets)',
      ],
    ),
    PastWorkoutSession(
      title: 'Legs & Core',
      dateText: 'Friday, 16 Oct 2026',
      day: 16,
      month: 10,
      year: 2026,
      duration: '58 min',
      volumeKg: 24100,
      totalSets: 16,
      hasPR: true,
      exerciseSummaries: [
        'Barbell Squat: 115 kg × 6 (PR), 115 kg × 6, 110 kg × 8',
        'Romanian Deadlift: 90 kg × 8 (3 sets)',
        'Leg Press: 180 kg × 10 (3 sets)',
        'Standing Calf Raise: 70 kg × 12 (4 sets)',
        'Hanging Leg Raise: 15 reps (3 sets)',
      ],
    ),
    PastWorkoutSession(
      title: 'Upper Body Power',
      dateText: 'Wednesday, 14 Oct 2026',
      day: 14,
      month: 10,
      year: 2026,
      duration: '48 min',
      volumeKg: 17200,
      totalSets: 14,
      hasPR: false,
      exerciseSummaries: [
        'Overhead Press: 55 kg × 6 (4 sets)',
        'Weighted Pull-Ups: +10 kg × 6 (3 sets)',
        'Dips: Bodyweight + 15 kg × 8 (3 sets)',
        'Incline DB Row: 26 kg × 10 (3 sets)',
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    // Filter sessions
    final filtered = _sessions.where((s) {
      if (s.year != _selectedYear) return false;
      if (s.month != _selectedMonth) return false;
      if (_selectedDay != null && s.day != _selectedDay) return false;
      if (_activeFilter == 'PRs Only' && !s.hasPR) return false;
      if (_activeFilter == 'Heavy (>20k)' && s.volumeKg < 20000) return false;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: FitLogTokens.bg,
      appBar: AppBar(
        backgroundColor: FitLogTokens.bg,
        elevation: 0,
        title: const Text(
          'Workout Calendar & History',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: FitLogTokens.textPrimary,
          ),
        ),
        actions: [
          // Toggle between Yearly Heatmap and Monthly Calendar
          TextButton.icon(
            onPressed: () => setState(() => _isYearlyView = !_isYearlyView),
            icon: Icon(
              _isYearlyView ? Icons.calendar_view_month : Icons.grid_view,
              size: 16,
              color: FitLogTokens.accent,
            ),
            label: Text(
              _isYearlyView ? 'Month View' : 'Year View',
              style: const TextStyle(
                color: FitLogTokens.accent,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_isYearlyView) ...[
            _buildYearlyHeatmapView(),
          ] else ...[
            _buildMonthlyCalendarCard(),
          ],

          const SizedBox(height: 16),

          // Filter Chips
          Row(
            children: [
              _buildFilterChip('All'),
              const SizedBox(width: 8),
              _buildFilterChip('PRs Only'),
              const SizedBox(width: 8),
              _buildFilterChip('Heavy (>20k)'),
              const Spacer(),
              if (_selectedDay != null)
                TextButton(
                  onPressed: () => setState(() => _selectedDay = null),
                  child: const Text('Show All Days',
                      style:
                          TextStyle(color: FitLogTokens.accent, fontSize: 11)),
                ),
            ],
          ),

          const SizedBox(height: 12),

          // Logged session header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _selectedDay == null
                    ? '${_monthNames[_selectedMonth - 1].toUpperCase()} $_selectedYear SESSIONS (${filtered.length})'
                    : '$_selectedDay ${_monthNames[_selectedMonth - 1].toUpperCase()} SESSIONS (${filtered.length})',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                  color: FitLogTokens.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          if (filtered.isEmpty)
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: FitLogTokens.surface,
                borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
              ),
              child: Column(
                children: [
                  const Text('💤', style: TextStyle(fontSize: 32)),
                  const SizedBox(height: 8),
                  const Text(
                    'No workouts on this selection',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: FitLogTokens.textPrimary),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _selectedDay != null
                        ? 'Rest day logged on Day $_selectedDay.'
                        : 'No sessions match this filter.',
                    style: const TextStyle(
                        color: FitLogTokens.textSecondary, fontSize: 12),
                  ),
                ],
              ),
            )
          else
            for (final session in filtered) _buildSessionCard(session),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label) {
    final isSelected = _activeFilter == label;
    return GestureDetector(
      onTap: () => setState(() => _activeFilter = label),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? FitLogTokens.accent : FitLogTokens.surface2,
          borderRadius: BorderRadius.circular(FitLogTokens.radiusPill),
          border: Border.all(
              color: isSelected ? FitLogTokens.accent : Colors.white10),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color:
                isSelected ? FitLogTokens.onAccent : FitLogTokens.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildYearlyHeatmapView() {
    return Container(
      padding: const EdgeInsets.all(18),
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
              Text(
                '$_selectedYear ANNUAL OVERVIEW',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.0,
                  color: FitLogTokens.textPrimary,
                ),
              ),
              const Text(
                '146 Workouts Total',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: FitLogTokens.accent),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // 12 Months Grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 12,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.6,
            ),
            itemBuilder: (context, index) {
              final monthNum = index + 1;
              final count = _yearlyMonthlyCounts[monthNum] ?? 0;
              final isCurrent = monthNum == _selectedMonth;

              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedMonth = monthNum;
                    _isYearlyView = false;
                    _selectedDay = null;
                  });
                },
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isCurrent
                        ? FitLogTokens.accent.withValues(alpha: 0.15)
                        : FitLogTokens.surface2,
                    borderRadius:
                        BorderRadius.circular(FitLogTokens.radiusControl),
                    border: Border.all(
                      color: isCurrent ? FitLogTokens.accent : Colors.white10,
                      width: isCurrent ? 1.5 : 1.0,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _monthNames[index].substring(0, 3).toUpperCase(),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: isCurrent
                              ? FitLogTokens.accent
                              : FitLogTokens.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$count workouts',
                        style: const TextStyle(
                            fontSize: 10, color: FitLogTokens.textSecondary),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMonthlyCalendarCard() {
    return Container(
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
              Row(
                children: [
                  Text(
                    '${_monthNames[_selectedMonth - 1].toUpperCase()} $_selectedYear',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.0,
                      color: FitLogTokens.textPrimary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  PopupMenuButton<int>(
                    color: FitLogTokens.surface2,
                    icon: const Icon(Icons.arrow_drop_down,
                        color: FitLogTokens.accent),
                    onSelected: (m) => setState(() => _selectedMonth = m),
                    itemBuilder: (context) {
                      return [
                        for (var i = 0; i < 12; i++)
                          PopupMenuItem(
                            value: i + 1,
                            child: Text(
                              _monthNames[i],
                              style: TextStyle(
                                color: (i + 1) == _selectedMonth
                                    ? FitLogTokens.accent
                                    : FitLogTokens.textPrimary,
                                fontWeight: (i + 1) == _selectedMonth
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                              ),
                            ),
                          ),
                      ];
                    },
                  ),
                ],
              ),
              Text(
                '${_activeDaysOctober.length} Logged',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: FitLogTokens.accent,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Text('M',
                  style: TextStyle(
                      color: FitLogTokens.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.bold)),
              Text('T',
                  style: TextStyle(
                      color: FitLogTokens.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.bold)),
              Text('W',
                  style: TextStyle(
                      color: FitLogTokens.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.bold)),
              Text('T',
                  style: TextStyle(
                      color: FitLogTokens.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.bold)),
              Text('F',
                  style: TextStyle(
                      color: FitLogTokens.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.bold)),
              Text('S',
                  style: TextStyle(
                      color: FitLogTokens.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.bold)),
              Text('S',
                  style: TextStyle(
                      color: FitLogTokens.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 10),
          _buildCalendarGrid(),
        ],
      ),
    );
  }

  Widget _buildCalendarGrid() {
    const offset = 3; // Oct 1 is Thursday
    const totalCells = offset + 31;
    final rows = (totalCells / 7).ceil();

    return Column(
      children: [
        for (var r = 0; r < rows; r++)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                for (var c = 0; c < 7; c++) ...[
                  Builder(
                    builder: (_) {
                      final cellIndex = r * 7 + c;
                      final dayNum = cellIndex - offset + 1;
                      if (dayNum < 1 || dayNum > 31) {
                        return const SizedBox(width: 32, height: 32);
                      }

                      final hasWorkout = _activeDaysOctober.contains(dayNum);
                      final isSelected = dayNum == _selectedDay;

                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedDay = isSelected ? null : dayNum;
                          });
                        },
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isSelected
                                ? FitLogTokens.accent
                                : hasWorkout
                                    ? FitLogTokens.accent
                                        .withValues(alpha: 0.18)
                                    : Colors.transparent,
                            border: Border.all(
                              color: hasWorkout
                                  ? FitLogTokens.accent
                                  : Colors.transparent,
                              width: 1,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              '$dayNum',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: hasWorkout
                                    ? FontWeight.w900
                                    : FontWeight.normal,
                                color: isSelected
                                    ? FitLogTokens.onAccent
                                    : hasWorkout
                                        ? FitLogTokens.accent
                                        : FitLogTokens.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildSessionCard(PastWorkoutSession session) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
              Text(
                session.title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: FitLogTokens.textPrimary,
                ),
              ),
              if (session.hasPR)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: FitLogTokens.prGold.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: FitLogTokens.prGold, width: 1),
                  ),
                  child: const Text(
                    '🏆 NEW PR',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: FitLogTokens.prGold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            session.dateText,
            style: const TextStyle(
              fontSize: 12,
              color: FitLogTokens.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildMetricChip(Icons.timer_outlined, session.duration),
              const SizedBox(width: 12),
              _buildMetricChip(Icons.line_weight, '${session.volumeKg} kg'),
              const SizedBox(width: 12),
              _buildMetricChip(
                  Icons.check_circle_outline, '${session.totalSets} sets'),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: Colors.white10),
          for (final ex in session.exerciseSummaries)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 2.5),
              child: Text(
                '• $ex',
                style: const TextStyle(
                    fontSize: 12, color: FitLogTokens.textSecondary),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMetricChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: FitLogTokens.surface2,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: FitLogTokens.textSecondary),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: FitLogTokens.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
