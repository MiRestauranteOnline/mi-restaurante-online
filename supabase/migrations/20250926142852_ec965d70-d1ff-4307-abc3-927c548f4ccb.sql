-- Add downloadable menu URL field to admin_content table
ALTER TABLE public.admin_content 
ADD COLUMN downloadable_menu_url text;