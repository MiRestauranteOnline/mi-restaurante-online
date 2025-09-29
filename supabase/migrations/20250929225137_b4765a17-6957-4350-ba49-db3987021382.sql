-- Create payment_settings table for global payment/test configuration
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_mode boolean NOT NULL DEFAULT true,
  test_payer_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can read payment settings"
  ON public.payment_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage payment settings"
  ON public.payment_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER trg_payment_settings_updated
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a default row if table is empty
INSERT INTO public.payment_settings (test_mode)
SELECT true
WHERE NOT EXISTS (SELECT 1 FROM public.payment_settings);