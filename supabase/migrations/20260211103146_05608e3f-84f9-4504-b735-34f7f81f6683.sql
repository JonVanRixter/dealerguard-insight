
-- Banned dealers and directors list
CREATE TABLE public.banned_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('dealer', 'director')),
  entity_name TEXT NOT NULL,
  company_name TEXT,
  reason TEXT NOT NULL,
  failed_checks TEXT[] DEFAULT '{}',
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  banned_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.banned_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all banned entities"
  ON public.banned_entities FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert banned entities"
  ON public.banned_entities FOR INSERT
  WITH CHECK (auth.uid() = banned_by);

CREATE POLICY "Users can delete own banned entries"
  ON public.banned_entities FOR DELETE
  USING (auth.uid() = banned_by);

-- Onboarding applications tracking
CREATE TABLE public.onboarding_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dealer_name TEXT NOT NULL,
  company_number TEXT,
  stage TEXT NOT NULL DEFAULT 'pre-screening' CHECK (stage IN ('pre-screening', 'application', 'completed', 'failed')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'passed', 'failed')),
  segmentation JSONB DEFAULT '{}',
  qualification_notes TEXT,
  screening_results JSONB DEFAULT '{}',
  checklist_progress JSONB DEFAULT '{}',
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON public.onboarding_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.onboarding_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.onboarding_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON public.onboarding_applications FOR DELETE
  USING (auth.uid() = user_id);
