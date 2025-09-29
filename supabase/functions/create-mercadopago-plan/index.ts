import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePlanRequest {
  planType: 'basic' | 'advanced';
}

serve(async (req) => {
  console.log('create-mercadopago-plan function called, method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planType }: CreatePlanRequest = await req.json();
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    const planDetails = {
      basic: {
        title: 'Plan Básico - Sitio Web Restaurante',
        price: 297,
        frequency: 1,
        frequency_type: 'months',
        description: 'Sitio web profesional con menú digital y diseño personalizado',
      },
      advanced: {
        title: 'Plan Avanzado - Sitio Web + Cambios',
        price: 497,
        frequency: 1,
        frequency_type: 'months',
        description: 'Sitio web profesional + cambios ilimitados de contenido y soporte prioritario',
      },
    };

    const plan = planDetails[planType];

    const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: plan.title,
        auto_recurring: {
          frequency: plan.frequency,
          frequency_type: plan.frequency_type,
          transaction_amount: plan.price,
          currency_id: 'PEN',
        },
        back_url: `${req.headers.get('origin')}/signup/success`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mercado Pago plan creation error:', errorData);
      throw new Error(`Failed to create plan: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    
    console.log(`Plan created successfully: ${planType}`, data);

    return new Response(
      JSON.stringify({
        success: true,
        plan: {
          id: data.id,
          type: planType,
          amount: plan.price,
          title: plan.title,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-mercadopago-plan:', error);
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
