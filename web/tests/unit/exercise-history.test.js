import test from 'node:test';
import assert from 'node:assert/strict';
import { WorkoutStore } from '../../src/lib/workoutStore.js';

test('EXERCISE-HIST-001: getLastSessionForExercise matches by exerciseId, id, and exerciseName', () => {
  // Clear any state and prepare mock history
  const sampleHistory = [
    {
      id: 'wo-1',
      title: 'Push Day',
      timestamp: Date.now() - 86400000 * 2, // 2 days ago
      volumeKg: 1500,
      exercises: [
        {
          exerciseId: 'bench_press',
          exerciseName: 'Barbell Flat Bench Press',
          sets: [
            { weight: 100, reps: 5, completed: true },
            { weight: 100, reps: 6, completed: true },
          ],
        },
        {
          id: 'incline_dumbbell_press',
          name: 'Incline Dumbbell Press',
          sets: [
            { weight: 32, reps: 8, completed: true },
          ],
        },
      ],
    },
  ];

  // Save to localStorage
  localStorage.setItem('fitlog_workout_history', JSON.stringify(sampleHistory));

  // Match by exact exerciseId
  const matchById = WorkoutStore.getLastSessionForExercise('bench_press');
  assert.ok(matchById, 'Should find session by exerciseId');
  assert.equal(matchById.bestSet.weight, 100);
  assert.equal(matchById.bestSet.reps, 6);

  // Match by exact exerciseName
  const matchByName = WorkoutStore.getLastSessionForExercise('Barbell Flat Bench Press');
  assert.ok(matchByName, 'Should find session by exact exerciseName');
  assert.equal(matchByName.bestSet.weight, 100);

  // Match by case-insensitive name
  const matchCase = WorkoutStore.getLastSessionForExercise('barbell flat bench press');
  assert.ok(matchCase, 'Should find session case-insensitively');

  // Match exercise with 'id' instead of 'exerciseId'
  const matchIdProp = WorkoutStore.getLastSessionForExercise('incline_dumbbell_press');
  assert.ok(matchIdProp, 'Should find session where property was id');
  assert.equal(matchIdProp.bestSet.weight, 32);
});

test('EXERCISE-HIST-002: getAllExercisesHistory aggregates every exercise ever performed', () => {
  const history = [
    {
      id: 'wo-1',
      title: 'Chest & Back',
      timestamp: Date.now() - 86400000 * 4,
      volumeKg: 2000,
      exercises: [
        {
          exerciseId: 'bench_press',
          exerciseName: 'Barbell Flat Bench Press',
          sets: [
            { weight: 90, reps: 8, completed: true },
            { weight: 90, reps: 8, completed: true },
          ],
        },
        {
          exerciseId: 'lat_pulldown',
          exerciseName: 'Lat Pulldown',
          sets: [
            { weight: 50, reps: 10, completed: true },
          ],
        },
      ],
    },
    {
      id: 'wo-2',
      title: 'Push Power',
      timestamp: Date.now() - 86400000 * 1,
      volumeKg: 1800,
      exercises: [
        {
          exerciseId: 'bench_press',
          exerciseName: 'Barbell Flat Bench Press',
          sets: [
            { weight: 95, reps: 8, completed: true },
            { weight: 100, reps: 5, completed: true },
          ],
        },
      ],
    },
  ];

  localStorage.setItem('fitlog_workout_history', JSON.stringify(history));

  const allExercises = WorkoutStore.getAllExercisesHistory();
  assert.ok(Array.isArray(allExercises), 'Should return an array');
  assert.equal(allExercises.length, 2, 'Should aggregate 2 distinct exercises');

  const bench = allExercises.find((e) => e.exerciseId === 'bench_press');
  assert.ok(bench, 'Bench press should be present in history');
  assert.equal(bench.timesPerformed, 2, 'Bench press performed in 2 workouts');
  assert.equal(bench.totalSets, 4, 'Total completed sets should be 4');
  assert.equal(bench.lastWeight, 100, 'Last weight should be from most recent session');
  assert.equal(bench.lastReps, 5, 'Last reps should be from most recent session');
  assert.ok(bench.best1RM > 0, 'Best 1RM should be calculated');

  const lats = allExercises.find((e) => e.exerciseId === 'lat_pulldown');
  assert.ok(lats, 'Lat pulldown should be present in history');
  assert.equal(lats.timesPerformed, 1);
});

test('EXERCISE-HIST-003: getExerciseHistory returns detailed chronological drill-down', () => {
  const history = [
    {
      id: 'wo-1',
      title: 'Session 1',
      timestamp: 1000000,
      volumeKg: 500,
      exercises: [
        {
          exerciseId: 'squat',
          exerciseName: 'Barbell Back Squat',
          sets: [{ weight: 100, reps: 5, completed: true }],
        },
      ],
    },
    {
      id: 'wo-2',
      title: 'Session 2',
      timestamp: 2000000,
      volumeKg: 600,
      exercises: [
        {
          exerciseId: 'squat',
          exerciseName: 'Barbell Back Squat',
          sets: [{ weight: 110, reps: 5, completed: true }],
        },
      ],
    },
  ];

  localStorage.setItem('fitlog_workout_history', JSON.stringify(history));

  const detail = WorkoutStore.getExerciseHistory('squat');
  assert.ok(detail, 'Detailed history should exist');
  assert.equal(detail.exerciseName, 'Barbell Back Squat');
  assert.equal(detail.sessions.length, 2);
  // Newest session first
  assert.equal(detail.sessions[0].bestSet.weight, 110);
  assert.equal(detail.sessions[1].bestSet.weight, 100);
});

