-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members
CREATE POLICY "Public can view active team members" 
ON public.team_members 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can view their client team members" 
ON public.team_members 
FOR SELECT 
USING (client_id IN (
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Users can insert their client team members" 
ON public.team_members 
FOR INSERT 
WITH CHECK (client_id IN (
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Users can update their client team members" 
ON public.team_members 
FOR UPDATE 
USING (client_id IN (
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Users can delete their client team members" 
ON public.team_members 
FOR DELETE 
USING (client_id IN (
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all team members" 
ON public.team_members 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  reviewer_name TEXT NOT NULL,
  review_text TEXT NOT NULL,
  star_rating DECIMAL(2,1) NOT NULL CHECK (star_rating >= 0.5 AND star_rating <= 5.0),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Public can view active reviews" 
ON public.reviews 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can view their client reviews" 
ON public.reviews 
FOR SELECT 
USING (client_id IN (
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Users can insert their client reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (client_id IN (
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Users can update their client reviews" 
ON public.reviews 
FOR UPDATE 
USING (client_id IN (
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Users can delete their client reviews" 
ON public.reviews 
FOR DELETE 
USING (client_id IN (
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all reviews" 
ON public.reviews 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();