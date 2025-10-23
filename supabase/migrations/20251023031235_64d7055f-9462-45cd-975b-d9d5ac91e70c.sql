-- Add locked price columns to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS locked_basic_price NUMERIC,
ADD COLUMN IF NOT EXISTS locked_advanced_price NUMERIC;

COMMENT ON COLUMN public.clients.locked_basic_price IS 'Price locked for this client at registration for basic plan';
COMMENT ON COLUMN public.clients.locked_advanced_price IS 'Price locked for this client at registration for advanced plan';