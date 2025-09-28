-- Clean up duplicate client images that point to the same URL
-- Keep only one record for each unique image_url
WITH duplicate_client_images AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY client_id, image_url 
    ORDER BY created_at ASC
  ) as rn
  FROM client_images 
  WHERE client_id = '52cbff2e-c013-4ee9-97d5-3b644d033006'
)
DELETE FROM client_images 
WHERE id IN (
  SELECT id FROM duplicate_client_images WHERE rn > 1
);