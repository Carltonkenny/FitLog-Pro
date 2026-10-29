-- FitLog Pro database schema for Neon Postgres.
-- Apply with:  npm --prefix web run db:migrate        (safe to re-run)
--
-- Access model: the browser never talks to Postgres. It calls the `api` Neon Function, which verifies the
-- caller's Neon Auth JWT and scopes every query to that user id. Ownership is therefore enforced in the
-- function (see web/functions/api.ts), and these constraints are the second line of defence.

-- Users live in neon_auth."user" (managed by Neon Auth). Deleting a user removes all of their data.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    fitness_goal TEXT,
    experience_level TEXT,
    split_preference TEXT,
    body_weight_kg NUMERIC(6, 2),
    target_weight_kg NUMERIC(6, 2),
    body_fat_pct NUMERIC(4, 1),
    daily_calorie_target INTEGER,
    bench_1rm_kg NUMERIC(6, 2),
    weekly_volume_target_sets INTEGER,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_pro_member BOOLEAN NOT NULL DEFAULT FALSE,      -- never writable from the API
    routines JSONB NOT NULL DEFAULT '[]'::jsonb,
    coach_memory JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT profiles_json_sane CHECK (
        jsonb_typeof(routines) = 'array' AND jsonb_typeof(coach_memory) = 'object'
        AND pg_column_size(routines) < 100000 AND pg_column_size(coach_memory) < 20000
    )
);

CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    volume_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_sets INTEGER NOT NULL DEFAULT 0,
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT workouts_values_sane CHECK (
        duration_seconds BETWEEN 0 AND 86400 AND volume_kg >= 0 AND total_sets >= 0
    )
);

CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id VARCHAR(100) NOT NULL,
    exercise_name VARCHAR(150) NOT NULL,
    set_order INTEGER NOT NULL,
    weight_kg NUMERIC(6, 2) NOT NULL,
    reps INTEGER NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    set_type VARCHAR(20) NOT NULL DEFAULT 'normal',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT workout_sets_values_sane CHECK (
        weight_kg BETWEEN 0 AND 1000 AND reps BETWEEN 0 AND 500 AND set_order >= 1
    )
);

CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id VARCHAR(100) NOT NULL,
    exercise_name VARCHAR(150) NOT NULL,
    weight_kg NUMERIC(6, 2) NOT NULL,
    reps INTEGER NOT NULL,
    one_rep_max NUMERIC(6, 2) NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT personal_records_values_sane CHECK (
        weight_kg BETWEEN 0 AND 1000 AND reps BETWEEN 0 AND 500 AND one_rep_max BETWEEN 0 AND 2000
    )
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_started ON public.workouts(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout ON public.workout_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON public.personal_records(user_id, exercise_id);
-- A retried upload of the same workout must not create the same record twice.
CREATE UNIQUE INDEX IF NOT EXISTS uq_personal_record_event ON public.personal_records(user_id, exercise_id, achieved_at);

-- Keep updated_at honest (it also drives live cross-device refresh).
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS workouts_set_updated_at ON public.workouts;
CREATE TRIGGER workouts_set_updated_at BEFORE UPDATE ON public.workouts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
