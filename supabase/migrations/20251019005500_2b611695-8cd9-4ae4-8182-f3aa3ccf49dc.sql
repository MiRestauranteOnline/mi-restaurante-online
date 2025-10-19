-- Add internal_notes column to reservations table
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS internal_notes text;