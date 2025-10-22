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

    const { action, clientId, recordId, recordData } = await req.json();

    if (!clientId) {
      throw new Error('Client ID is required');
    }

    // Get client's zone_id
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('cloudflare_zone_id, custom_domain')
      .eq('id', clientId)
      .single();

    if (clientError) throw clientError;

    if (!client.cloudflare_zone_id) {
      throw new Error('No Cloudflare Zone configured for this client');
    }

    const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const cfApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const zoneId = client.cloudflare_zone_id;

    switch (action) {
      case 'list': {
        // List all DNS records
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
          {
            headers: {
              'Authorization': `Bearer ${cfApiToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Cloudflare API error: ${data.errors?.[0]?.message || 'Unknown error'}`);
        }

        return new Response(
          JSON.stringify({ success: true, records: data.result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create': {
        // Create new DNS record
        if (!recordData) {
          throw new Error('Record data is required');
        }

        const response = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${cfApiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: recordData.type,
              name: recordData.name,
              content: recordData.content,
              ttl: recordData.ttl || 1,
              priority: recordData.priority,
              proxied: recordData.proxied || false,
            }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Cloudflare API error: ${data.errors?.[0]?.message || 'Unknown error'}`);
        }

        console.log(`Created DNS record ${recordData.type} ${recordData.name} for client ${clientId}`);

        return new Response(
          JSON.stringify({ success: true, record: data.result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        // Update existing DNS record
        if (!recordId || !recordData) {
          throw new Error('Record ID and data are required');
        }

        const response = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${cfApiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: recordData.type,
              name: recordData.name,
              content: recordData.content,
              ttl: recordData.ttl || 1,
              priority: recordData.priority,
              proxied: recordData.proxied || false,
            }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Cloudflare API error: ${data.errors?.[0]?.message || 'Unknown error'}`);
        }

        console.log(`Updated DNS record ${recordId} for client ${clientId}`);

        return new Response(
          JSON.stringify({ success: true, record: data.result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        // Delete DNS record
        if (!recordId) {
          throw new Error('Record ID is required');
        }

        const response = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${cfApiToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Cloudflare API error: ${data.errors?.[0]?.message || 'Unknown error'}`);
        }

        console.log(`Deleted DNS record ${recordId} for client ${clientId}`);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in manage-dns-records:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
