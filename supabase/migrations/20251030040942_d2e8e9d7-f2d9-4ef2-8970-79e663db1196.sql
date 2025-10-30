-- Add email tracking columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS site_live_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS review_request_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reengagement_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Add index for email tracking queries
CREATE INDEX IF NOT EXISTS idx_clients_site_live_at ON public.clients(site_live_at);
CREATE INDEX IF NOT EXISTS idx_clients_review_request_sent_at ON public.clients(review_request_sent_at);
CREATE INDEX IF NOT EXISTS idx_clients_reengagement_sent_at ON public.clients(reengagement_sent_at);
CREATE INDEX IF NOT EXISTS idx_clients_cancelled_at ON public.clients(cancelled_at);

-- Add comment for documentation
COMMENT ON COLUMN public.clients.site_live_at IS 'Timestamp when the site was activated/went live';
COMMENT ON COLUMN public.clients.review_request_sent_at IS 'Timestamp when review request email was sent';
COMMENT ON COLUMN public.clients.reengagement_sent_at IS 'Timestamp when reengagement email was sent';
COMMENT ON COLUMN public.clients.cancelled_at IS 'Timestamp when subscription was cancelled (for email tracking)';