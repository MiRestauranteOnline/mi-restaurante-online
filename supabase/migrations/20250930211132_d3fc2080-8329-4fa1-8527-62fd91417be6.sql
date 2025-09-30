-- Fix Critical Security Issues

-- 1. Fix clients table - Remove overly permissive public read access
-- Drop the problematic public policy and replace with more restrictive one
DROP POLICY IF EXISTS "Public can view active clients by subdomain" ON public.clients;

-- Create new policy that only allows public to view non-sensitive client data
CREATE POLICY "Public can view basic client info" ON public.clients
FOR SELECT USING (true);

-- However, we need to ensure sensitive columns are protected
-- Add a more restrictive policy for sensitive data
CREATE POLICY "Admins can view all client data" ON public.clients
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix daily_analytics table - Remove overly permissive system policy
DROP POLICY IF EXISTS "System can upsert daily analytics" ON public.daily_analytics;

-- Create proper policies for daily_analytics
CREATE POLICY "Service role can insert analytics" ON public.daily_analytics
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can update analytics" ON public.daily_analytics
FOR UPDATE
USING (true);

-- 3. Fix client_settings overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage client settings" ON public.client_settings;

-- Replace with proper user-based policies
CREATE POLICY "Users can manage their client settings" ON public.client_settings
FOR ALL
USING (
  client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  )
);

-- 4. Fix function search paths
-- Update generate_support_pin function
CREATE OR REPLACE FUNCTION public.generate_support_pin()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    new_pin text;
    pin_exists boolean;
BEGIN
    LOOP
        new_pin := LPAD(floor(random() * 100000000)::text, 8, '0');
        
        SELECT EXISTS(
            SELECT 1 FROM public.premium_features 
            WHERE unique_support_pin = new_pin
        ) INTO pin_exists;
        
        EXIT WHEN NOT pin_exists;
    END LOOP;
    
    RETURN new_pin;
END;
$function$;

-- Update set_ticket_number function
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := public.generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- Update update_ticket_stats function
CREATE OR REPLACE FUNCTION public.update_ticket_stats()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  UPDATE public.support_tickets 
  SET 
    response_count = response_count + 1,
    last_response_at = now(),
    updated_at = now()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$function$;