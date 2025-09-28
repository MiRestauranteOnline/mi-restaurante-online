-- Add referral_source column to clients table to track how users found us
ALTER TABLE public.clients 
ADD COLUMN referral_source text;

-- Create index for better query performance on referral analytics
CREATE INDEX idx_clients_referral_source ON public.clients(referral_source);