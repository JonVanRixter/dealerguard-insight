
CREATE TABLE public.dealer_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_name TEXT NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dealer_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dealer notes"
  ON public.dealer_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dealer notes"
  ON public.dealer_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dealer notes"
  ON public.dealer_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dealer notes"
  ON public.dealer_notes FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_dealer_notes_updated_at
  BEFORE UPDATE ON public.dealer_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
