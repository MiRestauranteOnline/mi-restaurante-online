-- Fix remaining security issues

-- 1. Fix support_tickets table - Add column-level security
REVOKE SELECT ON public.support_tickets FROM anon;

-- Public doesn't need to see any support ticket data
-- Only authenticated users (via RLS) and service role can access
GRANT SELECT ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;

-- 2. Fix user_clients table - Add column-level security  
REVOKE SELECT ON public.user_clients FROM anon;

-- Only authenticated users can see their own relationships (via existing RLS)
GRANT SELECT ON public.user_clients TO authenticated;
GRANT ALL ON public.user_clients TO service_role;

-- 3. Fix analytics_events table - Restrict public INSERT
-- Remove the overly permissive public insert policy
DROP POLICY IF EXISTS "Public can insert analytics events" ON public.analytics_events;

-- Create a more restrictive policy - service role handles analytics
-- Authenticated users can insert their own client's analytics
CREATE POLICY "Users can insert analytics for their clients" ON public.analytics_events
FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  )
);

-- Allow service role to insert analytics (for edge functions)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 4. Fix premium_features table - Already has good RLS, just ensure column security
REVOKE SELECT ON public.premium_features FROM anon;
GRANT SELECT ON public.premium_features TO authenticated;
GRANT ALL ON public.premium_features TO service_role;

-- Add helpful comments
COMMENT ON TABLE public.support_tickets IS 'SECURITY: Only authenticated users (admins and ticket owners) can access. No public access.';
COMMENT ON TABLE public.user_clients IS 'SECURITY: Only authenticated users can see their own client relationships. No public access.';
COMMENT ON TABLE public.analytics_events IS 'SECURITY: Users can only insert analytics for their own clients. Viewing restricted to owners/admins.';
COMMENT ON TABLE public.premium_features IS 'SECURITY: Only authenticated users (clients and admins) can access premium settings. No public access.';