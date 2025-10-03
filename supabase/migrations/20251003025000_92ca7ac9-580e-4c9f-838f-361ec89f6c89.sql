-- Phase 2: Remove all MercadoPago columns and data

-- Remove MercadoPago columns from clients table
ALTER TABLE public.clients 
  DROP COLUMN IF EXISTS mercadopago_subscription_id,
  DROP COLUMN IF EXISTS mercadopago_preapproval_id;

-- Remove MercadoPago columns from subscription_payments table
ALTER TABLE public.subscription_payments 
  DROP COLUMN IF EXISTS mercadopago_payment_id,
  DROP COLUMN IF EXISTS mercadopago_preference_id,
  DROP COLUMN IF EXISTS mercadopago_subscription_id;