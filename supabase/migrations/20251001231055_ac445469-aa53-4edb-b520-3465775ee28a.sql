-- Add INSERT policy for admins on client_settings table
CREATE POLICY "Admins can insert client settings"
ON public.client_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));