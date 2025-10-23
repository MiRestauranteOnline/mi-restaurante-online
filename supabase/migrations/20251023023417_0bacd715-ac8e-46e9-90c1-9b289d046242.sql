-- Add is_deactivated column to clients table
ALTER TABLE public.clients 
ADD COLUMN is_deactivated boolean DEFAULT false NOT NULL;

-- Add index for faster queries
CREATE INDEX idx_clients_is_deactivated ON public.clients(is_deactivated);

-- Comment for documentation
COMMENT ON COLUMN public.clients.is_deactivated IS 'When true, the client site shows a deactivation overlay. Automatically set when subscription is cancelled due to non-payment.';