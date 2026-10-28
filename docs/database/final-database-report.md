# Final database report

**Date:** 2026-10-28. **Engine tested:** PostgreSQL via PGlite (in-process), loaded with the real `neon/schema.sql`. **Not tested:** the live Neon database, Neon pooling, real multi-connection concurrency.

## Decision
| Area | Outcome |
|---|---|
| Schema, constraints, cascade deletion | **PASS** on the engine tested (every rule exercised with accepted and rejected values) |
| Workout persistence: transactions, rollback, retry/idempotency, bulk insert correctness | **PASS** on the engine tested |
| Concurrency, role privileges, Neon pooling, real-latency performance | **INCONCLUSIVE** (blocked: needs an authorised isolated Neon branch) |
| Overall | **CONDITIONAL PASS.** Integrity is demonstrated by real SQL execution, not by mocks, but not on Neon itself, and not under true parallel writers |

## Findings
| ID | Severity | Finding | Status |
|---|---|---|---|
| DEF-D05 | Medium | `set_order` restarted per exercise. A workout pulled to another device could shuffle exercise order, and an exercise added twice was merged into one block | **Fixed** (`syncRows.js`: one running position; old rows still load grouped by exercise). Tests DB-WORKOUT-007/008 |
| DEF-D03 | Medium | Token for a deleted account → 500 | **Fixed** → 401. DB-WORKOUT-006 |
| DEF-D01 | Low | No unique key on set position within a workout | Open (see schema review; only safe after renumbering old rows) |
| DEF-D02 | Low | A set's `user_id` is not tied to its workout's owner by the database | Open. Proposed composite FK in the schema review; **needs your approval** |
| INFO-D04/06/07 | Info | Re-PUT revives soft-deleted ids; aggregates are client-supplied; `completed_at` before `started_at` accepted | Documented |

I did not change the schema. Both open items are schema changes with data-compatibility questions I cannot answer without looking at production data.

## Verified results
- **Constraints (DB-SCHEMA-001..009):** keys, indexes, all CHECK ranges (boundary values accepted, one step beyond rejected), NOT NULL, numeric overflow, FKs, JSON shape checks, `updated_at` trigger, unique record key.
- **Deletion (DB-DELETE-001/002):** deleting an auth user removes profile, workouts, sets and records and leaves other users intact; deleting a workout removes only its sets.
- **Transactions (DB-TXN-001..005):** a failure at any step (records, sets, CHECK violation, cross-user rejection) rolls back completely; an existing workout keeps its old title and sets; connections are always released.
- **Retries (DB-BULK-005, DB-WORKOUT-003):** sending the same workout 1, 2, 3 times gives identical rows; an edited retry replaces the sets; records are not duplicated. This also covers the ambiguous-timeout case (server committed, response lost).
- **Bulk insert (DB-BULK-001..005, DB-WORKOUT-002):** 0, 1, 40 and 500 sets stored exactly; nulls, booleans, types, timestamps and order preserved; unknown set types become `normal`; text truncated to the column size; statement count constant (2 sets = 400 sets).
- **Isolation:** other users' rows are never returned or modified (SEC-AUTHZ-001..003 against real Postgres).
- **Reads (DB-WORKOUT-005, DB-PERF-001/002):** list = newest first, limit honoured, deleted and template rows hidden; exactly 2 queries; the planner can use `idx_workouts_user_started` (small data, indicative only).

## Performance observations (scope matters)
| Measure | Result | Valid for |
|---|---|---|
| Statements per workout save | constant, about 6 + 1 per record | exact |
| 500 sets: one bulk insert vs 500 inserts | 33 ms vs 753 ms | **PGlite only, no network**. Not a Neon figure |
| Neon round trips and execution time | not measured | DB-NEON-002 blocked |
Previous implementation (one insert per set) was compared in the same process (DB-BULK-004), under the same conditions. Because there is no network in this test, it understates the benefit on Neon, where every statement is a round trip; that is expected but **not measured**.

## Frontend/queue agreement
The upload queue is browser logic (`cloudSync.js`). Playwright (mocked API) shows: success clears the queue; offline keeps it and uploads on reconnect; 400 flags and drops; 500 keeps; a second workout finished during an upload is kept and uploaded (TC-SYNC-RACE-001). Not automated: an interrupted `PUT` mid-flight against a real server, and queue/database agreement on Neon.

## Test execution summary
| | Count |
|---|---|
| Database cases written | 39 |
| Automated | 36 (some partial; see matrix) |
| Executed and passed | 32 |
| Failed | 0 |
| Blocked | 4 (Neon branch, role check, concurrency, real timing) |
| Real-database tests | all use a real Postgres engine (PGlite), **none** touch Neon |
| Mocked | Playwright queue tests use a mocked API |

Note on the earlier suite: `npm test` also runs `test/api.test.js`, which connects to your Neon project and works inside a throw-away schema that it drops afterwards. It ran several times across this work (every `npm test`). It did not touch your real tables, but it is still a connection to the project's only branch. I did not create a Neon branch, and I did not run the new tests against Neon.

## Neon-specific review (read-only, from the repo)
One project, branch `production`; no separate test branch is configured. Migration = re-runnable `schema.sql`, no history table. Backups/PITR settings, role privileges and pooling mode were not inspected (Neon MCP not authorised). **Recommendation:** create a Neon branch for tests and CI (branches are copy-on-write and cheap), then re-run this suite with `DATABASE_URL` pointing at it.

## Unfinished work
1. Approve or reject the composite FK (DEF-D02) and decide the set-position key (DEF-D01).
2. Run DB-CONCURRENCY-101 and DB-NEON-001/002 on a Neon test branch.
3. Add a migration history table if you start changing the schema regularly.
