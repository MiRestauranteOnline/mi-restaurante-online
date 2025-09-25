-- Add ordered opening hours array column for guaranteed Monday-Sunday display
ALTER TABLE public.clients ADD COLUMN opening_hours_ordered JSONB DEFAULT '[]'::jsonb;

-- Create function to convert opening_hours object to ordered array
CREATE OR REPLACE FUNCTION public.generate_opening_hours_ordered(opening_hours_obj JSONB)
RETURNS JSONB AS $$
DECLARE
    days TEXT[] := ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    result JSONB := '[]'::jsonb;
    day TEXT;
    day_data JSONB;
BEGIN
    FOREACH day IN ARRAY days LOOP
        day_data := opening_hours_obj -> day;
        IF day_data IS NOT NULL THEN
            result := result || jsonb_build_object(
                'day', day,
                'open', day_data ->> 'open',
                'close', day_data ->> 'close',
                'closed', (day_data ->> 'closed')::boolean
            );
        END IF;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Create trigger to auto-update ordered array when opening_hours changes
CREATE OR REPLACE FUNCTION public.sync_opening_hours_ordered()
RETURNS TRIGGER AS $$
BEGIN
    NEW.opening_hours_ordered := public.generate_opening_hours_ordered(NEW.opening_hours);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add trigger
CREATE TRIGGER sync_opening_hours_ordered_trigger
    BEFORE INSERT OR UPDATE OF opening_hours ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_opening_hours_ordered();

-- Update existing records
UPDATE public.clients 
SET opening_hours_ordered = public.generate_opening_hours_ordered(opening_hours)
WHERE opening_hours IS NOT NULL;