-- Change homepage_reservations_section_visible default to FALSE
ALTER TABLE public.admin_content 
ALTER COLUMN homepage_reservations_section_visible SET DEFAULT false;