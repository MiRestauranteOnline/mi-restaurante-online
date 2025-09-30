import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || '';
    const pkDefault = Deno.env.get('MERCADOPAGO_PUBLIC_KEY');
    const pkTest = Deno.env.get('MERCADOPAGO_PUBLIC_KEY_TEST');
    const pkLive = Deno.env.get('MERCADOPAGO_PUBLIC_KEY_LIVE');

    const isTest = accessToken.startsWith('TEST-');

    // Choose the appropriate public key based on access token environment
    const publicKey = isTest
      ? (pkTest || pkDefault)
      : (pkLive || pkDefault);

    if (!publicKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'No Mercado Pago public key configured for the current mode', mode: isTest ? 'test' : 'live' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(JSON.stringify({ success: true, publicKey, mode: isTest ? 'test' : 'live' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('get-mercadopago-public-key error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});