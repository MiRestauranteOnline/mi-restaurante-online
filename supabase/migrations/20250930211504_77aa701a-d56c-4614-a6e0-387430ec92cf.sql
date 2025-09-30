-- Drop the security definer view that's causing issues
DROP VIEW IF EXISTS public.clients_public_view CASCADE;