-- Migrate delivery platform data from social_media_links to delivery field
UPDATE public.clients 
SET delivery = jsonb_build_object(
  'rappi', COALESCE(social_media_links->>'rappi', ''),
  'pedidos_ya', COALESCE(social_media_links->>'pedidos_ya', ''),
  'didi_food', COALESCE(social_media_links->>'didi_food', '')
);

-- Remove delivery platform fields from social_media_links
UPDATE public.clients 
SET social_media_links = social_media_links - 'rappi' - 'pedidos_ya' - 'didi_food';