import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionRequest {
  token: string;
  issuer_id: string;
  payment_method_id: string;
  transaction_amount: number;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
  clientId: string;
  planType: 'basic' | 'advanced';
  couponCode?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, issuer_id, payment_method_id, transaction_amount, payer, clientId, planType, couponCode }: SubscriptionRequest = await req.json();

    console.log('Creating subscription:', { clientId, planType, amount: transaction_amount, couponCode });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Fetch plan price from database
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('monthly_price, currency')
      .eq('plan_key', planType)
      .eq('is_active', true)
      .single();

    if (planError || !planData) {
      throw new Error('Plan not found');
    }

    const currency = planData.currency || 'PEN';
    let finalAmount = planData.monthly_price;
    let originalAmount = finalAmount;
    let discountAmount = 0;

    // Apply coupon if provided
    if (couponCode) {
      const { data: couponResult, error: couponError } = await supabase.rpc('validate_coupon', {
        coupon_code: couponCode,
        plan_type: planType,
        amount: finalAmount
      });

      if (!couponError && couponResult?.valid) {
        discountAmount = couponResult.discount_amount;
        finalAmount = couponResult.final_amount;
        console.log('Coupon applied:', { original: originalAmount, discount: discountAmount, final: finalAmount });
      }
    }

    // Calculate subscription dates
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Step 1: Create initial payment with tokenized card
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_SUBSCRIPTION')!;
    
    const paymentData = {
      token,
      issuer_id,
      payment_method_id,
      transaction_amount: finalAmount,
      installments: 1,
      description: `Primera cuota - Suscripción ${planType} - ${client.restaurant_name}`,
      payer,
      statement_descriptor: 'MI RESTAURANTE',
      metadata: {
        client_id: clientId,
        plan_type: planType,
        subscription_type: 'initial_payment',
      },
    };

    console.log('Processing initial payment...');

    const idempotencyKey = `sub-init-${clientId}-${Date.now()}`;

    const paymentResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(paymentData),
    });

    const paymentResult = await paymentResponse.json();
    console.log('Initial payment result:', paymentResult);

    if (!paymentResponse.ok || paymentResult.status !== 'approved') {
      throw new Error(paymentResult.message || paymentResult.status_detail || 'Payment failed');
    }

    // Step 2: Create subscription (preapproval) for recurring billing
    const autoRecurringData = {
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: finalAmount,
        currency_id: currency,
      },
      back_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/subscription-callback`,
      payer_email: payer.email,
      reason: `Suscripción mensual ${planType} - ${client.restaurant_name}`,
      external_reference: clientId,
      status: 'authorized',
    };

    console.log('Creating preapproval subscription...');

    const preapprovalResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(autoRecurringData),
    });

    const preapprovalResult = await preapprovalResponse.json();
    console.log('Preapproval result:', preapprovalResult);

    if (!preapprovalResponse.ok) {
      console.error('Preapproval creation failed, but initial payment succeeded');
      // Continue anyway - we'll handle manually if needed
    }

    // Create payment record
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('subscription_payments')
      .insert({
        client_id: clientId,
        amount: finalAmount,
        original_amount: originalAmount,
        discount_amount: discountAmount,
        currency: currency,
        status: 'approved',
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        coupon_code: couponCode || null,
        mercadopago_payment_id: paymentResult.id.toString(),
        mercadopago_subscription_id: preapprovalResult.id || null,
        payment_method: paymentResult.payment_method_id,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError);
    }

    // Activate subscription
    const { error: activateError } = await supabase
      .from('clients')
      .update({
        subscription_status: 'active',
        subscription_start_date: periodStart.toISOString(),
        subscription_end_date: periodEnd.toISOString(),
        next_billing_date: periodEnd.toISOString(),
        payment_status: 'paid',
        plan_type: planType,
        mercadopago_subscription_id: preapprovalResult.id || null,
        mercadopago_preapproval_id: preapprovalResult.id || null,
        subscription_auto_recurring: true,
      })
      .eq('id', clientId);

    if (activateError) {
      console.error('Failed to activate subscription:', activateError);
    } else {
      console.log('Subscription activated successfully');
    }

    // Increment coupon usage if applicable
    if (couponCode) {
      await supabase.rpc('increment_coupon_usage', { coupon_code: couponCode });
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: paymentResult,
        subscription: preapprovalResult,
        status: 'approved',
        status_detail: 'Payment successful and subscription created',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Subscription creation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Subscription creation failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});