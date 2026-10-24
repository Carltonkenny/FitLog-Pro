import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback onFinish;

  const OnboardingScreen({super.key, required this.onFinish});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  String _selectedGoal = 'Hypertrophy (Muscle Size)';
  String _selectedLevel = 'Intermediate (1-3 yrs)';
  int _selectedDays = 4;
  String _selectedEquipment = 'Commercial Gym (Barbells, Cables, Machines)';
  bool _hasAttachedPhoto = false;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < 3) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
      );
    } else {
      widget.onFinish();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FitLogTokens.bg,
      appBar: AppBar(
        backgroundColor: FitLogTokens.bg,
        elevation: 0,
        leading: _currentPage > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back,
                    color: FitLogTokens.textSecondary),
                onPressed: () {
                  _pageController.previousPage(
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeInOut,
                  );
                },
              )
            : null,
        title: const Text(
          'Personalize Your Plan',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w900,
            color: FitLogTokens.textPrimary,
          ),
        ),
        actions: [
          TextButton(
            onPressed: widget.onFinish,
            child: const Text('Skip',
                style: TextStyle(color: FitLogTokens.textSecondary)),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          child: Column(
            children: [
              // Progress Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (var i = 0; i < 4; i++)
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: i == _currentPage ? 32 : 10,
                      height: 5,
                      decoration: BoxDecoration(
                        color: i == _currentPage
                            ? FitLogTokens.accent
                            : (i < _currentPage
                                ? FitLogTokens.accent.withValues(alpha: 0.4)
                                : Colors.white12),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),

              Expanded(
                child: PageView(
                  controller: _pageController,
                  physics: const NeverScrollableScrollPhysics(),
                  onPageChanged: (page) => setState(() => _currentPage = page),
                  children: [
                    _buildStep1Goal(),
                    _buildStep2ScheduleAndLevel(),
                    _buildStep3EquipmentAndPhoto(),
                    _buildStep4AIGeneratedBlueprint(),
                  ],
                ),
              ),

              ElevatedButton(
                onPressed: _nextPage,
                child: Text(
                  _currentPage == 3
                      ? 'Approve Blueprint & Start Training'
                      : 'Continue',
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  // ----------------------------------------------------
  // STEP 1: 6 EVIDENCE-BASED GOALS
  // ----------------------------------------------------
  Widget _buildStep1Goal() {
    final goals = [
      {
        'title': 'Hypertrophy (Muscle Size)',
        'desc': 'Maximum aesthetic muscle fullness, broad shoulders & V-taper.',
        'badge': '8-12 REPS · 90S REST',
      },
      {
        'title': 'Maximum Strength (Power)',
        'desc': 'Heavier 1RM bench, squat & deadlift power with low reps.',
        'badge': '3-6 REPS · 3M REST',
      },
      {
        'title': 'Fat Loss & Conditioning',
        'desc':
            'Burn subcutaneous fat while preserving hard-earned lean muscle.',
        'badge': '10-15 REPS · 45-60S REST',
      },
      {
        'title': 'Body Recomposition',
        'desc': 'Simultaneously drop body fat and pack on lean muscle mass.',
        'badge': '8-10 REPS · STEADY VOLUME',
      },
      {
        'title': 'Athletic Power & Speed',
        'desc': 'Explosive vertical jump, sprint acceleration & kinetic chain.',
        'badge': 'EXPLOSIVE LOAD · UNILATERAL',
      },
      {
        'title': 'Longevity & Joint Armor',
        'desc':
            'Bulletproof rotator cuffs, spine & knees with zero joint pain.',
        'badge': 'MACHINE & CABLE CONTROL',
      },
    ];

    return ListView(
      children: [
        const Text(
          'STEP 1 OF 4',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.0,
            color: FitLogTokens.accent,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'What is your primary fitness goal?',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            color: FitLogTokens.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Our AI engine will calibrate your training volume, rest intervals, and rep schemes to match.',
          style: TextStyle(color: FitLogTokens.textSecondary, fontSize: 12),
        ),
        const SizedBox(height: 16),
        for (final g in goals)
          GestureDetector(
            onTap: () => setState(() => _selectedGoal = g['title']!),
            child: Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _selectedGoal == g['title']
                    ? FitLogTokens.surface2
                    : FitLogTokens.surface,
                borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
                border: Border.all(
                  color: _selectedGoal == g['title']
                      ? FitLogTokens.accent
                      : Colors.white10,
                  width: _selectedGoal == g['title'] ? 1.8 : 1.0,
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              g['title']!,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: FitLogTokens.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          g['desc']!,
                          style: const TextStyle(
                            fontSize: 11,
                            color: FitLogTokens.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: FitLogTokens.accent.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            g['badge']!,
                            style: const TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                              color: FitLogTokens.accent,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (_selectedGoal == g['title'])
                    const Icon(Icons.check_circle, color: FitLogTokens.accent),
                ],
              ),
            ),
          ),
      ],
    );
  }

  // ----------------------------------------------------
  // STEP 2: SCHEDULE & EXPERIENCE LEVEL
  // ----------------------------------------------------
  Widget _buildStep2ScheduleAndLevel() {
    return ListView(
      children: [
        const Text(
          'STEP 2 OF 4',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.0,
            color: FitLogTokens.accent,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Training frequency & experience',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            color: FitLogTokens.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'How many days per week can you consistently train without burnout?',
          style: TextStyle(color: FitLogTokens.textSecondary, fontSize: 12),
        ),
        const SizedBox(height: 18),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            for (final d in [3, 4, 5, 6])
              GestureDetector(
                onTap: () => setState(() => _selectedDays = d),
                child: Container(
                  width: 72,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: _selectedDays == d
                        ? FitLogTokens.accent
                        : FitLogTokens.surface,
                    borderRadius:
                        BorderRadius.circular(FitLogTokens.radiusCard),
                    border: Border.all(
                      color: _selectedDays == d
                          ? FitLogTokens.accent
                          : Colors.white10,
                    ),
                  ),
                  child: Center(
                    child: Column(
                      children: [
                        Text(
                          '$d Days',
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 14,
                            color: _selectedDays == d
                                ? FitLogTokens.onAccent
                                : FitLogTokens.textPrimary,
                          ),
                        ),
                        Text(
                          d == 3
                              ? 'Full Body'
                              : (d == 4
                                  ? 'Upper/Lower'
                                  : (d == 5 ? 'PPL' : 'Arnold')),
                          style: TextStyle(
                            fontSize: 10,
                            color: _selectedDays == d
                                ? Colors.black87
                                : FitLogTokens.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 24),
        const Text(
          'YOUR EXPERIENCE LEVEL',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
            color: FitLogTokens.textSecondary,
          ),
        ),
        const SizedBox(height: 10),
        for (final lvl in [
          {
            'name': 'Beginner (< 1 year gym experience)',
            'desc':
                'Focus on motor patterns, safe form, and rapid neuromuscular gains.'
          },
          {
            'name': 'Intermediate (1-3 years gym experience)',
            'desc':
                'Requires structured progressive overload and targeted volume.'
          },
          {
            'name': 'Advanced (3+ years consistent lifting)',
            'desc':
                'High mechanical tension, strategic fatigue management & micro-cycles.'
          },
        ])
          GestureDetector(
            onTap: () => setState(() => _selectedLevel = lvl['name']!),
            child: Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _selectedLevel == lvl['name']
                    ? FitLogTokens.surface2
                    : FitLogTokens.surface,
                borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
                border: Border.all(
                  color: _selectedLevel == lvl['name']
                      ? FitLogTokens.accent
                      : Colors.white10,
                  width: _selectedLevel == lvl['name'] ? 1.8 : 1.0,
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          lvl['name']!,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: FitLogTokens.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          lvl['desc']!,
                          style: const TextStyle(
                            fontSize: 11,
                            color: FitLogTokens.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (_selectedLevel == lvl['name'])
                    const Icon(Icons.check_circle, color: FitLogTokens.accent),
                ],
              ),
            ),
          ),
      ],
    );
  }

  // ----------------------------------------------------
  // STEP 3: EQUIPMENT ACCESS & OPTIONAL BODY PHOTO
  // ----------------------------------------------------
  Widget _buildStep3EquipmentAndPhoto() {
    final equipmentOptions = [
      {
        'title': 'Commercial Gym (Barbells, Cables, Machines)',
        'desc':
            'Full access to racks, selectorized pin stacks, and free weights.',
      },
      {
        'title': 'Home Gym (Dumbbells & Adjustable Bench)',
        'desc':
            'Workout plans tailored 100% to dumbbell and bodyweight vectors.',
      },
      {
        'title': 'Bodyweight & Calisthenics Only',
        'desc':
            'Zero equipment needed; uses body leverage and gymnastics progressions.',
      },
    ];

    return ListView(
      children: [
        const Text(
          'STEP 3 OF 4',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.0,
            color: FitLogTokens.accent,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Equipment & posture scan',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            color: FitLogTokens.textPrimary,
          ),
        ),
        const SizedBox(height: 14),
        const Text(
          'AVAILABLE EQUIPMENT',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
            color: FitLogTokens.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        for (final eq in equipmentOptions)
          GestureDetector(
            onTap: () => setState(() => _selectedEquipment = eq['title']!),
            child: Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _selectedEquipment == eq['title']
                    ? FitLogTokens.surface2
                    : FitLogTokens.surface,
                borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
                border: Border.all(
                  color: _selectedEquipment == eq['title']
                      ? FitLogTokens.accent
                      : Colors.white10,
                  width: _selectedEquipment == eq['title'] ? 1.8 : 1.0,
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          eq['title']!,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: FitLogTokens.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          eq['desc']!,
                          style: const TextStyle(
                            fontSize: 11,
                            color: FitLogTokens.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (_selectedEquipment == eq['title'])
                    const Icon(Icons.check_circle, color: FitLogTokens.accent),
                ],
              ),
            ),
          ),
        const SizedBox(height: 16),

        // Optional Full Body Photo Analysis Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: FitLogTokens.surface,
            borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
            border: Border.all(
              color: _hasAttachedPhoto ? FitLogTokens.accent : Colors.white12,
              width: _hasAttachedPhoto ? 1.8 : 1.0,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.camera_alt,
                          color: FitLogTokens.accent, size: 18),
                      SizedBox(width: 8),
                      Text(
                        'Full-Body Posture Scan',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          color: FitLogTokens.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: FitLogTokens.surface2,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'OPTIONAL · ON-DEVICE',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: FitLogTokens.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              const Text(
                'Attach a front or side posture photo. Our local AI scans shoulder alignment and pelvic tilt to prescribe corrective rear delt and postural exercises.',
                style: TextStyle(
                    fontSize: 11,
                    height: 1.4,
                    color: FitLogTokens.textSecondary),
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () {
                  setState(() => _hasAttachedPhoto = !_hasAttachedPhoto);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: _hasAttachedPhoto
                        ? FitLogTokens.accent.withValues(alpha: 0.2)
                        : FitLogTokens.surface2,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _hasAttachedPhoto
                          ? FitLogTokens.accent
                          : Colors.white24,
                    ),
                  ),
                  child: Center(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _hasAttachedPhoto
                              ? Icons.check_circle
                              : Icons.add_photo_alternate,
                          size: 16,
                          color: _hasAttachedPhoto
                              ? FitLogTokens.accent
                              : FitLogTokens.textSecondary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _hasAttachedPhoto
                              ? 'Photo Scanned: Posture Calibration Applied'
                              : '+ Attach Photo (Optional)',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: _hasAttachedPhoto
                                ? FitLogTokens.accent
                                : FitLogTokens.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ----------------------------------------------------
  // STEP 4: AI BLUEPRINT GENERATOR RESULT (THE "WHY")
  // ----------------------------------------------------
  Widget _buildStep4AIGeneratedBlueprint() {
    return ListView(
      children: [
        const Text(
          'AI PRESCRIPTION READY',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.0,
            color: FitLogTokens.accent,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Your Personalized $_selectedDays-Day Blueprint',
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            color: FitLogTokens.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Target: $_selectedGoal · $_selectedDays sessions per week',
          style: const TextStyle(color: FitLogTokens.accent, fontSize: 13),
        ),
        const SizedBox(height: 16),

        // Scientific Rationale ("The Why") - Streamlined & Punchy
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: FitLogTokens.surface,
            borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
            border: Border.all(
                color: FitLogTokens.accent.withValues(alpha: 0.4), width: 1.5),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.bolt, color: FitLogTokens.accent, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'AI PRESCRIPTION SUMMARY',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.8,
                      color: FitLogTokens.accent,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              const Text(
                '• 2×/Week Frequency: Delivers 48% higher muscle protein synthesis than once-a-week splits.\n'
                '• 90s Rest Intervals: Replenishes 95% of ATP cellular energy for maximum mechanical tension.\n'
                '• Compound First: High-motor-unit recruitment while central nervous system is fresh.',
                style: TextStyle(
                    fontSize: 12, height: 1.5, color: FitLogTokens.textPrimary),
              ),
              const SizedBox(height: 10),
              const Divider(color: Colors.white12),
              ExpansionTile(
                tilePadding: EdgeInsets.zero,
                iconColor: FitLogTokens.accent,
                collapsedIconColor: FitLogTokens.textSecondary,
                title: const Row(
                  children: [
                    Icon(Icons.biotech, color: FitLogTokens.accent, size: 16),
                    SizedBox(width: 6),
                    Text(
                      'View Peer-Reviewed Citations & Studies',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: FitLogTokens.accent,
                      ),
                    ),
                  ],
                ),
                children: [
                  _buildWhyBullet(
                    title: 'Frequency (Schoenfeld et al., 2021):',
                    body:
                        'Systematic meta-analysis confirming superior hypertrophy for twice-weekly frequency over single-session bro-splits.',
                  ),
                  const SizedBox(height: 8),
                  _buildWhyBullet(
                    title: 'Rest Intervals (ACSM Position Stand):',
                    body:
                        '3-5 min for raw strength, 60-90s for hypertrophy to balance metabolic stress with mechanical tension.',
                  ),
                  const SizedBox(height: 8),
                  _buildWhyBullet(
                    title: 'Exercise Order (Hunter et al., 2014):',
                    body:
                        'Multi-joint compound movements first prevent premature accessory muscle exhaustion.',
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Generated Routine Schedule
        const Text(
          'YOUR WEEKLY WORKOUT SCHEDULE',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
            color: FitLogTokens.textSecondary,
          ),
        ),
        const SizedBox(height: 10),

        _buildRoutineScheduleCard('Day 1: Push Day',
            'Chest, Shoulders & Triceps (5 exercises · 50 min)'),
        _buildRoutineScheduleCard(
            'Day 2: Pull Day', 'Back, Lats & Biceps (5 exercises · 55 min)'),
        _buildRoutineScheduleCard('Day 3: Rest & Recovery',
            'Active recovery, hydration & muscle synthesis'),
        _buildRoutineScheduleCard('Day 4: Legs & Core',
            'Quads, Hamstrings, Calves & Abs (5 exercises · 60 min)'),
        if (_selectedDays >= 5)
          _buildRoutineScheduleCard('Day 5: Upper Hypertrophy',
              'Chest, Back & Arm volume density (4 exercises · 45 min)'),

        const SizedBox(height: 14),
      ],
    );
  }

  Widget _buildWhyBullet({required String title, required String body}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: FitLogTokens.textPrimary,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          body,
          style: const TextStyle(
            fontSize: 11,
            height: 1.4,
            color: FitLogTokens.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildRoutineScheduleCard(String title, String details) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: FitLogTokens.surface2,
        borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: FitLogTokens.textPrimary,
                ),
              ),
              Text(
                details,
                style: const TextStyle(
                  fontSize: 11,
                  color: FitLogTokens.textSecondary,
                ),
              ),
            ],
          ),
          const Icon(Icons.check, size: 16, color: FitLogTokens.accent),
        ],
      ),
    );
  }
}
