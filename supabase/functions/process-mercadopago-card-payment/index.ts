import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  token: string;
  issuer_id: string;
  payment_method_id: string;
  transaction_amount: number;
  installments: number;
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
  country?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, issuer_id, payment_method_id, transaction_amount, installments, payer, clientId, planType, couponCode, country = 'PE' }: PaymentRequest = await req.json();

    console.log('Processing card payment:', { clientId, planType, amount: transaction_amount, couponCode });

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

    // Calculate subscription dates
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Define plan prices
    const planPrices = {
      basic: country === 'PE' ? 49 : 15, // PEN or USD
      advanced: country === 'PE' ? 99 : 30,
    };

    const currency = country === 'PE' ? 'PEN' : 'USD';
    let finalAmount = planPrices[planType];
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

    // Create payment record
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('subscription_payments')
      .insert({
        client_id: clientId,
        amount: finalAmount,
        original_amount: originalAmount,
        discount_amount: discountAmount,
        currency: currency,
        status: 'pending',
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        coupon_code: couponCode || null,
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error('Failed to create payment record');
    }

    // Process payment with MercadoPago
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_TEST');
    
    const paymentData = {
      token,
      issuer_id,
      payment_method_id,
      transaction_amount: finalAmount,
      installments,
      description: `Suscripción ${planType} - ${client.restaurant_name}`,
      payer,
      statement_descriptor: 'MI RESTAURANTE ONLINE',
      metadata: {
        client_id: clientId,
        plan_type: planType,
        payment_record_id: paymentRecord.id,
      },
    };

    console.log('Sending payment to MercadoPago:', paymentData);

    // Generate unique idempotency key
    const idempotencyKey = `${clientId}-${paymentRecord.id}-${Date.now()}`;

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(paymentData),
    });

    const mercadoPagoData = await mercadoPagoResponse.json();
    console.log('MercadoPago response:', mercadoPagoData);

    if (!mercadoPagoResponse.ok) {
      throw new Error(mercadoPagoData.message || 'Payment processing failed');
    }

    // Update payment record with MercadoPago info
    const { error: updateError } = await supabase
      .from('subscription_payments')
      .update({
        mercadopago_payment_id: mercadoPagoData.id.toString(),
        payment_method: mercadoPagoData.payment_method_id,
        status: mercadoPagoData.status,
        paid_at: mercadoPagoData.status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', paymentRecord.id);

    if (updateError) {
      console.error('Failed to update payment record:', updateError);
    }

    // If payment approved, activate subscription
    if (mercadoPagoData.status === 'approved') {
      const { error: activateError } = await supabase
        .from('clients')
        .update({
          subscription_status: 'active',
          subscription_start_date: periodStart.toISOString(),
          subscription_end_date: periodEnd.toISOString(),
          next_billing_date: periodEnd.toISOString(),
          payment_status: 'paid',
          plan_type: planType,
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
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: mercadoPagoData,
        status: mercadoPagoData.status,
        status_detail: mercadoPagoData.status_detail,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Payment processing failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
