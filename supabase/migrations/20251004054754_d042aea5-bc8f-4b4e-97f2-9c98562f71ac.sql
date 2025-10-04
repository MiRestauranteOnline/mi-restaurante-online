-- Add custom_table_configs to reservation_schedules
ALTER TABLE public.reservation_schedules 
ADD COLUMN custom_table_configs JSONB DEFAULT NULL;

COMMENT ON COLUMN public.reservation_schedules.custom_table_configs IS 'Custom table configuration for this schedule. If NULL, uses global table_configurations. Format: [{"table_name": "...", "seats": 2, "quantity": 5, "min_party_size": 1, "max_party_size": 2}]';