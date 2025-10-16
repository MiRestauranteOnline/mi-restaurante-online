-- Create table for client billing information
CREATE TABLE IF NOT EXISTS public.client_billing_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('boleta', 'factura')),
  dni TEXT,
  ruc TEXT,
  business_name TEXT,
  fiscal_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Enable RLS
ALTER TABLE public.client_billing_info ENABLE ROW LEVEL SECURITY;

-- Admins can manage all billing info
CREATE POLICY "Admins can manage all billing info"
  ON public.client_billing_info
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their client billing info
CREATE POLICY "Users can view their client billing info"
  ON public.client_billing_info
  FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM public.user_clients
      WHERE user_id = auth.uid()
    )
  );

-- Users can manage their client billing info
CREATE POLICY "Users can manage their client billing info"
  ON public.client_billing_info
  FOR ALL
  USING (
    client_id IN (
      SELECT client_id FROM public.user_clients
      WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_client_billing_info_updated_at
  BEFORE UPDATE ON public.client_billing_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();