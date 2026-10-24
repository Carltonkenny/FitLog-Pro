enum MuscleGroup {
  chest('Chest', 'Pectoralis Major & Minor'),
  back('Back & Lats', 'Latissimus Dorsi, Rhomboids, Mid-Traps'),
  shoulders('Shoulders', 'Anterior, Lateral & Posterior Deltoids'),
  biceps('Biceps', 'Biceps Brachii & Brachialis'),
  triceps('Triceps', 'Triceps Brachii (3 Heads)'),
  quads('Quads', 'Quadriceps Femoris & Vatus Lateralis'),
  hamstrings('Hamstrings & Glutes', 'Biceps Femoris & Gluteus Maximus'),
  calves('Calves', 'Gastrocnemius & Soleus'),
  core('Core & Abs', 'Rectus Abdominis & Transverse Abdominis'),
  traps('Traps & Forearms', 'Upper Trapezius & Wrist Flexors');

  final String displayName;
  final String anatomicalDescription;

  const MuscleGroup(this.displayName, this.anatomicalDescription);
}

enum EquipmentType {
  barbell('Barbell'),
  dumbbell('Dumbbell'),
  cable('Cable'),
  machine('Machine'),
  bodyweight('Bodyweight'),
  smithMachine('Smith Machine');

  final String displayName;

  const EquipmentType(this.displayName);
}

enum ExerciseMechanic {
  compound('Compound'),
  isolation('Isolation');

  final String displayName;

  const ExerciseMechanic(this.displayName);
}

class Exercise {
  final String id;
  final String name;
  final MuscleGroup muscleGroup;
  final EquipmentType equipment;
  final ExerciseMechanic mechanic;
  final String description;
  final List<String> secondaryMuscles;

  const Exercise({
    required this.id,
    required this.name,
    required this.muscleGroup,
    required this.equipment,
    required this.mechanic,
    this.description = '',
    this.secondaryMuscles = const [],
  });
}
