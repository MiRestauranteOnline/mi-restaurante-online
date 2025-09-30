-- Remove MercadoPago and Rebill related columns from clients table
ALTER TABLE public.clients 
DROP COLUMN IF EXISTS rebill_subscription_id,
DROP COLUMN IF EXISTS rebill_customer_id,
DROP COLUMN IF EXISTS payment_id;