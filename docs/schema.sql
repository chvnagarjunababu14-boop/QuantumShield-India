-- ============================================================================
-- QuantumShield India — Phase 3 Database Schema & Row-Level Security (RLS)
-- Platform: InsForge-managed PostgreSQL
-- Scope: Learner Profiles, Lesson Progress, Bookmarks, and Quiz Results
-- ============================================================================

-- Ensure uuid-ossp or pgcrypto extension is available for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Learner Profiles Table
-- Stores user presentation details tied to authenticated InsForge user ID.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learner_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learner_profiles_user_id ON public.learner_profiles(user_id);

-- Enable Row-Level Security
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. Lesson Progress Table
-- Tracks per-user completion of sample lessons.
-- ----------------------------------------------------------------------------
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

-- Enable Row-Level Security
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. Bookmarks Table
-- Stores saved lessons for quick reference.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_slug TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_bookmark UNIQUE (user_id, lesson_slug)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_slug ON public.bookmarks(lesson_slug);

-- Enable Row-Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 4. Quiz Results Table
-- Stores verified quiz submissions with integrity constraints.
-- ----------------------------------------------------------------------------
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

-- Enable Row-Level Security
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Verified rules:
-- 1. Anonymous users cannot read, insert, update, or delete private records.
-- 2. Authenticated users can only read, insert, update, or delete records where
--    user_id matches their verified auth identity (auth.uid()).
-- 3. Cross-user operations are strictly forbidden.
-- ============================================================================

-- Learner Profiles Policies
DROP POLICY IF EXISTS "Learners can view their own profile" ON public.learner_profiles;
CREATE POLICY "Learners can view their own profile"
    ON public.learner_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can insert their own profile" ON public.learner_profiles;
CREATE POLICY "Learners can insert their own profile"
    ON public.learner_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can update their own profile" ON public.learner_profiles;
CREATE POLICY "Learners can update their own profile"
    ON public.learner_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Lesson Progress Policies
DROP POLICY IF EXISTS "Learners can view their own progress" ON public.lesson_progress;
CREATE POLICY "Learners can view their own progress"
    ON public.lesson_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can insert their own progress" ON public.lesson_progress;
CREATE POLICY "Learners can insert their own progress"
    ON public.lesson_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can update their own progress" ON public.lesson_progress;
CREATE POLICY "Learners can update their own progress"
    ON public.lesson_progress
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can delete their own progress" ON public.lesson_progress;
CREATE POLICY "Learners can delete their own progress"
    ON public.lesson_progress
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Bookmarks Policies
DROP POLICY IF EXISTS "Learners can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Learners can view their own bookmarks"
    ON public.bookmarks
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can insert their own bookmarks" ON public.bookmarks;
CREATE POLICY "Learners can insert their own bookmarks"
    ON public.bookmarks
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can delete their own bookmarks" ON public.bookmarks;
CREATE POLICY "Learners can delete their own bookmarks"
    ON public.bookmarks
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Quiz Results Policies
DROP POLICY IF EXISTS "Learners can view their own quiz results" ON public.quiz_results;
CREATE POLICY "Learners can view their own quiz results"
    ON public.quiz_results
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can insert their own quiz results" ON public.quiz_results;
CREATE POLICY "Learners can insert their own quiz results"
    ON public.quiz_results
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ROLE GRANTS
-- ============================================================================
-- Deny all access to anonymous role
REVOKE ALL ON public.learner_profiles FROM anon;
REVOKE ALL ON public.lesson_progress FROM anon;
REVOKE ALL ON public.bookmarks FROM anon;
REVOKE ALL ON public.quiz_results FROM anon;

-- Grant required table operations to authenticated role
GRANT SELECT, INSERT, UPDATE ON public.learner_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.bookmarks TO authenticated;
GRANT SELECT, INSERT ON public.quiz_results TO authenticated;

-- ============================================================================
-- Phase 4: Community, Discussions, Replies, Reports, and Moderation
-- ============================================================================

-- User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('moderator', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Community Discussions Table
CREATE TABLE IF NOT EXISTS public.community_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3 AND char_length(title) <= 120),
    content TEXT NOT NULL CHECK (char_length(trim(content)) >= 10 AND char_length(content) <= 5000),
    reply_count INTEGER NOT NULL DEFAULT 0 CHECK (reply_count >= 0),
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_community_discussions_topic ON public.community_discussions(topic_id);
CREATE INDEX IF NOT EXISTS idx_community_discussions_author ON public.community_discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_community_discussions_created ON public.community_discussions(created_at DESC);
ALTER TABLE public.community_discussions ENABLE ROW LEVEL SECURITY;

-- Community Replies Table
CREATE TABLE IF NOT EXISTS public.community_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES public.community_discussions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL CHECK (char_length(trim(content)) >= 1 AND char_length(content) <= 5000),
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_community_replies_discussion ON public.community_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_author ON public.community_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_created ON public.community_replies(created_at ASC);
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;

