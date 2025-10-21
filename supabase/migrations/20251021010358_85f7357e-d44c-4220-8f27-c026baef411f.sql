-- Step 1: Clean up orphaned records in client_images
DELETE FROM client_images 
WHERE client_id NOT IN (SELECT id FROM clients);

-- Step 2: Clean up orphaned records in carousel_images
DELETE FROM carousel_images 
WHERE client_id NOT IN (SELECT id FROM clients);

-- Step 3: Add foreign key constraints with cascade delete for client images
ALTER TABLE client_images
DROP CONSTRAINT IF EXISTS client_images_client_id_fkey;

ALTER TABLE client_images
ADD CONSTRAINT client_images_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- Step 4: Add foreign key constraints with cascade delete for carousel images
ALTER TABLE carousel_images
DROP CONSTRAINT IF EXISTS carousel_images_client_id_fkey;

ALTER TABLE carousel_images
ADD CONSTRAINT carousel_images_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- Step 5: Create function to delete image from storage when deleted from database
CREATE OR REPLACE FUNCTION delete_image_from_storage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  storage_path TEXT;
BEGIN
  -- Extract the storage path from the URL
  -- Format: https://[project].supabase.co/storage/v1/object/public/client-assets/[path]
  storage_path := regexp_replace(
    OLD.image_url, 
    '^https?://[^/]+/storage/v1/object/public/client-assets/', 
    ''
  );
  
  -- Delete from storage bucket
  IF storage_path IS NOT NULL AND storage_path != '' THEN
    BEGIN
      DELETE FROM storage.objects 
      WHERE bucket_id = 'client-assets' 
      AND name = storage_path;
      
      RAISE NOTICE 'Deleted image from storage: %', storage_path;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to delete image from storage: %, Error: %', storage_path, SQLERRM;
    END;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Step 6: Create trigger for client_images table
DROP TRIGGER IF EXISTS delete_client_image_from_storage ON client_images;
CREATE TRIGGER delete_client_image_from_storage
  BEFORE DELETE ON client_images
  FOR EACH ROW
  EXECUTE FUNCTION delete_image_from_storage();

-- Step 7: Create trigger for carousel_images table  
DROP TRIGGER IF EXISTS delete_carousel_image_from_storage ON carousel_images;
CREATE TRIGGER delete_carousel_image_from_storage
  BEFORE DELETE ON carousel_images
  FOR EACH ROW
  EXECUTE FUNCTION delete_image_from_storage();

-- Step 8: Create function to log image cleanup for clients
CREATE OR REPLACE FUNCTION log_client_image_cleanup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  image_count INTEGER;
  carousel_count INTEGER;
BEGIN
  -- Count images to be deleted
  SELECT COUNT(*) INTO image_count FROM client_images WHERE client_id = OLD.id;
  SELECT COUNT(*) INTO carousel_count FROM carousel_images WHERE client_id = OLD.id;
  
  IF image_count > 0 OR carousel_count > 0 THEN
    RAISE NOTICE 'Cleaning up % client images and % carousel images for client %', 
      image_count, carousel_count, OLD.id;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Step 9: Create trigger to log cleanup before client deletion
DROP TRIGGER IF EXISTS log_client_cleanup ON clients;
CREATE TRIGGER log_client_cleanup
  BEFORE DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION log_client_image_cleanup();