
CREATE TABLE public.completed_rechecks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dealer_name TEXT NOT NULL,
  recheck_month INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, dealer_name, recheck_month)
);

ALTER TABLE public.completed_rechecks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completed rechecks"
ON public.completed_rechecks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completed rechecks"
ON public.completed_rechecks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completed rechecks"
ON public.completed_rechecks FOR DELETE
USING (auth.uid() = user_id);
