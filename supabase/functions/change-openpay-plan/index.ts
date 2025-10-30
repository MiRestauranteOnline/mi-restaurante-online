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

    // Environment-based configuration
    const environment = Deno.env.get('OPENPAY_ENVIRONMENT') || 'sandbox';
    const suffix = environment === 'production' ? '_PROD' : '_SANDBOX';
    
    const merchantId = Deno.env.get(`OPENPAY_MERCHANT_ID${suffix}`)!;
    const privateKey = Deno.env.get(`OPENPAY_PRIVATE_KEY${suffix}`)!;
    const planBasicId = Deno.env.get(`OPENPAY_PLAN_BASIC_ID${suffix}`)!;
    const planAdvancedId = Deno.env.get(`OPENPAY_PLAN_ADVANCED_ID${suffix}`)!;
    const openpayApiBase = Deno.env.get('OPENPAY_API_BASE')!;
    
    console.log(`Using OpenPay ${environment} environment`);

    const { clientId, newPlanType, immediate } = await req.json();

    console.log(`Processing plan change for client:`, clientId, 'to:', newPlanType, 'immediate:', immediate);

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
      throw new Error('No OpenPay subscription found for this client');
    }

    const auth = btoa(`${privateKey}:`);
    const openpayUrl = `${openpayApiBase}/${merchantId}`;
    
    console.log('Using OpenPay API base:', openpayApiBase);
    console.log('OpenPay URL:', openpayUrl);
    const isUpgrade = (client.plan_type === 'basic' && newPlanType === 'advanced');

    if (immediate && isUpgrade) {
      // UPGRADE: Cancel current subscription and create new one immediately
      
      // Cancel existing subscription
      const cancelResponse = await fetch(
        `${openpayUrl}/customers/${client.openpay_customer_id}/subscriptions/${client.openpay_subscription_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Basic ${auth}`,
          },
        }
      );

      if (!cancelResponse.ok && cancelResponse.status !== 404) {
        const error = await cancelResponse.json();
        console.error('OpenPay subscription cancellation failed:', error);
      }

      // Get customer's cards
      const cardsResponse = await fetch(
        `${openpayUrl}/customers/${client.openpay_customer_id}/cards`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
          },
        }
      );

      if (!cardsResponse.ok) {
        throw new Error('Failed to get customer cards');
      }

      const cards = await cardsResponse.json();
      if (!cards || cards.length === 0) {
        throw new Error('No payment method found');
      }

      // Create new subscription with higher plan
      const newPlanId = planAdvancedId;
      const subscriptionResponse = await fetch(
        `${openpayUrl}/customers/${client.openpay_customer_id}/subscriptions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan_id: newPlanId,
            card_id: cards[0].id,
          }),
        }
      );

      if (!subscriptionResponse.ok) {
        const error = await subscriptionResponse.json();
        console.error('OpenPay subscription creation failed:', error);
        throw new Error(`Failed to create new subscription: ${error.description || 'Unknown error'}`);
      }

      const subscription = await subscriptionResponse.json();

      // Calculate new billing dates
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

      // Update client
      await supabase
        .from('clients')
        .update({
          plan_type: newPlanType,
          openpay_subscription_id: subscription.id,
          subscription_end_date: subscriptionEndDate.toISOString(),
          next_billing_date: subscriptionEndDate.toISOString(),
          pending_plan_change: null,
          pending_plan_change_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId);

      console.log('Plan upgraded successfully');

      // Send upgrade confirmation email
      try {
        const nextBillingFormatted = subscriptionEndDate.toLocaleDateString('es-PE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const basicPrice = client.locked_basic_price || 297;
        const advancedPrice = client.locked_advanced_price || 497;

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #484848; }
                .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
                h1 { color: #1a1a1a; font-size: 28px; margin-bottom: 30px; }
                .success-box { background-color: #d1fae5; padding: 24px; border-radius: 8px; border: 2px solid #10b981; margin: 24px 0; text-align: center; }
                .details-box { background-color: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 24px 0; }
                .button { display: inline-block; background-color: #44a79b; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 24px 0; }
                .button:visited { color: #ffffff !important; }
                .button:hover { color: #ffffff !important; background-color: #3a8f85; }
                .button:active { color: #ffffff !important; }
                .footer { color: #898989; font-size: 14px; text-align: center; margin-top: 32px; }
                .features { background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 24px 0; }
                .features ul { margin: 10px 0; padding-left: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🎉 ¡Bienvenido al Plan Avanzado!</h1>
                <p>Hola ${client.restaurant_name},</p>
                <p>¡Felicitaciones! Tu upgrade al Plan Avanzado se ha completado exitosamente.</p>
                
                <div class="success-box">
                  <strong style="color: #065f46; font-size: 20px;">✅ Upgrade Completado</strong><br>
                  <span style="color: #065f46; font-size: 16px;">Ya tienes acceso a todas las funciones premium</span>
                </div>

                <div class="details-box">
                  <strong>Detalles del Upgrade</strong><br><br>
                  <strong>Plan anterior:</strong> Plan Básico (S/ ${basicPrice})<br>
                  <strong>Plan actual:</strong> Plan Avanzado (S/ ${advancedPrice})<br>
                  <strong>Próximo cobro:</strong> ${nextBillingFormatted} (S/ ${advancedPrice})
                </div>

                <div class="features">
                  <strong>🌟 Ahora tienes acceso a:</strong>
                  <ul>
                    <li>Sistema de reservas online</li>
                    <li>Soporte prioritario con PIN único</li>
                    <li>Análisis avanzados de tu sitio</li>
                    <li>Gestión de múltiples ubicaciones</li>
                    <li>Y mucho más...</li>
                  </ul>
                </div>

                <p>Accede a tu panel de control para explorar todas las nuevas funciones disponibles:</p>
                
                <div style="text-align: center;">
                  <a href="https://mirestaurante.online/login" class="button">Explorar Panel Avanzado</a>
                </div>

                <p>¿Necesitas ayuda? Ahora tienes acceso a soporte prioritario. Contáctanos en <a href="mailto:premiumsoporte@mirestaurante.online" style="color: #e11d48;">premiumsoporte@mirestaurante.online</a></p>

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
          subject: '🎉 Upgrade Exitoso - Plan Avanzado',
          html,
        });

        console.log('Upgrade confirmation email sent to:', client.email);
      } catch (emailError) {
        console.error('Error sending upgrade confirmation email:', emailError);
      }

    } else {
      // DOWNGRADE: Schedule for next billing cycle
      const nextBillingDate = client.next_billing_date || client.subscription_end_date;
      
      await supabase
        .from('clients')
        .update({
          pending_plan_change: newPlanType,
          pending_plan_change_date: nextBillingDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId);

      console.log('Plan downgrade scheduled for:', nextBillingDate);

      // Send downgrade confirmation email
      try {
        const effectiveDateFormatted = new Date(nextBillingDate).toLocaleDateString('es-PE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const basicPrice = client.locked_basic_price || 297;
        const advancedPrice = client.locked_advanced_price || 497;
        const oldPlanName = client.plan_type === 'basic' ? 'Plan Básico' : 'Plan Avanzado';
        const newPlanName = newPlanType === 'basic' ? 'Plan Básico' : 'Plan Avanzado';
        const newPrice = newPlanType === 'basic' ? basicPrice : advancedPrice;

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #484848; }
                .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
                h1 { color: #1a1a1a; font-size: 28px; margin-bottom: 30px; }
                .info-box { background-color: #dbeafe; padding: 24px; border-radius: 8px; border: 2px solid #3b82f6; margin: 24px 0; text-align: center; }
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
                <h1>📋 Cambio de Plan Programado</h1>
                <p>Hola ${client.restaurant_name},</p>
                <p>Hemos recibido tu solicitud de cambio de plan. El cambio se aplicará al final de tu período de facturación actual.</p>
                
                <div class="info-box">
                  <strong style="color: #1e40af; font-size: 20px;">Cambio Programado</strong><br>
                  <span style="color: #1e40af; font-size: 16px;">Fecha efectiva: ${effectiveDateFormatted}</span>
                </div>

                <div class="details-box">
                  <strong>Detalles del Cambio</strong><br><br>
                  <strong>Plan actual:</strong> ${oldPlanName}<br>
                  <strong>Nuevo plan:</strong> ${newPlanName}<br>
                  <strong>Fecha de cambio:</strong> ${effectiveDateFormatted}<br>
                  <strong>Nuevo precio mensual:</strong> S/ ${newPrice}
                </div>

                <p>Tu ${oldPlanName} seguirá activo hasta ${effectiveDateFormatted}. Después de esta fecha, tu plan cambiará automáticamente al ${newPlanName}.</p>
                
                <p>${newPlanType === 'basic' ? 'Lamentamos verte cambiar al Plan Básico. Si hay algo que podamos hacer para mejorar tu experiencia, no dudes en contactarnos.' : ''}</p>

                <div style="text-align: center;">
                  <a href="https://mirestaurante.online/login" class="button">Ver Mi Panel</a>
                </div>

                <p>¿Preguntas sobre tu cambio de plan? Contáctanos en <a href="mailto:pagos@mirestaurante.online" style="color: #e11d48;">pagos@mirestaurante.online</a></p>

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
          subject: '📋 Cambio de Plan Programado - MiRestaurante',
          html,
        });

        console.log('Downgrade confirmation email sent to:', client.email);
      } catch (emailError) {
        console.error('Error sending downgrade confirmation email:', emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        immediate: immediate && isUpgrade,
        scheduledDate: (!immediate || !isUpgrade) ? (client.next_billing_date || client.subscription_end_date) : null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in change-openpay-plan:', error);
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
