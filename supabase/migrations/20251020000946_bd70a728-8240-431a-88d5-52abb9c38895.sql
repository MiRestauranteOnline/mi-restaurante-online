-- Create function to automatically update sitemap when articles are published
CREATE OR REPLACE FUNCTION public.trigger_sitemap_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Only trigger on published articles
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR
     (TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published') OR
     (TG_OP = 'UPDATE' AND OLD.status = 'published' AND NEW.status = 'published' AND (OLD.slug != NEW.slug OR OLD.category != NEW.category)) THEN
    
    BEGIN
      -- Call the edge function to update sitemap (no JWT required since verify_jwt = false)
      PERFORM net.http_post(
        url := 'https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/update-static-sitemap',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
      );
      RAISE NOTICE 'Sitemap update triggered for article: %', NEW.slug;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Sitemap update failed for article %: %', NEW.slug, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on generated_articles table
DROP TRIGGER IF EXISTS update_sitemap_on_article_publish ON public.generated_articles;
CREATE TRIGGER update_sitemap_on_article_publish
  AFTER INSERT OR UPDATE ON public.generated_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sitemap_update();