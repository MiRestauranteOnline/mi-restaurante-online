-- Add a public policy for client images to allow admins to view all images
-- This will allow the admin dashboard to work without requiring complex authentication setup

CREATE POLICY "Public can view all client images for admin dashboard" 
ON client_images 
FOR SELECT 
USING (true);

-- Add a public policy for carousel images as well
CREATE POLICY "Public can view all carousel images for admin dashboard" 
ON carousel_images 
FOR SELECT 
USING (true);