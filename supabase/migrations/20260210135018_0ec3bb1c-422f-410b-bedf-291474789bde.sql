
-- Create storage bucket for dealer documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('dealer-documents', 'dealer-documents', false);

-- Storage policies: authenticated users can upload, view, and delete their own files
CREATE POLICY "Authenticated users can upload dealer documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dealer-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view dealer documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'dealer-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete dealer documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'dealer-documents' AND auth.role() = 'authenticated');

-- Create dealer_documents table
CREATE TABLE public.dealer_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dealer_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Other',
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dealer_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own documents"
ON public.dealer_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
ON public.dealer_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
ON public.dealer_documents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
ON public.dealer_documents FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_dealer_documents_updated_at
BEFORE UPDATE ON public.dealer_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
