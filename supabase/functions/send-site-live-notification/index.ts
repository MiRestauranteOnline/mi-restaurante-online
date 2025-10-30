import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

    const { clientId } = await req.json();

    if (!clientId) {
      throw new Error('Client ID is required');
    }

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Determine the site URL (custom domain or subdomain)
    const siteUrl = client.custom_domain 
      ? `https://${client.custom_domain}` 
      : `https://${client.subdomain}.mirestaurante.online`;
    
    const dashboardUrl = `${siteUrl}/login`;
    const dashboardGuideUrl = 'https://mirestaurante.online/guias/primeros-pasos/introduccion';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #484848; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
            h1 { color: #1a1a1a; font-size: 32px; margin-bottom: 30px; }
            .success-box { background-color: #e6f7f5; padding: 32px; border-radius: 8px; border: 3px solid #44a79b; margin: 24px 0; text-align: center; }
            .info-box { background-color: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 24px 0; }
            .button { display: inline-block; background-color: #44a79b; color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 24px 0; font-size: 16px; }
            .button:visited { color: #ffffff !important; }
            .button:hover { color: #ffffff !important; background-color: #3a8f85; }
            .button:active { color: #ffffff !important; }
            .button-secondary { display: inline-block; background-color: #44a79b; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 8px 0; font-size: 14px; }
            .button-secondary:visited { color: #ffffff !important; }
            .button-secondary:hover { color: #ffffff !important; background-color: #3a8f85; }
            .button-secondary:active { color: #ffffff !important; }
            .footer { color: #898989; font-size: 14px; text-align: center; margin-top: 32px; }
            .video-section { background-color: #fef3c7; padding: 24px; border-radius: 8px; margin: 24px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 ¡Tu Sitio Web Está en Vivo!</h1>
            <p>Hola ${client.restaurant_name},</p>
            <p>¡Excelentes noticias! Tu sitio web profesional ya está <strong>en línea y listo para recibir visitas</strong>.</p>
            
            <div class="success-box">
              <strong style="color: #065f46; font-size: 24px;">🎉 ¡Felicitaciones!</strong><br>
              <span style="color: #065f46; font-size: 18px;">Tu restaurante ahora tiene presencia online profesional</span>
            </div>

            <div class="info-box">
              <strong>🌐 Accede a tu sitio web:</strong><br><br>
              <a href="${siteUrl}" style="color: #44a79b; font-size: 18px; font-weight: bold;">${siteUrl}</a><br><br>
              <em>Comparte este enlace con tus clientes, en redes sociales y en tu menú físico.</em>
            </div>

            <div class="video-section">
              <strong>📹 Tutoriales para Usar tu Panel de Control</strong><br><br>
              <p>Hemos preparado videos tutoriales para ayudarte a sacar el máximo provecho de tu panel de control:</p>
              
              <strong>📚 Aprenderás a:</strong><br>
              • Actualizar tu menú y precios<br>
              • Gestionar imágenes y contenido<br>
              • Configurar horarios y datos de contacto<br>
              • Ver estadísticas de visitas<br>
              • Y mucho más...<br><br>

              <div style="text-align: center;">
                <a href="${dashboardGuideUrl}" class="button-secondary">Ver Tutoriales en Video</a>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" class="button">Acceder a Mi Panel de Control</a>
            </div>

            <div class="info-box">
              <strong>🔐 Tus Datos de Acceso:</strong><br><br>
              <strong>URL del Panel:</strong> ${dashboardUrl}<br>
              <strong>Email:</strong> ${client.email}<br>
              <strong>Contraseña:</strong> La que creaste durante el registro
            </div>

            <p><strong>💡 Consejos para empezar:</strong></p>
            <ul>
              <li>Revisa toda la información de tu sitio y actualiza lo que sea necesario</li>
              <li>Comparte el enlace de tu sitio web en tus redes sociales</li>
              <li>Agrega el enlace a tu perfil de Google My Business</li>
              <li>Incluye el enlace en tus menús físicos y publicidad</li>
            </ul>

            <p>¿Necesitas ayuda? Estamos aquí para apoyarte en <a href="mailto:soporte@mirestaurante.online" style="color: #44a79b;">soporte@mirestaurante.online</a></p>

            <div class="footer">
              <a href="https://mirestaurante.online" style="color: #898989;">MiRestaurante.online</a><br>
              Sitios web profesionales para restaurantes en Perú
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'MiRestaurante <info@mirestaurante.online>',
      to: [client.email],
      subject: '🚀 ¡Tu Sitio Web Está en Vivo!',
      html,
    });

    console.log('Site live notification sent to:', client.email);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending site live notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
