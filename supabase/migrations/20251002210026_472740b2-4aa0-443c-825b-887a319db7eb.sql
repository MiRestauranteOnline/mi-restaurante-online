-- Add reservation duration and party size constraints to reservation_schedules
ALTER TABLE public.reservation_schedules
ADD COLUMN duration_minutes integer NOT NULL DEFAULT 120,
ADD COLUMN min_party_size integer NOT NULL DEFAULT 1,
ADD COLUMN max_party_size integer NOT NULL DEFAULT 10,
ADD COLUMN special_groups_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN special_groups_condition text,
ADD COLUMN special_groups_contact_method text;

-- Add check constraints for valid values
ALTER TABLE public.reservation_schedules
ADD CONSTRAINT duration_minutes_positive CHECK (duration_minutes > 0),
ADD CONSTRAINT min_party_size_positive CHECK (min_party_size > 0),
ADD CONSTRAINT max_party_size_valid CHECK (max_party_size >= min_party_size),
ADD CONSTRAINT special_groups_condition_valid CHECK (
  special_groups_condition IS NULL OR 
  special_groups_condition IN ('bigger', 'smaller', 'both')
),
ADD CONSTRAINT special_groups_contact_valid CHECK (
  special_groups_contact_method IS NULL OR 
  special_groups_contact_method IN ('phone', 'whatsapp', 'both')
);

COMMENT ON COLUMN public.reservation_schedules.duration_minutes IS 'Duration of each reservation slot in minutes (e.g., 120 for 2 hours)';
COMMENT ON COLUMN public.reservation_schedules.min_party_size IS 'Minimum number of guests allowed per reservation';
COMMENT ON COLUMN public.reservation_schedules.max_party_size IS 'Maximum number of guests allowed per reservation';
COMMENT ON COLUMN public.reservation_schedules.special_groups_enabled IS 'Whether to show contact message for groups outside the min/max range';
COMMENT ON COLUMN public.reservation_schedules.special_groups_condition IS 'When to show contact message: bigger, smaller, or both';
COMMENT ON COLUMN public.reservation_schedules.special_groups_contact_method IS 'Contact method for special groups: phone, whatsapp, or both';