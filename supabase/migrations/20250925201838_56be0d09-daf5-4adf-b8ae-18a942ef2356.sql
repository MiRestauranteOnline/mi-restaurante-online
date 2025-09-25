-- Add unique constraint on client_id for admin_content table
-- This ensures each client can only have one admin_content record
ALTER TABLE public.admin_content 
ADD CONSTRAINT admin_content_client_id_unique UNIQUE (client_id);