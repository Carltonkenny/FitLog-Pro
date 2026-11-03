# Schema and integrity review

Source: `neon/schema.sql` (one file, safe to re-run, applied by `npm run db:migrate`). There is no migration history table or numbered migrations; the file is the schema. The tests load this exact file into a real PostgreSQL engine (PGlite). I did **not** inspect the live Neon database, so drift between the file and production is unverified.

## Tables
| Table | Key | Foreign keys | Checks | Notes |
|---|---|---|---|---|
| `profiles` | `id` UUID | → `neon_auth.user(id)` ON DELETE CASCADE | JSONB shapes and size caps | `is_pro_member` default false, never written by the API |
| `workouts` | `id` UUID (client-generated) | `user_id` → profiles CASCADE | duration 0..86400, volume ≥ 0, total_sets ≥ 0 | `title` ≤ 100; soft delete via `deleted_at` (no API sets it) |
| `workout_sets` | `id` UUID default | `workout_id` → workouts CASCADE; `user_id` → profiles CASCADE | weight 0..1000, reps 0..500, set_order ≥ 1 | |
| `personal_records` | `id` UUID default | `user_id` → profiles CASCADE | weight, reps, 1RM ranges | unique (user, exercise, achieved_at) |

Indexes: `workouts(user_id, started_at DESC)`, `workout_sets(workout_id)`, `personal_records(user_id, exercise_id)`, unique record event key. A trigger keeps `updated_at` honest on `profiles` and `workouts`.

## Verified in real Postgres (tests DB-SCHEMA-001..009, DB-DELETE-001/002)
Primary keys and indexes exist; every CHECK rejects out-of-range values written directly (including exact boundary values being accepted); NOT NULL and NUMERIC(6,2) overflow reject; FKs reject orphans; account deletion cascades through all four tables without touching other users; deleting a workout removes only its sets; the unique key blocks duplicate records; `updated_at` advances.

## Findings
| ID | Severity | Finding | Status |
|---|---|---|---|
| DEF-D01 | Low | Nothing prevents two sets with the same position in one workout (no unique key). Safe today because the API replaces all sets in one transaction | Open. Not changed: see note below |
| DEF-D02 | Low (defence in depth) | A set row's `user_id` is not forced to equal its workout's `user_id` by the database. Only the API guarantees it | Open. Proposed composite FK below; needs approval |
| DEF-D03 | Medium | A valid JWT for a deleted account made `PUT /workouts` and `/me` fail with a 500 (FK violation) | **Fixed**: 401. Test DB-WORKOUT-006 |
| DEF-D05 | Medium | `set_order` restarted at 1 for each exercise, so exercise order and a repeated exercise were not preserved when a workout was pulled to another device | **Fixed** in `syncRows.js` (one running position; old rows still load). Tests DB-WORKOUT-007/008 |
| INFO-D04 | Info | Re-sending a soft-deleted workout id revives it. No delete route exists, so unreachable today | Documented |
| INFO-D06 | Info | `total_sets`, `volume_kg` are client-supplied, not recomputed from the sets. A user can store inconsistent totals for their own data | Documented |
| INFO-D07 | Info | `completed_at` earlier than `started_at` is accepted | Documented |

## Proposed hardening (NOT applied; schema change needs your approval and a data check first)
```sql
-- 0. check existing data first
SELECT workout_id, user_id FROM workout_sets s JOIN workouts w ON w.id = s.workout_id WHERE s.user_id <> w.user_id;
-- 1. a set's owner must equal its workout's owner
ALTER TABLE workouts ADD CONSTRAINT workouts_id_user_uq UNIQUE (id, user_id);
ALTER TABLE workout_sets ADD CONSTRAINT workout_sets_owner_fk
  FOREIGN KEY (workout_id, user_id) REFERENCES workouts (id, user_id) ON DELETE CASCADE;
```
A unique key on `(workout_id, set_order)` is **only valid for rows written after the DEF-D05 fix**; rows already in the database restart numbering per exercise, so add that key only after those rows are renumbered or the old workouts are deleted.

## Row-level security
Not used. Ownership is enforced in the function. If RLS is wanted later, it must be tested over the same role and connection the function uses (a privileged owner role bypasses it).

## Retention and deletion
Account deletion cascades to all data (tested). There is no workout delete endpoint, so users cannot delete a single synced workout from the cloud. Whether that matches policy is a product decision.
