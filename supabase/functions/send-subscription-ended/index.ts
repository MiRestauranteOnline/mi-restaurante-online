import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId } = await req.json();

    if (!clientId) {
      throw new Error('Client ID is required');
    }

    console.log('Sending subscription ended email for client:', clientId);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch client details
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('restaurant_name, email, plan_type, subdomain')
      .eq('id', clientId)
      .single();

    if (clientError) throw clientError;
    if (!client?.email) {
      throw new Error('Client email not found');
    }

    // Prepare email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .cta-button { display: inline-block; padding: 15px 40px; background: #44a79b; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            ul { line-height: 1.8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Tu Suscripción Ha Finalizado</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${client.restaurant_name}</strong>,</p>
              
              <p>Tu suscripción a Mi Restaurante Online ha llegado a su fin y tu sitio web ha sido desactivado.</p>

              <div class="alert-box">
                <strong>⚠️ Estado Actual:</strong><br>
                Tu sitio <strong>${client.subdomain}.lovable.app</strong> ya no está accesible para tus clientes.
              </div>

              <div class="info-box">
                <h3>🔄 ¡Reactiva Tu Sitio Ahora!</h3>
                <p>Puedes reactivar tu suscripción en cualquier momento y tu sitio volverá a estar en línea de inmediato.</p>
                
                <center>
                  <a href="https://mirestaurante.online/client/subscription" class="cta-button">🚀 Reactivar Mi Suscripción</a>
                </center>

                <p style="margin-top: 20px;"><strong>Al reactivar obtendrás:</strong></p>
                <ul>
                  <li>✅ Tu sitio web volverá a estar en línea inmediatamente</li>
                  <li>✅ Acceso completo a tu dashboard</li>
                  <li>✅ Todas tus configuraciones y contenido intactos</li>
                  <li>✅ Soporte técnico completo</li>
                  <li>✅ Facturación renovada a partir de hoy</li>
                </ul>
              </div>

              <div class="info-box">
                <h3>💰 ¿Tienes dudas sobre precios o planes?</h3>
                <p>Visita nuestra página de precios o contacta con nuestro equipo para encontrar el plan perfecto para ti.</p>
                <p>
                  <a href="https://mirestaurante.online/#pricing" style="color: #44a79b; text-decoration: none; font-weight: bold;">Ver Planes y Precios →</a>
                </p>
              </div>

              <div class="info-box">
                <h3>❓ ¿Necesitas Ayuda?</h3>
                <p>Nuestro equipo está disponible para responder cualquier pregunta:</p>
                <p>
                  📧 Email: <a href="mailto:info@mirestaurante.online">info@mirestaurante.online</a><br>
                  💬 Soporte: <a href="https://mirestaurante.online/soporte">mirestaurante.online/soporte</a>
                </p>
              </div>

              <p>Esperamos volver a trabajar contigo pronto y ayudarte a hacer crecer tu negocio en línea.</p>

              <div class="footer">
                <p><strong>Mi Restaurante Online</strong><br>
                Tu Partner Digital para Restaurantes</p>
                <p>📧 info@mirestaurante.online | 🌐 <a href="https://mirestaurante.online">mirestaurante.online</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Mi Restaurante Online <info@mirestaurante.online>',
      to: [client.email],
      subject: '❌ Tu suscripción ha finalizado - Reactívala ahora',
      html: htmlContent,
    });

    if (emailError) throw emailError;

    console.log('Subscription ended email sent successfully:', emailData);

    return new Response(
      JSON.stringify({ success: true, messageId: emailData?.id }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in send-subscription-ended:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
