import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentRequest {
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
  console.log('Create Rebill payment function called');

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
      amount,
      currency,
      customer,
      signup_data,
      return_url,
      webhook_url
    }: CreatePaymentRequest = await req.json();

    console.log('Creating Rebill payment for:', customer.email);

    // Get Rebill API key from environment
    const rebillApiKey = Deno.env.get('REBILL_API_KEY');
    const rebillSecretKey = Deno.env.get('REBILL_SECRET_KEY');

    if (!rebillApiKey || !rebillSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Rebill API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create payment with Rebill
    const rebillResponse = await fetch('https://api.rebill.com/v2/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rebillApiKey}`,
        'organization_id': rebillSecretKey, // Rebill uses organization_id in headers
      },
      body: JSON.stringify({
        items: [{
          name: `Sitio web para ${customer.name}`,
          amount: amount,
          currency: currency,
          quantity: 1,
        }],
        customer: {
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
        },
        installments: {
          maximum: 1,
          interestFree: 1,
        },
        paymentMetadata: {
          signup_data: signup_data,
          source: 'restaurant_signup',
          return_url: return_url,
          webhook_url: webhook_url,
        },
      }),
    });

    if (!rebillResponse.ok) {
      const errorData = await rebillResponse.text();
      console.error('Rebill API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment', details: errorData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentData = await rebillResponse.json();
    console.log('Rebill payment created:', paymentData.id);

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: paymentData.id,
        payment_url: paymentData.payment_url || paymentData.checkout_url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Unexpected error in create-rebill-payment function:', error);
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