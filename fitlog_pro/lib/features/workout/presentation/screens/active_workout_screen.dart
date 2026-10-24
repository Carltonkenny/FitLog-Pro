import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';
import '../../domain/entities/workout_set.dart';
import '../../domain/usecases/epley_calculator.dart';
import '../../domain/usecases/volume_calculator.dart';
import '../widgets/rest_timer_modal.dart';
import '../widgets/equipment_graphics.dart';
import 'package:fitlog_pro/features/exercises/presentation/widgets/exercise_library_sheet.dart';
import 'package:fitlog_pro/features/exercises/domain/entities/exercise.dart';
import '../../domain/services/gemini_coach_service.dart';
import 'workout_summary_screen.dart';

class ActiveWorkoutScreen extends StatefulWidget {
  final VoidCallback? onNavigateHome;
  final VoidCallback? onNavigateProgress;

  const ActiveWorkoutScreen({
    super.key,
    this.onNavigateHome,
    this.onNavigateProgress,
  });

  @override
  State<ActiveWorkoutScreen> createState() => _ActiveWorkoutScreenState();
}

class _ActiveWorkoutScreenState extends State<ActiveWorkoutScreen> {
  // Main Exercise: Barbell Bench Press sets
  final List<WorkoutSet> _benchSets = [
    const WorkoutSet(
        id: 's1', setOrder: 1, weightKg: 82.5, reps: 8, isCompleted: true),
    const WorkoutSet(
        id: 's2', setOrder: 2, weightKg: 82.5, reps: 8, isCompleted: true),
    const WorkoutSet(
        id: 's3', setOrder: 3, weightKg: 82.5, reps: 8, isCompleted: false),
  ];

  // Superset Exercise A: Incline Dumbbell Press
  final List<WorkoutSet> _supersetASets = [
    const WorkoutSet(
        id: 'sa1', setOrder: 1, weightKg: 28.0, reps: 10, isCompleted: false),
    const WorkoutSet(
        id: 'sa2', setOrder: 2, weightKg: 28.0, reps: 10, isCompleted: false),
  ];

  // Superset Exercise B: Cable Fly
  final List<WorkoutSet> _supersetBSets = [
    const WorkoutSet(
        id: 'sb1', setOrder: 1, weightKg: 15.0, reps: 12, isCompleted: false),
    const WorkoutSet(
        id: 'sb2', setOrder: 2, weightKg: 15.0, reps: 12, isCompleted: false),
  ];

  bool _isSupersetLinked = true;

  // Additional dynamic exercises added from 330+ Library
  final List<Map<String, dynamic>> _customExercises = [];

  final double _previousBest1RM = 101.3;
  bool _showPRBanner = true;
  String _prBannerText = '82.5 kg × 8 reps · Est. 1RM: 104.5 kg (+3.2 kg)';

  void _toggleBenchSet(int index) {
    setState(() {
      final current = _benchSets[index];
      final newCompleted = !current.isCompleted;
      _benchSets[index] = current.copyWith(isCompleted: newCompleted);

      if (newCompleted) {
        final est1RM = EpleyCalculator.calculate(
          weightKg: current.weightKg,
          reps: current.reps,
        );

        if (est1RM > _previousBest1RM) {
          _showPRBanner = true;
          _prBannerText =
              '${current.weightKg} kg × ${current.reps} reps · Est. 1RM: ${est1RM.toStringAsFixed(1)} kg (+${(est1RM - _previousBest1RM).toStringAsFixed(1)} kg)';
        }

        // Standard rest timer trigger for solo exercise
        RestTimerModal.show(
          context,
          seconds: 90,
          nextExercise: 'Barbell Bench Press',
          nextSetDetails: 'Set ${index + 2} · Target 82.5 kg × 8',
        );
      }
    });
  }

