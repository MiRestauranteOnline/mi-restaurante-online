-- Create analytics events table for raw event tracking
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL,
  session_id text NOT NULL,
  event_type text NOT NULL, -- 'page_view', 'button_click', 'menu_section_view', 'menu_download', 'scroll_depth'
  event_data jsonb NOT NULL DEFAULT '{}', -- flexible data: page, button_type, section_name, scroll_percentage, etc.
  user_agent text,
  device_type text, -- 'desktop', 'mobile', 'tablet'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create daily analytics summary table for dashboard display
CREATE TABLE public.daily_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL,
  date date NOT NULL,
  total_page_views integer NOT NULL DEFAULT 0,
  unique_sessions integer NOT NULL DEFAULT 0,
  avg_time_on_page integer NOT NULL DEFAULT 0, -- in seconds
  bounce_rate numeric(5,2) NOT NULL DEFAULT 0, -- percentage
  whatsapp_clicks integer NOT NULL DEFAULT 0,
  phone_clicks integer NOT NULL DEFAULT 0,
  menu_downloads integer NOT NULL DEFAULT 0,
  reservation_clicks integer NOT NULL DEFAULT 0,
  menu_section_data jsonb NOT NULL DEFAULT '{}', -- section_name: {views, avg_time}
  device_breakdown jsonb NOT NULL DEFAULT '{}', -- device_type: count
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id, date)
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY "Public can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their client analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (client_id IN (
  SELECT user_clients.client_id 
  FROM user_clients 
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Admins can view all analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for daily_analytics
CREATE POLICY "Users can view their client daily analytics" 
ON public.daily_analytics 
FOR SELECT 
USING (client_id IN (
  SELECT user_clients.client_id 
  FROM user_clients 
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all daily analytics" 
ON public.daily_analytics 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can upsert daily analytics" 
ON public.daily_analytics 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add updated_at trigger for daily_analytics
CREATE TRIGGER update_daily_analytics_updated_at
  BEFORE UPDATE ON public.daily_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_analytics_events_client_date ON public.analytics_events(client_id, created_at);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_daily_analytics_client_date ON public.daily_analytics(client_id, date);