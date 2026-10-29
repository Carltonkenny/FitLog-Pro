import { createRealtime, rawSql } from '@neon/realtime/server';

/**
 * Seals the only two live queries the browser may subscribe to. Both are read-only and filtered to the
 * verified user id, so a user cannot watch anyone else's rows. A sealed query is a short-lived bearer token.
 */
export function makeSealer(opts: { secret: string; db: string }) {
  const realtime = createRealtime({ secret: opts.secret, db: opts.db });
  return async (userId: string) => ({
    workouts: await realtime.seal({
      query: rawSql(
        'SELECT id, updated_at FROM workouts WHERE user_id = $1 AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 5',
        [userId],
      ),
    }),
    profile: await realtime.seal({ query: rawSql('SELECT id, updated_at FROM profiles WHERE id = $1', [userId]) }),
  });
}
