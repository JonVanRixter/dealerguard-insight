-- Add RLS policies for qa_health_checks table
-- The qa-health-check edge function uses service_role_key which bypasses RLS,
-- so these policies only affect client-side access.

CREATE POLICY "Authenticated users can view health checks"
ON public.qa_health_checks
FOR SELECT
TO authenticated
USING (true);

-- No INSERT/UPDATE/DELETE policies for regular users - only the service role (edge function) can write.