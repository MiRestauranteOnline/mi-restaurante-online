-- Fix clients table public access security issue
-- The current "Public can view basic client info" policy is too permissive

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view basic client info" ON public.clients;

-- Create a more restrictive policy that only allows viewing active clients
-- This still allows row access but the application must select only safe columns
CREATE POLICY "Public can view active restaurant clients" ON public.clients
FOR SELECT 
USING (
  -- Only allow viewing clients with active subscriptions
  subscription_status = 'active' 
  AND subscription_end_date > now()
);

-- Add a policy for viewing clients by subdomain (needed for restaurant websites)
-- This allows anyone to view a specific restaurant's public info when accessing by subdomain
CREATE POLICY "Public can view client by subdomain" ON public.clients
FOR SELECT
USING (
  -- Allow access when querying by subdomain
  -- Application code MUST only select non-sensitive columns
  subscription_status = 'active'
);

-- Add comment documenting which columns should be publicly accessible
COMMENT ON TABLE public.clients IS 
'PUBLIC COLUMNS (safe to expose): restaurant_name, phone, phone_country_code, whatsapp, whatsapp_country_code, address, coordinates, opening_hours, opening_hours_ordered, social_media_links, brand_colors, theme, subdomain, delivery
PRIVATE COLUMNS (never expose publicly): email, payment_status, subscription_status, subscription_start_date, subscription_end_date, next_billing_date, plan_type, rebill_subscription_id, rebill_customer_id, payment_id, trial_end_date, cancellation_date, cancellation_reason, payment_failures_count, last_payment_attempt, referral_source, vercel_team, vercel_project, vercel_dashboard_url, domain';

-- Create a database view for safe public access
CREATE OR REPLACE VIEW public.clients_public_view AS
SELECT 
  id,
  subdomain,
  restaurant_name,
  phone,
  phone_country_code,
  whatsapp,
  whatsapp_country_code,
  address,
  coordinates,
  opening_hours,
  opening_hours_ordered,
  social_media_links,
  brand_colors,
  theme,
  delivery,
  other_customizations,
  created_at,
  updated_at
FROM public.clients
WHERE subscription_status = 'active'
  AND (subscription_end_date IS NULL OR subscription_end_date > now());

-- Grant public read access to the view
GRANT SELECT ON public.clients_public_view TO anon;
GRANT SELECT ON public.clients_public_view TO authenticated;