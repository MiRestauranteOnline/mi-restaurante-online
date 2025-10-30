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

    const webhook = await req.json();
    console.log('Received OpenPay webhook:', JSON.stringify(webhook, null, 2));

    const { type, transaction } = webhook;

    // Handle different webhook types
    switch (type) {
      case 'subscription.charge.succeeded':
      case 'charge.succeeded':
        await handleChargeSucceeded(supabase, resend, transaction);
        break;
      
      case 'subscription.charge.failed':
      case 'charge.failed':
        await handleChargeFailed(supabase, resend, transaction);
        break;
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(supabase, transaction);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(supabase, transaction);
        break;
      
      default:
        console.log('Unhandled webhook type:', type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing OpenPay webhook:', error);
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

async function handleChargeSucceeded(supabase: any, resend: any, transaction: any) {
  console.log('Processing successful charge:', transaction.id);
  
  // Find client by OpenPay subscription ID
  const customerId = transaction.customer_id;
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('openpay_customer_id', customerId);

  if (clients && clients.length > 0) {
    const client = clients[0];
    
    // Check if there's a pending plan change
    const updates: any = {
      payment_status: 'paid',
      payment_failures_count: 0,
      last_payment_attempt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If there's a pending plan change and it's time to apply it
    if (client.pending_plan_change && client.pending_plan_change_date) {
      const changeDate = new Date(client.pending_plan_change_date);
      if (changeDate <= new Date()) {
        updates.plan_type = client.pending_plan_change;
        updates.pending_plan_change = null;
        updates.pending_plan_change_date = null;
        console.log('Applied pending plan change to:', client.pending_plan_change);
      }
    }

    // Update next billing date
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    updates.next_billing_date = nextBillingDate.toISOString();
    updates.subscription_end_date = nextBillingDate.toISOString();

    await supabase
      .from('clients')
      .update(updates)
      .eq('id', client.id);

    console.log('Client payment status updated successfully');

    // Send payment success email
    try {
      const nextBillingFormatted = new Date(updates.next_billing_date).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const planName = client.plan_type === 'basic' ? 'Plan Básico' : 'Plan Avanzado';
      const amount = (transaction.amount / 100).toFixed(2);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #484848; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
              h1 { color: #1a1a1a; font-size: 28px; margin-bottom: 30px; }
              .details-box { background-color: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 24px 0; }
              .button { display: inline-block; background-color: #44a79b; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 24px 0; }
              .button:visited { color: #ffffff !important; }
              .button:hover { color: #ffffff !important; background-color: #3a8f85; }
              .button:active { color: #ffffff !important; }
              .footer { color: #898989; font-size: 14px; text-align: center; margin-top: 32px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✅ Pago Recibido Exitosamente</h1>
              <p>Hola ${client.restaurant_name},</p>
              <p>¡Gracias por tu pago! Tu suscripción sigue activa y tu sitio web continúa en línea.</p>
              
              <div class="details-box">
                <strong>Detalles del Pago</strong><br><br>
                <strong>Monto pagado:</strong> S/ ${amount}<br>
                <strong>Plan:</strong> ${planName}<br>
                <strong>Próximo cobro:</strong> ${nextBillingFormatted}<br>
                <strong>ID de transacción:</strong> ${transaction.id}
              </div>

              <p>Tu sitio web seguirá funcionando sin interrupciones. Puedes acceder a tu panel de control en cualquier momento para gestionar tu contenido.</p>
              
              <div style="text-align: center;">
                <a href="https://mirestaurante.online/login" class="button">Acceder a mi Panel</a>
              </div>

              <p>Si necesitas un recibo o tienes alguna pregunta sobre tu facturación, contáctanos en <a href="mailto:pagos@mirestaurante.online" style="color: #e11d48;">pagos@mirestaurante.online</a></p>

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
        subject: '✅ Pago Recibido - MiRestaurante',
        html,
      });

      console.log('Payment success email sent to:', client.email);
    } catch (emailError) {
      console.error('Error sending payment success email:', emailError);
    }
  }
}

async function handleChargeFailed(supabase: any, resend: any, transaction: any) {
  console.log('Processing failed charge:', transaction.id);
  
  const customerId = transaction.customer_id;
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('openpay_customer_id', customerId);

  if (clients && clients.length > 0) {
    const client = clients[0];
    const failureCount = (client.payment_failures_count || 0) + 1;

    const updates: any = {
      payment_failures_count: failureCount,
      last_payment_attempt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // After 3 failed attempts, suspend the subscription
    if (failureCount >= 3) {
      updates.subscription_status = 'suspended';
      updates.payment_status = 'failed';
    }

    await supabase
      .from('clients')
      .update(updates)
      .eq('id', client.id);

    console.log(`Client payment failure recorded (${failureCount} failures)`);

    // Send payment failed email
    try {
      const retryDate = failureCount < 3 ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '';

      const planName = client.plan_type === 'basic' ? 'Plan Básico' : 'Plan Avanzado';
      const amount = (transaction.amount / 100).toFixed(2);
      const isSuspended = failureCount >= 3;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #484848; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
              h1 { color: #1a1a1a; font-size: 28px; margin-bottom: 30px; }
              .warning-box { background-color: #fef3c7; padding: 24px; border-radius: 8px; border: 2px solid #fbbf24; margin: 24px 0; text-align: center; }
              .alert-box { background-color: #fee2e2; padding: 20px; border-radius: 8px; border: 2px solid #ef4444; margin: 24px 0; text-align: center; color: #991b1b; }
              .details-box { background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 24px 0; }
              .button { display: inline-block; background-color: #44a79b; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 24px 0; }
              .button:visited { color: #ffffff !important; }
              .button:hover { color: #ffffff !important; background-color: #3a8f85; }
              .button:active { color: #ffffff !important; }
              .footer { color: #898989; font-size: 14px; text-align: center; margin-top: 32px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ Problema con tu Pago</h1>
              <p>Hola ${client.restaurant_name},</p>
              <p>No pudimos procesar tu pago mensual. Esto puede deberse a fondos insuficientes, una tarjeta vencida, o un problema temporal con tu banco.</p>
              
              <div class="warning-box">
                <strong style="color: #92400e; font-size: 20px;">Intento ${failureCount} de 3</strong><br>
                <span style="color: #92400e; font-size: 16px;">
                  ${isSuspended 
                    ? 'Tu suscripción ha sido suspendida. Por favor actualiza tu método de pago.' 
                    : `Reintentaremos el cobro automáticamente el ${retryDate}`
                  }
                </span>
              </div>

              <div class="details-box">
                <strong>Monto pendiente:</strong> S/ ${amount}<br>
                <strong>Plan:</strong> ${planName}
              </div>

              ${isSuspended ? `
                <div class="alert-box">
                  <strong>⚠️ Tu sitio web ha sido desactivado temporalmente</strong>
                </div>
                <p>Para reactivar tu sitio y evitar perder tu contenido, por favor actualiza tu método de pago lo antes posible.</p>
              ` : `
                <p>No necesitas hacer nada si ya actualizaste tu método de pago. Si el problema persiste, tu sitio será desactivado después de 3 intentos fallidos.</p>
              `}
              
              <div style="text-align: center;">
                <a href="https://mirestaurante.online/login" class="button">Actualizar Método de Pago</a>
              </div>

              <hr style="border-color: #e6e6e6; margin: 30px 0;">

              <p>Si necesitas ayuda o tienes preguntas sobre tu facturación, no dudes en contactarnos:</p>
              <p>
                📧 Email: <a href="mailto:pagos@mirestaurante.online" style="color: #e11d48;">pagos@mirestaurante.online</a><br>
                💬 WhatsApp: <a href="https://wa.me/51123456789" style="color: #e11d48;">+51 123 456 789</a>
              </p>

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
        subject: isSuspended ? '⚠️ Suscripción Suspendida - MiRestaurante' : '⚠️ Problema con tu Pago - MiRestaurante',
        html,
      });

      console.log('Payment failed email sent to:', client.email);
    } catch (emailError) {
      console.error('Error sending payment failed email:', emailError);
    }
  }
}

async function handleSubscriptionUpdated(supabase: any, transaction: any) {
  console.log('Processing subscription update:', transaction.id);
  
  // Handle subscription updates if needed
  // This could include plan changes, etc.
}

async function handleSubscriptionCancelled(supabase: any, transaction: any) {
  console.log('Processing subscription cancellation:', transaction.id);
  
  const customerId = transaction.customer_id;
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('openpay_customer_id', customerId);

  if (clients && clients.length > 0) {
    const client = clients[0];

    await supabase
      .from('clients')
      .update({
        subscription_status: 'cancelled',
        cancellation_date: new Date().toISOString(),
        subscription_auto_recurring: false,
        is_deactivated: true, // Automatically deactivate site when subscription is cancelled
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id);

    console.log('Client subscription cancelled and site deactivated');
  }
}
