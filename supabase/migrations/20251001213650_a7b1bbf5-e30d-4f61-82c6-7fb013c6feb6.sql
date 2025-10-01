-- Add subscription tracking fields
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS mercadopago_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_preapproval_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_auto_recurring BOOLEAN DEFAULT true;

-- Add subscription ID tracking to payments
ALTER TABLE public.subscription_payments
ADD COLUMN IF NOT EXISTS mercadopago_subscription_id TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_subscription_id 
ON public.clients(mercadopago_subscription_id);

COMMENT ON COLUMN public.clients.mercadopago_subscription_id IS 'MercadoPago subscription/preapproval ID for recurring billing';
COMMENT ON COLUMN public.clients.subscription_auto_recurring IS 'Whether subscription is set to auto-renew';