  void _toggleSupersetASet(int index) {
    setState(() {
      final current = _supersetASets[index];
      final newCompleted = !current.isCompleted;
      _supersetASets[index] = current.copyWith(isCompleted: newCompleted);

      if (newCompleted) {
        if (_isSupersetLinked) {
          // Superset Rule: No rest timer after Exercise A!
          // Direct lifter to transition immediately to Exercise B
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              duration: const Duration(milliseconds: 2500),
              backgroundColor: FitLogTokens.surface2,
              behavior: SnackBarBehavior.floating,
              content: Row(
                children: [
                  const Text('⚡', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Superset: Move immediately to B${index + 1} (Cable Fly) — No Rest!',
                      style: const TextStyle(
                        color: FitLogTokens.accent,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        } else {
          // Unlinked: Normal rest timer
          RestTimerModal.show(
            context,
            seconds: 60,
            nextExercise: 'Incline Dumbbell Press',
            nextSetDetails: 'Set ${index + 2} · 28 kg × 10',
          );
        }
      }
    });
  }

  void _toggleSupersetBSet(int index) {
    setState(() {
      final current = _supersetBSets[index];
      final newCompleted = !current.isCompleted;
      _supersetBSets[index] = current.copyWith(isCompleted: newCompleted);

      if (newCompleted) {
        if (_isSupersetLinked) {
          // Superset Rule: Full rest timer ONLY after completing Exercise B!
          RestTimerModal.show(
            context,
            seconds: 90,
            nextExercise: 'Superset Round ${index + 2}',
            nextSetDetails:
                'Round ${index + 1} Complete! Next: Incline DB Press',
          );
        } else {
          RestTimerModal.show(
            context,
            seconds: 60,
            nextExercise: 'Cable Fly',
            nextSetDetails: 'Set ${index + 2} · 15 kg × 12',
          );
        }
      }
    });
  }

  void _addBenchSet() {
    setState(() {
      final last = _benchSets.isNotEmpty ? _benchSets.last : null;
      _benchSets.add(WorkoutSet(
        id: 's${_benchSets.length + 1}',
        setOrder: _benchSets.length + 1,
        weightKg: last?.weightKg ?? 82.5,
        reps: last?.reps ?? 8,
        isCompleted: false,
      ));
    });
  }

  void _showPlateCalculator(double targetWeight) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Visual Equipment & Plate Math',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close,
                        color: FitLogTokens.textSecondary),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Target: ${targetWeight.toStringAsFixed(1)} kg Barbell Load (20 kg Bar + Plates)',
                style: const TextStyle(
                    color: FitLogTokens.textSecondary, fontSize: 12),
              ),
              const SizedBox(height: 16),

              // Feature 1: 2D Olympic Barbell Sleeve CustomPaint with IWF Bumper Plates
              OlympicBarbellSleeveWidget(
                totalWeightKg: targetWeight,
                barWeightKg: 20.0,
              ),

              const SizedBox(height: 14),
              // Dumbbell Equipment Visual Preview
              const DumbbellVisualWidget(weightKg: 28.0),

              const SizedBox(height: 14),
              // Selectorized Cable Stack Visual Preview
              const CableStackVisualWidget(selectedWeightKg: 45.0),

              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Confirm Equipment Setup'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _openExerciseLibrary() {
    ExerciseLibrarySheet.show(
      context,
      onSelect: (ex) {
        setState(() {
          _customExercises.add({
            'exercise': ex,
            'sets': [
              WorkoutSet(
                id: 'c_${DateTime.now().millisecondsSinceEpoch}_1',
                setOrder: 1,
                weightKg: ex.equipment == EquipmentType.bodyweight ? 0.0 : 40.0,
                reps: 10,
                isCompleted: false,
              ),
            ],
          });
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: FitLogTokens.surface2,
            content: Text(
              'Added ${ex.name} (${ex.muscleGroup.displayName}) to workout',
              style: const TextStyle(color: FitLogTokens.accent),
            ),
          ),
        );
      },
    );
  }

  void _finishWorkout() {
    final allCompletedSets = _benchSets.where((s) => s.isCompleted).length +
        _supersetASets.where((s) => s.isCompleted).length +
        _supersetBSets.where((s) => s.isCompleted).length;

    final totalVolume = VolumeCalculator.calculateTotal(_benchSets) +
        VolumeCalculator.calculateTotal(_supersetASets) +
        VolumeCalculator.calculateTotal(_supersetBSets);

    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => WorkoutSummaryScreen(
          title: 'Push Day',
          duration: '42m 18s',
          volumeKg: totalVolume,
          totalSets: allCompletedSets,
          prCount: 1,
        ),
      ),
    );
  }

  Widget _buildStepperButton(String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(FitLogTokens.radiusControl),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: FitLogTokens.surface2,
          borderRadius: BorderRadius.circular(FitLogTokens.radiusControl),
          border: Border.all(color: Colors.white12),
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w900,
            color: FitLogTokens.accent,
          ),
        ),
      ),
    );
  }

  void _showQuickStepperModal({
    required String exerciseName,
    required int setOrder,
    required double initialWeight,
    required int initialReps,
    required Function(double newWeight, int newReps) onSave,
  }) {
    double currentWeight = initialWeight;
    int currentReps = initialReps;

    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: FitLogTokens.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                border: Border(
                    top: BorderSide(color: FitLogTokens.accent, width: 2)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '$exerciseName · Set $setOrder',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: FitLogTokens.textPrimary,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close,
                            color: FitLogTokens.textSecondary),
                        onPressed: () => Navigator.of(ctx).pop(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Weight Row with Steppers
                  const Text('WEIGHT (KG)',
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: FitLogTokens.textSecondary)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: FitLogTokens.surface2,
                          borderRadius:
                              BorderRadius.circular(FitLogTokens.radiusControl),
                        ),
                        child: Text(
                          '${currentWeight.toStringAsFixed(currentWeight.truncateToDouble() == currentWeight ? 0 : 1)} kg',
                          style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              color: FitLogTokens.accent),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _buildStepperButton(
                                '-5',
                                () => setModalState(() => currentWeight =
                                    (currentWeight - 5.0).clamp(0.0, 500.0))),
                            _buildStepperButton(
                                '-2.5',
                                () => setModalState(() => currentWeight =
                                    (currentWeight - 2.5).clamp(0.0, 500.0))),
                            _buildStepperButton(
                                '+2.5',
                                () => setModalState(() => currentWeight =
                                    (currentWeight + 2.5).clamp(0.0, 500.0))),
                            _buildStepperButton(
                                '+5',
                                () => setModalState(() => currentWeight =
                                    (currentWeight + 5.0).clamp(0.0, 500.0))),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Reps Row with Steppers
                  const Text('REPS',
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: FitLogTokens.textSecondary)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 10),
                        decoration: BoxDecoration(
                          color: FitLogTokens.surface2,
                          borderRadius:
                              BorderRadius.circular(FitLogTokens.radiusControl),
                        ),
                        child: Text(
                          '$currentReps',
                          style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              color: FitLogTokens.textPrimary),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _buildStepperButton(
                                '-1',
                                () => setModalState(() => currentReps =
                                    (currentReps - 1).clamp(1, 100))),
                            _buildStepperButton(
                                '+1',
                                () => setModalState(() => currentReps =
                                    (currentReps + 1).clamp(1, 100))),
                            _buildStepperButton(
                                '+2',
                                () => setModalState(() => currentReps =
                                    (currentReps + 2).clamp(1, 100))),
                            _buildStepperButton(
                                '+5',
                                () => setModalState(() => currentReps =
                                    (currentReps + 5).clamp(1, 100))),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Confirm button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: FitLogTokens.accent,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(
                                FitLogTokens.radiusControl)),
                      ),
                      onPressed: () {
                        onSave(currentWeight, currentReps);
                        Navigator.of(ctx).pop();
                      },
                      child: const Text('Update Set Numbers',
                          style: TextStyle(
                              fontWeight: FontWeight.w900, fontSize: 15)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showAICoachModal() {
    final queryController = TextEditingController();
    String? coachResponse;
    bool isLoading = false;
    final keyController =
        TextEditingController(text: GeminiCoachService.apiKey ?? '');

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Container(
              padding: EdgeInsets.fromLTRB(
                20,
                20,
                20,
                MediaQuery.of(ctx).viewInsets.bottom + 20,
              ),
              decoration: const BoxDecoration(
                color: FitLogTokens.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                border: Border(
                    top: BorderSide(color: FitLogTokens.accent, width: 2)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.auto_awesome,
                                color: FitLogTokens.accent, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Smart AI Gym Coach',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: FitLogTokens.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close,
                              color: FitLogTokens.textSecondary),
                          onPressed: () => Navigator.of(ctx).pop(),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      GeminiCoachService.hasApiKey
                          ? '⚡ Connected to Google Gemini 1.5 Flash'
                          : '⚡ Running Offline Sports Science Engine (0ms latency)',
                      style: TextStyle(
                        fontSize: 11,
                        color: GeminiCoachService.hasApiKey
                            ? FitLogTokens.accent
                            : FitLogTokens.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Quick prompt chips
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ActionChip(
                          backgroundColor: FitLogTokens.surface2,
                          label: const Text('🔄 Bench is busy',
                              style: TextStyle(
                                  fontSize: 12,
                                  color: FitLogTokens.textPrimary)),
                          onPressed: () async {
                            setModalState(() => isLoading = true);
                            final res = await GeminiCoachService.askCoach(
                              query:
                                  'Bench press is taken, what is the best alternative?',
                              currentExercise: 'Barbell Bench Press',
                            );
                            setModalState(() {
                              coachResponse = res;
                              isLoading = false;
                            });
                          },
                        ),
                        ActionChip(
                          backgroundColor: FitLogTokens.surface2,
                          label: const Text('⚠️ Shoulder hurts',
                              style: TextStyle(
                                  fontSize: 12,
                                  color: FitLogTokens.textPrimary)),
                          onPressed: () async {
                            setModalState(() => isLoading = true);
                            final res = await GeminiCoachService.askCoach(
                              query: 'Shoulder joint hurts during pressing',
                              currentExercise: 'Barbell Bench Press',
                            );
                            setModalState(() {
                              coachResponse = res;
                              isLoading = false;
                            });
                          },
                        ),
                        ActionChip(
                          backgroundColor: FitLogTokens.surface2,
                          label: const Text('⚡ Only 25 mins',
                              style: TextStyle(
                                  fontSize: 12,
                                  color: FitLogTokens.textPrimary)),
                          onPressed: () async {
                            setModalState(() => isLoading = true);
                            final res = await GeminiCoachService.askCoach(
                              query: 'Condense this workout to 25 minutes',
                              currentExercise: 'Barbell Bench Press',
                            );
                            setModalState(() {
                              coachResponse = res;
                              isLoading = false;
                            });
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Response card
                    if (isLoading)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(20),
                          child: CircularProgressIndicator(
                              color: FitLogTokens.accent),
                        ),
                      )
                    else if (coachResponse != null)
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: FitLogTokens.surface2,
                          borderRadius:
                              BorderRadius.circular(FitLogTokens.radiusCard),
                          border: Border.all(
                              color:
                                  FitLogTokens.accent.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          coachResponse!,
                          style: const TextStyle(
                              fontSize: 13,
                              height: 1.5,
                              color: FitLogTokens.textPrimary),
                        ),
                      ),

                    const SizedBox(height: 14),

                    // Custom question row
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: queryController,
                            style: const TextStyle(
                                color: FitLogTokens.textPrimary, fontSize: 13),
                            decoration: InputDecoration(
                              hintText:
                                  'Ask anything (e.g. form, warmup, swap)...',
                              hintStyle: const TextStyle(
                                  color: FitLogTokens.textSecondary,
                                  fontSize: 12),
                              filled: true,
                              fillColor: FitLogTokens.surface2,
                              contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 10),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(
                                    FitLogTokens.radiusControl),
                                borderSide: BorderSide.none,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          style: IconButton.styleFrom(
                            backgroundColor: FitLogTokens.accent,
                            foregroundColor: Colors.black,
                          ),
                          icon: const Icon(Icons.arrow_upward, size: 18),
                          onPressed: () async {
                            final q = queryController.text.trim();
                            if (q.isEmpty) return;
                            setModalState(() => isLoading = true);
                            final res = await GeminiCoachService.askCoach(
                              query: q,
                              currentExercise: 'Barbell Bench Press',
                            );
                            setModalState(() {
                              coachResponse = res;
                              isLoading = false;
                            });
                          },
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    // Collapsible API Key setting
                    ExpansionTile(
                      tilePadding: EdgeInsets.zero,
                      title: const Text(
                        'Gemini API Key Settings (Optional)',
                        style: TextStyle(
                            fontSize: 11,
                            color: FitLogTokens.textSecondary,
                            fontWeight: FontWeight.bold),
                      ),
                      children: [
                        TextField(
                          controller: keyController,
                          style: const TextStyle(
                              color: FitLogTokens.textPrimary, fontSize: 12),
                          decoration: InputDecoration(
                            hintText: 'Paste Gemini API Key (e.g. AIzaSy...)',
                            hintStyle: const TextStyle(
                                color: FitLogTokens.textSecondary,
                                fontSize: 11),
                            filled: true,
                            fillColor: FitLogTokens.surface2,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(
                                  FitLogTokens.radiusControl),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          onChanged: (val) {
                            GeminiCoachService.setApiKey(val);
                            setModalState(() {});
                          },
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'FitLog Pro works 100% offline without a key. Adding a key unlocks Google Gemini 1.5 Flash conversational reasoning.',
                          style: TextStyle(
                              fontSize: 10, color: FitLogTokens.textSecondary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final allCompletedSets = _benchSets.where((s) => s.isCompleted).length +
        _supersetASets.where((s) => s.isCompleted).length +
        _supersetBSets.where((s) => s.isCompleted).length;

    final allTotalSets =
        _benchSets.length + _supersetASets.length + _supersetBSets.length;

    final totalVolume = VolumeCalculator.calculateTotal(_benchSets) +
        VolumeCalculator.calculateTotal(_supersetASets) +
        VolumeCalculator.calculateTotal(_supersetBSets);

    return Scaffold(
      backgroundColor: FitLogTokens.bg,
      appBar: AppBar(
        title: const Text('Push Day'),
        backgroundColor: FitLogTokens.bg,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome, color: FitLogTokens.accent),
            tooltip: 'Smart AI Coach',
            onPressed: _showAICoachModal,
          ),
          IconButton(
            icon: const Icon(Icons.fitness_center, color: FitLogTokens.accent),
            tooltip: '330+ Exercise Library',
            onPressed: _openExerciseLibrary,
          ),
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: FitLogTokens.surface,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusPill),
            ),
            child: const Text(
              '⏱ 00:42:18',
              style: TextStyle(
                color: FitLogTokens.accent,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(
          color: FitLogTokens.surface,
          border: Border(top: BorderSide(color: Colors.white12, width: 1)),
        ),
        child: Row(
          children: [
            Expanded(
              flex: 3,
              child: OutlinedButton.icon(
                onPressed: _openExerciseLibrary,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.white24),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                icon: const Icon(Icons.add,
                    size: 16, color: FitLogTokens.textPrimary),
                label: const Text('Add Exercise',
                    style: TextStyle(
                        color: FitLogTokens.textPrimary, fontSize: 13)),
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              style: IconButton.styleFrom(
                backgroundColor: FitLogTokens.surface2,
                padding: const EdgeInsets.all(12),
              ),
              icon: const Icon(Icons.auto_awesome,
                  color: FitLogTokens.accent, size: 20),
              tooltip: 'AI Coach',
              onPressed: _showAICoachModal,
            ),
            const SizedBox(width: 8),
            Expanded(
              flex: 4,
              child: ElevatedButton.icon(
                onPressed: _finishWorkout,
                style: ElevatedButton.styleFrom(
                  backgroundColor: FitLogTokens.accent,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                icon: const Icon(Icons.check_circle_outline, size: 18),
                label: const Text('Finish Workout',
                    style:
                        TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
              ),
            ),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(FitLogTokens.spacing16),
        children: [
          // Meta Chips
          Row(
            children: [
              _buildMetaChip(
                  '$allTotalSets sets total', FitLogTokens.textSecondary),
              const SizedBox(width: 8),
              _buildMetaChip(
                  '$allCompletedSets completed', FitLogTokens.accent),
              const SizedBox(width: 8),
              _buildMetaChip('${totalVolume.toStringAsFixed(0)} kg vol',
                  FitLogTokens.textPrimary),
            ],
          ),
          const SizedBox(height: 14),

          // PR Celebration Banner
          if (_showPRBanner)
            Container(
              padding: const EdgeInsets.all(14),
              margin: const EdgeInsets.only(bottom: 14),
              decoration: BoxDecoration(
                color: FitLogTokens.prGold.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
                border: Border.all(
                    color: FitLogTokens.prGold.withValues(alpha: 0.4),
                    width: 1.5),
              ),
              child: Row(
                children: [
                  const Text('🏆', style: TextStyle(fontSize: 28)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'New Personal Record!',
                          style: TextStyle(
                            color: FitLogTokens.prGold,
                            fontWeight: FontWeight.w900,
                            fontSize: 14,
                          ),
                        ),
                        Text(
                          _prBannerText,
                          style: const TextStyle(
                              color: FitLogTokens.textSecondary, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          // ----------------------------------------------------
          // EXERCISE 1: Barbell Bench Press (with 2D Plate Visualizer)
          // ----------------------------------------------------
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
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '1. Barbell Bench Press',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w900),
                        ),
                        Text(
                          'Chest · Rest 90s · Target RPE 8.5',
                          style: TextStyle(
                              fontSize: 12, color: FitLogTokens.textSecondary),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.calculate_outlined,
                              color: FitLogTokens.accent, size: 20),
                          onPressed: () => _showPlateCalculator(82.5),
                          tooltip: 'Visual 2D Plate Calculator',
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(color: Colors.white12),

                // Table Header
                _buildSetTableHeader(),

                // Bench Set Rows
                ..._benchSets.asMap().entries.map((entry) {
                  final idx = entry.key;
                  final set = entry.value;
                  return _buildSetRow(
                    setOrder: set.setOrder,
                    prevText: '80 × 8',
                    weight: set.weightKg,
                    reps: set.reps,
                    isCompleted: set.isCompleted,
                    onToggle: () => _toggleBenchSet(idx),
                    onEdit: () {
                      _showQuickStepperModal(
                        exerciseName: 'Barbell Bench Press',
                        setOrder: set.setOrder,
                        initialWeight: set.weightKg,
                        initialReps: set.reps,
                        onSave: (newW, newR) {
                          setState(() {
                            _benchSets[idx] =
                                set.copyWith(weightKg: newW, reps: newR);
                          });
                        },
                      );
                    },
                  );
                }),

                const SizedBox(height: 8),
                Center(
                  child: TextButton(
                    onPressed: _addBenchSet,
                    child: const Text('+ Add Set',
                        style: TextStyle(
                            color: FitLogTokens.accent,
                            fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ----------------------------------------------------
          // FEATURE 2: SUPERSET LINKING CONTAINER (A + B)
          // ----------------------------------------------------
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: FitLogTokens.surface,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
              border: Border.all(
                color: _isSupersetLinked
                    ? FitLogTokens.accent.withValues(alpha: 0.6)
                    : Colors.white12,
                width: _isSupersetLinked ? 1.8 : 1.0,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Superset Linking Header & Toggle
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(
                          _isSupersetLinked ? Icons.link : Icons.link_off,
                          color: _isSupersetLinked
                              ? FitLogTokens.accent
                              : FitLogTokens.textSecondary,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _isSupersetLinked
                              ? 'SUPERSET [ A + B ]'
                              : 'EXERCISES 2 & 3',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.8,
                            color: _isSupersetLinked
                                ? FitLogTokens.accent
                                : FitLogTokens.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    TextButton.icon(
                      onPressed: () {
                        setState(() => _isSupersetLinked = !_isSupersetLinked);
                      },
                      icon: Icon(
                        _isSupersetLinked ? Icons.close : Icons.link,
                        size: 14,
                        color: FitLogTokens.accent,
                      ),
                      label: Text(
                        _isSupersetLinked ? 'Unlink' : 'Link as Superset',
                        style: const TextStyle(
                            fontSize: 11, color: FitLogTokens.accent),
                      ),
                    ),
                  ],
                ),
                if (_isSupersetLinked) ...[
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: FitLogTokens.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      children: [
                        Text('⚡', style: TextStyle(fontSize: 14)),
                        SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Alternating Sets: Finish A1 → Immediate B1 (No Rest) → 90s Rest after B1.',
                            style: TextStyle(
                                fontSize: 11, color: FitLogTokens.accent),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // Sub-Exercise A: Incline Dumbbell Press
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Text('A. ',
                            style: TextStyle(
                                fontWeight: FontWeight.w900,
                                color: FitLogTokens.accent)),
                        Text('Incline Dumbbell Press',
                            style: TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: FitLogTokens.surface2,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('28 kg Dumbbells',
                          style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: FitLogTokens.textSecondary)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                _buildSetTableHeader(),
                ..._supersetASets.asMap().entries.map((entry) {
                  final idx = entry.key;
                  final set = entry.value;
                  return _buildSetRow(
                    setOrder: set.setOrder,
                    prevText: '26 × 10',
                    weight: set.weightKg,
                    reps: set.reps,
                    isCompleted: set.isCompleted,
                    onToggle: () => _toggleSupersetASet(idx),
                    onEdit: () {
                      _showQuickStepperModal(
                        exerciseName: 'Incline Dumbbell Press',
                        setOrder: set.setOrder,
                        initialWeight: set.weightKg,
                        initialReps: set.reps,
                        onSave: (newW, newR) {
                          setState(() {
                            _supersetASets[idx] =
                                set.copyWith(weightKg: newW, reps: newR);
                          });
                        },
                      );
                    },
                  );
                }),

                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Divider(color: Colors.white12),
                ),

                // Sub-Exercise B: Cable Fly
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Text('B. ',
                            style: TextStyle(
                                fontWeight: FontWeight.w900,
                                color: FitLogTokens.accent)),
                        Text('Cable Fly',
                            style: TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: FitLogTokens.surface2,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('15 kg Pin Stack',
                          style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: FitLogTokens.textSecondary)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                _buildSetTableHeader(),
                ..._supersetBSets.asMap().entries.map((entry) {
                  final idx = entry.key;
                  final set = entry.value;
                  return _buildSetRow(
                    setOrder: set.setOrder,
                    prevText: '12 × 12',
                    weight: set.weightKg,
                    reps: set.reps,
                    isCompleted: set.isCompleted,
                    onToggle: () => _toggleSupersetBSet(idx),
                    onEdit: () {
                      _showQuickStepperModal(
                        exerciseName: 'Cable Fly',
                        setOrder: set.setOrder,
                        initialWeight: set.weightKg,
                        initialReps: set.reps,
                        onSave: (newW, newR) {
                          setState(() {
                            _supersetBSets[idx] =
                                set.copyWith(weightKg: newW, reps: newR);
                          });
                        },
                      );
                    },
                  );
                }),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Custom Added Exercises from 330+ Library
          for (final item in _customExercises) ...[
            _buildCustomExerciseCard(item),
            const SizedBox(height: 12),
          ],

          // Next Collapsed Exercises
          _buildCollapsedExercise('Triceps Pushdown', '3 sets · 30 kg × 12'),
          _buildCollapsedExercise('Lateral Raise', '2 sets · 10 kg × 15'),

          const SizedBox(height: 16),
          // 330+ Exercise Library Launcher Button
          OutlinedButton.icon(
            onPressed: _openExerciseLibrary,
            icon: const Icon(Icons.add, color: FitLogTokens.accent, size: 18),
            label: const Text('+ Add Exercise from 330+ Library',
                style: TextStyle(color: FitLogTokens.accent)),
          ),

          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => WorkoutSummaryScreen(
                    title: 'Push Day',
                    duration: '00:46:12',
                    volumeKg: totalVolume,
                    totalSets: allTotalSets,
                    prCount: 1,
                  ),
                ),
              );
            },
            child: const Text('Finish Workout'),
          ),
        ],
      ),
    );
  }

  Widget _buildSetTableHeader() {
    return const Padding(
      padding: EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(
              width: 32,
              child: Text('SET',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: FitLogTokens.textSecondary))),
          Expanded(
              child: Text('PREVIOUS',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: FitLogTokens.textSecondary))),
          SizedBox(
              width: 68,
              child: Text('KG',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: FitLogTokens.textSecondary))),
          SizedBox(
              width: 62,
              child: Text('REPS',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: FitLogTokens.textSecondary))),
          SizedBox(width: 44),
        ],
      ),
    );
  }

  Widget _buildSetRow({
    required int setOrder,
    required String prevText,
    required double weight,
    required int reps,
    required bool isCompleted,
    required VoidCallback onToggle,
    VoidCallback? onEdit,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 32,
            child: Text(
              '$setOrder',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
          Expanded(
            child: Text(
              prevText,
              style: const TextStyle(
                  color: FitLogTokens.textSecondary, fontSize: 12),
            ),
          ),
          InkWell(
            onTap: onEdit,
            borderRadius: BorderRadius.circular(FitLogTokens.radiusControl),
            child: Container(
              width: 68,
              height: 38,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: FitLogTokens.surface2,
                borderRadius: BorderRadius.circular(FitLogTokens.radiusControl),
                border: Border.all(color: Colors.white12),
              ),
              child: Text(
                weight.toStringAsFixed(
                    weight.truncateToDouble() == weight ? 0 : 1),
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
          ),
          const SizedBox(width: 6),
          InkWell(
            onTap: onEdit,
            borderRadius: BorderRadius.circular(FitLogTokens.radiusControl),
            child: Container(
              width: 62,
              height: 38,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: FitLogTokens.surface2,
                borderRadius: BorderRadius.circular(FitLogTokens.radiusControl),
                border: Border.all(color: Colors.white12),
              ),
              child: Text(
                '$reps',
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: onToggle,
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color:
                    isCompleted ? FitLogTokens.accent : FitLogTokens.surface2,
                borderRadius: BorderRadius.circular(FitLogTokens.radiusControl),
                border: !isCompleted
                    ? Border.all(color: FitLogTokens.accent, width: 2)
                    : null,
              ),
              child: Icon(
                Icons.check,
                size: 20,
                color:
                    isCompleted ? FitLogTokens.onAccent : FitLogTokens.accent,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomExerciseCard(Map<String, dynamic> item) {
    final Exercise ex = item['exercise'] as Exercise;
    final List<WorkoutSet> sets = item['sets'] as List<WorkoutSet>;

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
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ex.name,
                      style: const TextStyle(
                          fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '${ex.muscleGroup.displayName} · ${ex.equipment.displayName}',
                      style: const TextStyle(
                          fontSize: 11, color: FitLogTokens.textSecondary),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline,
                    size: 18, color: FitLogTokens.danger),
                onPressed: () {
                  setState(() => _customExercises.remove(item));
                },
              ),
            ],
          ),
          const SizedBox(height: 8),
          _buildSetTableHeader(),
          for (var i = 0; i < sets.length; i++)
            _buildSetRow(
              setOrder: sets[i].setOrder,
              prevText: 'Target',
              weight: sets[i].weightKg,
              reps: sets[i].reps,
              isCompleted: sets[i].isCompleted,
              onToggle: () {
                setState(() {
                  sets[i] = sets[i].copyWith(isCompleted: !sets[i].isCompleted);
                  if (sets[i].isCompleted) {
                    RestTimerModal.show(
                      context,
                      seconds: 90,
                      nextExercise: ex.name,
                      nextSetDetails: 'Set ${i + 2}',
                    );
                  }
                });
              },
              onEdit: () {
                _showQuickStepperModal(
                  exerciseName: ex.name,
                  setOrder: sets[i].setOrder,
                  initialWeight: sets[i].weightKg,
                  initialReps: sets[i].reps,
                  onSave: (newW, newR) {
                    setState(() {
                      sets[i] = sets[i].copyWith(weightKg: newW, reps: newR);
                    });
                  },
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildMetaChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: FitLogTokens.surface,
        borderRadius: BorderRadius.circular(FitLogTokens.radiusPill),
      ),
      child: Text(label,
          style: TextStyle(
              fontSize: 11, fontWeight: FontWeight.bold, color: color)),
    );
  }

  Widget _buildCollapsedExercise(String name, String details) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: FitLogTokens.surface,
        borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 13)),
              Text(details,
                  style: const TextStyle(
                      fontSize: 11, color: FitLogTokens.textSecondary)),
            ],
          ),
          const Icon(Icons.chevron_right,
              size: 20, color: FitLogTokens.textSecondary),
        ],
      ),
    );
  }
}
