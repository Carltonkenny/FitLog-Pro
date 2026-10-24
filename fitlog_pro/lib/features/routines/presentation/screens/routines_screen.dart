import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';
import '../../../workout/presentation/screens/active_workout_screen.dart';
import 'package:fitlog_pro/features/routines/domain/health_science_engine.dart';
import 'package:fitlog_pro/features/exercises/presentation/widgets/exercise_library_sheet.dart';

class RoutineTemplate {
  final String id;
  final String name;
  final String splitCategory;
  final int exerciseCount;
  final int estimatedMinutes;
  final List<String> exercises;
  final bool isCustom;

  const RoutineTemplate({
    required this.id,
    required this.name,
    required this.splitCategory,
    required this.exerciseCount,
    required this.estimatedMinutes,
    required this.exercises,
    this.isCustom = false,
  });

  RoutineTemplate copyWith({
    String? id,
    String? name,
    String? splitCategory,
    int? exerciseCount,
    int? estimatedMinutes,
    List<String>? exercises,
    bool? isCustom,
  }) {
    return RoutineTemplate(
      id: id ?? this.id,
      name: name ?? this.name,
      splitCategory: splitCategory ?? this.splitCategory,
      exerciseCount: exerciseCount ?? this.exerciseCount,
      estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
      exercises: exercises ?? this.exercises,
      isCustom: isCustom ?? this.isCustom,
    );
  }
}

class RoutinesScreen extends StatefulWidget {
  const RoutinesScreen({super.key});

  @override
  State<RoutinesScreen> createState() => _RoutinesScreenState();
}

class _RoutinesScreenState extends State<RoutinesScreen> {
  final List<RoutineTemplate> _routines = [
    const RoutineTemplate(
      id: 'push-1',
      name: 'Push Day (Chest / Delts / Tris)',
      splitCategory: 'Hypertrophy · 4-Day Split',
      exerciseCount: 5,
      estimatedMinutes: 50,
      exercises: [
        'Barbell Bench Press (3 sets)',
        'Incline Dumbbell Press (3 sets)',
        'Cable Fly (3 sets)',
        'Triceps Pushdown (3 sets)',
        'Lateral Raise (2 sets)',
      ],
    ),
    const RoutineTemplate(
      id: 'pull-1',
      name: 'Pull Day (Back / Lats / Biceps)',
      splitCategory: 'Strength · 4-Day Split',
      exerciseCount: 5,
      estimatedMinutes: 55,
      exercises: [
        'Barbell Deadlift (3 sets)',
        'Lat Pulldown (3 sets)',
        'Seated Cable Row (3 sets)',
        'Barbell Bicep Curl (3 sets)',
        'Face Pulls (3 sets)',
      ],
    ),
    const RoutineTemplate(
      id: 'legs-1',
      name: 'Legs & Core Power',
      splitCategory: 'Hypertrophy · 4-Day Split',
      exerciseCount: 5,
      estimatedMinutes: 60,
      exercises: [
        'Barbell Back Squat (4 sets)',
        'Romanian Deadlift (3 sets)',
        'Leg Press (3 sets)',
        'Standing Calf Raise (4 sets)',
        'Hanging Leg Raise (3 sets)',
      ],
    ),
    const RoutineTemplate(
      id: 'upper-1',
      name: 'Upper Body Power & Speed',
      splitCategory: 'Athletic Conditioning',
      exerciseCount: 4,
      estimatedMinutes: 45,
      exercises: [
        'Overhead Barbell Press (4 sets)',
        'Weighted Pull-Ups (3 sets)',
        'Dips (3 sets)',
        'Incline Dumbbell Row (3 sets)',
      ],
    ),
  ];

  String? _expandedId;

  // Science Blueprint Dialog State
  BiologicalSex _blueprintSex = BiologicalSex.male;
  FitnessGoal _blueprintGoal = FitnessGoal.hypertrophy;

