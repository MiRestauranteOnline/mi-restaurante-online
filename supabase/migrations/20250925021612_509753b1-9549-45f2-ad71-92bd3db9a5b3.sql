-- Remove any existing cron jobs and set up properly
SELECT cron.unschedule('daily-blog-generation-10am-lima');

-- Create the cron job with the standard cron.schedule function
SELECT cron.schedule(
  'daily-blog-generation-10am-lima',
  '0 15 * * *', -- 15:00 UTC = 10:00 Lima time
  $$
  SELECT
    net.http_post(
        url:='https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/daily-blog-generator',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);