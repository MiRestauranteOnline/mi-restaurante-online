-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- =====================================================
-- CRON JOB 1: Send Review Requests (30 days after site goes live)
-- =====================================================
-- Runs daily at 10:00 AM UTC
SELECT cron.schedule(
  'send-review-requests-daily',
  '0 10 * * *', -- Every day at 10:00 AM
  $$
  SELECT
    extensions.net.http_post(
      url:='https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/send-review-request',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id
  FROM public.clients
  WHERE 
    site_live_at IS NOT NULL 
    AND review_request_sent_at IS NULL
    AND site_live_at <= (NOW() - INTERVAL '30 days')
    AND subscription_status = 'active'
  LIMIT 50; -- Process max 50 per run to avoid overload
  $$
);

-- =====================================================
-- CRON JOB 2: Send Re-engagement Emails (7 days after cancellation)
-- =====================================================
-- Runs daily at 11:00 AM UTC
SELECT cron.schedule(
  'send-reengagement-emails-daily',
  '0 11 * * *', -- Every day at 11:00 AM
  $$
  SELECT
    extensions.net.http_post(
      url:='https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/send-reengagement-email',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id
  FROM public.clients
  WHERE 
    cancelled_at IS NOT NULL 
    AND reengagement_sent_at IS NULL
    AND cancelled_at <= (NOW() - INTERVAL '7 days')
    AND subscription_status IN ('cancelled', 'expired')
  LIMIT 50; -- Process max 50 per run to avoid overload
  $$
);

-- =====================================================
-- CRON JOB 3: Deactivate Expired Subscriptions
-- =====================================================
-- Runs daily at 2:00 AM UTC (when traffic is typically low)
SELECT cron.schedule(
  'deactivate-expired-subscriptions-daily',
  '0 2 * * *', -- Every day at 2:00 AM
  $$
  SELECT
    extensions.net.http_post(
      url:='https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/deactivate-expired-subscriptions',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Add helpful comments
COMMENT ON EXTENSION pg_cron IS 'Cron-based job scheduler for PostgreSQL';
COMMENT ON EXTENSION pg_net IS 'Async HTTP client for PostgreSQL';

-- View all scheduled cron jobs (for verification)
-- Run this query separately to see all cron jobs:
-- SELECT * FROM cron.job ORDER BY jobname;