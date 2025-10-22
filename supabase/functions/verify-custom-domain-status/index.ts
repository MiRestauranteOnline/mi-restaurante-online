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

    const { clientId } = await req.json();

    if (!clientId) {
      throw new Error('Missing required field: clientId');
    }

    // Get client's custom domain
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('custom_domain')
      .eq('id', clientId)
      .single();

    if (clientError || !client?.custom_domain) {
      throw new Error('No custom domain found for this client');
    }

    const customDomain = client.custom_domain;
    console.log(`Checking status for domain ${customDomain}`);

    // Check domain status in Cloudflare Pages
    const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const cfProjectName = Deno.env.get('CLOUDFLARE_PAGES_PROJECT_NAME') || 'mi-restaurante-online';

    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/pages/projects/${cfProjectName}/domains/${customDomain}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const cfData = await cfResponse.json();
    console.log('Cloudflare domain status:', cfData);

    if (!cfResponse.ok) {
      throw new Error(`Cloudflare API error: ${cfData.errors?.[0]?.message || 'Unknown error'}`);
    }

    const domain = cfData.result;
    const isVerified = domain?.status === 'active';
    const sslStatus = domain?.ssl_status || 'pending';

    // Update client record
    const { error: updateError } = await supabaseClient
      .from('clients')
      .update({
        domain_verified: isVerified,
        ssl_status: sslStatus,
        domain_verification_date: isVerified ? new Date().toISOString() : null,
        ssl_issued_date: sslStatus === 'active' ? new Date().toISOString() : null,
        last_domain_check: new Date().toISOString(),
      })
      .eq('id', clientId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log(`Domain ${customDomain} - Verified: ${isVerified}, SSL: ${sslStatus}`);

    return new Response(
      JSON.stringify({
        success: true,
        domain: customDomain,
        verified: isVerified,
        ssl_status: sslStatus,
        status: domain?.status || 'pending',
        verification_errors: domain?.verification_errors || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-custom-domain-status:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
