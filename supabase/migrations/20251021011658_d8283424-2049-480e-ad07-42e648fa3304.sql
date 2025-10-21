-- Clean up storage when deleting a client and enhance logging
-- 1) Replace previous log trigger with a cleanup trigger that deletes all files under clients/{id} and temp/{id}

-- Drop previous log-only trigger and function if they exist
DROP TRIGGER IF EXISTS log_client_cleanup ON public.clients;
DROP FUNCTION IF EXISTS public.log_client_image_cleanup();

-- Create a SECURITY DEFINER trigger function to delete client storage and log counts
CREATE OR REPLACE FUNCTION public.cleanup_client_storage_and_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  image_count INTEGER;
  carousel_count INTEGER;
  files_deleted INTEGER;
BEGIN
  -- Count DB rows to be cascaded (informational only)
  SELECT COUNT(*) INTO image_count FROM public.client_images WHERE client_id = OLD.id;
  SELECT COUNT(*) INTO carousel_count FROM public.carousel_images WHERE client_id = OLD.id;

  -- Delete all storage objects for this client (both optimized and temp/originals)
  DELETE FROM storage.objects
  WHERE bucket_id = 'client-assets'
    AND (
      name LIKE ('clients/' || OLD.id::text || '/%')
      OR name LIKE ('temp/' || OLD.id::text || '/%')
    );
  GET DIAGNOSTICS files_deleted = ROW_COUNT;

  RAISE NOTICE 'Cleaning up % client_images, % carousel_images; deleted % storage files for client %',
    image_count, carousel_count, files_deleted, OLD.id;

  RETURN OLD;
END;
$$;

-- Create new trigger to run before a client is deleted
DROP TRIGGER IF EXISTS cleanup_client_storage ON public.clients;
CREATE TRIGGER cleanup_client_storage
  BEFORE DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_client_storage_and_log();