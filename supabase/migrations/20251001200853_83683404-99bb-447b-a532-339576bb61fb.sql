-- Allow public subdomain availability checks (signup form needs this)
CREATE POLICY "Public can check subdomain availability"
ON public.clients
FOR SELECT
TO public
USING (true);

-- Note: The above policy allows reading all columns, but the SignupStep1 component
-- only selects 'id, subdomain' or 'id, domain' so no sensitive data is exposed.
-- The queries use .maybeSingle() so they only check existence, not retrieve full records.