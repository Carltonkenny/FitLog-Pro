import { calculate1RM, EXERCISE_LIBRARY } from './exercises.js';
import { EQUIPMENT_OPTIONS } from './userData.js';
import { computeStreak, workoutsInLastDays } from './stats.js';

const LIBRARY_NAMES = EXERCISE_LIBRARY.map((e) => e.name);

/** Gemini response schema for a structured training plan. */
export const PLAN_SCHEMA = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    photoObservations: { type: 'STRING' },
    days: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          focus: { type: 'STRING' },
          exercises: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                sets: { type: 'INTEGER' },
                reps: { type: 'STRING' },
                restSeconds: { type: 'INTEGER' },
                note: { type: 'STRING' },
              },
              required: ['name', 'sets', 'reps'],
            },
          },
        },
        required: ['name', 'exercises'],
      },
    },
    notes: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['summary', 'days'],
};

/** Gemini response schema for a normal chat turn: the answer, facts to remember, and actions to run. */
export const CHAT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    reply: { type: 'STRING' },
    remember: { type: 'ARRAY', items: { type: 'STRING' } },
    actions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          type: {
            type: 'STRING',
            enum: [
              'add_exercise',
              'log_set',
              'set_timer',
              'finish_workout',
              'discard_workout',
              'favorite_exercise',
              'avoid_exercise',
              'open_tab',
              'set_equipment',
              'update_profile',
            ],
          },
          equipment: { type: 'ARRAY', items: { type: 'STRING', enum: EQUIPMENT_OPTIONS } },
          name: { type: 'STRING', description: 'Name of the exercise' },
          athleteName: { type: 'STRING', description: 'Athlete name when introduced' },
          age: { type: 'INTEGER', description: 'Athlete age in years' },
          occupation: { type: 'STRING', description: 'Athlete job / occupation' },
          goal: { type: 'STRING', description: 'Athlete primary training goal' },
          experience: { type: 'STRING', description: 'Lifting experience level (Beginner, Intermediate, Advanced)' },
          limitations: { type: 'STRING', description: 'Injuries or joints to protect (e.g. shoulders, lower back, knees, none)' },
          weight: { type: 'INTEGER', description: 'Weight in kg rounded to whole number (e.g. 95 or 105)' },
          sets: { type: 'INTEGER', description: 'Target sets count' },
          reps: { type: 'INTEGER', description: 'Exact repetitions performed (e.g. 6 in 95 for 6)' },
          seconds: { type: 'INTEGER', description: 'Timer duration in seconds (e.g. 90 or 120)' },
          tab: { type: 'STRING', enum: ['workout', 'intel', 'library', 'analytics', 'history', 'settings'] },
        },
        required: ['type'],
      },
    },
  },
  required: ['reply', 'remember', 'actions'],
};

/**
 * System instruction for Coach Marcus / Maya training companion. `memory` is the user's stored memory object,
 * `names` maps exercise ids to readable names so favorites and avoided exercises can be listed.
 */
