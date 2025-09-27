-- Add Vercel hosting fields to clients table
ALTER TABLE public.clients 
ADD COLUMN vercel_team TEXT,
ADD COLUMN vercel_project TEXT,
ADD COLUMN vercel_dashboard_url TEXT;