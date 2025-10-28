-- Add dashboard_is_deactivated field to clients table
ALTER TABLE public.clients
ADD COLUMN dashboard_is_deactivated boolean NOT NULL DEFAULT true;

-- Change is_deactivated default to true for new clients
ALTER TABLE public.clients
ALTER COLUMN is_deactivated SET DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN public.clients.dashboard_is_deactivated IS 'Controls client dashboard access during manual quality review period';
COMMENT ON COLUMN public.clients.is_deactivated IS 'Controls public website access - shows maintenance overlay when true';