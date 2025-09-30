-- Fix remaining function search path issue

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 6) AS INTEGER)), 0) + 1
  INTO counter
  FROM public.support_tickets
  WHERE ticket_number ~ '^TICK-[0-9]+$';
  
  new_number := 'TICK-' || LPAD(counter::TEXT, 6, '0');
  RETURN new_number;
END;
$function$;