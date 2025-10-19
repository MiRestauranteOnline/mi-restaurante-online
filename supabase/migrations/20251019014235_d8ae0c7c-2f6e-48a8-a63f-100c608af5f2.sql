-- Add reservations email field to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS reservations_email TEXT;