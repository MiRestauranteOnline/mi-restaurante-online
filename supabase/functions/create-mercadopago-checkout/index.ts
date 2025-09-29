import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface CreateCheckoutRequest {
  customerEmail?: string | null;
  customerName: string;
  clientId: string;
  planType: 'basic' | 'advanced';
}

serve(async (req) => {
  console.log('create-mercadopago-checkout function called, method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, clientId, planType }: CreateCheckoutRequest = await req.json();
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    const isTestToken = accessToken.startsWith('TEST-');
    const origin = req.headers.get('origin') || 'https://mirestauranteonline.com';
    console.log('Creating Mercado Pago Checkout Pro preference:', { customerEmail, planType, clientId, origin, tokenMode: isTestToken ? 'TEST' : 'LIVE' });

    const amount = planType === 'basic' ? 297 : 497;
    const planTitle = planType === 'basic' ? 'Plan Básico' : 'Plan Avanzado';

    // Create a Checkout Pro preference (one-time payment that will be converted to subscription via webhook)
    const preferencePayload: any = {
      items: [
        {
          title: `${planTitle} - Mi Restaurante Online`,
          description: planType === 'basic' 
            ? 'Sitio web profesional con menú digital y diseño personalizado' 
            : 'Sitio web profesional + cambios ilimitados de contenido y soporte prioritario',
          quantity: 1,
          unit_price: amount,
          currency_id: 'PEN',
        }
      ],
      back_urls: {
        success: `${origin}/signup/success?client_id=${clientId}`,
        failure: `${origin}/signup?error=payment_failed`,
        pending: `${origin}/signup?status=pending`,
      },
      auto_return: 'approved',
      external_reference: clientId,
      statement_descriptor: 'MiRestauranteOnline',
      metadata: {
        client_id: clientId,
        plan_type: planType,
      },
    };

    // Include payer info; if invalid email, fallback to a sandbox email for testing
    if (customerEmail && customerEmail.includes('@')) {
      preferencePayload.payer = {
        email: customerEmail,
        name: customerName,
      };
    } else {
      const fallbackEmail = `buyer.test.${Date.now()}@example.com`;
      preferencePayload.payer = {
        email: fallbackEmail,
        name: customerName || 'Test Buyer',
      };
      console.log('No valid payer email provided. Using fallback test email:', fallbackEmail);
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferencePayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mercado Pago checkout preference creation error:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create checkout: ${response.status} ${errorData}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const data = await response.json();
    
    console.log('Checkout preference created successfully:', data);

    // Use sandbox_init_point for test mode, init_point for production
    const checkoutUrl = data.sandbox_init_point || data.init_point;

    return new Response(
      JSON.stringify({
        success: true,
        preferenceId: data.id,
        initPoint: checkoutUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-mercadopago-checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
