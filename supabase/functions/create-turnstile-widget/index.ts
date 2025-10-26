import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

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
    const { client_id } = await req.json();

    if (!client_id) {
      console.error('Missing client_id parameter');
      return new Response(
        JSON.stringify({ error: 'client_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating Turnstile widget for client: ${client_id}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('restaurant_name, subdomain')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      console.error('Client not found:', clientError);
      return new Response(
        JSON.stringify({ error: 'Client not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Cloudflare credentials
    const cloudflareToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const cloudflareAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');

    if (!cloudflareToken || !cloudflareAccountId) {
      console.error('Missing Cloudflare credentials');
      return new Response(
        JSON.stringify({ error: 'Cloudflare credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Turnstile widget via Cloudflare API
    const widgetName = `${client.restaurant_name} (${client.subdomain})`.substring(0, 100);
    
    console.log(`Creating Turnstile widget with name: ${widgetName}`);

    const createWidgetResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/challenges/widgets`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudflareToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: widgetName,
          mode: 'managed', // managed, non-interactive, or invisible
          domains: [
            `${client.subdomain}.mirestaurante.online`,
            'mirestaurante.online', // Allow testing from main domain
          ],
        }),
      }
    );

    if (!createWidgetResponse.ok) {
      const errorText = await createWidgetResponse.text();
      console.error('Cloudflare API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create Turnstile widget',
          details: errorText 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const widgetData = await createWidgetResponse.json();
    
    if (!widgetData.success || !widgetData.result) {
      console.error('Unexpected Cloudflare response:', widgetData);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from Cloudflare API',
          details: widgetData 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const widget = widgetData.result;
    
    console.log(`Turnstile widget created successfully:`, {
      id: widget.sitekey,
      name: widget.name,
    });

    // Update client with Turnstile configuration
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        turnstile_site_key: widget.sitekey,
        turnstile_secret_key: widget.secret,
        turnstile_widget_id: widget.sitekey, // Widget ID is the same as site key in Cloudflare
        updated_at: new Date().toISOString(),
      })
      .eq('id', client_id);

    if (updateError) {
      console.error('Failed to update client with Turnstile keys:', updateError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save Turnstile configuration',
          details: updateError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully configured Turnstile for client ${client_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        site_key: widget.sitekey,
        widget_id: widget.sitekey,
        message: 'Turnstile widget created and configured successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
