-- Trigger sitemap regeneration
DO $$
BEGIN
  PERFORM net.http_post(
    url := 'https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/update-static-sitemap',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
END $$;