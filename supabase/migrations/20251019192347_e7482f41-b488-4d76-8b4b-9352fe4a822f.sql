-- Create table for storing page metadata per client
CREATE TABLE public.page_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  page_type TEXT NOT NULL, -- 'home', 'about', 'menu', 'contact', 'reviews'
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  og_title TEXT,
  og_description TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, page_type)
);

-- Enable RLS
ALTER TABLE public.page_metadata ENABLE ROW LEVEL SECURITY;

-- Admins can manage all metadata
CREATE POLICY "Admins can manage all page metadata"
ON public.page_metadata
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can manage their client metadata
CREATE POLICY "Users can manage their client page metadata"
ON public.page_metadata
FOR ALL
USING (client_id IN (
  SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
));

-- Public can view metadata (for rendering on client sites)
CREATE POLICY "Public can view page metadata"
ON public.page_metadata
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_page_metadata_updated_at
BEFORE UPDATE ON public.page_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();