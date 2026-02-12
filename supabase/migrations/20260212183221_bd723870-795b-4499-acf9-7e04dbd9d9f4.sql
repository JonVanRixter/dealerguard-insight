-- Add DELETE policy for profiles table so users can delete their own profile data
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);