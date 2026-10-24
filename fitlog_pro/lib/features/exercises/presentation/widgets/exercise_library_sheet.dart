import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';
import '../../domain/entities/exercise.dart';
import '../../data/exercise_database.dart';

/// Interactive modal sheet allowing users to search, filter by muscle anatomy
/// and equipment type across 330+ exercises, and pick exercises for routines or workouts.
class ExerciseLibrarySheet extends StatefulWidget {
  final ValueChanged<Exercise> onSelectExercise;

  const ExerciseLibrarySheet({
    super.key,
    required this.onSelectExercise,
  });

  static Future<Exercise?> show(
    BuildContext context, {
    required ValueChanged<Exercise> onSelect,
  }) {
    return showModalBottomSheet<Exercise>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => ExerciseLibrarySheet(
        onSelectExercise: (ex) {
          onSelect(ex);
          Navigator.of(ctx).pop(ex);
        },
      ),
    );
  }

  @override
  State<ExerciseLibrarySheet> createState() => _ExerciseLibrarySheetState();
}

class _ExerciseLibrarySheetState extends State<ExerciseLibrarySheet> {
  final TextEditingController _searchController = TextEditingController();
  MuscleGroup? _selectedMuscleGroup;
  EquipmentType? _selectedEquipment;
  ExerciseMechanic? _selectedMechanic;
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = ExerciseDatabase.filter(
      muscleGroup: _selectedMuscleGroup,
      equipment: _selectedEquipment,
      mechanic: _selectedMechanic,
      query: _searchQuery,
    );

    final height = MediaQuery.of(context).size.height * 0.88;

