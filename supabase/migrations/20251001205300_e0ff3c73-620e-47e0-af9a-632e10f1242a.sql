-- Create subscription_plans table for dynamic plan management
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  monthly_price NUMERIC NOT NULL,
  original_price NUMERIC,
  discount_percentage NUMERIC,
  features TEXT[] NOT NULL DEFAULT '{}',
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'PEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view active subscription plans"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all subscription plans"
ON public.subscription_plans
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto update updated_at
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial plans (basic and advanced)
INSERT INTO public.subscription_plans (plan_key, name, monthly_price, original_price, discount_percentage, features, is_popular, is_active, display_order)
VALUES
  (
    'basic',
    'Plan Básico',
    49,
    NULL,
    NULL,
    ARRAY[
      'Hasta 3,000 visitas/mes (6 GB hosting)',
      'Soporte WhatsApp básico',
      'Soporte por email (respuesta en 48h)',
      'Actualizaciones auto-gestionables vía dashboard'
    ],
    true,
    true,
    1
  ),
  (
    'advanced',
    'Plan Avanzado',
    99,
    NULL,
    NULL,
    ARRAY[
      'Todo lo del Plan Básico',
      'Doble capacidad: Hasta 6,000 visitas/mes (12 GB hosting)',
      '1 hora/mes soporte profesional para cambios de texto e imágenes',
      'Soporte prioritario (respuesta en 24h)',
      'Soporte WhatsApp premium con PIN único',
      'Dashboard de Analítica Básica y reportes mensuales',
      'Configuración de Google Analytics y Search Console incluida'
    ],
    false,
    true,
    2
  )
ON CONFLICT (plan_key) DO NOTHING;