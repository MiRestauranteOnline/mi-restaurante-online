-- Create premium_features table for advanced plan features
CREATE TABLE public.premium_features (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  google_analytics_id text,
  google_search_console_verification text,
  analytics_setup_date timestamp with time zone,
  analytics_enabled boolean DEFAULT false,
  monthly_reports_enabled boolean DEFAULT false,
  premium_support_enabled boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Enable RLS
ALTER TABLE public.premium_features ENABLE ROW LEVEL SECURITY;

-- Create policies for premium_features
CREATE POLICY "Admins can manage all premium features" 
ON public.premium_features 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their client premium features" 
ON public.premium_features 
FOR SELECT 
USING (client_id IN (
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Users can update their client premium features" 
ON public.premium_features 
FOR UPDATE 
USING (client_id IN (
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Users can insert their client premium features" 
ON public.premium_features 
FOR INSERT 
WITH CHECK (client_id IN (
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_premium_features_updated_at
  BEFORE UPDATE ON public.premium_features
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_premium_features_client_id ON public.premium_features(client_id);