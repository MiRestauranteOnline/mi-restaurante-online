-- Add coordinates toggle field to clients table
ALTER TABLE public.clients 
ADD COLUMN use_coordinates boolean DEFAULT false;

COMMENT ON COLUMN public.clients.use_coordinates IS 'Whether to use specific coordinates for maps instead of street address';