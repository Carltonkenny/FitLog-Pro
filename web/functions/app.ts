import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { AuthedUser, Verifier } from './lib/auth.ts';
import { callGemini, makeRateLimiter, sanitizeCoachRequest } from './lib/coach.ts';
import { ValidationError, isUuid, parseProfile, parseWorkout } from './lib/validate.ts';

// The FitLog API. One job: verify who is calling, then read and write only that user's rows.
// Every query below filters on the verified user id; nothing from the request body can change it.

type Db = { query: (text: string, params?: unknown[]) => Promise<{ rows: any[]; rowCount: number | null }>; connect: () => Promise<any> };

export type Deps = {
  pool: Db;
  verify: Verifier;
  allowedOrigins: string[];
  geminiKey?: string;
  geminiModel?: string;
  geminiFallbackModel?: string;
  fetchImpl?: typeof fetch;
  seal?: (userId: string) => Promise<{ workouts: unknown; profile: unknown }>;
};

type Env = { Variables: { user: AuthedUser } };

const PROFILE_COLUMNS =
  'id, email, full_name, fitness_goal, experience_level, split_preference, body_weight_kg, target_weight_kg, ' +
  'body_fat_pct, daily_calorie_target, bench_1rm_kg, weekly_volume_target_sets, onboarding_completed, routines, coach_memory, updated_at';

const NUMERIC_PROFILE = ['body_weight_kg', 'target_weight_kg', 'body_fat_pct', 'bench_1rm_kg'];

