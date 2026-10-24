-- ==============================================================================
-- FitLog Pro Cloud Schema ("The Brain")
-- Supabase PostgreSQL with Row Level Security (RLS)
-- Project Ref: fczhckzsynzfomytkgym
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Stores user onboarding blueprint and preferences)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT 'Athlete',
    fitness_goal TEXT DEFAULT 'Hypertrophy', -- Hypertrophy, Pure Strength, Recomp, Conditioning
    experience_level TEXT DEFAULT 'Intermediate', -- Novice, Intermediate, Advanced
    split_preference TEXT DEFAULT 'PPL', -- PPL, Upper/Lower, FullBody, Arnold
    body_weight_kg NUMERIC(6, 2) DEFAULT 75.00,
    target_weight_kg NUMERIC(6, 2) DEFAULT 78.00,
    body_fat_pct NUMERIC(4, 1) DEFAULT 15.0,
    daily_calorie_target INTEGER DEFAULT 2600,
    is_pro_member BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. WORKOUTS TABLE (Syncs relational workouts with local Drift SQLite)
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0 NOT NULL,
    volume_kg NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total_sets INTEGER DEFAULT 0 NOT NULL,
    is_template BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    deleted_at TIMESTAMPTZ -- Soft delete for offline sync
);

-- 4. WORKOUT SETS TABLE (Zero-loss set telemetry)
CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id VARCHAR(100) NOT NULL,
    exercise_name VARCHAR(150) NOT NULL,
    set_order INTEGER NOT NULL,
    weight_kg NUMERIC(6, 2) NOT NULL,
    reps INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    set_type VARCHAR(20) DEFAULT 'normal' NOT NULL, -- normal, warmup, drop, failure
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. PERSONAL RECORDS TABLE (Epley 1RM formula tracking)
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id VARCHAR(100) NOT NULL,
    exercise_name VARCHAR(150) NOT NULL,
    weight_kg NUMERIC(6, 2) NOT NULL,
    reps INTEGER NOT NULL,
    one_rep_max NUMERIC(6, 2) NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. BODY STATS TABLE (Weight & body fat trend logs)
CREATE TABLE IF NOT EXISTS public.body_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    weight_kg NUMERIC(6, 2) NOT NULL,
    body_fat_pct NUMERIC(4, 1),
    logged_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Users can only select, insert, update, or delete their own data
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_stats ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Workouts Policies
CREATE POLICY "Users can view own workouts" 
    ON public.workouts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" 
    ON public.workouts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" 
    ON public.workouts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" 
    ON public.workouts FOR DELETE 
    USING (auth.uid() = user_id);

-- Workout Sets Policies
CREATE POLICY "Users can view own sets" 
    ON public.workout_sets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sets" 
    ON public.workout_sets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sets" 
    ON public.workout_sets FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sets" 
    ON public.workout_sets FOR DELETE 
    USING (auth.uid() = user_id);

-- Personal Records Policies
CREATE POLICY "Users can view own PRs" 
    ON public.personal_records FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own PRs" 
    ON public.personal_records FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Body Stats Policies
CREATE POLICY "Users can view own body stats" 
    ON public.body_stats FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own body stats" 
    ON public.body_stats FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC TRIGGERS
-- ==============================================================================

-- 1. Auto-create Profile row when auth.users signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_workouts_timestamp BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_sets_timestamp BEFORE UPDATE ON public.workout_sets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- OPTIMIZED PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workouts_user_started ON public.workouts(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout ON public.workout_sets(workout_id, set_order ASC);
CREATE INDEX IF NOT EXISTS idx_prs_user_exercise ON public.personal_records(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_body_stats_user_date ON public.body_stats(user_id, logged_at DESC);
