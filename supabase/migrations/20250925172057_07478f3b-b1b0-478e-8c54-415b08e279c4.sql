-- Add admin policies for client_settings table to allow admins to manage all client settings

-- Allow admins to insert client settings for any client
CREATE POLICY "Admins can insert client settings" 
ON public.client_settings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update client settings for any client
CREATE POLICY "Admins can update client settings" 
ON public.client_settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all client settings
CREATE POLICY "Admins can view all client settings" 
ON public.client_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete client settings
CREATE POLICY "Admins can delete client settings" 
ON public.client_settings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));