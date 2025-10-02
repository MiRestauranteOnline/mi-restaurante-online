const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Return the subscription public key
    const publicKey = Deno.env.get('MERCADOPAGO_PUBLIC_KEY_SUBSCRIPTION');
    
    if (!publicKey) {
      throw new Error('MercadoPago public key not configured');
    }

    // DIAGNOSTIC: Log public key details (safe to log, it's public)
    console.log('✓ Returning public key:', publicKey);
    console.log('✓ Key prefix:', publicKey.substring(0, 20));

    return new Response(
      JSON.stringify({ publicKey }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error getting public key:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
