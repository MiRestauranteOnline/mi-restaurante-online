-- Add signup_completed field to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS signup_completed boolean NOT NULL DEFAULT false;

-- Create function to prevent manual signup_completed updates by users
CREATE OR REPLACE FUNCTION public.prevent_manual_signup_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow system (service role) or edge functions to set signup_completed
  -- Block if user is trying to manually set it to true
  IF NEW.signup_completed = true AND OLD.signup_completed = false THEN
    -- Check if this is being called from an edge function or service role
    -- Regular users should not be able to set this
    IF current_setting('request.jwt.claims', true)::jsonb->>'role' = 'authenticated' THEN
      RAISE EXCEPTION 'Cannot manually complete signup. Use the proper signup flow.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce signup_completed protection
DROP TRIGGER IF EXISTS enforce_signup_completion ON public.clients;
CREATE TRIGGER enforce_signup_completion
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  WHEN (OLD.signup_completed IS DISTINCT FROM NEW.signup_completed)
  EXECUTE FUNCTION public.prevent_manual_signup_completion();

-- Create index for faster queries on signup_completed
CREATE INDEX IF NOT EXISTS idx_clients_signup_completed ON public.clients(signup_completed) WHERE signup_completed = false;