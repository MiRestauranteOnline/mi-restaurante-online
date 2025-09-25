-- Add admin policy to allow admins to update any client
CREATE POLICY "Admins can update any client"
ON public.clients
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));