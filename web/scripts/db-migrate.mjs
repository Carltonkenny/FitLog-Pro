// Applies ../neon/schema.sql to the Neon database in DATABASE_URL_UNPOOLED. Safe to re-run.
// Usage: npm run db:migrate
import { readFileSync } from 'node:fs';
import pg from 'pg';

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL_UNPOOLED is not set. Run `neon deploy` (or `neon env pull`) first.');
  process.exit(1);
}

const sql = readFileSync(new URL('../../neon/schema.sql', import.meta.url), 'utf8');
const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  console.log('Schema applied. Tables:', rows.map((r) => r.table_name).join(', '));
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
