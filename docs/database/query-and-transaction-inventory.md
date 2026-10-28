# Query and transaction inventory

All statements are in `web/functions/app.ts` and use bound parameters (`$1..`). The only dynamic SQL is the column list of `UPDATE profiles`, built from the validated whitelist in `validate.ts`, never from request keys.

| # | Operation | Statements | Transaction | Notes |
|---|---|---|---|---|
| 1 | `GET /me` | `INSERT profiles ... ON CONFLICT DO NOTHING`, `SELECT profile` | no | Creates the profile on first call |
| 2 | `PUT /me` | insert-if-missing, `UPDATE profiles SET <whitelist>`, `SELECT` | no | Single UPDATE is atomic |
| 3 | `GET /workouts` | `SELECT workouts ... LIMIT`, `SELECT workout_sets WHERE workout_id = ANY(...) AND user_id` | no | Exactly 2 queries (test DB-PERF-001) |
| 4 | `GET /records` | `SELECT personal_records ... LIMIT 1000` | no | |
| 5 | `PUT /workouts/:id` | `BEGIN`, ensure profile, upsert workout (ownership in `WHERE`), `DELETE sets`, **one bulk `INSERT ... SELECT * FROM unnest(...)`** for all sets (skipped if none), `INSERT records ... ON CONFLICT DO NOTHING` (one per record, ≤ 50), `COMMIT` | yes | Rollback on any error; connection always released (DB-TXN-004) |
| 6 | `GET /health` | none | n/a | |
| 7 | realtime seal | none (sealed read queries run by Neon realtime) | n/a | queries filter by user id |

## Transaction guarantees verified (real Postgres)
- Failure while writing records leaves no workout, sets or records for a new id (DB-TXN-001).
- Failure while writing sets for an existing id keeps the old title and old sets (DB-TXN-002).
- A database CHECK violation inside the transaction rolls back (DB-TXN-003).
- A rejected cross-user overwrite rolls back and commits nothing (DB-TXN-005).
- Retrying the same workout any number of times leaves identical rows (DB-BULK-005, DB-WORKOUT-003): the retry deletes and re-inserts the sets in one transaction, and the record key is unique.

## Bulk insert review (`unnest`)
- Arrays are built from the same validated `sets` list with `.map`, so they always have equal length. Empty list: the statement is skipped.
- Casts match the columns (`text[]`, `int[]`, `numeric[]`, `bool[]`, `timestamptz[]`); nulls in `completed_at` work (DB-BULK-001).
- Values are validated/clamped before the statement (SEC-VALID-001/003); CHECK constraints still apply (DB-SCHEMA-002, DB-TXN-003).
- Statement count is constant: 2 sets and 400 sets use the same number of statements (DB-BULK-003).
- Order: sets are stored with `set_order`; reads sort by it. Insert order is not relied on.
- Max size: 500 sets × 10 arrays; PostgreSQL's parameter limit is 65535 and this uses 10 parameters in total.

## Measurements (honest scope)
| What | Result | Where measured |
|---|---|---|
| SQL statements per save | constant (about 6 plus one per record) | exact, from the statement log |
| 500 sets: bulk vs one INSERT per set | 33 ms vs 753 ms | **in-process PGlite**, no network. This shows statement overhead only |
| Real Neon round trips and latency | **not measured** | needs an authorised isolated branch (DB-NEON-002) |

Do not read the 33 ms vs 753 ms as production numbers: a Neon round trip costs far more than a local call, so the real gap is larger, but I have not measured it.

## Pool and connections
`new Pool({ max: 5 })` per function instance, `attachDatabasePool`. Whether `DATABASE_URL` is the pooled or unpooled endpoint, and role privileges, were not inspected. Lock contention, deadlocks and true concurrent writers are **not tested** (DB-CONCURRENCY-101 blocked). Reasoning only: concurrent writers of one workout id serialise on the row lock taken by `ON CONFLICT DO UPDATE`.
