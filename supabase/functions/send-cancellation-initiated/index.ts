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

    console.log('Sending cancellation initiated email for client:', clientId);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch client details
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('restaurant_name, email, subscription_end_date, plan_type')
      .eq('id', clientId)
      .single();

    if (clientError) throw clientError;
    if (!client?.email) {
      throw new Error('Client email not found');
    }

    // Format end date
    const endDate = client.subscription_end_date 
      ? new Date(client.subscription_end_date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'el final del período de facturación';

    // Prepare email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #44a79b 0%, #3a8f85 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 30px; background: #44a79b; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            ul { line-height: 1.8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Confirmación de Cancelación</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${client.restaurant_name}</strong>,</p>
              
              <p>Hemos recibido tu solicitud de cancelación de suscripción.</p>

              <div class="highlight-box">
                <strong>⏰ Tu suscripción permanecerá activa hasta:</strong><br>
                ${endDate}
              </div>

              <div class="info-box">
                <h3>📋 ¿Qué significa esto?</h3>
                <ul>
                  <li>✅ Tu sitio web seguirá funcionando normalmente hasta la fecha indicada</li>
                  <li>✅ Mantendrás acceso completo a tu dashboard</li>
                  <li>✅ Tus clientes podrán seguir visitando tu sitio</li>
                  <li>⚠️ Después de esta fecha, tu sitio será desactivado</li>
                  <li>🔄 Puedes reactivar tu suscripción en cualquier momento desde tu dashboard</li>
                </ul>
              </div>

              <div class="info-box">
                <h3>💡 ¿Cambiaste de opinión?</h3>
                <p>Si deseas mantener tu sitio activo, puedes cancelar esta solicitud en cualquier momento:</p>
                <a href="https://mirestaurante.online/client/subscription" class="button">Reactivar Mi Suscripción</a>
              </div>

              <div class="info-box">
                <h3>❓ ¿Necesitas ayuda?</h3>
                <p>Si tienes alguna pregunta o necesitas asistencia, nuestro equipo está aquí para ayudarte:</p>
                <a href="https://mirestaurante.online/soporte" class="button">Contactar Soporte</a>
              </div>

              <p>Lamentamos verte partir. Si hay algo que podamos hacer para mejorar nuestro servicio, por favor háznoslo saber.</p>

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
      subject: `⏰ Tu suscripción permanecerá activa hasta ${endDate}`,
      html: htmlContent,
    });

    if (emailError) throw emailError;

    console.log('Cancellation initiated email sent successfully:', emailData);

    return new Response(
      JSON.stringify({ success: true, messageId: emailData?.id }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in send-cancellation-initiated:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
