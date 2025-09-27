import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSubscriptionRequest {
  plan_type: 'basic' | 'advanced';
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
    phone: string;
  };
  signup_data: string;
  return_url: string;
  webhook_url: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Create Rebill subscription function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const {
      plan_type,
      amount,
      currency,
      customer,
      signup_data,
      return_url,
      webhook_url
    }: CreateSubscriptionRequest = await req.json();

    console.log('Creating Rebill subscription for:', customer.email, 'Plan:', plan_type);

    // Get Rebill API key from environment
    const rebillApiKey = Deno.env.get('REBILL_API_KEY');
    
    if (!rebillApiKey) {
      return new Response(
        JSON.stringify({ error: 'Rebill API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First, create or get the plan
    const planName = plan_type === 'basic' ? 'Plan Básico - Mi Restaurante Online' : 'Plan Avanzado - Mi Restaurante Online';
    
    // Create subscription with Rebill
    const rebillResponse = await fetch('https://api.rebill.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rebillApiKey}`,
      },
      body: JSON.stringify({
        customer: {
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
        },
        plan: {
          name: planName,
          amount: amount,
          currency: currency,
          interval: 'month',
          interval_count: 1,
        },
        metadata: {
          signup_data: signup_data,
          plan_type: plan_type,
          source: 'restaurant_signup'
        },
        success_url: return_url,
        failure_url: `${return_url}?error=payment_failed`,
        webhook_url: webhook_url,
        trial_period_days: 0,
      }),
    });

    if (!rebillResponse.ok) {
      const errorData = await rebillResponse.text();
      console.error('Rebill API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription', details: errorData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscriptionData = await rebillResponse.json();
    console.log('Rebill subscription created:', subscriptionData.id);

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: subscriptionData.id,
        payment_url: subscriptionData.checkout_url || subscriptionData.payment_url,
        plan_type: plan_type,
        amount: amount,
        currency: currency,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Unexpected error in create-rebill-subscription function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);