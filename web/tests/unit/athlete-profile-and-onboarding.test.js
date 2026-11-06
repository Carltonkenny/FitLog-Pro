import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, updateAthleteProfile, getUserData, resetUserData } from '../../src/lib/userData.js';
import { buildContext } from '../../src/lib/coachPrompt.js';
import { parseChatReply } from '../../src/lib/companionActions.js';

test('athlete profile normalization and safe bounds', () => {
  const norm = normalize({
    memory: {
      athleteProfile: {
        name: '  Alex Hunter   ',
        age: '27',
        occupation: 'Software Engineer at Tech Corp',
        goal: 'Add 10kg to barbell bench press',
      },
    },
  });

  assert.equal(norm.memory.athleteProfile.name, 'Alex Hunter');
  assert.equal(norm.memory.athleteProfile.age, 27);
  assert.equal(norm.memory.athleteProfile.occupation, 'Software Engineer at Tech Corp');
  assert.equal(norm.memory.athleteProfile.goal, 'Add 10kg to barbell bench press');

  // Test out-of-bounds rejection
  const bad = normalize({
    memory: {
      athleteProfile: {
        name: 12345,
        age: 999, // Should be clamped or rejected
        occupation: null,
      },
    },
  });
  assert.equal(bad.memory.athleteProfile.name, '');
  assert.equal(bad.memory.athleteProfile.age, 120); // Clamped to max age 120
});

test('athlete profile immutability for fixed variables (name, age, occupation)', () => {
  resetUserData();

  // Initial intake
  const p1 = updateAthleteProfile({
    name: 'Marcus Jr',
    age: 28,
    occupation: 'Architect',
    goal: 'Hypertrophy & raw strength',
  });
  assert.equal(p1.name, 'Marcus Jr');
  assert.equal(p1.age, 28);
  assert.equal(p1.occupation, 'Architect');
  assert.equal(p1.goal, 'Hypertrophy & raw strength');

  // Subsequent conversation turn attempts to change name/age
  const p2 = updateAthleteProfile({
    name: 'Hacker',
    age: 99,
    occupation: 'Astronaut',
    goal: 'Lean out for summer cut',
  });

  // Fixed variables MUST NOT change
  assert.equal(p2.name, 'Marcus Jr', 'Name must be immutable once established');
  assert.equal(p2.age, 28, 'Age must be immutable once established');
  assert.equal(p2.occupation, 'Architect', 'Occupation must be immutable once established');
  // Dynamic goal CAN evolve
  assert.equal(p2.goal, 'Lean out for summer cut', 'Goal is dynamic and can update');
});

test('buildContext includes temporal context and relative session elapsed time', () => {
  const morningDate = new Date('2026-11-06T09:30:00');
  const context1 = buildContext({
    history: [],
    prs: {},
    athleteProfile: { name: 'Sarah', age: 24, occupation: 'Designer', goal: 'Strength' },
    now: morningDate,
  });

  assert.match(context1, /Friday, Nov 6, 2026 at 9:30 AM \(Morning\)/);
  assert.match(context1, /No previous workouts logged/);
  assert.match(context1, /Sarah/);

  // 2 days ago workout
  const twoDaysAgo = new Date(morningDate.getTime() - 86400000 * 2).getTime();
  const context2 = buildContext({
    history: [{ timestamp: twoDaysAgo, title: 'Upper Power', exercises: [] }],
    prs: {},
    athleteProfile: { name: 'Sarah', age: 24 },
    now: morningDate,
  });

  assert.match(context2, /Last workout was 2 days ago \("Upper Power"\)/);
});

test('parseChatReply handles update_profile action correctly', () => {
  const modelReply = JSON.stringify({
    reply: "Good to meet you, Alex. Desk job by day, iron house by night.",
    remember: ["Alex is a software engineer"],
    actions: [
      {
        type: "update_profile",
        athleteName: "Alex",
        age: 27,
        occupation: "Software Engineer",
        goal: "Build chest thickness",
      },
    ],
  });

  const parsed = parseChatReply(modelReply);
  assert.equal(parsed.reply, "Good to meet you, Alex. Desk job by day, iron house by night.");
  assert.equal(parsed.actions.length, 1);
  assert.equal(parsed.actions[0].type, 'update_profile');
  assert.equal(parsed.actions[0].athleteName, 'Alex');
  assert.equal(parsed.actions[0].age, 27);
  assert.equal(parsed.actions[0].occupation, 'Software Engineer');
  assert.equal(parsed.actions[0].goal, 'Build chest thickness');
});
