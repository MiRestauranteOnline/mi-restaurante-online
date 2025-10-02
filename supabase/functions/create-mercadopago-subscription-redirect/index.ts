import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    console.log('↪️ create-mercadopago-subscription-redirect body:', JSON.stringify(body, null, 2));

    const { clientId, planType, transaction_amount, payer } = body || {};

    if (!clientId || !planType || !transaction_amount || !payer?.email) {
      const msg = 'Missing required fields: clientId, planType, transaction_amount, payer.email';
      console.error(msg, { clientId, planType, transaction_amount, payer });
      return new Response(JSON.stringify({ success: false, error: msg }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load plan to get currency and ensure it's active
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('monthly_price, currency')
      .eq('plan_key', planType)
      .eq('is_active', true)
      .maybeSingle();

    if (planError || !planData) {
      const msg = 'Plan not found or inactive';
      console.error(msg, { planError, planType });
      return new Response(JSON.stringify({ success: false, error: msg }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const amount = Number(transaction_amount) || Number(planData.monthly_price);
    const currency = planData.currency || 'PEN';

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_SUBSCRIPTION')!;
    console.log('✓ Using access token prefix:', accessToken?.substring(0, 20));

    // 1) Create Preapproval Plan
    const planBody = {
      reason: `Suscripción ${planType} - ${clientId}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: amount,
        currency_id: currency,
      },
      back_url: `https://mirestauranteonline.com/registro?payment=success`,
    };

    console.log('→ Creating preapproval_plan with body:', JSON.stringify(planBody));
    const planResp = await fetch('https://api.mercadopago.com/preapproval_plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(planBody),
    });
    const planResult = await planResp.json().catch(() => ({}));
    console.log('← preapproval_plan result:', JSON.stringify(planResult));

    if (!planResp.ok || !planResult?.id) {
      const msg = planResult?.message || planResult?.error || 'Failed to create preapproval plan';
      return new Response(JSON.stringify({ success: false, error: msg, details: planResult }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 2) Redirect-based subscription: use plan init_point directly (no preapproval creation needed)
    if (planResult?.init_point) {
      console.log('✓ Using preapproval_plan init_point for redirect:', planResult.init_point);
      return new Response(
        JSON.stringify({ success: true, checkoutUrl: planResult.init_point, preapprovalPlanId: planResult.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Plan created but init_point missing', details: planResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('create-mercadopago-subscription-redirect error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
