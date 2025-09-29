-- Add subscription management fields to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'basic' CHECK (plan_type IN ('basic', 'advanced'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'pending' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'pending', 'payment_failed', 'trial'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS next_billing_date timestamp with time zone;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'failed', 'cancelled', 'refunded'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS rebill_subscription_id text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS rebill_customer_id text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cancellation_date timestamp with time zone;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS payment_failures_count integer DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_payment_attempt timestamp with time zone;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS trial_end_date timestamp with time zone;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS payment_id text; -- For one-time payments or subscription payments

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_subscription_status ON public.clients(subscription_status);
CREATE INDEX IF NOT EXISTS idx_clients_plan_type ON public.clients(plan_type);
CREATE INDEX IF NOT EXISTS idx_clients_next_billing_date ON public.clients(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_clients_rebill_subscription_id ON public.clients(rebill_subscription_id);

-- Add a function to calculate subscription end date based on plan
CREATE OR REPLACE FUNCTION public.calculate_subscription_end_date(
  start_date timestamp with time zone,
  plan_type text
) RETURNS timestamp with time zone
LANGUAGE sql
STABLE
AS $$
  SELECT 
    CASE 
      WHEN plan_type = 'basic' THEN start_date + interval '1 month'
      WHEN plan_type = 'advanced' THEN start_date + interval '1 month'
      ELSE start_date + interval '1 month'
    END;
$$;

-- Add a function to check if subscription is active
CREATE OR REPLACE FUNCTION public.is_subscription_active(client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.clients 
    WHERE id = client_id 
    AND subscription_status = 'active' 
    AND (subscription_end_date IS NULL OR subscription_end_date > now())
  );
$$;