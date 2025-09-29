-- Add unique support PIN field to premium_features table
ALTER TABLE public.premium_features 
ADD COLUMN unique_support_pin text;

-- Add constraint to ensure PIN is exactly 8 characters when not null
ALTER TABLE public.premium_features 
ADD CONSTRAINT check_pin_length CHECK (unique_support_pin IS NULL OR length(unique_support_pin) = 8);

-- Create function to generate 8-digit PIN
CREATE OR REPLACE FUNCTION public.generate_support_pin()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_pin text;
    pin_exists boolean;
BEGIN
    LOOP
        -- Generate 8-digit PIN
        new_pin := LPAD(floor(random() * 100000000)::text, 8, '0');
        
        -- Check if PIN already exists
        SELECT EXISTS(
            SELECT 1 FROM public.premium_features 
            WHERE unique_support_pin = new_pin
        ) INTO pin_exists;
        
        -- Exit loop if PIN is unique
        EXIT WHEN NOT pin_exists;
    END LOOP;
    
    RETURN new_pin;
END;
$$;

-- Create function to auto-generate PIN when client upgrades to advanced
CREATE OR REPLACE FUNCTION public.handle_premium_plan_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If plan_type changed to 'advanced' and no PIN exists, generate one
    IF NEW.plan_type = 'advanced' AND OLD.plan_type != 'advanced' THEN
        -- Check if premium_features record exists
        IF NOT EXISTS (SELECT 1 FROM public.premium_features WHERE client_id = NEW.id) THEN
            -- Create premium_features record with PIN
            INSERT INTO public.premium_features (client_id, unique_support_pin)
            VALUES (NEW.id, public.generate_support_pin());
        ELSE
            -- Update existing record with PIN if it doesn't have one
            UPDATE public.premium_features 
            SET unique_support_pin = public.generate_support_pin()
            WHERE client_id = NEW.id AND unique_support_pin IS NULL;
        END IF;
    END IF;
    
    -- If plan_type changed from 'advanced' to something else, remove PIN
    IF OLD.plan_type = 'advanced' AND NEW.plan_type != 'advanced' THEN
        UPDATE public.premium_features 
        SET unique_support_pin = NULL
        WHERE client_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for plan changes
DROP TRIGGER IF EXISTS on_plan_change ON public.clients;
CREATE TRIGGER on_plan_change
    AFTER UPDATE OF plan_type ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_premium_plan_change();