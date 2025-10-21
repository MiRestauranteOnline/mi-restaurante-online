-- Enhanced image cleanup: delete both original (temp/) and optimized (clients/.../) when image row is deleted
-- Replace the previous simple trigger with one that handles the full client folder structure

DROP TRIGGER IF EXISTS delete_client_image_from_storage ON public.client_images;
DROP TRIGGER IF EXISTS delete_carousel_image_from_storage ON public.carousel_images;
DROP FUNCTION IF EXISTS public.delete_image_from_storage();

-- New function that deletes both temp and optimized image folders
CREATE OR REPLACE FUNCTION public.delete_image_and_folders_from_storage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  client_uuid TEXT;
  files_deleted INTEGER := 0;
BEGIN
  -- Extract client_id from the row
  client_uuid := OLD.client_id::text;
  
  IF client_uuid IS NULL OR client_uuid = '' THEN
    RAISE NOTICE 'No client_id found for image, skipping storage cleanup';
    RETURN OLD;
  END IF;
  
  -- Delete all files in the client's storage folders (temp and optimized)
  -- This covers: temp/{client_id}/* and clients/{client_id}/*
  DELETE FROM storage.objects
  WHERE bucket_id = 'client-assets'
    AND (
      name LIKE ('temp/' || client_uuid || '/%')
      OR name LIKE ('clients/' || client_uuid || '/%')
    );
  
  GET DIAGNOSTICS files_deleted = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % storage files for client % (both temp and optimized)', files_deleted, client_uuid;
  
  RETURN OLD;
END;
$$;

-- Recreate triggers for both tables
CREATE TRIGGER delete_client_image_from_storage
  BEFORE DELETE ON public.client_images
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_image_and_folders_from_storage();

CREATE TRIGGER delete_carousel_image_from_storage
  BEFORE DELETE ON public.carousel_images
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_image_and_folders_from_storage();