    return Container(
      height: height,
      decoration: const BoxDecoration(
        color: FitLogTokens.bg,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(top: BorderSide(color: FitLogTokens.accent, width: 2)),
      ),
      child: Column(
        children: [
          // Drag Handle
          const SizedBox(height: 12),
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 14),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.fitness_center,
                        color: FitLogTokens.accent, size: 22),
                    const SizedBox(width: 8),
                    const Text(
                      'Exercise Library',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: FitLogTokens.textPrimary,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: FitLogTokens.surface2,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${ExerciseDatabase.totalCount}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: FitLogTokens.accent,
                        ),
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close,
                      color: FitLogTokens.textSecondary),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Search Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(
                  color: FitLogTokens.textPrimary, fontSize: 14),
              decoration: InputDecoration(
                hintText:
                    'Search 330+ exercises (e.g. Incline, Squat, Delts)...',
                hintStyle: const TextStyle(
                    color: FitLogTokens.textSecondary, fontSize: 13),
                prefixIcon: const Icon(Icons.search,
                    color: FitLogTokens.accent, size: 20),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear,
                            size: 18, color: Colors.white54),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: FitLogTokens.surface,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                border: OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(FitLogTokens.radiusControl),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Muscle Group Anatomy Filter Chips (Horizontal)
          SizedBox(
            height: 34,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                _buildFilterChip(
                  label: 'All Muscles',
                  isSelected: _selectedMuscleGroup == null,
                  onTap: () => setState(() => _selectedMuscleGroup = null),
                ),
                for (final mg in MuscleGroup.values) ...[
                  const SizedBox(width: 6),
                  _buildFilterChip(
                    label: mg.displayName,
                    isSelected: _selectedMuscleGroup == mg,
                    onTap: () => setState(() => _selectedMuscleGroup = mg),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Equipment Type Filter Chips
          SizedBox(
            height: 32,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                _buildFilterChip(
                  label: 'All Equipment',
                  isSelected: _selectedEquipment == null,
                  onTap: () => setState(() => _selectedEquipment = null),
                  isSecondary: true,
                ),
                for (final eq in EquipmentType.values) ...[
                  const SizedBox(width: 6),
                  _buildFilterChip(
                    label: eq.displayName,
                    isSelected: _selectedEquipment == eq,
                    onTap: () => setState(() => _selectedEquipment = eq),
                    isSecondary: true,
                  ),
                ],
                const SizedBox(width: 8),
                _buildFilterChip(
                  label: 'Compound',
                  isSelected: _selectedMechanic == ExerciseMechanic.compound,
                  onTap: () => setState(() {
                    _selectedMechanic =
                        _selectedMechanic == ExerciseMechanic.compound
                            ? null
                            : ExerciseMechanic.compound;
                  }),
                  isSecondary: true,
                ),
                const SizedBox(width: 6),
                _buildFilterChip(
                  label: 'Isolation',
                  isSelected: _selectedMechanic == ExerciseMechanic.isolation,
                  onTap: () => setState(() {
                    _selectedMechanic =
                        _selectedMechanic == ExerciseMechanic.isolation
                            ? null
                            : ExerciseMechanic.isolation;
                  }),
                  isSecondary: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Filter Summary Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Showing ${filtered.length} of ${ExerciseDatabase.totalCount} exercises',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: FitLogTokens.textSecondary,
                  ),
                ),
                if (_selectedMuscleGroup != null ||
                    _selectedEquipment != null ||
                    _selectedMechanic != null ||
                    _searchQuery.isNotEmpty)
                  GestureDetector(
                    onTap: () {
                      _searchController.clear();
                      setState(() {
                        _selectedMuscleGroup = null;
                        _selectedEquipment = null;
                        _selectedMechanic = null;
                        _searchQuery = '';
                      });
                    },
                    child: const Text(
                      'Reset Filters',
                      style: TextStyle(
                        fontSize: 11,
                        color: FitLogTokens.accent,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const Divider(color: Colors.white12, height: 16),

          // Exercise List View
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.search_off,
                            size: 48, color: FitLogTokens.textSecondary),
                        const SizedBox(height: 12),
                        const Text(
                          'No exercises match your criteria',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: FitLogTokens.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Try relaxing your anatomy or equipment filters',
                          style: TextStyle(
                              color: FitLogTokens.textSecondary, fontSize: 12),
                        ),
                        const SizedBox(height: 16),
                        OutlinedButton(
                          onPressed: () {
                            _searchController.clear();
                            setState(() {
                              _selectedMuscleGroup = null;
                              _selectedEquipment = null;
                              _selectedMechanic = null;
                              _searchQuery = '';
                            });
                          },
                          child: const Text('Clear All Filters'),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final ex = filtered[index];
                      return _buildExerciseCard(ex);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    bool isSecondary = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? (isSecondary
                  ? FitLogTokens.accent.withValues(alpha: 0.25)
                  : FitLogTokens.accent)
              : FitLogTokens.surface,
          borderRadius: BorderRadius.circular(FitLogTokens.radiusPill),
          border: Border.all(
            color: isSelected ? FitLogTokens.accent : Colors.white10,
            width: 1,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: isSelected
                  ? (isSecondary ? FitLogTokens.accent : FitLogTokens.onAccent)
                  : FitLogTokens.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildExerciseCard(Exercise ex) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: FitLogTokens.surface,
        borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
        border: Border.all(color: Colors.white10),
      ),
      child: InkWell(
        onTap: () => widget.onSelectExercise(ex),
        borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        ex.name,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: FitLogTokens.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        ex.muscleGroup.anatomicalDescription,
                        style: const TextStyle(
                          fontSize: 11,
                          color: FitLogTokens.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () => widget.onSelectExercise(ex),
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        FitLogTokens.accent.withValues(alpha: 0.15),
                    foregroundColor: FitLogTokens.accent,
                    elevation: 0,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    minimumSize: const Size(0, 32),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: const BorderSide(
                          color: FitLogTokens.accent, width: 1),
                    ),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.add, size: 14),
                      SizedBox(width: 4),
                      Text('Add',
                          style: TextStyle(
                              fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Anatomy & Equipment Tag Row
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: [
                _buildTag(ex.muscleGroup.displayName, FitLogTokens.accent),
                _buildTag(ex.equipment.displayName, Colors.lightBlueAccent),
                _buildTag(ex.mechanic.displayName, Colors.purpleAccent),
                for (final sec in ex.secondaryMuscles)
                  _buildTag('+ $sec', FitLogTokens.textSecondary,
                      isOutline: true),
              ],
            ),

            if (ex.description.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                ex.description,
                style: const TextStyle(
                  fontSize: 11,
                  color: FitLogTokens.textSecondary,
                  height: 1.3,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTag(String text, Color color, {bool isOutline = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: isOutline ? Colors.transparent : color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: isOutline ? Colors.white24 : color.withValues(alpha: 0.5),
          width: 0.8,
        ),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: isOutline ? FitLogTokens.textSecondary : color,
        ),
      ),
    );
  }
}
