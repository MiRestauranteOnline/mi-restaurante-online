import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionRequest {
  token?: string;
  issuer_id?: string;
  payment_method_id?: string;
  transaction_amount: number;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  clientId: string;
  planType: 'basic' | 'advanced';
  couponCode?: string;
  useCheckoutPro?: boolean; // Flag to switch between card payment and redirect
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, issuer_id, payment_method_id, transaction_amount, payer, clientId, planType, couponCode, useCheckoutPro }: SubscriptionRequest = await req.json();

    console.log('Creating subscription:', { clientId, planType, amount: transaction_amount, couponCode, useCheckoutPro });

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
        amount: Number(finalAmount)
      });

      if (!couponError && couponResult?.valid) {
        discountAmount = couponResult.discount_amount;
        finalAmount = couponResult.final_amount;
        console.log('Coupon applied:', { original: originalAmount, discount: discountAmount, final: finalAmount });
      }
    }

    // Normalize amounts to valid numbers (2 decimals)
    const amountNumberRaw = typeof finalAmount === 'string' ? parseFloat(finalAmount) : Number(finalAmount);
    if (!Number.isFinite(amountNumberRaw) || amountNumberRaw <= 0) {
      throw new Error('Invalid amount computed for transaction_amount');
    }
    const amount = Math.round(amountNumberRaw * 100) / 100;
    const originalAmountNumber = Math.round(Number(originalAmount) * 100) / 100;
    const discountAmountNumber = Math.round(Number(discountAmount) * 100) / 100;

    // Calculate subscription dates (ensure start_date is safely in the future for any timezone)
    const bufferMinutes = 5; // avoid "past date" due to processing delays/timezones
    const periodStart = new Date(Date.now() + bufferMinutes * 60 * 1000);
    // Normalize seconds/millis to avoid precision issues
    periodStart.setSeconds(0, 0);
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_SUBSCRIPTION')!;

    // Check if we should use Checkout Pro (redirect) or card payment
    const shouldUseCheckoutPro = useCheckoutPro !== false; // Default to true for better approval rates
    
    console.log(`Using ${shouldUseCheckoutPro ? 'Checkout Pro (redirect)' : 'card payment'} flow`);
    
    if (shouldUseCheckoutPro) {
      // ===== CHECKOUT PRO (REDIRECT) FLOW =====
      console.log('Creating Checkout Pro preference for redirect...');
      console.log('✓ Access token prefix:', accessToken?.substring(0, 30));
      
      const preferenceBody = {
        reason: `Suscripción ${planType} - ${client.restaurant_name}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: amount,
          currency_id: currency,
          start_date: periodStart.toISOString(),
        },
        back_url: `https://${client.subdomain}.mirestauranteonline.com/registro?payment=success`,
        payer_email: payer.email,
        external_reference: clientId
      };

      console.log('Preference body:', JSON.stringify(preferenceBody, null, 2));

      const preferenceResponse = await fetch('https://api.mercadopago.com/preapproval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preferenceBody),
      });

      const preferenceResult = await preferenceResponse.json();
      console.log('Preference created:', preferenceResult);

      if (!preferenceResponse.ok) {
        console.error('Preference creation failed:', preferenceResult);
        throw new Error(preferenceResult.message || 'Failed to create checkout preference');
      }

      // Return the checkout URL for redirect
      return new Response(
        JSON.stringify({
          success: true,
          checkoutUrl: preferenceResult.init_point,
          preapprovalId: preferenceResult.id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // ===== CARD PAYMENT FLOW (ORIGINAL) =====
    if (!token || !payment_method_id || !issuer_id) {
      throw new Error('Card token, payment method, and issuer are required for card payment flow');
    }

    // DIAGNOSTIC: Log credential details (partial)
    console.log('Creating subscription with card payment...');
    console.log('✓ Access token prefix:', accessToken?.substring(0, 30));
    console.log('✓ Token received from SDK:', token?.substring(0, 20));
    console.log('✓ Token length:', token?.length);
    console.log('✓ Payment method:', payment_method_id, 'Issuer:', issuer_id);

    // Create subscription (preapproval) - MercadoPago will automatically charge the first payment
    const subscriptionData = {
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: amount,
        currency_id: currency,
        start_date: periodStart.toISOString(),
      },
      back_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/subscription-callback`,
      payer_email: payer.email,
      reason: `Suscripción mensual ${planType} - ${client.restaurant_name}`,
      external_reference: clientId,
      status: 'authorized',
      card_token_id: token,
    };

    const subscriptionResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(subscriptionData),
    });

    const subscriptionResult = await subscriptionResponse.json();
    console.log('Subscription result:', subscriptionResult);

    if (!subscriptionResponse.ok) {
      console.error('Subscription creation failed:', subscriptionResult);
      // Log full error details for debugging
      if (subscriptionResult.cause && Array.isArray(subscriptionResult.cause)) {
        console.error('Error causes:', JSON.stringify(subscriptionResult.cause, null, 2));
      }
      if (subscriptionResult.message) {
        console.error('Error message:', subscriptionResult.message);
      }
      const errorMsg = subscriptionResult.message || subscriptionResult.code || 'Subscription creation failed';
      throw new Error(errorMsg);
    }

    // Wait a moment for MercadoPago to process the initial payment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fetch the first payment details from the subscription
    let firstPaymentId = null;
    try {
      const paymentsResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${subscriptionResult.id}/authorized_payments`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        if (paymentsData.results && paymentsData.results.length > 0) {
          firstPaymentId = paymentsData.results[0].id;
          console.log('First payment ID:', firstPaymentId);
        }
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }

    // Create payment record
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('subscription_payments')
      .insert({
        client_id: clientId,
        amount: amount,
        original_amount: originalAmountNumber,
        discount_amount: discountAmountNumber,
        currency: currency,
        status: 'approved',
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        coupon_code: couponCode || null,
        mercadopago_payment_id: firstPaymentId || subscriptionResult.id.toString(),
        mercadopago_subscription_id: subscriptionResult.id || null,
        payment_method: payment_method_id,
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
        mercadopago_subscription_id: subscriptionResult.id || null,
        mercadopago_preapproval_id: subscriptionResult.id || null,
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
        payment: { id: firstPaymentId, status: 'approved' },
        subscription: subscriptionResult,
        status: 'approved',
        status_detail: 'Subscription created successfully with initial payment',
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