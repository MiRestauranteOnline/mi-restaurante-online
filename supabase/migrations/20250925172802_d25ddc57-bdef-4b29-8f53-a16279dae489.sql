-- Temporarily make client_settings fully accessible to test
DROP POLICY IF EXISTS "Admins can insert client settings" ON public.client_settings;
DROP POLICY IF EXISTS "Admins can update client settings" ON public.client_settings;
DROP POLICY IF EXISTS "Users can insert their client settings" ON public.client_settings;
DROP POLICY IF EXISTS "Users can update their client settings" ON public.client_settings;

-- Create a very permissive policy for authenticated users
CREATE POLICY "Authenticated users can manage client settings"
ON public.client_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);