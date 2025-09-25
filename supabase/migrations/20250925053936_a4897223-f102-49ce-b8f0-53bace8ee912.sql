-- Add delivery field to clients table
ALTER TABLE public.clients 
ADD COLUMN delivery jsonb DEFAULT '{}'::jsonb;