-- Create table for client policies settings
CREATE TABLE IF NOT EXISTS public.client_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Libro de Reclamaciones settings
  reclamaciones_enabled BOOLEAN NOT NULL DEFAULT true,
  reclamaciones_email TEXT,
  
  -- Future policies (for now just placeholders)
  privacy_policy_enabled BOOLEAN NOT NULL DEFAULT false,
  privacy_policy_content TEXT,
  
  cookies_policy_enabled BOOLEAN NOT NULL DEFAULT false,
  cookies_policy_content TEXT,
  
  terms_of_service_enabled BOOLEAN NOT NULL DEFAULT false,
  terms_of_service_content TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(client_id)
);

-- Enable RLS
ALTER TABLE public.client_policies ENABLE ROW LEVEL SECURITY;

-- Policies for client_policies
CREATE POLICY "Admins can manage all client policies"
  ON public.client_policies
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their client policies"
  ON public.client_policies
  FOR SELECT
  USING (client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their client policies"
  ON public.client_policies
  FOR ALL
  USING (client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  ));

CREATE POLICY "Public can view enabled policies"
  ON public.client_policies
  FOR SELECT
  USING (
    reclamaciones_enabled = true OR
    privacy_policy_enabled = true OR
    cookies_policy_enabled = true OR
    terms_of_service_enabled = true
  );

-- Add trigger for updated_at
CREATE TRIGGER update_client_policies_updated_at
  BEFORE UPDATE ON public.client_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_client_policies_client_id ON public.client_policies(client_id);