-- Fix column-level security for clients table
-- RLS policies control row access, but we need column-level security for sensitive data

-- First, revoke default SELECT privilege from anon (public) role
REVOKE SELECT ON public.clients FROM anon;

-- Grant SELECT only on safe, public columns to anon role
GRANT SELECT (
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
) ON public.clients TO anon;

-- Authenticated users can see all columns (they are owners/admins)
GRANT SELECT ON public.clients TO authenticated;

-- Service role needs full access
GRANT ALL ON public.clients TO service_role;

-- Update the table comment to clearly document this security model
COMMENT ON TABLE public.clients IS 
'SECURITY MODEL:
- PUBLIC (anon): Can only SELECT specific safe columns (restaurant name, hours, address, etc.) for active clients
- AUTHENTICATED: Can SELECT all columns for their own clients (via RLS policies)
- ADMINS: Can SELECT and UPDATE all columns for all clients (via RLS policies)

PUBLIC COLUMNS (anon can read): id, subdomain, restaurant_name, phone, phone_country_code, whatsapp, whatsapp_country_code, address, coordinates, opening_hours, opening_hours_ordered, social_media_links, brand_colors, theme, delivery, other_customizations, created_at, updated_at

PRIVATE COLUMNS (authenticated only): email, domain, vercel_team, vercel_project, vercel_dashboard_url, referral_source, plan_type, subscription_status, payment_status, subscription_start_date, subscription_end_date, next_billing_date, trial_end_date, cancellation_date, cancellation_reason, payment_failures_count, last_payment_attempt';