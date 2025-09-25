-- Make client_settings write policies allow admins OR client-linked users

-- INSERT policy: drop and recreate with admin OR client link
DROP POLICY IF EXISTS "Users can insert their client settings" ON public.client_settings;
CREATE POLICY "Users can insert their client settings"
ON public.client_settings
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (client_id IN (
    SELECT user_clients.client_id FROM user_clients WHERE user_clients.user_id = auth.uid()
  ))
);

-- UPDATE policy: drop and recreate with admin OR client link
DROP POLICY IF EXISTS "Users can update their client settings" ON public.client_settings;
CREATE POLICY "Users can update their client settings"
ON public.client_settings
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (client_id IN (
    SELECT user_clients.client_id FROM user_clients WHERE user_clients.user_id = auth.uid()
  ))
);
