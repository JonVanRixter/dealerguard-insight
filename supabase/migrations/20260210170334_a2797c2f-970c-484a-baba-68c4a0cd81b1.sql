
ALTER TABLE public.dealer_notes
  ADD CONSTRAINT dealer_notes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
