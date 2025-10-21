-- Add admin UPDATE policy for client_settings
CREATE POLICY "Admins can update client settings"
ON client_settings
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));