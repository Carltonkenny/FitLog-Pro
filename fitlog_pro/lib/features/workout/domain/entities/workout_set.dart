/// Set categorization for workout sets (warmup, drop set, normal, failure).
enum SetType { normal, warmup, dropSet, failure }

/// Immutable pure Dart entity representing a single workout set.
final class WorkoutSet {
  final String id;
  final int setOrder;
  final double weightKg;
  final int reps;
  final bool isCompleted;
  final SetType type;
  final DateTime? completedAt;

  const WorkoutSet({
    this.id = '',
    required this.setOrder,
    required this.weightKg,
    required this.reps,
    this.isCompleted = false,
    this.type = SetType.normal,
    this.completedAt,
  });

  WorkoutSet copyWith({
    String? id,
    int? setOrder,
    double? weightKg,
    int? reps,
    bool? isCompleted,
    SetType? type,
    DateTime? completedAt,
  }) {
    return WorkoutSet(
      id: id ?? this.id,
      setOrder: setOrder ?? this.setOrder,
      weightKg: weightKg ?? this.weightKg,
      reps: reps ?? this.reps,
      isCompleted: isCompleted ?? this.isCompleted,
      type: type ?? this.type,
      completedAt: completedAt ?? this.completedAt,
    );
  }
}
