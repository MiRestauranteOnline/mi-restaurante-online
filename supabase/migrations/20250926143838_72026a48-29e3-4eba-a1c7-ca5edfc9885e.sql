-- Fix the trigger functions to use 'subdomain' instead of 'domain'
CREATE OR REPLACE FUNCTION public.trigger_fast_load_generation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  client_domain TEXT;
BEGIN
  -- Determine domain for the affected client
  IF TG_TABLE_NAME = 'clients' THEN
    client_domain := COALESCE(NEW.subdomain, OLD.subdomain);
  ELSE
    SELECT c.subdomain INTO client_domain
    FROM public.clients c 
    WHERE c.id = COALESCE(NEW.client_id, OLD.client_id);
  END IF;

  -- Call the base function
  PERFORM public.generate_fast_load_data(client_domain);

  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.debounced_fast_load_generation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  client_domain TEXT;
BEGIN
  -- Determine domain for the affected client
  IF TG_TABLE_NAME = 'clients' THEN
    client_domain := COALESCE(NEW.subdomain, OLD.subdomain);
  ELSE
    SELECT c.subdomain INTO client_domain
    FROM public.clients c 
    WHERE c.id = COALESCE(NEW.client_id, OLD.client_id);
  END IF;

  -- Debounce
  PERFORM pg_sleep(0.5);

  -- Call the base function (safe to call directly)
  PERFORM public.generate_fast_load_data(client_domain);

  RETURN COALESCE(NEW, OLD);
END;
$function$;