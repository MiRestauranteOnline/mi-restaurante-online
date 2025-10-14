-- Add OpenPay customer and subscription tracking to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS openpay_customer_id TEXT,
ADD COLUMN IF NOT EXISTS openpay_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_pause_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_resume_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pending_plan_change TEXT,
ADD COLUMN IF NOT EXISTS pending_plan_change_date TIMESTAMP WITH TIME ZONE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_openpay_customer ON public.clients(openpay_customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_openpay_subscription ON public.clients(openpay_subscription_id);

-- Add comments for documentation
COMMENT ON COLUMN public.clients.openpay_customer_id IS 'OpenPay customer ID for payment processing';
COMMENT ON COLUMN public.clients.openpay_subscription_id IS 'OpenPay subscription ID for recurring payments';
COMMENT ON COLUMN public.clients.subscription_pause_date IS 'Date when subscription was paused';
COMMENT ON COLUMN public.clients.subscription_resume_date IS 'Date when subscription will resume after pause';
COMMENT ON COLUMN public.clients.pending_plan_change IS 'Plan type to change to at next billing cycle (for downgrades)';
COMMENT ON COLUMN public.clients.pending_plan_change_date IS 'Date when pending plan change will take effect';