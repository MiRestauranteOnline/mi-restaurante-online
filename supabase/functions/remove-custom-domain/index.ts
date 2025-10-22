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
    console.log(`Removing custom domain ${customDomain} for client ${clientId}`);

    // Remove domain from Cloudflare Pages
    const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const cfProjectName = Deno.env.get('CLOUDFLARE_PAGES_PROJECT_NAME') || 'mi-restaurante-online';

    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/pages/projects/${cfProjectName}/domains/${customDomain}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!cfResponse.ok) {
      const cfData = await cfResponse.json();
      console.error('Cloudflare error:', cfData);
      // Continue anyway to clean up database
    }

    // Update client record to remove custom domain
    const { error: updateError } = await supabaseClient
      .from('clients')
      .update({
        custom_domain: null,
        domain_verified: false,
        ssl_status: 'pending',
        domain_verification_date: null,
        ssl_issued_date: null,
        last_domain_check: null,
      })
      .eq('id', clientId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log(`Successfully removed domain ${customDomain} from Cloudflare Pages`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Custom domain removed successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in remove-custom-domain:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
