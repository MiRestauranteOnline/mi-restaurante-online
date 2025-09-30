-- Add brand profile table for content generation context
CREATE TABLE IF NOT EXISTS public.brand_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'Mi Restaurante Online',
  company_description TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  key_differentiators TEXT[] NOT NULL DEFAULT '{}',
  tone_of_voice TEXT NOT NULL DEFAULT 'professional, approachable, expert',
  primary_services TEXT[] NOT NULL DEFAULT '{}',
  geographic_focus TEXT[] NOT NULL DEFAULT '{Lima, Arequipa, Cusco, Perú}',
  founder_bio TEXT,
  brand_values TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_profile ENABLE ROW LEVEL SECURITY;

-- Allow public read access for content generation
CREATE POLICY "Public can view brand profile"
ON public.brand_profile
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage brand profile"
ON public.brand_profile
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial brand profile
INSERT INTO public.brand_profile (
  company_name,
  company_description,
  target_audience,
  key_differentiators,
  tone_of_voice,
  primary_services,
  geographic_focus,
  founder_bio,
  brand_values
) VALUES (
  'Mi Restaurante Online',
  'Mi Restaurante Online es una empresa tecnológica peruana especializada en crear sitios web profesionales para restaurantes. Combinamos tecnología internacional de vanguardia con un profundo entendimiento del mercado gastronómico local, ofreciendo soluciones digitales accesibles que ayudan a restaurantes de todos los tamaños a crecer en el mundo digital.',
  'Propietarios y gerentes de restaurantes en Perú que buscan establecer o mejorar su presencia digital con soluciones profesionales y accesibles.',
  ARRAY[
    'Precios accesibles adaptados al mercado peruano',
    'Experiencia específica en el sector gastronómico peruano',
    'Tecnología internacional de vanguardia',
    'Soporte local en español',
    'Comprensión profunda del mercado y cultura gastronómica peruana',
    'Enfoque en resultados y conversión, no solo diseño'
  ],
  'Profesional, experto y accesible. Usamos un tono que transmite autoridad y experiencia técnica, pero sin ser intimidante. Somos cercanos, directos y enfocados en resultados concretos para nuestros clientes.',
  ARRAY[
    'Diseño y desarrollo de sitios web para restaurantes',
    'Optimización SEO para el sector gastronómico',
    'Estrategias de marketing digital para restaurantes',
    'Integración con sistemas de delivery (Rappi, PedidosYa)',
    'Gestión de redes sociales para restaurantes',
    'Análisis de datos y reportes de rendimiento'
  ],
  ARRAY['Lima', 'Arequipa', 'Cusco', 'Perú'],
  'Kevin van Geffen es un emprendedor tecnológico con más de 8 años de experiencia en desarrollo web y marketing digital. Su pasión por crear soluciones digitales innovadoras lo llevó a especializarse en el sector gastronómico peruano. Como desarrollador full-stack y diseñador UX/UI, Kevin combina su expertise técnico con un profundo entendimiento del mercado local para crear sitios web que no solo son visualmente atractivos, sino que también generan resultados reales para los restaurantes. Su enfoque en la experiencia del usuario y las estrategias de conversión ha ayudado a decenas de restaurantes a aumentar sus ventas online y mejorar su presencia digital.',
  ARRAY[
    'Accesibilidad digital para todos los restaurantes',
    'Calidad profesional sin comprometer el presupuesto',
    'Resultados medibles y tangibles',
    'Innovación tecnológica al servicio del negocio gastronómico',
    'Compromiso con el crecimiento de nuestros clientes'
  ]
);