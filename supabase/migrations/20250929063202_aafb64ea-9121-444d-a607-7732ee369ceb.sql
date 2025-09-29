INSERT INTO public.premium_features (client_id, unique_support_pin, premium_support_enabled)
VALUES ('9e530090-7ca0-435f-9c5f-08c921d4ebb4', public.generate_support_pin(), true)
ON CONFLICT (client_id) 
DO UPDATE SET 
  unique_support_pin = public.generate_support_pin(),
  premium_support_enabled = true;