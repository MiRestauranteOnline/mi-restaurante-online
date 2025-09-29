-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job that runs daily at 1 AM to process analytics
SELECT cron.schedule(
  'process-daily-analytics',
  '0 1 * * *', -- Daily at 1 AM
  $$
  SELECT
    net.http_post(
        url:='https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/process-daily-analytics',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8"}'::jsonb,
        body:=concat('{"scheduled": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Insert dummy analytics data for the past 30 days to showcase the dashboard
-- Get a client ID to use for dummy data
DO $$
DECLARE
    client_uuid uuid;
    day_date date;
    day_offset integer;
BEGIN
    -- Get the first client ID available
    SELECT id INTO client_uuid FROM clients LIMIT 1;
    
    IF client_uuid IS NOT NULL THEN
        -- Generate data for the past 30 days
        FOR day_offset IN 0..29 LOOP
            day_date := CURRENT_DATE - day_offset;
            
            INSERT INTO daily_analytics (
                client_id,
                date,
                total_page_views,
                unique_sessions,
                avg_time_on_page,
                bounce_rate,
                whatsapp_clicks,
                phone_clicks,
                menu_downloads,
                reservation_clicks,
                device_breakdown,
                menu_section_data
            ) VALUES (
                client_uuid,
                day_date,
                -- Random but realistic page views (50-300 per day)
                50 + (random() * 250)::integer,
                -- Unique sessions (30-150 per day)
                30 + (random() * 120)::integer,
                -- Average time on page (60-300 seconds)
                60 + (random() * 240)::integer,
                -- Bounce rate (20-70%)
                20 + (random() * 50)::integer,
                -- WhatsApp clicks (5-25 per day)
                5 + (random() * 20)::integer,
                -- Phone clicks (2-15 per day)
                2 + (random() * 13)::integer,
                -- Menu downloads (1-10 per day)
                1 + (random() * 9)::integer,
                -- Reservation clicks (3-20 per day)
                3 + (random() * 17)::integer,
                -- Device breakdown
                jsonb_build_object(
                    'mobile', (40 + random() * 40)::integer,
                    'desktop', (20 + random() * 30)::integer,
                    'tablet', (5 + random() * 15)::integer
                ),
                -- Menu section data
                jsonb_build_object(
                    'Entradas', jsonb_build_object('views', (10 + random() * 20)::integer, 'avg_time', (30 + random() * 60)::integer),
                    'Platos Principales', jsonb_build_object('views', (15 + random() * 30)::integer, 'avg_time', (45 + random() * 90)::integer),
                    'Postres', jsonb_build_object('views', (5 + random() * 15)::integer, 'avg_time', (20 + random() * 40)::integer),
                    'Bebidas', jsonb_build_object('views', (8 + random() * 18)::integer, 'avg_time', (15 + random() * 30)::integer)
                )
            ) ON CONFLICT (client_id, date) DO NOTHING;
        END LOOP;
        
        RAISE NOTICE 'Dummy analytics data inserted for client %', client_uuid;
    ELSE
        RAISE NOTICE 'No clients found to insert dummy data';
    END IF;
END $$;