-- Create resend_email_logs table
CREATE TABLE public.resend_email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ticket_number TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  resend_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resend_email_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all email logs
CREATE POLICY "Admins can view all email logs"
ON public.resend_email_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- System can insert email logs
CREATE POLICY "System can insert email logs"
ON public.resend_email_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_resend_logs_created_at ON public.resend_email_logs(created_at DESC);
CREATE INDEX idx_resend_logs_email_type ON public.resend_email_logs(email_type);
CREATE INDEX idx_resend_logs_status ON public.resend_email_logs(status);