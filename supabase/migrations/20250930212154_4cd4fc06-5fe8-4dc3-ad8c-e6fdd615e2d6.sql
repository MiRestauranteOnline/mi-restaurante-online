-- Remove payment_settings table since we removed payment integrations
DROP TABLE IF EXISTS public.payment_settings CASCADE;