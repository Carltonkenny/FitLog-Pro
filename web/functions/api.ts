import { attachDatabasePool } from '@neon/functions';
import { Pool } from 'pg';
import { createApp } from './app.ts';
import { makeVerifier } from './lib/auth.ts';
import { makeSealer } from './lib/seal.ts';

// Entry point of the FitLog API function. All settings come from environment variables that Neon
// injects (DATABASE_URL, NEON_AUTH_*, NEON_REALTIME_SECRET) plus the ones declared in neon.ts.
const env = process.env;

// One long-lived pool per instance, as the Neon Functions guide recommends.
const pool = new Pool({ connectionString: env.DATABASE_URL, max: 5 });
attachDatabasePool(pool);

const dbName = new URL(env.DATABASE_URL as string).pathname.slice(1) || 'neondb';

export default createApp({
  pool,
  verify: makeVerifier({ jwksUrl: env.NEON_AUTH_JWKS_URL as string, baseUrl: env.NEON_AUTH_BASE_URL as string }),
  allowedOrigins: (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  geminiKey: env.GEMINI_API_KEY || undefined,
  geminiModel: env.GEMINI_MODEL || undefined,
  geminiFallbackModel: env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite',
  seal: env.NEON_REALTIME_SECRET ? makeSealer({ secret: env.NEON_REALTIME_SECRET, db: dbName }) : undefined,
});
