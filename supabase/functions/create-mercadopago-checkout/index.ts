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
    const { clientId, planType, couponCode, country = 'PE' } = await req.json();

    if (!clientId || !planType) {
      throw new Error('Client ID and plan type are required');
    }

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

    // Determine plan price based on type and country
    const planPrices: Record<string, { PEN: number; MXN: number; COP: number; CLP: number; ARS: number; BRL: number }> = {
      basic: { PEN: 297, MXN: 1499, COP: 299000, CLP: 64990, ARS: 69990, BRL: 389 },
      advanced: { PEN: 497, MXN: 2499, COP: 499000, CLP: 109990, ARS: 119990, BRL: 649 },
    };

    const currencies: Record<string, string> = {
      PE: 'PEN', MX: 'MXN', CO: 'COP', CL: 'CLP', AR: 'ARS', BR: 'BRL'
    };

    const currency = currencies[country] || 'PEN';
    let amount = planPrices[planType]?.[currency as keyof typeof planPrices.basic];

    if (!amount) {
      throw new Error('Invalid plan type or country');
    }

    const originalAmount = amount;
    let discountAmount = 0;
    let appliedCoupon = null;

    // Apply coupon if provided
    if (couponCode) {
      const { data: validationResult } = await supabase
        .rpc('validate_coupon', {
          coupon_code: couponCode,
          plan_type: planType,
          amount: amount
        });

      if (validationResult?.valid) {
        discountAmount = validationResult.discount_amount;
        amount = validationResult.final_amount;
        appliedCoupon = couponCode;
      }
    }

    // Calculate subscription period
    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('subscription_payments')
      .insert({
        client_id: clientId,
        amount: amount,
        currency: currency,
        status: 'pending',
        original_amount: originalAmount,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
      })
      .select()
      .single();

    if (paymentError || !payment) {
      throw new Error('Failed to create payment record');
    }

    // Create MercadoPago preference
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;
    
    const preference = {
      items: [
        {
          title: `Plan ${planType === 'basic' ? 'Básico' : 'Avanzado'} - ${client.restaurant_name}`,
          quantity: 1,
          unit_price: amount,
          currency_id: currency,
        },
      ],
      payer: {
        email: client.email || 'cliente@mirestauranteonline.pe',
        name: client.restaurant_name,
      },
      back_urls: {
        success: `https://mirestauranteonline.pe/signup?payment=success&payment_id=${payment.id}`,
        failure: `https://mirestauranteonline.pe/signup?payment=failure&payment_id=${payment.id}`,
        pending: `https://mirestauranteonline.pe/signup?payment=pending&payment_id=${payment.id}`,
      },
      auto_return: 'approved',
      external_reference: payment.id,
      notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
      metadata: {
        client_id: clientId,
        plan_type: planType,
        payment_id: payment.id,
      },
    };

    console.log('Creating MercadoPago preference:', preference);

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('MercadoPago API error:', errorText);
      throw new Error(`MercadoPago API error: ${mpResponse.status}`);
    }

    const mpData = await mpResponse.json();

    // Update payment with preference ID
    await supabase
      .from('subscription_payments')
      .update({ mercadopago_preference_id: mpData.id })
      .eq('id', payment.id);

    // Increment coupon usage if applied
    if (appliedCoupon) {
      // Fetch current usage
      const { data: couponData } = await supabase
        .from('coupons')
        .select('uses_count, code')
        .eq('code', appliedCoupon)
        .single();
      
      if (couponData) {
        const { error: couponError } = await supabase
          .from('coupons')
          .update({ uses_count: (couponData.uses_count || 0) + 1 })
          .eq('code', appliedCoupon);
        
        if (couponError) {
          console.error('Failed to increment coupon usage:', couponError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        preference_id: mpData.id,
        payment_id: payment.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
