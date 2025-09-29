import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSubscriptionRequest {
  planId: string;
  customerEmail: string;
  customerName: string;
  clientId: string;
  planType: 'basic' | 'advanced';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, customerEmail, customerName, clientId, planType }: CreateSubscriptionRequest = await req.json();
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    console.log('Creating Mercado Pago subscription:', { planId, customerEmail, planType, clientId });

    const origin = req.headers.get('origin') || 'https://mirestauranteonline.com';

    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preapproval_plan_id: planId,
        reason: `Suscripción ${planType === 'basic' ? 'Básica' : 'Avanzada'} - Mi Restaurante Online`,
        payer_email: customerEmail,
        card_token_id: null, // Will be collected via checkout
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: planType === 'basic' ? 297 : 497,
          currency_id: 'PEN',
          start_date: new Date().toISOString(),
        },
        back_url: `${origin}/signup/success?client_id=${clientId}`,
        status: 'pending',
        external_reference: clientId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mercado Pago subscription creation error:', errorData);
      throw new Error(`Failed to create subscription: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    
    console.log('Subscription created successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: data.id,
        initPoint: data.init_point,
        status: data.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-mercadopago-subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
