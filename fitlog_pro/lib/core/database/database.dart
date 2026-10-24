import 'package:drift/drift.dart';

/// Relational table for logged workouts and templates.
class Workouts extends Table {
  TextColumn get id => text()();
  TextColumn get title => text().withLength(min: 1, max: 100)();
  DateTimeColumn get startedAt => dateTime()();
  DateTimeColumn get completedAt => dateTime().nullable()();
  IntColumn get durationSeconds => integer().withDefault(const Constant(0))();
  RealColumn get volumeKg => real().withDefault(const Constant(0.0))();
  IntColumn get totalSets => integer().withDefault(const Constant(0))();
  BoolColumn get isTemplate => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}

/// Relational table for individual sets. Every set commits immediately for zero data loss.
class WorkoutSetsTable extends Table {
  TextColumn get id => text()();
  TextColumn get workoutId => text()();
  TextColumn get exerciseId => text()();
  IntColumn get setOrder => integer()();
  RealColumn get weightKg => real()();
  IntColumn get reps => integer()();
  BoolColumn get isCompleted => boolean().withDefault(const Constant(false))();
  TextColumn get setType => text().withDefault(const Constant('normal'))();
  DateTimeColumn get completedAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Relational table for Personal Records calculated via Epley formula.
class PersonalRecordsTable extends Table {
  TextColumn get id => text()();
  TextColumn get exerciseId => text()();
  TextColumn get exerciseName => text()();
  RealColumn get weightKg => real()();
  IntColumn get reps => integer()();
  RealColumn get oneRepMax => real()();
  DateTimeColumn get achievedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Relational table for body weight and body fat logs.
class BodyStatsTable extends Table {
  TextColumn get id => text()();
  RealColumn get weightKg => real()();
  RealColumn get bodyFatPct => real().nullable()();
  DateTimeColumn get loggedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}
