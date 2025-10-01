import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('MercadoPago webhook received:', JSON.stringify(body, null, 2));

    // MercadoPago sends notifications for various events
    const eventType = body.type;
    
    if (eventType === 'payment') {
      return await handlePaymentEvent(body);
    } else if (eventType === 'subscription_preapproval' || eventType === 'subscription_authorized_payment') {
      return await handleSubscriptionEvent(body);
    } else {
      console.log('Ignoring event type:', eventType);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function handlePaymentEvent(body: any) {
  const paymentId = body.data?.id;
  if (!paymentId) {
    throw new Error('No payment ID in webhook');
  }

  // Fetch payment details from MercadoPago
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_SUBSCRIPTION')!;
  const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!mpResponse.ok) {
    throw new Error(`Failed to fetch payment details: ${mpResponse.status}`);
  }

  const payment = await mpResponse.json();
  console.log('Payment details:', JSON.stringify(payment, null, 2));

  const externalReference = payment.external_reference || payment.metadata?.client_id;
  const status = payment.status; // approved, rejected, cancelled, etc.
  const paymentMethod = payment.payment_type_id;

  if (!externalReference) {
    console.error('No external reference or client_id in payment metadata');
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if externalReference is a payment record ID (UUID) or client ID
  let paymentRecord;
  let clientId = externalReference;
  
  // Try to find payment record by ID first
  const { data: paymentById, error: paymentByIdError } = await supabase
    .from('subscription_payments')
    .select('*, clients(*)')
    .eq('id', externalReference)
    .maybeSingle();

  if (!paymentByIdError && paymentById) {
    // Found by payment ID
    paymentRecord = paymentById;
    clientId = paymentById.client_id;
    
    // Update payment record
    await supabase
      .from('subscription_payments')
      .update({
        status: status,
        mercadopago_payment_id: paymentId,
        payment_method: paymentMethod,
        paid_at: status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', externalReference);
  } else {
    // Assume externalReference is a client_id (from fallback payment)
    // Find or create payment record
    const { data: existingPayment } = await supabase
      .from('subscription_payments')
      .select('*, clients(*)')
      .eq('client_id', clientId)
      .eq('mercadopago_payment_id', paymentId)
      .maybeSingle();

    if (existingPayment) {
      paymentRecord = existingPayment;
    } else {
      // Create new payment record for fallback payment
      const periodStart = new Date();
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const { data: clientData } = await supabase
        .from('clients')
        .select('plan_type')
        .eq('id', clientId)
        .single();

      const { data: planData } = await supabase
        .from('subscription_plans')
        .select('monthly_price, currency')
        .eq('plan_key', clientData?.plan_type || 'basic')
        .eq('is_active', true)
        .single();

      const { data: newPayment, error: createError } = await supabase
        .from('subscription_payments')
        .insert({
          client_id: clientId,
          amount: payment.transaction_amount,
          original_amount: planData?.monthly_price || payment.transaction_amount,
          discount_amount: 0,
          currency: planData?.currency || 'PEN',
          status: status,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          mercadopago_payment_id: paymentId,
          payment_method: paymentMethod,
          paid_at: status === 'approved' ? new Date().toISOString() : null,
        })
        .select('*, clients(*)')
        .single();

      if (!createError && newPayment) {
        paymentRecord = newPayment;
      }
    }
  }

  console.log('Payment record:', paymentRecord);

  // If payment approved, activate subscription
  if (status === 'approved' && paymentRecord) {
    const periodEnd = new Date(paymentRecord.period_end);

    await supabase
      .from('clients')
      .update({
        subscription_status: 'active',
        payment_status: 'paid',
        subscription_start_date: paymentRecord.period_start,
        subscription_end_date: paymentRecord.period_end,
        next_billing_date: periodEnd.toISOString(),
        plan_type: paymentRecord.clients?.plan_type || 'basic',
        payment_failures_count: 0,
      })
      .eq('id', clientId);

    console.log(`Activated subscription for client ${clientId}`);
  } else if (status === 'rejected' || status === 'cancelled') {
    // Handle failed payment
    await supabase
      .from('clients')
      .update({
        payment_status: 'failed',
        last_payment_attempt: new Date().toISOString(),
        payment_failures_count: supabase.rpc('increment'),
      })
      .eq('id', clientId);

    console.log(`Payment failed for client ${clientId}`);
  }

  return new Response(
    JSON.stringify({ received: true, status }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleSubscriptionEvent(body: any) {
  const subscriptionId = body.data?.id;
  if (!subscriptionId) {
    throw new Error('No subscription ID in webhook');
  }

  console.log('Handling subscription event:', body.action);

  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_SUBSCRIPTION')!;
  const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!mpResponse.ok) {
    throw new Error(`Failed to fetch subscription details: ${mpResponse.status}`);
  }

  const subscription = await mpResponse.json();
  console.log('Subscription details:', JSON.stringify(subscription, null, 2));

  const clientId = subscription.external_reference;
  const status = subscription.status; // authorized, paused, cancelled

  if (!clientId) {
    console.error('No external reference in subscription');
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Update client subscription status
  const updateData: any = {
    mercadopago_subscription_id: subscriptionId,
  };

  if (status === 'cancelled') {
    updateData.subscription_status = 'cancelled';
    updateData.subscription_auto_recurring = false;
    updateData.cancellation_date = new Date().toISOString();
    console.log(`Subscription cancelled for client ${clientId}`);
  } else if (status === 'paused') {
    updateData.subscription_status = 'paused';
    console.log(`Subscription paused for client ${clientId}`);
  }

  await supabase
    .from('clients')
    .update(updateData)
    .eq('id', clientId);

  return new Response(
    JSON.stringify({ received: true, subscription_status: status }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}