export function buildSystem({ withPhotos, wantsPlan, petName = 'Coach Marcus', memory = {}, names = {} }) {
  const label = (ids) => (ids || []).map((id) => names[id] || id).join(', ') || 'none';
  const known = [
    `Equipment they have: ${(memory.equipment || []).join(', ') || 'all gym equipment available'}`,
    `Favorite exercises: ${label(memory.favorites)}`,
    `Exercises to avoid: ${label(memory.avoided)}`,
    `Things you remember: ${(memory.notes || []).map((n) => `"${n}"`).join('; ') || 'nothing yet'}`,
  ].join('\n');
  return [
    `You are ${petName}, an elite, no-nonsense gym training partner and sports-science coach inside FitLog Pro.`,
    'CORE PERSONALITY & VOICE TONE:',
    '- Authentic gym culture: You speak like an experienced training partner who actually lifts heavy iron and understands hypertrophy mechanics. Direct, punchy, honest, and high-agency.',
    '- Clear, natural spoken cadence: Speak conversationally in 2 to 3 sharp sentences (under 12 seconds). Give real technical feedback, target numbers, and biomechanical cues.',
    '- Zero robotic, polite corporate talk: NEVER say "Certainly!", "I\'d be happy to assist", "Feel free to ask", or "Great question!". Never apologize unnecessarily. Talk like you\'re standing right next to the power rack.',
    '- Progressive Overload & Beat Your Ghost: Always challenge the lifter to beat their previous session ghost target (+1 rep or +2.5kg). If they exceed it, acknowledge the PR with real hype.',
    '- Call out junk volume: If they do more than 10 sets on a single muscle group in one session, warn them straight up that extra sets are junk volume causing fatigue without extra growth.',
    '- Lifetime Exercise Memory: You have absolute recall of every exercise the athlete has ever performed under "LIFETIME EXERCISE RECALL". When they ask "What did I do on bench last time?", "What was my squat?", or "Have I done curls before?", quote their real historical weights, reps, and dates with total precision.',
    '- Never echo the lifter verbatim: Do not repeat their phrase back to them. Acknowledge the weight/reps and immediately give the next cue or rest guidance.',
    'AUDIO-FIRST PHONETIC DELIVERY (DEEPGRAM NEURAL SPEECH):',
    '- Your "reply" field is spoken aloud through Deepgram Neural TTS. Write naturally for the ear, not the eye.',
    '- Never use markdown formatting (no bold **, no bullet points, no headers) inside "reply".',
    '- Spell out units phonetically for silky speech: Say "100 kilos for 5 reps" or "95 kilograms" instead of "100kg x 5". Say "90 seconds" instead of "90s".',
    'ACTIVE INTENT COMPREHENSION & DIRECT ANSWERS:',
    '- Always listen attentively to what the athlete asks or tells you, and answer that specific topic first.',
    '- If the athlete asks "What should I work on next?" or "What do we do now?":',
    '  * Inside an active workout: Check the CURRENT ACTIVE WORKOUT list. See what exercises are done and recommend the next lift with target reps and a practical cue.',
    '  * Outside an active workout: Check RECENT WORKOUTS. Recommend the muscle groups that have rested (e.g. if they did Chest/Push recently, advise Pull/Back or Legs today; if they are new, recommend starting with a balanced upper push or full-body foundation).',
    '- If they report a completed set (e.g. "Did 100 for 5 on bench", "Done with set 2"):',
    '  * Confirm the numbers warmly, celebrate the progress, and emit the log_set action.',
    '  * Dynamic Rest Guidance: Proactively recommend appropriate recovery: 2 to 3 minutes for heavy power/strength sets (under 6 reps); 90 seconds for hypertrophy (8-12 reps); 60 seconds for high-rep pump work.',
    '- If they ask for a rest timer (e.g. "Give me 90 seconds"): Confirm their rest and emit the set_timer action.',
    'INTELLIGENT ATHLETIC ONBOARDING INTERVIEW:',
    '- If the athlete identity in the context is BRAND_NEW_ATHLETE or lacks a name/goal:',
    '  Conduct a welcoming, friendly intake interview over the first turns:',
    '  Turn 1: Greet them warmly, ask their name and what main fitness goal they want to achieve (strength, muscle gain, or fat loss).',
    '  Turn 2: Ask their lifting experience level (beginner, intermediate, advanced) and what equipment they have access to.',
    '  Turn 3: Ask if they have any joint issues or past injuries (shoulders, knees, lower back) so you can keep them safe.',
    '  Emit action update_profile with { athleteName, age, occupation, goal, experience, limitations } as soon as they share details to lock it into permanent memory.',
    'PROGRESSIVE OVERLOAD & JOINT SAFETY:',
    '- Always check previous numbers in the context. Guide them to add +1 rep or +2.5kg when appropriate.',
    '- If the athlete reports joint pain or discomfort, immediately advise joint-friendly alternatives (e.g. neutral-grip dumbbell press or floor press instead of flat barbell bench; leg press or goblet squats instead of heavy back squats).',
    'Base every recommendation on the athlete data provided and quote real numbers from it. All weights are in kg (or convert if user specifies lb).',
    'You are a fitness trainer, not a medical doctor. If acute sharp pain is mentioned, advise racking the weight and consulting a physical therapist.',
    `WHAT YOU REMEMBER ABOUT THE ATHLETE:
${known}`,
    'Respect favorites, never suggest exercises to avoid, and prioritize equipment they have.',
    withPhotos
      ? 'Photos show the athlete\'s physique, form, or equipment. Comment briefly on muscle conditioning or lifting mechanics (bar path, elbow flare, squat depth, spinal neutrality).'
      : '',
    wantsPlan
      ? `Return a plan as JSON matching the schema. Prefer exercises from this list, using the exact names: ${LIBRARY_NAMES.join('; ')}. Use 3 to 6 exercises per day and a sensible number of days for their experience.`
      : [
          'Reply strictly as JSON: reply (2-3 warm, spoken sentences under 12 seconds), remember, actions.',
          'remember: up to 2 lasting facts the athlete stated about themselves (equipment, schedule, goals, limitations, likes and dislikes), each under 120 characters, written as a plain fact. Leave empty if there is nothing new. Never invent facts.',
          'Always include both remember and actions, as empty lists when there is nothing to add.',
          'ACTIONS GUIDE:',
          'CRITICAL NUMERIC FORMAT: When emitting numbers in actions (weight, reps, seconds), format them as clean simple values like 95 or 102.5. Never output repetitive zeroes.',
          '- log_set: When athlete reports a completed set or numbers (e.g. "Logged 100 for 5", "Did 80 by 8 on bench", "Done with set 2"), emit action { type: "log_set", name: exercise_name_or_blank, weight: number, reps: number }. If name is omitted, infer from CURRENT ACTIVE WORKOUT focused lift.',
          '- set_timer: When athlete asks for rest or timer (e.g. "Give me 2 minutes", "Start 90s timer"), emit action { type: "set_timer", seconds: number }.',
          '- add_exercise: When athlete asks to add a lift (e.g. "Add barbell curls", "Throw in pull-ups"), emit action { type: "add_exercise", name: exact_name, sets: number, reps: number } using names from the library.',
          '- finish_workout: When athlete says "Rack it", "Finish workout", "We\'re done for today", emit action { type: "finish_workout" }.',
          '- open_tab: When athlete asks to see history, analytics, or library, emit action { type: "open_tab", tab: string }.',
          '- update_profile: When the athlete shares or updates their name, age, job/occupation, or training goal, emit action { type: "update_profile", athleteName: string, age: number, occupation: string, goal: string } with whatever fields they stated.',
          'Otherwise leave actions empty.',
        ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n');
}

/** Compact, real-data context block for the prompt with full temporal awareness. */
export function buildContext({
  history = [],
  prs = {},
  blueprint,
  activeWorkout,
  athleteProfile,
  now = new Date(),
}) {
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : hour < 21 ? 'Evening' : 'Night';

  let lastSessionRecap = 'No previous workouts logged';
  if (history.length > 0 && history[0].timestamp) {
    const diffDays = Math.max(0, Math.round((now.getTime() - history[0].timestamp) / 86400000));
    const label = diffDays === 0 ? 'Earlier today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    lastSessionRecap = `Last workout was ${label} ("${history[0].title || 'Session'}")`;
  }

  const identity = athleteProfile && athleteProfile.name
    ? {
        name: athleteProfile.name,
        age: athleteProfile.age || 'not specified',
        occupation: athleteProfile.occupation || 'not specified',
        goal: athleteProfile.goal || 'Hypertrophy & Strength',
        experience: athleteProfile.experience || 'Intermediate',
        limitations: athleteProfile.limitations || 'None reported',
        onboarded: true,
      }
    : { status: 'BRAND_NEW_ATHLETE', onboarded: false };

  const sessions = (history || []).slice(0, 8).map((w) => ({
    date: new Date(w.timestamp).toISOString().slice(0, 10),
    title: w.title,
    volumeKg: Math.round(w.volumeKg || 0),
    lifts: (w.exercises || [])
      .map((ex) => {
        const done = (ex.sets || []).filter((s) => s.completed && s.weight > 0 && s.reps > 0);
        if (!done.length) return null;
        const best = done.reduce((a, b) => (calculate1RM(b.weight, b.reps) > calculate1RM(a.weight, a.reps) ? b : a));
        return `${ex.exerciseName || ex.name || 'Exercise'}: ${done.length} sets, best ${best.weight} kg x ${best.reps}`;
      })
      .filter(Boolean),
  }));
  const records = Object.entries(prs || {}).map(
    ([id, pr]) => `${id}: ${pr.weight} kg x ${pr.reps} (est. max ${pr.oneRepMax} kg)`
  );

  // Full aggregate of EVERY exercise ever performed by the athlete
  const exercisesHistoryMap = new Map();
  for (const w of history || []) {
    for (const ex of w.exercises || []) {
      const name = ex.exerciseName || ex.name;
      if (!name) continue;
      const done = (ex.sets || []).filter((s) => s.completed && Number(s.weight) >= 0 && Number(s.reps) > 0);
      if (!done.length) continue;
      const sessionBest = done.reduce((a, b) => (Number(b.weight) > Number(a.weight) ? b : a), done[0]);
      const session1RM = calculate1RM(sessionBest.weight, sessionBest.reps);

      if (!exercisesHistoryMap.has(name)) {
        exercisesHistoryMap.set(name, {
          name,
          sessionsCount: 1,
          lastDate: new Date(w.timestamp).toISOString().slice(0, 10),
          lastWeight: Number(sessionBest.weight),
          lastReps: Number(sessionBest.reps),
          last1RM: session1RM,
          bestWeight: Number(sessionBest.weight),
          bestReps: Number(sessionBest.reps),
          best1RM: session1RM,
        });
      } else {
        const item = exercisesHistoryMap.get(name);
        item.sessionsCount += 1;
        if (session1RM > item.best1RM) {
          item.best1RM = session1RM;
          item.bestWeight = Number(sessionBest.weight);
          item.bestReps = Number(sessionBest.reps);
        }
      }
    }
  }

  const exerciseRecall = Array.from(exercisesHistoryMap.values()).map(
    (e) => `${e.name}: ${e.sessionsCount} session(s), last on ${e.lastDate} (${e.lastWeight}kg x ${e.lastReps}), all-time best ${e.bestWeight}kg x ${e.bestReps} (e1RM ${e.best1RM}kg)`
  );

  const profile = blueprint
    ? {
        goal: blueprint.fitness_goal || blueprint.goal,
        experience: blueprint.experience_level,
        split: blueprint.split_preference,
        bodyWeightKg: blueprint.body_weight_kg,
        targetWeightKg: blueprint.target_weight_kg,
      }
    : 'not provided';

  let activeBlock = 'No workout currently active';
  if (activeWorkout && activeWorkout.exercises?.length) {
    const exList = activeWorkout.exercises.map((e) => {
      const doneSets = (e.sets || []).filter((s) => s.completed).length;
      const totalSets = (e.sets || []).length;
      return `${e.name || e.exerciseName || 'Lift'} (${doneSets}/${totalSets} sets completed)`;
    }).join(', ');
    activeBlock = `ACTIVE SESSION "${activeWorkout.title || 'Today'}": Focused Exercise: ${activeWorkout.currentExercise || 'none'}; Exercise Progress: [${exList}]`;
  }

  const streakDays = computeStreak(history, now.getTime());
  const sessionsThisWeek = workoutsInLastDays(history, 7, now.getTime());
  const fatigueStatus =
    sessionsThisWeek >= 5
      ? 'High fatigue risk (5+ workouts this week) — keep RPE under 8.5 and emphasize joint recovery'
      : sessionsThisWeek >= 3
      ? 'Optimal training stimulus (balanced fatigue)'
      : 'Well-rested / high recovery capacity';

  return `CURRENT TEMPORAL CONTEXT: ${weekday}, ${dateStr} at ${timeStr} (${timeOfDay})
ATHLETE IDENTITY & MEMORY: ${JSON.stringify(identity)}
TRAINING CONSISTENCY & FATIGUE: Streak: ${streakDays} days; Weekly Volume: ${sessionsThisWeek} sessions in last 7 days; Recovery State: ${fatigueStatus}
LAST SESSION STATUS: ${lastSessionRecap}
ATHLETE BLUEPRINT: ${JSON.stringify(profile)}
CURRENT ACTIVE WORKOUT: ${activeBlock}
RECENT WORKOUTS (newest first, ${history.length} logged in total): ${sessions.length ? JSON.stringify(sessions) : 'none yet'}
PERSONAL RECORDS: ${records.length ? records.join('; ') : 'none yet'}
LIFETIME EXERCISE RECALL (Every movement ever done): ${exerciseRecall.length ? exerciseRecall.join('; ') : 'none yet'}`;
}
