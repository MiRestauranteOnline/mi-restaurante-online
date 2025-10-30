-- Add timestamp columns for email campaign tracking
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS review_request_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reengagement_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.clients.cancelled_at IS 'Timestamp when user initiated subscription cancellation (before end of billing cycle)';
COMMENT ON COLUMN public.clients.review_request_sent_at IS 'Timestamp when 30-day review request email was sent (prevents duplicate sends)';
COMMENT ON COLUMN public.clients.reengagement_sent_at IS 'Timestamp when 7-day re-engagement email was sent after cancellation (prevents duplicate sends)';