-- Community Content Reports Table
CREATE TABLE IF NOT EXISTS public.community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('discussion', 'reply')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL CHECK (char_length(trim(reason)) >= 3 AND char_length(reason) <= 500),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_target_report UNIQUE (reporter_id, target_type, target_id)
);
CREATE INDEX IF NOT EXISTS idx_community_reports_target ON public.community_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_reporter ON public.community_reports(reporter_id);
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- Trigger: Maintain Discussion Reply Counts
CREATE OR REPLACE FUNCTION public.update_discussion_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.community_discussions
        SET reply_count = reply_count + 1,
            updated_at = now()
        WHERE id = NEW.discussion_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.community_discussions
        SET reply_count = GREATEST(reply_count - 1, 0),
            updated_at = now()
        WHERE id = OLD.discussion_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_reply_count ON public.community_replies;
CREATE TRIGGER trg_reply_count
AFTER INSERT OR DELETE ON public.community_replies
FOR EACH ROW EXECUTE FUNCTION public.update_discussion_reply_count();

-- RLS: User Roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    ));

-- RLS: Community Discussions
DROP POLICY IF EXISTS "Public can view active discussions" ON public.community_discussions;
CREATE POLICY "Public can view active discussions"
    ON public.community_discussions
    FOR SELECT
    TO anon, authenticated
    USING (
        is_hidden = false
        OR (auth.uid() IS NOT NULL AND auth.uid() = author_id)
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role IN ('moderator', 'admin')
        )
    );

DROP POLICY IF EXISTS "Authenticated learners can create discussions" ON public.community_discussions;
CREATE POLICY "Authenticated learners can create discussions"
    ON public.community_discussions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id AND is_hidden = false);

DROP POLICY IF EXISTS "Authors can update own discussions" ON public.community_discussions;
CREATE POLICY "Authors can update own discussions"
    ON public.community_discussions
    FOR UPDATE
    TO authenticated
    USING (
        (auth.uid() = author_id AND is_hidden = false)
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role IN ('moderator', 'admin')
        )
    )
    WITH CHECK (
        (auth.uid() = author_id AND is_hidden = false)
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role IN ('moderator', 'admin')
        )
    );

DROP POLICY IF EXISTS "Authors can delete own discussions" ON public.community_discussions;
CREATE POLICY "Authors can delete own discussions"
    ON public.community_discussions
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role IN ('moderator', 'admin')
        )
    );

-- RLS: Community Replies
DROP POLICY IF EXISTS "Public can view active replies" ON public.community_replies;
CREATE POLICY "Public can view active replies"
    ON public.community_replies
    FOR SELECT
    TO anon, authenticated
    USING (
        is_hidden = false
        OR (auth.uid() IS NOT NULL AND auth.uid() = author_id)
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role IN ('moderator', 'admin')
        )
    );

DROP POLICY IF EXISTS "Authenticated learners can create replies" ON public.community_replies;
CREATE POLICY "Authenticated learners can create replies"
    ON public.community_replies
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id AND is_hidden = false);

DROP POLICY IF EXISTS "Authors can update own replies" ON public.community_replies;
CREATE POLICY "Authors can update own replies"
    ON public.community_replies
    FOR UPDATE
    TO authenticated
    USING (
        (auth.uid() = author_id AND is_hidden = false)
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role IN ('moderator', 'admin')
        )
    )
    WITH CHECK (
        (auth.uid() = author_id AND is_hidden = false)
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role IN ('moderator', 'admin')
        )
    );

DROP POLICY IF EXISTS "Authors can delete own replies" ON public.community_replies;
CREATE POLICY "Authors can delete own replies"
    ON public.community_replies
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role IN ('moderator', 'admin')
        )
    );

-- RLS: Community Reports
DROP POLICY IF EXISTS "Reporters can view own reports" ON public.community_reports;
CREATE POLICY "Reporters can view own reports"
    ON public.community_reports
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = reporter_id
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role IN ('moderator', 'admin')
        )
    );

DROP POLICY IF EXISTS "Authenticated users can submit reports" ON public.community_reports;
CREATE POLICY "Authenticated users can submit reports"
    ON public.community_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Moderators can update reports" ON public.community_reports;
CREATE POLICY "Moderators can update reports"
    ON public.community_reports
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role IN ('moderator', 'admin')
        )
    );

-- Grants
GRANT SELECT ON public.community_discussions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_discussions TO authenticated;
GRANT SELECT ON public.community_replies TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_replies TO authenticated;
REVOKE ALL ON public.community_reports FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.community_reports TO authenticated;
REVOKE ALL ON public.user_roles FROM anon;
GRANT SELECT ON public.user_roles TO authenticated;

