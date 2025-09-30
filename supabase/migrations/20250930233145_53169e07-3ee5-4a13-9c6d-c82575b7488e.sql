-- Handle all foreign key constraints before deleting articles

-- Step 1: Clear target_keywords references
UPDATE target_keywords 
SET covered_by_article_id = NULL,
    is_covered = false
WHERE covered_by_article_id IN (
  'da044ed0-f346-4487-8497-54c67f294371',
  'e4a726f2-5003-4659-bec2-e2f71fea0076',
  '9fb4d2f2-b61e-43ad-a400-7a2d5a598557'
);

-- Step 2: Clear generation_logs references to content gaps and articles
UPDATE generation_logs 
SET content_gap_id = NULL,
    article_id = NULL
WHERE article_id IN (
  'da044ed0-f346-4487-8497-54c67f294371',
  'e4a726f2-5003-4659-bec2-e2f71fea0076',
  '9fb4d2f2-b61e-43ad-a400-7a2d5a598557'
)
OR content_gap_id IN (
  SELECT id FROM content_gaps 
  WHERE article_id IN (
    'da044ed0-f346-4487-8497-54c67f294371',
    'e4a726f2-5003-4659-bec2-e2f71fea0076',
    '9fb4d2f2-b61e-43ad-a400-7a2d5a598557'
  )
);

-- Step 3: Delete content gaps for articles we'll delete
DELETE FROM content_gaps 
WHERE article_id IN (
  'da044ed0-f346-4487-8497-54c67f294371',
  'e4a726f2-5003-4659-bec2-e2f71fea0076',
  '9fb4d2f2-b61e-43ad-a400-7a2d5a598557'
);

-- Step 4: Delete the duplicate articles
DELETE FROM generated_articles 
WHERE id IN (
  'da044ed0-f346-4487-8497-54c67f294371',
  'e4a726f2-5003-4659-bec2-e2f71fea0076',
  '9fb4d2f2-b61e-43ad-a400-7a2d5a598557'
);

-- Step 5: Clear generation_logs for duplicate content gaps
UPDATE generation_logs 
SET content_gap_id = NULL
WHERE content_gap_id IN (
  SELECT id FROM content_gaps 
  WHERE (topic LIKE '%SEO para Restaurantes%' AND article_id IS NULL)
  OR (topic LIKE '%Sistema POS%' AND id NOT IN (
    SELECT id FROM content_gaps 
    WHERE topic LIKE '%Sistema POS%' 
    ORDER BY created_at ASC 
    LIMIT 1
  ))
  OR ((topic LIKE '%Marketing Digital%' AND topic NOT LIKE '%Guía Completa%') AND article_id IS NULL)
  OR (topic LIKE '%Publicidad Online%' AND article_id IS NULL)
);

-- Step 6: Delete duplicate content gaps
DELETE FROM content_gaps 
WHERE topic LIKE '%SEO para Restaurantes%' 
AND article_id IS NULL;

DELETE FROM content_gaps 
WHERE topic LIKE '%Sistema POS%' 
AND id NOT IN (
  SELECT id FROM content_gaps 
  WHERE topic LIKE '%Sistema POS%' 
  ORDER BY created_at ASC 
  LIMIT 1
);

DELETE FROM content_gaps 
WHERE (
  (topic LIKE '%Marketing Digital%' AND topic NOT LIKE '%Guía Completa%')
  OR (topic LIKE '%Publicidad Online%')
)
AND article_id IS NULL;

-- Step 7: Update internal links in remaining articles
UPDATE generated_articles 
SET content = REGEXP_REPLACE(
  content,
  '<a[^>]*href="/guia/desarrollo-web/(diseno-web-restaurantes-lima-tendencias-2025|diseno-web-restaurantes-lima-tendencias-mejores-practicas)"[^>]*>([^<]*)</a>',
  '<a href="/guia/desarrollo-web/diseno-web-restaurantes-lima-exito">\2</a>',
  'g'
)
WHERE content ~ 'diseno-web-restaurantes-lima-tendencias';

UPDATE generated_articles 
SET content = REGEXP_REPLACE(
  content,
  '<a[^>]*href="/guia/tecnologia-restaurante/menu-digital-qr-restaurante"[^>]*>([^<]*)</a>',
  '<a href="/guia/tecnologia-restaurante/implementacion-menu-digital-qr-restaurantes">\2</a>',
  'g'
)
WHERE content ~ 'menu-digital-qr-restaurante';