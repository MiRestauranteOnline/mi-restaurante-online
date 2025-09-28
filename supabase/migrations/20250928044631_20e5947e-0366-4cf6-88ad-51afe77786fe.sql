-- Insert 4 test images for the specified client
INSERT INTO client_images (
  client_id,
  image_url,
  alt_text,
  original_filename,
  upload_context,
  file_size_kb
) VALUES 
(
  'ce186edc-ceac-44b8-90e9-b7d0591d6da3',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
  'Restaurante elegante con vista nocturna',
  'restaurant-elegant-night.jpg',
  'custom_upload',
  145
),
(
  'ce186edc-ceac-44b8-90e9-b7d0591d6da3',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
  'Interior moderno del restaurante',
  'restaurant-interior-modern.jpg',
  'custom_upload',
  167
),
(
  'ce186edc-ceac-44b8-90e9-b7d0591d6da3',
  'https://images.unsplash.com/photo-1559329007-40df8e8e8a0e?w=800&h=600&fit=crop',
  'Platos gourmet elegantes',
  'gourmet-dishes.jpg',
  'custom_upload',
  189
),
(
  'ce186edc-ceac-44b8-90e9-b7d0591d6da3',
  'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&h=600&fit=crop',
  'Chef preparando comida',
  'chef-cooking.jpg',
  'custom_upload',
  156
);