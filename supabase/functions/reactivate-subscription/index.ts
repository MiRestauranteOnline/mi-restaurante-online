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

    console.log('Reactivating subscription for client:', clientId);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch client details
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('restaurant_name, email, plan_type, subscription_status, openpay_subscription_id, cancelled_at')
      .eq('id', clientId)
      .single();

    if (clientError) throw clientError;

    // Check if client has an active OpenPay subscription
    if (!client.openpay_subscription_id) {
      throw new Error('No OpenPay subscription found for this client');
    }

    // Check if subscription was actually cancelled
    if (!client.cancelled_at && client.subscription_status === 'active') {
      throw new Error('Subscription is already active');
    }

    // Calculate new subscription dates
    const now = new Date();
    const newEndDate = new Date(now);
    newEndDate.setMonth(newEndDate.getMonth() + 1); // Add 1 month

    // Reactivate the client subscription
    const { error: updateError } = await supabaseClient
      .from('clients')
      .update({
        subscription_status: 'active',
        is_deactivated: false,
        cancelled_at: null,
        subscription_start_date: now.toISOString(),
        subscription_end_date: newEndDate.toISOString(),
        next_billing_date: newEndDate.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', clientId);

    if (updateError) throw updateError;

    console.log('Subscription reactivated successfully for client:', clientId);

    // Prepare reactivation email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            ul { line-height: 1.8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Bienvenido de Vuelta!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${client.restaurant_name}</strong>,</p>
              
              <p>¡Excelentes noticias! Tu suscripción ha sido reactivada exitosamente.</p>

              <div class="success-box">
                <strong>✅ Estado: ACTIVO</strong><br>
                Tu sitio web está ahora en línea y funcionando completamente.
              </div>

              <div class="info-box">
                <h3>📅 Detalles de Tu Suscripción</h3>
                <ul>
                  <li><strong>Plan:</strong> ${client.plan_type === 'basic' ? 'Básico' : 'Avanzado'}</li>
                  <li><strong>Fecha de inicio:</strong> ${now.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
                  <li><strong>Próxima facturación:</strong> ${newEndDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
                  <li><strong>Estado del sitio:</strong> En línea ✅</li>
                </ul>
              </div>

              <div class="info-box">
                <h3>🚀 ¿Qué Puedes Hacer Ahora?</h3>
                <ul>
                  <li>✨ Tu sitio web está activo y visible para tus clientes</li>
                  <li>🎨 Accede a tu dashboard para gestionar tu contenido</li>
                  <li>📊 Revisa tus estadísticas y analíticas</li>
                  <li>🍽️ Actualiza tu menú y precios</li>
                  <li>📸 Sube nuevas fotos de tus platos</li>
                </ul>
                
                <center>
                  <a href="https://mirestaurante.online/client" class="button">Ir a Mi Dashboard</a>
                </center>
              </div>

              <div class="info-box">
                <h3>💡 ¿Necesitas Ayuda?</h3>
                <p>Nuestro equipo está disponible para ayudarte con cualquier pregunta o configuración:</p>
                <p>
                  📧 Email: <a href="mailto:info@mirestaurante.online">info@mirestaurante.online</a><br>
                  💬 Soporte: <a href="https://mirestaurante.online/soporte">mirestaurante.online/soporte</a>
                </p>
              </div>

              <p>Gracias por confiar en Mi Restaurante Online. ¡Estamos emocionados de seguir siendo tu partner digital!</p>

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

    // Send confirmation email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Mi Restaurante Online <info@mirestaurante.online>',
      to: [client.email],
      subject: '🎉 ¡Tu suscripción ha sido reactivada!',
      html: htmlContent,
    });

    if (emailError) {
      console.error('Error sending reactivation email:', emailError);
      // Don't throw - reactivation succeeded even if email failed
    } else {
      console.log('Reactivation email sent successfully:', emailData);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscription reactivated successfully',
        newEndDate: newEndDate.toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in reactivate-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
