
-- Fix 1: Replace overly permissive storage policies with owner-scoped ones
DROP POLICY IF EXISTS "Authenticated users can upload dealer documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view dealer documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete dealer documents" ON storage.objects;

CREATE POLICY "Users can upload own dealer documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dealer-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own dealer documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'dealer-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own dealer documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dealer-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own dealer documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dealer-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix 2: Replace public QA health check SELECT policy with restricted one
DROP POLICY IF EXISTS "Authenticated users can view QA results" ON public.qa_health_checks;
-- No public SELECT policy - only the service role (edge function) writes/reads this table
