import test from 'node:test';
import assert from 'node:assert/strict';
import { deepgramRateLimiter } from '../../src/lib/deepgramTts.js';
import { buildSystem, buildContext } from '../../src/lib/coachPrompt.js';

test('DEEPGRAM-RATELIMIT: rate limiter enforces requests per minute budget', () => {
  // Fresh rate limiter instance for isolation
  const limiter = new deepgramRateLimiter.constructor(3, 1000);

  // First 3 requests under budget
  const c1 = limiter.canConsume(50);
  assert.equal(c1.allowed, true);
  limiter.recordConsumption(50);

  const c2 = limiter.canConsume(50);
  assert.equal(c2.allowed, true);
  limiter.recordConsumption(50);

  const c3 = limiter.canConsume(50);
  assert.equal(c3.allowed, true);
  limiter.recordConsumption(50);

  // 4th request must be rejected
  const c4 = limiter.canConsume(50);
  assert.equal(c4.allowed, false);
  assert.match(c4.reason, /Rate limit exceeded/);
  assert.ok(c4.retryAfterMs > 0);
});

test('DEEPGRAM-RATELIMIT: character quota enforces volume budget', () => {
  const limiter = new deepgramRateLimiter.constructor(10, 200);

  const c1 = limiter.canConsume(150);
  assert.equal(c1.allowed, true);
  limiter.recordConsumption(150);

  // Attempting to consume 100 more when budget is 200 (150 + 100 = 250 > 200)
  const c2 = limiter.canConsume(100);
  assert.equal(c2.allowed, false);
  assert.match(c2.reason, /Character quota exceeded/);
});

test('PROMPT-SYSTEM-SPEC: prompt incorporates audio-first phonetics & dynamic rest', () => {
  const sys = buildSystem({ petName: 'Coach Marcus' });
  assert.ok(sys.includes('AUDIO-FIRST PHONETIC DELIVERY (DEEPGRAM NEURAL SPEECH)'));
  assert.ok(sys.includes('Dynamic Rest Guidance'));
  assert.ok(sys.includes('Never echo the lifter verbatim'));
  assert.ok(sys.includes('log_set'));
  assert.ok(sys.includes('set_timer'));
});

test('PROMPT-CONTEXT-SPEC: context includes fatigue and weekly consistency tracking', () => {
  const now = new Date('2026-11-06T12:00:00Z');
  const history = [
    {
      timestamp: now.getTime() - 86400000,
      title: 'Push Day',
      volumeKg: 3000,
      exercises: [
        {
          name: 'Barbell Flat Bench Press',
          sets: [{ completed: true, weight: 100, reps: 5 }],
        },
      ],
    },
  ];

  const ctx = buildContext({ history, now });
  assert.ok(ctx.includes('TRAINING CONSISTENCY & FATIGUE'));
  assert.ok(ctx.includes('Streak: 1 days'));
  assert.ok(ctx.includes('Weekly Volume: 1 sessions in last 7 days'));
  assert.ok(ctx.includes('Well-rested / high recovery capacity'));
});

