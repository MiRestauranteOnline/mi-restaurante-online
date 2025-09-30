-- Fix overly permissive RLS policies

-- 1. Fix daily_analytics - Remove policies with USING (true) that allow public access
DROP POLICY IF EXISTS "Service role can insert analytics" ON public.daily_analytics;
DROP POLICY IF EXISTS "Service role can update analytics" ON public.daily_analytics;

-- Only service_role should be able to insert/update analytics (via edge functions)
-- These operations bypass RLS, so we don't need policies for them

-- 2. Fix clients table - Remove duplicate/overlapping public policies
DROP POLICY IF EXISTS "Public can view active restaurant clients" ON public.clients;
DROP POLICY IF EXISTS "Public can view client by subdomain" ON public.clients;

-- Create a single, clear policy for public access
CREATE POLICY "Public can view active clients by subdomain" ON public.clients
FOR SELECT
TO anon
USING (
  subscription_status = 'active' 
  AND (subscription_end_date IS NULL OR subscription_end_date > now())
);

-- 3. Ensure analytics and support policies are authenticated-only
-- Recreate policies to be role-specific rather than using public role

-- Analytics events - authenticated users only
DROP POLICY IF EXISTS "Admins can view all analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view their client analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can insert analytics for their clients" ON public.analytics_events;

CREATE POLICY "Admins can view all analytics events" ON public.analytics_events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their client analytics events" ON public.analytics_events
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert analytics for their clients" ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  )
);

-- Support tickets - authenticated users only  
DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view their client tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create tickets for their clients" ON public.support_tickets;

CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their client tickets" ON public.support_tickets
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create tickets for their clients" ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  )
);

-- Daily analytics - authenticated users only
DROP POLICY IF EXISTS "Admins can manage all daily analytics" ON public.daily_analytics;
DROP POLICY IF EXISTS "Users can view their client daily analytics" ON public.daily_analytics;

CREATE POLICY "Admins can manage all daily analytics" ON public.daily_analytics
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their client daily analytics" ON public.daily_analytics
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  )
);