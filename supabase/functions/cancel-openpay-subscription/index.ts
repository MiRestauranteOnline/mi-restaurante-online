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

    // Environment-based configuration
    const environment = Deno.env.get('OPENPAY_ENVIRONMENT') || 'sandbox';
    const suffix = environment === 'production' ? '_PROD' : '_SANDBOX';
    
    const merchantId = Deno.env.get(`OPENPAY_MERCHANT_ID${suffix}`)!;
    const privateKey = Deno.env.get(`OPENPAY_PRIVATE_KEY${suffix}`)!;
    const openpayApiBase = Deno.env.get('OPENPAY_API_BASE')!;
    
    console.log(`Using OpenPay ${environment} environment`);

    const { clientId, reason } = await req.json();

    console.log(`Processing cancellation for client:`, clientId);

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    if (!client.openpay_customer_id || !client.openpay_subscription_id) {
      throw new Error('No OpenPay subscription found');
    }

    const auth = btoa(`${privateKey}:`);
    const openpayUrl = `${openpayApiBase}/${merchantId}`;

    // Cancel subscription in OpenPay
    const cancelResponse = await fetch(
      `${openpayUrl}/customers/${client.openpay_customer_id}/subscriptions/${client.openpay_subscription_id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    if (!cancelResponse.ok && cancelResponse.status !== 404 && cancelResponse.status !== 412) {
      const error = await cancelResponse.json();
      console.error('OpenPay subscription cancellation failed:', error);
      throw new Error(`Failed to cancel subscription in OpenPay: ${error.description || 'Unknown error'}`);
    }
    
    if (cancelResponse.status === 412) {
      console.log('OpenPay timing issue (error 3013), proceeding with DB cancellation');
    } else if (cancelResponse.status === 404) {
      console.log('Subscription already cancelled in OpenPay, updating DB');
    }

    // Update client in database
    // Note: is_deactivated stays false until subscription_end_date is reached
    await supabase
      .from('clients')
      .update({
        subscription_status: 'cancelled',
        cancellation_date: new Date().toISOString(),
        cancellation_reason: reason || 'user_request',
        subscription_auto_recurring: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    console.log('Subscription cancelled successfully');

    // Send cancellation confirmation email
    try {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);
      
      const endDate = client.subscription_end_date 
        ? new Date(client.subscription_end_date).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'inmediatamente';

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #484848; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
              h1 { color: #1a1a1a; font-size: 28px; margin-bottom: 30px; }
              .info-box { background-color: #fee2e2; padding: 24px; border-radius: 8px; border: 2px solid #ef4444; margin: 24px 0; text-align: center; }
              .details-box { background-color: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 24px 0; }
              .button { display: inline-block; background-color: #e11d48; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 24px 0; }
              .footer { color: #898989; font-size: 14px; text-align: center; margin-top: 32px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔴 Suscripción Cancelada</h1>
              <p>Hola ${client.restaurant_name},</p>
              <p>Hemos procesado tu solicitud de cancelación de suscripción.</p>
              
              <div class="info-box">
                <strong style="color: #991b1b; font-size: 20px;">Suscripción Cancelada</strong><br>
                <span style="color: #991b1b; font-size: 16px;">Tu sitio permanecerá activo hasta: ${endDate}</span>
              </div>

              <div class="details-box">
                <strong>Detalles de la Cancelación</strong><br><br>
                <strong>Fecha de cancelación:</strong> ${new Date().toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}<br>
                <strong>Plan:</strong> ${client.plan_type === 'basic' ? 'Plan Básico' : 'Plan Avanzado'}<br>
                <strong>Tu sitio estará activo hasta:</strong> ${endDate}<br>
                ${reason ? `<strong>Motivo:</strong> ${reason}<br>` : ''}
              </div>

              <p><strong>¿Qué sucede ahora?</strong></p>
              <ul>
                <li>Tu sitio web continuará funcionando hasta ${endDate}</li>
                <li>No se realizarán más cobros a tu método de pago</li>
                <li>Después de ${endDate}, tu sitio será desactivado</li>
                <li>Puedes reactivar tu suscripción en cualquier momento</li>
              </ul>

              <div class="details-box">
                <strong>😢 Lamentamos verte partir</strong><br><br>
                ¿Hay algo que podamos hacer para mejorar nuestro servicio? Tu feedback es muy valioso para nosotros.<br><br>
                Si cambias de opinión, estaremos encantados de tenerte de vuelta.
              </div>

              <div style="text-align: center;">
                <a href="https://mirestaurante.online/login" class="button">Reactivar Suscripción</a>
              </div>

              <p>¿Preguntas sobre tu cancelación? Contáctanos en <a href="mailto:pagos@mirestaurante.online" style="color: #e11d48;">pagos@mirestaurante.online</a></p>

              <div class="footer">
                <a href="https://mirestaurante.online" style="color: #898989;">MiRestaurante.online</a><br>
                Sitios web profesionales para restaurantes en Perú
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: 'MiRestaurante Pagos <pagos@mirestaurante.online>',
        to: [client.email],
        subject: '🔴 Suscripción Cancelada - MiRestaurante',
        html,
      });

      console.log('Cancellation confirmation email sent to:', client.email);
    } catch (emailError) {
      console.error('Error sending cancellation confirmation email:', emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in cancel-openpay-subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
