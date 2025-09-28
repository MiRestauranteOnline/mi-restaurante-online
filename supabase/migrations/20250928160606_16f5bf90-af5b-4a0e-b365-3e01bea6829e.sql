-- Clean up duplicate records for client 52cbff2e-c013-4ee9-97d5-3b644d033006

-- Keep only the first review for each reviewer_name + review_text combination
WITH duplicate_reviews AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY client_id, reviewer_name, review_text 
    ORDER BY created_at ASC
  ) as rn
  FROM reviews 
  WHERE client_id = '52cbff2e-c013-4ee9-97d5-3b644d033006'
)
DELETE FROM reviews 
WHERE id IN (
  SELECT id FROM duplicate_reviews WHERE rn > 1
);

-- Keep only the first menu item for each name
WITH duplicate_items AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY client_id, name 
    ORDER BY created_at ASC
  ) as rn
  FROM menu_items 
  WHERE client_id = '52cbff2e-c013-4ee9-97d5-3b644d033006'
)
DELETE FROM menu_items 
WHERE id IN (
  SELECT id FROM duplicate_items WHERE rn > 1
);

-- Keep only the first team member for each name
WITH duplicate_members AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY client_id, name 
    ORDER BY created_at ASC
  ) as rn
  FROM team_members 
  WHERE client_id = '52cbff2e-c013-4ee9-97d5-3b644d033006'
)
DELETE FROM team_members 
WHERE id IN (
  SELECT id FROM duplicate_members WHERE rn > 1
);

-- Keep only the first carousel image for each image_url
WITH duplicate_carousel AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY client_id, image_url 
    ORDER BY created_at ASC
  ) as rn
  FROM carousel_images 
  WHERE client_id = '52cbff2e-c013-4ee9-97d5-3b644d033006'
)
DELETE FROM carousel_images 
WHERE id IN (
  SELECT id FROM duplicate_carousel WHERE rn > 1
);