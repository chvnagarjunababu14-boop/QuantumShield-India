-- ============================================================================
-- Migration 001: Learner Profiles, Progress, Bookmarks, and Quiz Results
-- Scope: Phase 3 Foundation Schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Learner Profiles
CREATE TABLE IF NOT EXISTS public.learner_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learner_profiles_user_id ON public.learner_profiles(user_id);
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Lesson Progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_slug TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_lesson_progress UNIQUE (user_id, lesson_slug)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_slug ON public.lesson_progress(lesson_slug);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- 3. Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_slug TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_bookmark UNIQUE (user_id, lesson_slug)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_slug ON public.bookmarks(lesson_slug);
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 4. Quiz Results
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_quiz_score_non_negative CHECK (score >= 0),
    CONSTRAINT chk_quiz_score_within_total CHECK (score <= total_score),
    CONSTRAINT chk_quiz_total_positive CHECK (total_score > 0)
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON public.quiz_results(quiz_id);
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Learners can view their own profile" ON public.learner_profiles;
CREATE POLICY "Learners can view their own profile"
    ON public.learner_profiles FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can insert their own profile" ON public.learner_profiles;
CREATE POLICY "Learners can insert their own profile"
    ON public.learner_profiles FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can update their own profile" ON public.learner_profiles;
CREATE POLICY "Learners can update their own profile"
    ON public.learner_profiles FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can view their own progress" ON public.lesson_progress;
CREATE POLICY "Learners can view their own progress"
    ON public.lesson_progress FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can insert their own progress" ON public.lesson_progress;
CREATE POLICY "Learners can insert their own progress"
    ON public.lesson_progress FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can update their own progress" ON public.lesson_progress;
CREATE POLICY "Learners can update their own progress"
    ON public.lesson_progress FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can delete their own progress" ON public.lesson_progress;
CREATE POLICY "Learners can delete their own progress"
    ON public.lesson_progress FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Learners can view their own bookmarks"
    ON public.bookmarks FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can insert their own bookmarks" ON public.bookmarks;
CREATE POLICY "Learners can insert their own bookmarks"
    ON public.bookmarks FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can delete their own bookmarks" ON public.bookmarks;
CREATE POLICY "Learners can delete their own bookmarks"
    ON public.bookmarks FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can view their own quiz results" ON public.quiz_results;
CREATE POLICY "Learners can view their own quiz results"
    ON public.quiz_results FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can insert their own quiz results" ON public.quiz_results;
CREATE POLICY "Learners can insert their own quiz results"
    ON public.quiz_results FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Role Grants
REVOKE ALL ON public.learner_profiles FROM anon;
REVOKE ALL ON public.lesson_progress FROM anon;
REVOKE ALL ON public.bookmarks FROM anon;
REVOKE ALL ON public.quiz_results FROM anon;

GRANT SELECT, INSERT, UPDATE ON public.learner_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.bookmarks TO authenticated;
GRANT SELECT, INSERT ON public.quiz_results TO authenticated;
