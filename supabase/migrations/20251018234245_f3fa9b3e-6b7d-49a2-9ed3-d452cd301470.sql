-- Add duration_minutes column to table_configurations
ALTER TABLE public.table_configurations 
ADD COLUMN duration_minutes integer NOT NULL DEFAULT 120;

COMMENT ON COLUMN public.table_configurations.duration_minutes IS 'Default reservation duration in minutes for this table configuration';