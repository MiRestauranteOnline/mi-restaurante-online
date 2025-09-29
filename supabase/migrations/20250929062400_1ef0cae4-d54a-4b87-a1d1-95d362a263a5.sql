-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  support_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  last_response_at TIMESTAMP WITH TIME ZONE,
  response_count INTEGER NOT NULL DEFAULT 0
);

-- Create ticket responses table
CREATE TABLE public.ticket_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal_note BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT NOT NULL,
  created_by_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for support_tickets
CREATE POLICY "Admins can manage all tickets" 
ON public.support_tickets 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their client tickets" 
ON public.support_tickets 
FOR SELECT 
USING (client_id IN (
  SELECT user_clients.client_id 
  FROM user_clients 
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Users can create tickets for their clients" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (client_id IN (
  SELECT user_clients.client_id 
  FROM user_clients 
  WHERE user_clients.user_id = auth.uid()
));

-- Create policies for ticket_responses
CREATE POLICY "Admins can manage all responses" 
ON public.ticket_responses 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view responses for their client tickets" 
ON public.ticket_responses 
FOR SELECT 
USING (ticket_id IN (
  SELECT st.id 
  FROM support_tickets st 
  WHERE st.client_id IN (
    SELECT user_clients.client_id 
    FROM user_clients 
    WHERE user_clients.user_id = auth.uid()
  )
));

CREATE POLICY "Users can create responses for their client tickets" 
ON public.ticket_responses 
FOR INSERT 
WITH CHECK (ticket_id IN (
  SELECT st.id 
  FROM support_tickets st 
  WHERE st.client_id IN (
    SELECT user_clients.client_id 
    FROM user_clients 
    WHERE user_clients.user_id = auth.uid()
  )
));

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 6) AS INTEGER)), 0) + 1
  INTO counter
  FROM public.support_tickets
  WHERE ticket_number ~ '^TICK-[0-9]+$';
  
  new_number := 'TICK-' || LPAD(counter::TEXT, 6, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := public.generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ticket_number();

-- Create trigger to update ticket stats on responses
CREATE OR REPLACE FUNCTION public.update_ticket_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.support_tickets 
  SET 
    response_count = response_count + 1,
    last_response_at = now(),
    updated_at = now()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_stats_trigger
  AFTER INSERT ON public.ticket_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ticket_stats();

-- Add indexes for performance
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_client_id ON public.support_tickets(client_id);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at);
CREATE INDEX idx_ticket_responses_ticket_id ON public.ticket_responses(ticket_id);