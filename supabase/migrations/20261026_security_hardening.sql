-- ==============================================================================
-- FitLog Pro: security hardening migration
-- Run once in Supabase -> SQL Editor, after schema.sql. Safe to re-run.
-- Not yet executed against the live project: review, then run, then re-test sign-up and a workout sync.
-- ==============================================================================

-- 1. SECURITY DEFINER functions must pin their search_path (prevents schema-shadowing attacks)
--    and must not be callable by API roles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Athlete')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- 1b. Saved routines and companion memory live on the profile row as small, size-limited JSON.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS routines JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coach_memory JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_json_sane;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_json_sane
    CHECK (jsonb_typeof(routines) = 'array' AND jsonb_typeof(coach_memory) = 'object'
           AND pg_column_size(routines) < 100000 AND pg_column_size(coach_memory) < 20000);

-- 2. Users must not be able to grant themselves paid status (or touch any column the app does not edit).
--    Row-level security decides WHICH rows; column privileges decide WHICH columns.
REVOKE INSERT, UPDATE ON public.profiles FROM anon, authenticated;
GRANT INSERT (id, email, full_name, fitness_goal, experience_level, split_preference,
              body_weight_kg, target_weight_kg, body_fat_pct, daily_calorie_target,
              onboarding_completed, bench_1rm_kg, weekly_volume_target_sets, routines, coach_memory)
    ON public.profiles TO authenticated;
GRANT UPDATE (id, email, full_name, fitness_goal, experience_level, split_preference,
              body_weight_kg, target_weight_kg, body_fat_pct, daily_calorie_target,
              onboarding_completed, bench_1rm_kg, weekly_volume_target_sets, routines, coach_memory)
    ON public.profiles TO authenticated;
-- is_pro_member is now writable only by the service role (for example a billing webhook).

-- 3. A set may only be attached to a workout the same user owns.
DROP POLICY IF EXISTS "Users can insert own sets" ON public.workout_sets;
CREATE POLICY "Users can insert own sets"
    ON public.workout_sets FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update own sets" ON public.workout_sets;
CREATE POLICY "Users can update own sets"
    ON public.workout_sets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid())
    );

-- 4. Reject impossible values at the database, whatever the client sends.
ALTER TABLE public.workout_sets DROP CONSTRAINT IF EXISTS workout_sets_values_sane;
ALTER TABLE public.workout_sets ADD CONSTRAINT workout_sets_values_sane
    CHECK (weight_kg >= 0 AND weight_kg <= 1000 AND reps >= 0 AND reps <= 500 AND set_order >= 1);

ALTER TABLE public.workouts DROP CONSTRAINT IF EXISTS workouts_values_sane;
ALTER TABLE public.workouts ADD CONSTRAINT workouts_values_sane
    CHECK (duration_seconds >= 0 AND duration_seconds <= 86400 AND volume_kg >= 0 AND total_sets >= 0);

ALTER TABLE public.personal_records DROP CONSTRAINT IF EXISTS personal_records_values_sane;
ALTER TABLE public.personal_records ADD CONSTRAINT personal_records_values_sane
    CHECK (weight_kg >= 0 AND weight_kg <= 1000 AND reps >= 0 AND reps <= 500 AND one_rep_max >= 0 AND one_rep_max <= 2000);

-- 5. Index the foreign key the sync code filters on (workout_sets by workout) and PR lookups.
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout ON public.workout_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON public.personal_records(user_id, exercise_id);
