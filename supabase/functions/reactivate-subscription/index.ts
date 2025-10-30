import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { clientId, couponCode } = await req.json();

    if (!clientId) {
      console.error('Missing clientId in request');
      throw new Error('Client ID is required');
    }

    // Environment-based configuration
    const environment = Deno.env.get('OPENPAY_ENVIRONMENT') || 'sandbox';
    const suffix = environment === 'production' ? '_PROD' : '_SANDBOX';
    
    const merchantId = Deno.env.get(`OPENPAY_MERCHANT_ID${suffix}`)!;
    const privateKey = Deno.env.get(`OPENPAY_PRIVATE_KEY${suffix}`)!;
    const openpayApiBase = Deno.env.get('OPENPAY_API_BASE')!;
    
    console.log(`Using OpenPay ${environment} environment`);

    console.log('Reactivating subscription for client:', clientId);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch client details
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError) throw clientError;

    // Check if client has an active OpenPay customer
    if (!client.openpay_customer_id) {
      throw new Error('No OpenPay customer found for this client. Please contact support.');
    }

    // Check if subscription was actually cancelled
    if (!client.cancelled_at && client.subscription_status === 'active') {
      throw new Error('Subscription is already active');
    }

    const planPrice = client.plan_type === 'basic' 
      ? (client.locked_basic_price || 297) 
      : (client.locked_advanced_price || 497);

    const auth = btoa(`${privateKey}:`);
    const openpayUrl = `${openpayApiBase.replace(/\/$/, '')}/${merchantId}`;

    // Handle discount if provided
    let finalAmount = planPrice;
    let discountAmount = 0;
    let hasDiscount = false;
    
    if (couponCode) {
      // Validate coupon
      const { data: couponResult, error: couponError } = await supabaseClient
        .rpc('validate_coupon', {
          coupon_code: couponCode,
          plan_type: client.plan_type,
          amount: planPrice,
        });

      if (!couponError && couponResult && couponResult.valid) {
        discountAmount = couponResult.discount_amount;
        finalAmount = Math.max(0, planPrice - discountAmount);
        hasDiscount = true;
        console.log(`Applying discount: S/${discountAmount} (Final: S/${finalAmount})`);
      }
    }

    // Get customer's cards
    const cardsResponse = await fetch(`${openpayUrl}/customers/${client.openpay_customer_id}/cards`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` },
    });

    if (!cardsResponse.ok) {
      throw new Error('Failed to get customer payment methods');
    }

    const cards = await cardsResponse.json();
    if (!cards || cards.length === 0) {
      throw new Error('No payment method found. Please add a card.');
    }

    const cardId = cards[0].id;

    // Determine plan ID
    const planBasicId = Deno.env.get(`OPENPAY_PLAN_BASIC_ID${suffix}`)!;
    const planAdvancedId = Deno.env.get(`OPENPAY_PLAN_ADVANCED_ID${suffix}`)!;
    const planId = client.plan_type === 'basic' ? planBasicId : planAdvancedId;

    // If discount applied, create one-time charge + trial subscription
    if (hasDiscount && finalAmount >= 0) {
      // Create one-time charge for discounted first month
      const chargeResponse = await fetch(`${openpayUrl}/customers/${client.openpay_customer_id}/charges`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_id: cardId,
          method: 'card',
          amount: finalAmount,
          currency: 'PEN',
          description: `Reactivación con descuento - ${client.plan_type === 'basic' ? 'Plan Básico' : 'Plan Avanzado'}`,
        }),
      });

      if (!chargeResponse.ok) {
        const error = await chargeResponse.json();
        console.error('OpenPay charge failed:', error);
        throw new Error(`Failed to process discounted charge: ${error.description || 'Unknown error'}`);
      }

      console.log('Discounted charge processed successfully');

      // Create subscription with trial (starts billing at full price next month)
      const trialEndDate = new Date();
      trialEndDate.setMonth(trialEndDate.getMonth() + 1);
      const trialEndDateStr = trialEndDate.toISOString().slice(0, 10); // YYYY-MM-DD

      const subscriptionResponse = await fetch(`${openpayUrl}/customers/${client.openpay_customer_id}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          card_id: cardId,
          trial_end_date: trialEndDateStr,
        }),
      });

      if (!subscriptionResponse.ok) {
        const error = await subscriptionResponse.json();
        console.error('OpenPay subscription creation failed:', error);
        throw new Error(`Failed to create subscription: ${error.description || 'Unknown error'}`);
      }

      const subscription = await subscriptionResponse.json();
      console.log('Subscription created with trial:', subscription.id);

      // Update client with subscription info
      const now = new Date();
      const subscriptionEndDate = new Date(trialEndDate);

      const { error: updateError } = await supabaseClient
        .from('clients')
        .update({
          subscription_status: 'active',
          is_deactivated: false,
          cancelled_at: null,
          openpay_subscription_id: subscription.id,
          subscription_start_date: now.toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString(),
          next_billing_date: subscriptionEndDate.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', clientId);

      if (updateError) throw updateError;

      // Increment coupon usage
      if (couponCode) {
        await supabaseClient.rpc('increment_coupon_usage', { coupon_code: couponCode });
      }

      console.log('Subscription reactivated successfully with discount');
    } else {
      // No discount - create regular subscription
      const subscriptionResponse = await fetch(`${openpayUrl}/customers/${client.openpay_customer_id}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          card_id: cardId,
        }),
      });

      if (!subscriptionResponse.ok) {
        const error = await subscriptionResponse.json();
        console.error('OpenPay subscription creation failed:', error);
        throw new Error(`Failed to create subscription: ${error.description || 'Unknown error'}`);
      }

      const subscription = await subscriptionResponse.json();
      console.log('Subscription created:', subscription.id);

      // Calculate new subscription dates
      const now = new Date();
      const newEndDate = new Date(now);
      newEndDate.setMonth(newEndDate.getMonth() + 1);

      // Update client
      const { error: updateError } = await supabaseClient
        .from('clients')
        .update({
          subscription_status: 'active',
          is_deactivated: false,
          cancelled_at: null,
          openpay_subscription_id: subscription.id,
          subscription_start_date: now.toISOString(),
          subscription_end_date: newEndDate.toISOString(),
          next_billing_date: newEndDate.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', clientId);

      if (updateError) throw updateError;

      console.log('Subscription reactivated successfully');
    }

    // Send reactivation email
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const now = new Date();
    const newEndDate = new Date(now);
    newEndDate.setMonth(newEndDate.getMonth() + 1);

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
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 30px; background: #44a79b; color: #ffffff !important; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
            .button:visited { color: #ffffff !important; }
            .button:hover { color: #ffffff !important; background-color: #3a8f85; }
            .button:active { color: #ffffff !important; }
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
              
              <p>¡Excelentes noticias! Tu suscripción ha sido reactivada exitosamente${hasDiscount ? ` con S/${discountAmount.toFixed(2)} de descuento` : ''}.</p>

              <div class="success-box">
                <strong>✅ Estado: ACTIVO</strong><br>
                Tu sitio web está ahora en línea y funcionando completamente.
              </div>

              <div class="info-box">
                <h3>📅 Detalles de Tu Suscripción</h3>
                <ul>
                  <li><strong>Plan:</strong> ${client.plan_type === 'basic' ? 'Básico' : 'Avanzado'}</li>
                  ${hasDiscount ? `<li><strong>Primer mes:</strong> S/${finalAmount.toFixed(2)} (con descuento)</li>` : ''}
                  <li><strong>Próxima facturación:</strong> ${newEndDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
                  <li><strong>Precio regular:</strong> S/${planPrice.toFixed(2)}/mes</li>
                </ul>
              </div>

              <div class="info-box">
                <h3>🚀 ¿Qué Puedes Hacer Ahora?</h3>
                <ul>
                  <li>✨ Tu sitio web está activo y visible para tus clientes</li>
                  <li>🎨 Accede a tu dashboard para gestionar tu contenido</li>
                  <li>📊 Revisa tus estadísticas y analíticas</li>
                </ul>
                
                <center>
                  <a href="https://mirestaurante.online/client" class="button">Ir a Mi Dashboard</a>
                </center>
              </div>

              <p>Gracias por confiar en Mi Restaurante Online. ¡Estamos emocionados de seguir siendo tu partner digital!</p>

              <div class="footer">
                <p><strong>Mi Restaurante Online</strong></p>
                <p>📧 info@mirestaurante.online | 🌐 <a href="https://mirestaurante.online">mirestaurante.online</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Mi Restaurante Online <info@mirestaurante.online>',
      to: [client.email],
      subject: '🎉 ¡Tu suscripción ha sido reactivada!',
      html: htmlContent,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscription reactivated successfully',
        discountApplied: discountAmount > 0 ? discountAmount : null,
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
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
