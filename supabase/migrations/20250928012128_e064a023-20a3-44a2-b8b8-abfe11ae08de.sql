-- Add a persistent display order to menu items and initialize it per category
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Initialize display_order per logical category group (category_id if present, else legacy category text)
WITH ranked AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(category_id::text, category)
      ORDER BY name ASC, created_at ASC
    ) AS rn
  FROM public.menu_items
)
UPDATE public.menu_items mi
SET display_order = r.rn
FROM ranked r
WHERE mi.id = r.id;

-- Helpful index for ordering within category
CREATE INDEX IF NOT EXISTS idx_menu_items_category_order
ON public.menu_items (category_id, display_order);
