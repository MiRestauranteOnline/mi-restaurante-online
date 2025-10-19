-- Add cloudflare_zone_id to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS cloudflare_zone_id TEXT;

-- Create email_dns_requests table
CREATE TABLE IF NOT EXISTS public.email_dns_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- MX Records
  mx1_record TEXT NOT NULL DEFAULT 'mx1.privateemail.com',
  mx1_priority INTEGER NOT NULL DEFAULT 10,
  mx2_record TEXT NOT NULL DEFAULT 'mx2.privateemail.com',
  mx2_priority INTEGER NOT NULL DEFAULT 10,
  
  -- SPF Record
  spf_record TEXT NOT NULL DEFAULT 'v=spf1 include:spf.privateemail.com ~all',
  
  -- DKIM Record
  dkim_selector TEXT NOT NULL DEFAULT 'default._domainkey',
  dkim_value TEXT NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.email_dns_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_dns_requests
CREATE POLICY "Users can insert their client email DNS requests"
  ON public.email_dns_requests
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their client email DNS requests"
  ON public.email_dns_requests
  FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all email DNS requests"
  ON public.email_dns_requests
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_email_dns_requests_updated_at
  BEFORE UPDATE ON public.email_dns_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_email_dns_requests_client_id ON public.email_dns_requests(client_id);
CREATE INDEX idx_email_dns_requests_status ON public.email_dns_requests(status);