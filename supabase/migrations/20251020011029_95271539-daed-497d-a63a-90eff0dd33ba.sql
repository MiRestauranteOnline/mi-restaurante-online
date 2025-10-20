-- Create documentation_pages table for guide pages
CREATE TABLE IF NOT EXISTS public.documentation_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  changefreq TEXT NOT NULL DEFAULT 'weekly',
  priority NUMERIC(2,1) NOT NULL DEFAULT 0.7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_pages table for static pages
CREATE TABLE IF NOT EXISTS public.site_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  changefreq TEXT NOT NULL DEFAULT 'monthly',
  priority NUMERIC(2,1) NOT NULL DEFAULT 0.5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documentation_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

-- Public can view active pages
CREATE POLICY "Public can view active documentation pages"
  ON public.documentation_pages
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active site pages"
  ON public.site_pages
  FOR SELECT
  USING (is_active = true);

-- Admins can manage all pages
CREATE POLICY "Admins can manage documentation pages"
  ON public.documentation_pages
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage site pages"
  ON public.site_pages
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert existing documentation pages
INSERT INTO public.documentation_pages (path, changefreq, priority) VALUES
  ('/guias/inicio/que-es-pagina-web-restaurante', 'weekly', 0.7),
  ('/guias/inicio/beneficios-presencia-digital', 'weekly', 0.7),
  ('/guias/inicio/primeros-pasos', 'weekly', 0.7),
  ('/guias/contenido/actualizar-informacion-basica', 'weekly', 0.7),
  ('/guias/contenido/gestionar-menu', 'weekly', 0.7),
  ('/guias/contenido/agregar-imagenes', 'weekly', 0.7),
  ('/guias/contenido/configurar-horarios', 'weekly', 0.7),
  ('/guias/diseno/personalizar-colores', 'weekly', 0.7),
  ('/guias/diseno/elegir-plantilla', 'weekly', 0.7),
  ('/guias/diseno/subir-logo', 'weekly', 0.7),
  ('/guias/dominio/que-es-dominio', 'weekly', 0.7),
  ('/guias/dominio/elegir-nombre-dominio', 'weekly', 0.7),
  ('/guias/dominio/comprar-dominio', 'weekly', 0.7),
  ('/guias/dominio/conectar-dominio', 'weekly', 0.7),
  ('/guias/dominio/verificar-dominio', 'weekly', 0.7),
  ('/guias/dominio/configurar-email', 'weekly', 0.7),
  ('/guias/seo/que-es-seo', 'weekly', 0.7),
  ('/guias/seo/optimizar-contenido', 'weekly', 0.7),
  ('/guias/seo/palabras-clave', 'weekly', 0.7),
  ('/guias/seo/mejorar-posicionamiento', 'weekly', 0.7),
  ('/guias/marketing/atraer-clientes', 'weekly', 0.7),
  ('/guias/marketing/redes-sociales', 'weekly', 0.7),
  ('/guias/marketing/promociones', 'weekly', 0.7),
  ('/guias/reservas/configurar-sistema', 'weekly', 0.7),
  ('/guias/reservas/gestionar-reservas', 'weekly', 0.7),
  ('/guias/reservas/whatsapp-reservas', 'weekly', 0.7),
  ('/guias/soporte/contactar-soporte', 'weekly', 0.7);

-- Insert existing site pages
INSERT INTO public.site_pages (path, changefreq, priority) VALUES
  ('/', 'daily', 1.0),
  ('/blog', 'daily', 0.9),
  ('/sobre-nosotros', 'monthly', 0.5),
  ('/contacto', 'monthly', 0.5),
  ('/privacidad', 'yearly', 0.3),
  ('/terminos', 'yearly', 0.3),
  ('/soporte', 'monthly', 0.5);

-- Create trigger function to update sitemap
CREATE OR REPLACE FUNCTION public.trigger_sitemap_update_on_pages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/update-static-sitemap',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    );
    RAISE NOTICE 'Sitemap update triggered for pages table: %', TG_TABLE_NAME;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Sitemap update failed for table %: %', TG_TABLE_NAME, SQLERRM;
  END;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for documentation_pages
CREATE TRIGGER update_sitemap_on_documentation_change
  AFTER INSERT OR UPDATE OR DELETE ON public.documentation_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sitemap_update_on_pages();

-- Create triggers for site_pages
CREATE TRIGGER update_sitemap_on_site_page_change
  AFTER INSERT OR UPDATE OR DELETE ON public.site_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sitemap_update_on_pages();

-- Add updated_at trigger
CREATE TRIGGER update_documentation_pages_updated_at
  BEFORE UPDATE ON public.documentation_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_pages_updated_at
  BEFORE UPDATE ON public.site_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();