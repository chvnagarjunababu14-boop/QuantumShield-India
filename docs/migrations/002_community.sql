-- ============================================================================
-- QuantumShield India — Phase 4 Database Migration: Community & Moderation
-- Platform: InsForge-managed PostgreSQL
-- Scope: Discussions, Replies, Reports, and Role-Based Moderation
-- ============================================================================

-- Ensure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. User Roles Table
-- Trusted role provisioning for community moderators and administrators.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('moderator', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. Community Discussions Table
-- Topic-based discussions with validation limits (title: 3-120, content: 10-5000).
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 3. Community Replies Table
-- Chronological replies to discussions with content limit (1-5000).
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 4. Community Content Reports Table
-- Allows authenticated learners to report discussions or replies with a reason.
-- Enforces uniqueness per user & target to prevent spam / duplicate reports.
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 5. Trigger: Maintain Discussion Reply Counts
-- ----------------------------------------------------------------------------
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

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- A. User Roles Policies
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    ));

-- B. Community Discussions Policies
-- 1. Public and authenticated users can view non-hidden discussions.
--    Authors and moderators can always view discussions they authored/moderate.
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

-- 2. Authenticated users can insert their own discussions.
DROP POLICY IF EXISTS "Authenticated learners can create discussions" ON public.community_discussions;
CREATE POLICY "Authenticated learners can create discussions"
    ON public.community_discussions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id AND is_hidden = false);

-- 3. Authors can edit their own discussions (or moderators).
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

-- 4. Authors can delete their own discussions (or moderators).
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

-- C. Community Replies Policies
-- 1. Public and authenticated users can view active replies.
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

-- 2. Authenticated users can create replies.
DROP POLICY IF EXISTS "Authenticated learners can create replies" ON public.community_replies;
CREATE POLICY "Authenticated learners can create replies"
    ON public.community_replies
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id AND is_hidden = false);

-- 3. Authors can update their own replies (or moderators).
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

-- 4. Authors can delete their own replies (or moderators).
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

-- D. Community Reports Policies
-- 1. Reporters can view only their own reports (or moderators).
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

-- 2. Authenticated users can insert reports with verified identity.
DROP POLICY IF EXISTS "Authenticated users can submit reports" ON public.community_reports;
CREATE POLICY "Authenticated users can submit reports"
    ON public.community_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

-- 3. Only moderators can update or review reports.
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

-- ============================================================================
-- ROLE GRANTS
-- ============================================================================
-- Discussions
GRANT SELECT ON public.community_discussions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_discussions TO authenticated;

-- Replies
GRANT SELECT ON public.community_replies TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_replies TO authenticated;

-- Reports (strictly isolated from anonymous access)
REVOKE ALL ON public.community_reports FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.community_reports TO authenticated;

-- User Roles (strictly isolated from anonymous access)
REVOKE ALL ON public.user_roles FROM anon;
GRANT SELECT ON public.user_roles TO authenticated;