  void _showHealthScienceModal() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final rec = HealthScienceEngine.getBlueprint(
              sex: _blueprintSex,
              goal: _blueprintGoal,
            );

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
                            Icon(Icons.biotech,
                                color: FitLogTokens.accent, size: 22),
                            SizedBox(width: 8),
                            Text(
                              'Physiological Blueprint',
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
                    const SizedBox(height: 8),
                    const Text(
                      'Dynamic exercise prescription based on peer-reviewed clinical guidelines (ACSM, WHO, Hunter).',
                      style: TextStyle(
                          color: FitLogTokens.textSecondary, fontSize: 12),
                    ),
                    const SizedBox(height: 16),

                    // Biological Sex Selector
                    const Text('BIOLOGICAL PROFILE',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: FitLogTokens.textSecondary)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setModalState(
                                () => _blueprintSex = BiologicalSex.male),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _blueprintSex == BiologicalSex.male
                                    ? FitLogTokens.accent
                                    : FitLogTokens.surface2,
                                borderRadius: BorderRadius.circular(
                                    FitLogTokens.radiusControl),
                              ),
                              child: Center(
                                child: Text(
                                  'Male Profile ♂',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 13,
                                    color: _blueprintSex == BiologicalSex.male
                                        ? FitLogTokens.onAccent
                                        : FitLogTokens.textPrimary,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setModalState(
                                () => _blueprintSex = BiologicalSex.female),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _blueprintSex == BiologicalSex.female
                                    ? FitLogTokens.accent
                                    : FitLogTokens.surface2,
                                borderRadius: BorderRadius.circular(
                                    FitLogTokens.radiusControl),
                              ),
                              child: Center(
                                child: Text(
                                  'Female Profile ♀',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 13,
                                    color: _blueprintSex == BiologicalSex.female
                                        ? FitLogTokens.onAccent
                                        : FitLogTokens.textPrimary,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Fitness Goal Selector
                    const Text('TRAINING OBJECTIVE',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: FitLogTokens.textSecondary)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final g in FitnessGoal.values)
                          GestureDetector(
                            onTap: () =>
                                setModalState(() => _blueprintGoal = g),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: _blueprintGoal == g
                                    ? FitLogTokens.accent
                                    : FitLogTokens.surface2,
                                borderRadius: BorderRadius.circular(
                                    FitLogTokens.radiusPill),
                                border: Border.all(
                                    color: _blueprintGoal == g
                                        ? FitLogTokens.accent
                                        : Colors.white10),
                              ),
                              child: Text(
                                g == FitnessGoal.hypertrophy
                                    ? 'Hypertrophy'
                                    : g == FitnessGoal.maximumStrength
                                        ? 'Maximum Strength'
                                        : g == FitnessGoal.metabolicFatLoss
                                            ? 'Fat Loss'
                                            : 'Joint Longevity',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: _blueprintGoal == g
                                      ? FitLogTokens.onAccent
                                      : FitLogTokens.textPrimary,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Generated Health Intelligence Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: FitLogTokens.surface2,
                        borderRadius:
                            BorderRadius.circular(FitLogTokens.radiusCard),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            rec.title,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: FitLogTokens.accent,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            rec.physiologicalRationale,
                            style: const TextStyle(
                                fontSize: 12,
                                color: FitLogTokens.textPrimary,
                                height: 1.4),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              _buildMiniBadge(Icons.timer_outlined,
                                  'Rest: ${rec.recommendedRestSeconds}s'),
                              const SizedBox(width: 8),
                              _buildMiniBadge(Icons.repeat, rec.targetRepRange),
                              const SizedBox(width: 8),
                              _buildMiniBadge(Icons.stacked_bar_chart,
                                  '${rec.recommendedWeeklySetsPerMuscle} sets/wk'),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'RECOMMENDED EXERCISES',
                            style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: FitLogTokens.textSecondary),
                          ),
                          const SizedBox(height: 4),
                          for (final ex in rec.recommendedExercises)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 2),
                              child: Text(
                                '• $ex',
                                style: const TextStyle(
                                    fontSize: 12,
                                    color: FitLogTokens.textPrimary),
                              ),
                            ),
                          const SizedBox(height: 10),
                          Text(
                            'Citation: ${rec.evidenceCitation}',
                            style: const TextStyle(
                                fontSize: 10,
                                fontStyle: FontStyle.italic,
                                color: FitLogTokens.textSecondary),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() {
                          _routines.insert(
                            0,
                            RoutineTemplate(
                              id: 'blueprint-${DateTime.now().millisecondsSinceEpoch}',
                              name: rec.title,
                              splitCategory:
                                  'Health Science Blueprint (${_blueprintSex == BiologicalSex.male ? "Male" : "Female"})',
                              exerciseCount: rec.recommendedExercises.length,
                              estimatedMinutes:
                                  rec.recommendedExercises.length * 10,
                              exercises: rec.recommendedExercises,
                              isCustom: true,
                            ),
                          );
                        });
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: FitLogTokens.surface2,
                            content: Text(
                              'Applied: ${rec.title}',
                              style:
                                  const TextStyle(color: FitLogTokens.accent),
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.auto_awesome, size: 18),
                      label: const Text('Apply Evidence-Based Blueprint'),
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

  Widget _buildMiniBadge(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: FitLogTokens.surface,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: FitLogTokens.accent),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: FitLogTokens.textPrimary),
          ),
        ],
      ),
    );
  }

  void _showCreateOrEditRoutineModal({RoutineTemplate? existing}) {
    final nameController = TextEditingController(text: existing?.name ?? '');
    final categoryController = TextEditingController(
      text: existing?.splitCategory ?? 'Custom Hypertrophy Split',
    );
    final exercises = List<String>.from(
      existing?.exercises ??
          [
            'Dumbbell Shoulder Press (3 sets)',
            'Lateral Raises (3 sets)',
            'Tricep Pushdown (3 sets)',
          ],
    );

    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
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
                        Text(
                          existing == null
                              ? 'Create Custom Routine'
                              : 'Edit Routine',
                          style: const TextStyle(
                            fontSize: 18,
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
                    const SizedBox(height: 12),
                    const Text('ROUTINE NAME',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: FitLogTokens.textSecondary)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: nameController,
                      style: const TextStyle(color: FitLogTokens.textPrimary),
                      decoration: InputDecoration(
                        hintText: 'e.g. Arms & Delts Hypertrophy',
                        hintStyle:
                            const TextStyle(color: FitLogTokens.textSecondary),
                        filled: true,
                        fillColor: FitLogTokens.surface2,
                        border: OutlineInputBorder(
                          borderRadius:
                              BorderRadius.circular(FitLogTokens.radiusControl),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text('CATEGORY / SPLIT',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: FitLogTokens.textSecondary)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: categoryController,
                      style: const TextStyle(color: FitLogTokens.textPrimary),
                      decoration: InputDecoration(
                        hintText: 'e.g. 5-Day Bodybuilding Split',
                        hintStyle:
                            const TextStyle(color: FitLogTokens.textSecondary),
                        filled: true,
                        fillColor: FitLogTokens.surface2,
                        border: OutlineInputBorder(
                          borderRadius:
                              BorderRadius.circular(FitLogTokens.radiusControl),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'EXERCISE SEQUENCE',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: FitLogTokens.textSecondary,
                          ),
                        ),
                        TextButton.icon(
                          onPressed: () {
                            ExerciseLibrarySheet.show(
                              ctx,
                              onSelect: (ex) {
                                setModalState(() {
                                  exercises.add('${ex.name} (3 sets)');
                                });
                              },
                            );
                          },
                          icon: const Icon(Icons.add,
                              size: 14, color: FitLogTokens.accent),
                          label: const Text('Add from 330+ Library',
                              style: TextStyle(
                                  color: FitLogTokens.accent, fontSize: 11)),
                        ),
                      ],
                    ),
                    for (var i = 0; i < exercises.length; i++)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          children: [
                            Text('${i + 1}. ',
                                style: const TextStyle(
                                    color: FitLogTokens.accent,
                                    fontWeight: FontWeight.bold)),
                            Expanded(
                              child: Text(
                                exercises[i],
                                style: const TextStyle(
                                    color: FitLogTokens.textPrimary,
                                    fontSize: 13),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.remove_circle_outline,
                                  size: 18, color: FitLogTokens.danger),
                              onPressed: () {
                                setModalState(() {
                                  exercises.removeAt(i);
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () {
                        final title = nameController.text.trim().isNotEmpty
                            ? nameController.text.trim()
                            : 'Custom Routine';
                        final category =
                            categoryController.text.trim().isNotEmpty
                                ? categoryController.text.trim()
                                : 'Personal Split';

                        setState(() {
                          if (existing != null) {
                            final idx = _routines
                                .indexWhere((r) => r.id == existing.id);
                            if (idx != -1) {
                              _routines[idx] = existing.copyWith(
                                name: title,
                                splitCategory: category,
                                exercises: exercises,
                                exerciseCount: exercises.length,
                              );
                            }
                          } else {
                            _routines.insert(
                              0,
                              RoutineTemplate(
                                id: 'custom-${DateTime.now().millisecondsSinceEpoch}',
                                name: title,
                                splitCategory: category,
                                exerciseCount: exercises.length,
                                estimatedMinutes: exercises.length * 10,
                                exercises: exercises,
                                isCustom: true,
                              ),
                            );
                          }
                        });
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: FitLogTokens.surface2,
                            content: Text(
                              'Saved routine: $title (${exercises.length} exercises)',
                              style:
                                  const TextStyle(color: FitLogTokens.accent),
                            ),
                          ),
                        );
                      },
                      child: Text(
                          existing == null ? 'Create Routine' : 'Save Changes'),
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

  void _duplicateRoutine(RoutineTemplate routine) {
    setState(() {
      _routines.insert(
        0,
        routine.copyWith(
          id: 'custom-${DateTime.now().millisecondsSinceEpoch}',
          name: '${routine.name} (Copy)',
          isCustom: true,
        ),
      );
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: FitLogTokens.surface2,
        content: Text(
          'Duplicated: ${routine.name}',
          style: const TextStyle(color: FitLogTokens.accent),
        ),
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
        title: const Text(
          'Workout Routines & Splits',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: FitLogTokens.textPrimary,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.fitness_center, color: FitLogTokens.accent),
            tooltip: '330+ Exercise Library',
            onPressed: () {
              ExerciseLibrarySheet.show(
                context,
                onSelect: (ex) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: FitLogTokens.surface2,
                      content: Text(
                        'Browsed: ${ex.name} · ${ex.muscleGroup.displayName}',
                        style: const TextStyle(color: FitLogTokens.accent),
                      ),
                    ),
                  );
                },
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.auto_awesome, color: FitLogTokens.accent),
            tooltip: 'Science Recommendation Blueprint',
            onPressed: _showHealthScienceModal,
          ),
          IconButton(
            icon: const Icon(Icons.add, color: FitLogTokens.textPrimary),
            tooltip: 'Create Custom Routine',
            onPressed: () => _showCreateOrEditRoutineModal(),
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _routines.length,
        itemBuilder: (context, index) {
          final routine = _routines[index];
          final isExpanded = _expandedId == routine.id;

          return Container(
            margin: const EdgeInsets.only(bottom: 14),
            decoration: BoxDecoration(
              color: FitLogTokens.surface,
              borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
              border: Border.all(
                color: isExpanded ? FitLogTokens.accent : Colors.white10,
                width: isExpanded ? 1.5 : 1.0,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: routine.isCustom
                              ? FitLogTokens.prGold.withValues(alpha: 0.15)
                              : FitLogTokens.accent.withValues(alpha: 0.15),
                          borderRadius:
                              BorderRadius.circular(FitLogTokens.radiusControl),
                        ),
                        child: Center(
                          child: Icon(
                            routine.isCustom
                                ? Icons.stars
                                : Icons.fitness_center,
                            color: routine.isCustom
                                ? FitLogTokens.prGold
                                : FitLogTokens.accent,
                            size: 22,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    routine.name,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w800,
                                      color: FitLogTokens.textPrimary,
                                    ),
                                  ),
                                ),
                                if (routine.isCustom)
                                  Container(
                                    margin: const EdgeInsets.only(left: 6),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: FitLogTokens.prGold
                                          .withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Text('CUSTOM',
                                        style: TextStyle(
                                            color: FitLogTokens.prGold,
                                            fontSize: 9,
                                            fontWeight: FontWeight.w900)),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              '${routine.exerciseCount} exercises · ~${routine.estimatedMinutes} min · ${routine.splitCategory}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: FitLogTokens.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: Icon(
                          isExpanded ? Icons.expand_less : Icons.expand_more,
                          color: FitLogTokens.textSecondary,
                        ),
                        onPressed: () {
                          setState(() {
                            _expandedId = isExpanded ? null : routine.id;
                          });
                        },
                      ),
                    ],
                  ),
                ),
                if (isExpanded) ...[
                  const Divider(color: Colors.white10, height: 1),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'EXERCISE SEQUENCE',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.8,
                                color: FitLogTokens.textSecondary,
                              ),
                            ),
                            Row(
                              children: [
                                TextButton.icon(
                                  onPressed: () =>
                                      _showCreateOrEditRoutineModal(
                                          existing: routine),
                                  icon: const Icon(Icons.edit,
                                      size: 14, color: FitLogTokens.accent),
                                  label: const Text('Edit',
                                      style: TextStyle(
                                          color: FitLogTokens.accent,
                                          fontSize: 11)),
                                ),
                                TextButton.icon(
                                  onPressed: () => _duplicateRoutine(routine),
                                  icon: const Icon(Icons.copy,
                                      size: 14,
                                      color: FitLogTokens.textSecondary),
                                  label: const Text('Copy',
                                      style: TextStyle(
                                          color: FitLogTokens.textSecondary,
                                          fontSize: 11)),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        for (var i = 0; i < routine.exercises.length; i++)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Row(
                              children: [
                                Text(
                                  '${i + 1}. ',
                                  style: const TextStyle(
                                    color: FitLogTokens.accent,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                                Text(
                                  routine.exercises[i],
                                  style: const TextStyle(
                                    color: FitLogTokens.textPrimary,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        const SizedBox(height: 14),
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute<void>(
                                builder: (_) => const ActiveWorkoutScreen(),
                              ),
                            );
                          },
                          icon: const Icon(Icons.play_arrow, size: 20),
                          label: const Text('Start Routine Now'),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
