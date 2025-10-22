import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { clientId, customDomain } = await req.json();

    if (!clientId || !customDomain) {
      throw new Error('Missing required fields: clientId and customDomain');
    }

    console.log(`Adding custom domain ${customDomain} for client ${clientId}`);

    // Add domain to Cloudflare Pages
    const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const cfProjectName = Deno.env.get('CLOUDFLARE_PAGES_PROJECT_NAME') || 'mi-restaurante-online';

    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/pages/projects/${cfProjectName}/domains`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: customDomain }),
      }
    );

    const cfData = await cfResponse.json();
    console.log('Cloudflare response:', cfData);

    if (!cfResponse.ok) {
      throw new Error(`Cloudflare API error: ${cfData.errors?.[0]?.message || 'Unknown error'}`);
    }

    // Update client record with custom domain
    const { error: updateError } = await supabaseClient
      .from('clients')
      .update({
        custom_domain: customDomain,
        domain_verified: false,
        ssl_status: 'pending',
        last_domain_check: new Date().toISOString(),
      })
      .eq('id', clientId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log(`Successfully added domain ${customDomain} to Cloudflare Pages`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Custom domain added to Cloudflare Pages',
        domain: customDomain,
        verification_status: cfData.result?.verification_status || 'pending',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in add-custom-domain-to-pages:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
