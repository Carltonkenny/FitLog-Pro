import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStimulusVerdict,
  classifyMuscleVolume,
  calculateMuscleBalance,
  detectJunkVolume,
} from '../../src/domain/hypertrophyVerdict.js';

test('VERDICT-DOMAIN-001: classifyMuscleVolume correctly tags sets into sports science volume buckets', () => {
  assert.equal(classifyMuscleVolume(0).status, 'neglected');
  assert.equal(classifyMuscleVolume(4).status, 'maintenance');
  assert.equal(classifyMuscleVolume(12).status, 'optimal_growth');
  assert.equal(classifyMuscleVolume(22).status, 'junk_volume');
});

test('VERDICT-DOMAIN-002: detectJunkVolume flags excessive volume in a single session', () => {
  const normalWorkout = {
    exercises: [
      { name: 'Barbell Flat Bench Press', sets: [{ completed: true, weight: 100, reps: 5 }, { completed: true, weight: 100, reps: 5 }] },
    ],
  };
  const junkWorkout = {
    exercises: [
      {
        name: 'Barbell Flat Bench Press',
        sets: Array.from({ length: 18 }, () => ({ completed: true, weight: 80, reps: 10 })),
      },
    ],
  };

  const normalCheck = detectJunkVolume(normalWorkout);
  assert.equal(normalCheck.hasJunkVolume, false);

  const junkCheck = detectJunkVolume(junkWorkout);
  assert.equal(junkCheck.hasJunkVolume, true);
  assert.ok(junkCheck.warnings.length > 0);
  assert.match(junkCheck.warnings[0].message, /junk volume/i);
});

test('VERDICT-DOMAIN-003: calculateMuscleBalance detects anterior/posterior chest-to-back imbalances', () => {
  // Heavy chest, zero back
  const weeklySets = {
    chest: 16,
    back: 2,
    legs: 10,
    shoulders: 8,
    arms: 6,
    core: 4,
  };

  const balance = calculateMuscleBalance(weeklySets);
  assert.equal(balance.isImbalanced, true);
  assert.ok(balance.warnings.some((w) => w.type === 'chest_back_ratio'));
  assert.match(balance.warnings[0].remedy, /pulling|back/i);
});

test('VERDICT-DOMAIN-004: calculateStimulusVerdict gives unvarnished score and verdict', () => {
  const activeWorkout = {
    title: 'Push Day',
    exercises: [
      {
        name: 'Barbell Flat Bench Press',
        sets: [
          { completed: true, weight: 100, reps: 5 },
          { completed: true, weight: 100, reps: 5 },
          { completed: true, weight: 100, reps: 5 },
        ],
      },
    ],
  };

  const history = [
    {
      timestamp: Date.now() - 86400000 * 2,
      exercises: [
        {
          name: 'Barbell Flat Bench Press',
          sets: [{ completed: true, weight: 95, reps: 5 }],
        },
      ],
    },
  ];

  const verdict = calculateStimulusVerdict(activeWorkout, history);
  assert.ok(verdict.score >= 0 && verdict.score <= 100);
  assert.ok(['S', 'A', 'B', 'C', 'D', 'F'].includes(verdict.grade));
  assert.ok(verdict.unvarnishedTruth.length > 0);
  assert.equal(verdict.ghostDefeatedCount, 1);
});

