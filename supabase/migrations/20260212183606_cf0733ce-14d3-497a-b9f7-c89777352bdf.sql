-- 1. Fix banned_entities SELECT policy: scope to own records only
DROP POLICY IF EXISTS "Users can view all banned entities" ON public.banned_entities;
CREATE POLICY "Users can view own banned entities"
ON public.banned_entities
FOR SELECT
USING (auth.uid() = banned_by);

-- 2. Add UPDATE policy for banned_entities
CREATE POLICY "Users can update own banned entities"
ON public.banned_entities
FOR UPDATE
USING (auth.uid() = banned_by);

-- 3. Fix qa_health_checks SELECT policy: restrict to admins or remove broad access
DROP POLICY IF EXISTS "Authenticated users can view health checks" ON public.qa_health_checks;
-- Only the edge function (service role) should insert; no direct user access needed
-- If needed in future, add admin-only policy

-- 4. Add DELETE policy for user_settings
CREATE POLICY "Users can delete own settings"
ON public.user_settings
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Add UPDATE policy for completed_rechecks
CREATE POLICY "Users can update own completed rechecks"
ON public.completed_rechecks
FOR UPDATE
USING (auth.uid() = user_id);

-- 6. Add UPDATE policy for dismissed_duplicates
CREATE POLICY "Users can update own dismissed duplicates"
ON public.dismissed_duplicates
FOR UPDATE
USING (auth.uid() = user_id);