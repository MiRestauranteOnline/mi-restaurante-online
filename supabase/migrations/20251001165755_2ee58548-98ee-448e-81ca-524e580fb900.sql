-- Create coupons table for discount management
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  applicable_plans TEXT[] NOT NULL DEFAULT ARRAY['basic', 'advanced'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription payments tracking table
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PEN',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
  payment_method TEXT,
  mercadopago_payment_id TEXT,
  mercadopago_preference_id TEXT,
  coupon_code TEXT,
  original_amount NUMERIC,
  discount_amount NUMERIC DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons
CREATE POLICY "Admins can manage all coupons"
  ON public.coupons
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view active coupons"
  ON public.coupons
  FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- RLS Policies for subscription_payments
CREATE POLICY "Admins can view all payments"
  ON public.subscription_payments
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their client payments"
  ON public.subscription_payments
  FOR SELECT
  USING (client_id IN (
    SELECT client_id FROM public.user_clients WHERE user_id = auth.uid()
  ));

-- Trigger for updating coupons updated_at
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_subscription_payments_client_id ON public.subscription_payments(client_id);
CREATE INDEX idx_subscription_payments_status ON public.subscription_payments(status);
CREATE INDEX idx_coupons_code ON public.coupons(code);

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
  coupon_code TEXT,
  plan_type TEXT,
  amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  coupon_record RECORD;
  discount NUMERIC;
  final_amount NUMERIC;
BEGIN
  -- Fetch coupon
  SELECT * INTO coupon_record
  FROM public.coupons
  WHERE code = coupon_code
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > now())
    AND valid_from <= now()
    AND plan_type = ANY(applicable_plans)
    AND (max_uses IS NULL OR uses_count < max_uses);

  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Cupón inválido o expirado'
    );
  END IF;

  -- Calculate discount
  IF coupon_record.discount_type = 'percentage' THEN
    discount := amount * (coupon_record.discount_value / 100);
  ELSE
    discount := coupon_record.discount_value;
  END IF;

  -- Ensure discount doesn't exceed amount
  discount := LEAST(discount, amount);
  final_amount := amount - discount;

  RETURN jsonb_build_object(
    'valid', true,
    'discount_amount', discount,
    'final_amount', final_amount,
    'discount_type', coupon_record.discount_type,
    'discount_value', coupon_record.discount_value
  );
END;
$$;