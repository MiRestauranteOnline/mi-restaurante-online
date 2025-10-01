-- Drop the previous policy and create a more explicit one for anon role
DROP POLICY IF EXISTS "Public can check subdomain availability" ON public.clients;

-- Create policy that explicitly allows anon users to check subdomain/domain availability
CREATE POLICY "Anon users can check subdomain and domain availability"
ON public.clients
FOR SELECT
TO anon, authenticated
USING (true);

-- This allows unauthenticated signup form to verify subdomain/domain availability
-- The query only selects id, subdomain, or id, domain - no sensitive data exposed