const isLocal = (origin: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

function profileOut(row: Record<string, unknown>) {
  const out = { ...row };
  for (const k of NUMERIC_PROFILE) if (out[k] !== null && out[k] !== undefined) out[k] = Number(out[k]);
  return out;
}

export function createApp(deps: Deps) {
  const app = new Hono<Env>();
  const coachLimited = makeRateLimiter(30);

  app.use(
    '*',
    cors({
      origin: (origin) => (origin && (isLocal(origin) || deps.allowedOrigins.includes(origin)) ? origin : null),
      allowHeaders: ['Authorization', 'Content-Type'],
      allowMethods: ['GET', 'PUT', 'POST', 'OPTIONS'],
      maxAge: 600,
    }),
  );

  app.onError((err, c) => {
    if (err instanceof ValidationError) return c.json({ error: err.message }, 400);
    console.error('api error:', err instanceof Error ? err.message : 'unknown');
    return c.json({ error: 'server-error' }, 500);
  });

  /** Reads a JSON body, rejecting anything bigger than `maxBytes` before parsing. */
  async function readJson(c: any, maxBytes: number): Promise<unknown> {
    const raw = await c.req.text();
    if (raw.length > maxBytes) throw new ValidationError('request too large');
    try {
      return JSON.parse(raw);
    } catch {
      throw new ValidationError('body must be JSON');
    }
  }

  app.get('/health', async (c) => {
    await deps.pool.query('SELECT 1');
    return c.json({ ok: true });
  });

  // Everything below needs a valid Neon Auth token.
  app.use('*', async (c, next) => {
    if (c.req.method === 'OPTIONS') return next();
    const header = c.req.header('Authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    const user = token ? await deps.verify(token) : null;
    if (!user) return c.json({ error: 'unauthorized' }, 401);
    c.set('user', user);
    return next();
  });

  async function ensureProfile(db: Db, user: AuthedUser) {
    await db.query(
      'INSERT INTO profiles (id, email, full_name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
      [user.id, user.email, user.name],
    );
  }

  app.get('/me', async (c) => {
    const user = c.get('user');
    await ensureProfile(deps.pool, user);
    const { rows } = await deps.pool.query(`SELECT ${PROFILE_COLUMNS} FROM profiles WHERE id = $1`, [user.id]);
    return c.json({ profile: profileOut(rows[0]) });
  });

  app.put('/me', async (c) => {
    const user = c.get('user');
    const fields = parseProfile(await readJson(c, 150_000));
    await ensureProfile(deps.pool, user);
    const keys = Object.keys(fields);
    if (keys.length) {
      const sets = keys.map((k, i) => `${k} = $${i + 2}${k === 'routines' || k === 'coach_memory' ? '::jsonb' : ''}`);
      await deps.pool.query(`UPDATE profiles SET ${sets.join(', ')} WHERE id = $1`, [user.id, ...keys.map((k) => fields[k])]);
    }
    const { rows } = await deps.pool.query(`SELECT ${PROFILE_COLUMNS} FROM profiles WHERE id = $1`, [user.id]);
    return c.json({ profile: profileOut(rows[0]) });
  });

  app.put('/workouts/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    if (!isUuid(id)) throw new ValidationError('invalid workout id');
    const { workout: w, sets, prs } = parseWorkout(await readJson(c, 400_000));

    const client = await deps.pool.connect();
    try {
      await client.query('BEGIN');
      await ensureProfile(client, user);
      // The WHERE clause is the ownership check: an id that belongs to someone else updates nothing.
      const up = await client.query(
        `INSERT INTO workouts (id, user_id, title, started_at, completed_at, duration_seconds, volume_kg, total_sets)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, started_at = EXCLUDED.started_at,
           completed_at = EXCLUDED.completed_at, duration_seconds = EXCLUDED.duration_seconds,
           volume_kg = EXCLUDED.volume_kg, total_sets = EXCLUDED.total_sets, deleted_at = NULL
         WHERE workouts.user_id = $2
         RETURNING id`,
        [id, user.id, w.title, w.started_at, w.completed_at, w.duration_seconds, w.volume_kg, w.total_sets],
      );
      if (up.rowCount === 0) {
        await client.query('ROLLBACK');
        return c.json({ error: 'not-found' }, 404);
      }
      await client.query('DELETE FROM workout_sets WHERE workout_id = $1 AND user_id = $2', [id, user.id]);
      for (const s of sets) {
        await client.query(
          `INSERT INTO workout_sets (workout_id, user_id, exercise_id, exercise_name, set_order, weight_kg, reps, is_completed, set_type, completed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [id, user.id, s.exercise_id, s.exercise_name, s.set_order, s.weight_kg, s.reps, s.is_completed, s.set_type, s.completed_at],
        );
      }
      for (const p of prs) {
        await client.query(
          `INSERT INTO personal_records (user_id, exercise_id, exercise_name, weight_kg, reps, one_rep_max, achieved_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (user_id, exercise_id, achieved_at) DO NOTHING`,
          [user.id, p.exercise_id, p.exercise_name, p.weight_kg, p.reps, p.one_rep_max, p.achieved_at],
        );
      }
      await client.query('COMMIT');
      return c.json({ ok: true });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  });

  app.get('/workouts', async (c) => {
    const user = c.get('user');
    const limit = Math.min(500, Math.max(1, Math.round(Number(c.req.query('limit'))) || 200));
    const { rows } = await deps.pool.query(
      `SELECT id, title, started_at, completed_at, duration_seconds, volume_kg, total_sets
       FROM workouts WHERE user_id = $1 AND deleted_at IS NULL AND is_template = FALSE
       ORDER BY started_at DESC LIMIT $2`,
      [user.id, limit],
    );
    const ids = rows.map((r) => r.id);
    const sets = ids.length
      ? (
          await deps.pool.query(
            `SELECT workout_id, exercise_id, exercise_name, set_order, weight_kg, reps, is_completed, set_type
             FROM workout_sets WHERE workout_id = ANY($1::uuid[]) AND user_id = $2 ORDER BY workout_id, set_order`,
            [ids, user.id],
          )
        ).rows
      : [];
    const byWorkout = new Map<string, any[]>();
    for (const s of sets) byWorkout.set(s.workout_id, [...(byWorkout.get(s.workout_id) ?? []), s]);
    return c.json({ workouts: rows.map((r) => ({ ...r, workout_sets: byWorkout.get(r.id) ?? [] })) });
  });

  app.get('/records', async (c) => {
    const { rows } = await deps.pool.query(
      `SELECT exercise_id, weight_kg, reps, one_rep_max, achieved_at FROM personal_records
       WHERE user_id = $1 ORDER BY one_rep_max DESC LIMIT 1000`,
      [c.get('user').id],
    );
    return c.json({ records: rows });
  });

  app.post('/coach', async (c) => {
    const user = c.get('user');
    if (!deps.geminiKey) return c.json({ error: 'not-configured' }, 500);
    if (coachLimited(user.id)) return c.json({ error: 'rate-limited' }, 429);
    let payload;
    try {
      payload = sanitizeCoachRequest(await readJson(c, 6_000_000));
    } catch (err) {
      if (err instanceof ValidationError) return c.json({ error: err.message === 'bad image' || err.message === 'too large' ? err.message.replace(' ', '-') : 'bad-request' }, 400);
      throw err;
    }
    const result = await callGemini(payload, {
      apiKey: deps.geminiKey,
      model: deps.geminiModel ?? 'gemini-3.6-flash',
      fallbackModel: deps.geminiFallbackModel,
      fetchImpl: deps.fetchImpl,
    });
    if ('error' in result) return c.json({ error: result.error }, 502);
    return c.json(result);
  });

  app.post('/realtime/seal', async (c) => {
    if (!deps.seal) return c.json({ error: 'not-configured' }, 503);
    return c.json(await deps.seal(c.get('user').id));
  });

  return app;
}
