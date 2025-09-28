-- Update the client image record to match the actual stored content
UPDATE client_images 
SET 
  alt_text = 'Custom image 2',
  original_filename = 'custom-image-2',
  updated_at = now()
WHERE id = 'fb99c291-0bec-48c7-9f6a-3437ffd2dd0f';