
CREATE TABLE public.dismissed_duplicates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  duplicate_key TEXT NOT NULL,
  dismissed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, duplicate_key)
);

ALTER TABLE public.dismissed_duplicates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dismissed duplicates"
ON public.dismissed_duplicates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dismissed duplicates"
ON public.dismissed_duplicates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dismissed duplicates"
ON public.dismissed_duplicates FOR DELETE
USING (auth.uid() = user_id);
