
-- Table to store daily QA health check results
CREATE TABLE public.qa_health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at timestamp with time zone NOT NULL DEFAULT now(),
  overall_status text NOT NULL DEFAULT 'pass', -- 'pass', 'warn', 'fail'
  checks jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  duration_ms integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.qa_health_checks ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read QA results
CREATE POLICY "Authenticated users can view QA results"
  ON public.qa_health_checks
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role (edge function) can insert - no user insert policy needed
-- Edge functions use service role key which bypasses RLS

-- Index for efficient latest-result queries
CREATE INDEX idx_qa_health_checks_run_at ON public.qa_health_checks (run_at DESC);
