// A real PostgreSQL (PGlite = Postgres compiled to WASM, runs in-process) loaded with neon/schema.sql.
// It gives real constraint, transaction, trigger and unnest behaviour WITHOUT touching the Neon project.
// Limit: PGlite has one connection, so requests are serialised; true multi-connection races need a Neon branch.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

export async function makeDb() {
  const db = new PGlite();
  // Stand-in for the table Neon Auth manages. Only the column the schema references.
  await db.exec('CREATE SCHEMA neon_auth; CREATE TABLE neon_auth."user" (id uuid PRIMARY KEY, email text);');
  await db.exec(readFileSync(new URL('../../../neon/schema.sql', import.meta.url), 'utf8'));
  return db;
}

/**
 * Adapts PGlite to the { query, connect } pool shape the API uses. A lock makes a connection exclusive from
 * connect() to release(), so one request's BEGIN..COMMIT is never interleaved with another request's queries.
 * `hook(sql, params, nth)` can throw to inject a failure; `log` records every statement.
 */
export function makePool(db, { hook } = {}) {
  const log = [];
  let tail = Promise.resolve();
  const lock = () => {
    let release;
    const prev = tail;
    tail = new Promise((r) => (release = r));
    return prev.then(() => release);
  };
  const run = async (text, params) => {
    log.push(text.replace(/\s+/g, ' ').trim());
    if (hook) hook(text, params, log.length);
    const res = await db.query(text, params);
    return { rows: res.rows, rowCount: res.affectedRows ?? res.rows.length };
  };
  return {
    log,
    query: async (text, params) => {
      const release = await lock();
      try { return await run(text, params); } finally { release(); }
    },
    connect: async () => {
      const release = await lock();
      return { query: (t, p) => run(t, p), release };
    },
  };
}
