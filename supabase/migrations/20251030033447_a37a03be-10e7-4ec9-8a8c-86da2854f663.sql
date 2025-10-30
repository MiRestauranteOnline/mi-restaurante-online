-- Fix cron jobs to call edge functions once per day (they handle batch processing internally)

-- Remove old cron jobs
SELECT cron.unschedule('send-review-requests-daily');
SELECT cron.unschedule('send-reengagement-emails-daily');
SELECT cron.unschedule('deactivate-expired-subscriptions-daily');

-- =====================================================
-- CRON JOB 1: Send Review Requests (30 days after site goes live)
-- =====================================================
-- Runs daily at 10:00 AM UTC - Edge function processes all eligible clients
SELECT cron.schedule(
  'send-review-requests-daily',
  '0 10 * * *',
  $$
  SELECT
    extensions.net.http_post(
      url:='https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/send-review-request',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- =====================================================
-- CRON JOB 2: Send Re-engagement Emails (7 days after cancellation)
-- =====================================================
-- Runs daily at 11:00 AM UTC - Edge function processes all eligible clients
SELECT cron.schedule(
  'send-reengagement-emails-daily',
  '0 11 * * *',
  $$
  SELECT
    extensions.net.http_post(
      url:='https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/send-reengagement-email',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- =====================================================
-- CRON JOB 3: Deactivate Expired Subscriptions
-- =====================================================
-- Runs daily at 2:00 AM UTC (low traffic time)
SELECT cron.schedule(
  'deactivate-expired-subscriptions-daily',
  '0 2 * * *',
  $$
  SELECT
    extensions.net.http_post(
      url:='https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/deactivate-expired-subscriptions',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);