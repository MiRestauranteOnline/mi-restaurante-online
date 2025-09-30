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
    const publicKey = Deno.env.get('MERCADOPAGO_PUBLIC_KEY');
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!publicKey) {
      return new Response(JSON.stringify({ success: false, error: 'MERCADOPAGO_PUBLIC_KEY not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const isTest = !!accessToken && accessToken.startsWith('TEST-');

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