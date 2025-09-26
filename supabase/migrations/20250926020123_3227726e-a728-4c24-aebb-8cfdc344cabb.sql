-- Fix the pg_net extension issue in fast-load generation functions
-- Make the HTTP calls handle errors gracefully to prevent blocking database operations

CREATE OR REPLACE FUNCTION public.trigger_fast_load_generation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  client_subdomain TEXT;
BEGIN
  -- Get the subdomain for the affected client
  IF TG_TABLE_NAME = 'clients' THEN
    SELECT NEW.subdomain INTO client_subdomain;
  ELSE
    -- For other tables, get subdomain from clients table
    SELECT c.subdomain INTO client_subdomain
    FROM clients c 
    WHERE c.id = COALESCE(NEW.client_id, OLD.client_id);
  END IF;
  
  -- Only proceed if we have a subdomain
  IF client_subdomain IS NOT NULL THEN
    -- Try to make async HTTP request to regenerate fast-load data
    -- Handle any errors gracefully to prevent blocking database operations
    BEGIN
      PERFORM net.http_post(
        url := 'https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/prebuild-client-data',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := json_build_object('subdomain', client_subdomain)::jsonb
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't fail the transaction
      RAISE NOTICE 'Fast-load generation failed for subdomain %: %', client_subdomain, SQLERRM;
    END;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update debounced function with proper search_path and error handling
CREATE OR REPLACE FUNCTION public.debounced_fast_load_generation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  -- Use pg_sleep to add a small delay and reduce rapid-fire triggers
  PERFORM pg_sleep(0.5);
  RETURN trigger_fast_load_generation();
END;
$$;