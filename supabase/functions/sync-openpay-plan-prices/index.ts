import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting Openpay plan price sync');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch current plan prices from subscription_plans
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('plan_key, monthly_price')
      .eq('is_active', true);

    if (plansError) {
      console.error('Error fetching plans:', plansError);
      throw plansError;
    }

    console.log('📊 Fetched plans:', plans);

    const basicPlan = plans.find(p => p.plan_key === 'basic');
    const advancedPlan = plans.find(p => p.plan_key === 'advanced');

    if (!basicPlan || !advancedPlan) {
      throw new Error('Basic or Advanced plan not found in subscription_plans');
    }

    // Get Openpay credentials
    const openpayApiBase = Deno.env.get('OPENPAY_API_BASE');
    const openpayMerchantId = Deno.env.get('OPENPAY_MERCHANT_ID_SANDBOX');
    const openpayPrivateKey = Deno.env.get('OPENPAY_PRIVATE_KEY_SANDBOX');
    const basicPlanId = Deno.env.get('OPENPAY_PLAN_BASIC_ID_SANDBOX');
    const advancedPlanId = Deno.env.get('OPENPAY_PLAN_ADVANCED_ID_SANDBOX');

    if (!openpayApiBase || !openpayMerchantId || !openpayPrivateKey || !basicPlanId || !advancedPlanId) {
      throw new Error('Missing Openpay configuration');
    }

    console.log('🔑 Openpay config loaded');

    // Update basic plan in Openpay
    const basicUpdateResponse = await fetch(
      `${openpayApiBase}/${openpayMerchantId}/plans/${basicPlanId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${openpayPrivateKey}:`),
        },
        body: JSON.stringify({
          amount: basicPlan.monthly_price,
        }),
      }
    );

    if (!basicUpdateResponse.ok) {
      const errorText = await basicUpdateResponse.text();
      console.error('❌ Failed to update basic plan:', errorText);
      throw new Error(`Failed to update basic plan in Openpay: ${errorText}`);
    }

    console.log('✅ Basic plan updated in Openpay');

    // Update advanced plan in Openpay
    const advancedUpdateResponse = await fetch(
      `${openpayApiBase}/${openpayMerchantId}/plans/${advancedPlanId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${openpayPrivateKey}:`),
        },
        body: JSON.stringify({
          amount: advancedPlan.monthly_price,
        }),
      }
    );

    if (!advancedUpdateResponse.ok) {
      const errorText = await advancedUpdateResponse.text();
      console.error('❌ Failed to update advanced plan:', errorText);
      throw new Error(`Failed to update advanced plan in Openpay: ${errorText}`);
    }

    console.log('✅ Advanced plan updated in Openpay');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Openpay plan prices synced successfully',
        plans: {
          basic: basicPlan.monthly_price,
          advanced: advancedPlan.monthly_price,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error syncing Openpay prices:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});