-- Create table for storing client uploaded images during signup
CREATE TABLE public.client_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  original_filename TEXT,
  upload_context TEXT DEFAULT 'custom_upload',
  file_size_kb INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_images ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all client images" 
ON public.client_images 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all client images" 
ON public.client_images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for client owners to manage their own images
CREATE POLICY "Users can view their client images" 
ON public.client_images 
FOR SELECT 
USING (client_id IN ( 
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Users can insert their client images" 
ON public.client_images 
FOR INSERT 
WITH CHECK (client_id IN ( 
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

CREATE POLICY "Users can delete their client images" 
ON public.client_images 
FOR DELETE 
USING (client_id IN ( 
  SELECT user_clients.client_id
  FROM user_clients
  WHERE user_clients.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_client_images_updated_at
BEFORE UPDATE ON public.client_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_client_images_client_id ON public.client_images(client_id);
CREATE INDEX idx_client_images_upload_context ON public.client_images(upload_context);