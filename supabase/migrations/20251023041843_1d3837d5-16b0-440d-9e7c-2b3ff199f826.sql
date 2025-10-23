-- Fix subscription plans to reflect unlimited hosting in both plans
UPDATE subscription_plans 
SET features = ARRAY[
  'Sitio web completo optimizado y profesional',
  'Sistema de menú digital (categorías, items, precios, imágenes)',
  'Galería de imágenes tipo carrusel profesional',
  'Integración WhatsApp con botón flotante y popup',
  'Sistema de reservas completo incluido',
  'Diseño responsive optimizado para móviles',
  'SEO optimizado e indexación en Google',
  'Subdominio gratuito (nombre.mirestauranteonline.com)',
  'Panel de control para actualizaciones ilimitadas',
  'Entrega en 72 horas garantizado',
  'Hosting ilimitado (visitas y ancho de banda sin límite)',
  'SSL gratis incluido',
  'Soporte por email (respuesta en 48h)',
  'Soporte por WhatsApp incluido'
],
updated_at = now()
WHERE plan_key = 'basic';

-- Update Advanced Plan features with unlimited hosting
UPDATE subscription_plans 
SET features = ARRAY[
  '✨ Todo lo incluido en el Plan Básico',
  'Soporte prioritario (respuesta en 24h)',
  '1 hora mensual de soporte profesional para cambios',
  'Soporte WhatsApp premium con PIN único de acceso',
  'Dashboard de Analítica Avanzada en tiempo real',
  'Reportes mensuales de rendimiento detallados',
  'Configuración de Google Analytics incluida',
  'Configuración de Google Search Console incluida',
  'Soporte para conexión de dominio personalizado',
  'Cola de implementación prioritaria',
  'Consultoría mensual de optimización incluida'
],
updated_at = now()
WHERE plan_key = 'advanced';