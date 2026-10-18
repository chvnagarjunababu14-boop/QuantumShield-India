-- ============================================================================
-- Migration 003: Security Hardening & RLS Infinite Recursion Fix
-- Scope: Phase 5 Production Readiness
-- ============================================================================

-- 1. Helper function for role lookup with SECURITY DEFINER
-- This eliminates recursive policy evaluation on public.user_roles and allows
-- anonymous checks on public.community_discussions without exposing user_roles.
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('moderator', 'admin')
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  END;
$$;

GRANT EXECUTE ON FUNCTION public.is_moderator_or_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. Update RLS on user_roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- 3. Update RLS on community_discussions
DROP POLICY IF EXISTS "Public can view active discussions" ON public.community_discussions;
CREATE POLICY "Public can view active discussions"
    ON public.community_discussions
    FOR SELECT
    TO anon, authenticated
    USING (
        is_hidden = false
        OR (auth.uid() IS NOT NULL AND auth.uid() = author_id)
        OR public.is_moderator_or_admin()
    );

DROP POLICY IF EXISTS "Authors can update own discussions" ON public.community_discussions;
CREATE POLICY "Authors can update own discussions"
    ON public.community_discussions
    FOR UPDATE
    TO authenticated
    USING (
        (auth.uid() = author_id AND is_hidden = false)
        OR public.is_moderator_or_admin()
    )
    WITH CHECK (
        (auth.uid() = author_id AND is_hidden = false)
        OR public.is_moderator_or_admin()
    );

DROP POLICY IF EXISTS "Authors can delete own discussions" ON public.community_discussions;
CREATE POLICY "Authors can delete own discussions"
    ON public.community_discussions
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = author_id
        OR public.is_moderator_or_admin()
    );

-- 4. Update RLS on community_replies
DROP POLICY IF EXISTS "Public can view active replies" ON public.community_replies;
CREATE POLICY "Public can view active replies"
    ON public.community_replies
    FOR SELECT
    TO anon, authenticated
    USING (
        is_hidden = false
        OR (auth.uid() IS NOT NULL AND auth.uid() = author_id)
        OR public.is_moderator_or_admin()
    );

DROP POLICY IF EXISTS "Authors can update own replies" ON public.community_replies;
CREATE POLICY "Authors can update own replies"
    ON public.community_replies
    FOR UPDATE
    TO authenticated
    USING (
        (auth.uid() = author_id AND is_hidden = false)
        OR public.is_moderator_or_admin()
    )
    WITH CHECK (
        (auth.uid() = author_id AND is_hidden = false)
        OR public.is_moderator_or_admin()
    );

DROP POLICY IF EXISTS "Authors can delete own replies" ON public.community_replies;
CREATE POLICY "Authors can delete own replies"
    ON public.community_replies
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = author_id
        OR public.is_moderator_or_admin()
    );

-- 5. Update RLS on community_reports
DROP POLICY IF EXISTS "Reporters can view own reports" ON public.community_reports;
CREATE POLICY "Reporters can view own reports"
    ON public.community_reports
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = reporter_id
        OR public.is_moderator_or_admin()
    );

DROP POLICY IF EXISTS "Moderators can update reports" ON public.community_reports;
CREATE POLICY "Moderators can update reports"
    ON public.community_reports
    FOR UPDATE
    TO authenticated
    USING (public.is_moderator_or_admin());
