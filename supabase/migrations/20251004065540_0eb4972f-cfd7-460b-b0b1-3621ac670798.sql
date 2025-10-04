-- Add timezone, country_code, and locale fields to clients table
ALTER TABLE public.clients
ADD COLUMN timezone text DEFAULT 'America/Lima',
ADD COLUMN country_code text DEFAULT 'PE',
ADD COLUMN locale text DEFAULT 'es-PE';

-- Add comment for documentation
COMMENT ON COLUMN public.clients.timezone IS 'IANA timezone identifier (e.g., America/Lima, America/New_York)';
COMMENT ON COLUMN public.clients.country_code IS 'ISO 3166-1 alpha-2 country code (e.g., PE, US, ES)';
COMMENT ON COLUMN public.clients.locale IS 'Locale for language/region (e.g., es-PE, en-US)';
