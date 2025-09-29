-- Fix function search path security issue by setting search_path for existing functions
ALTER FUNCTION public.calculate_subscription_end_date(timestamp with time zone, text) SET search_path = public;

-- The leaked password protection warning is a global setting that should be enabled in Supabase dashboard
-- But we can't fix that via SQL migration - it needs to be done in the Supabase Auth settings