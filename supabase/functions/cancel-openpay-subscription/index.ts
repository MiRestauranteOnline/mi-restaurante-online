import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const merchantId = Deno.env.get('OPENPAY_MERCHANT_ID_SANDBOX')!;
    const privateKey = Deno.env.get('OPENPAY_PRIVATE_KEY_SANDBOX')!;
    const openpayApiBase = Deno.env.get('OPENPAY_API_BASE')!;

    const { clientId, reason } = await req.json();

    console.log(`Processing cancellation for client:`, clientId);

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    if (!client.openpay_customer_id || !client.openpay_subscription_id) {
      throw new Error('No OpenPay subscription found');
    }

    const auth = btoa(`${privateKey}:`);
    const openpayUrl = `${openpayApiBase}/${merchantId}`;

    // Cancel subscription in OpenPay
    const cancelResponse = await fetch(
      `${openpayUrl}/customers/${client.openpay_customer_id}/subscriptions/${client.openpay_subscription_id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    if (!cancelResponse.ok && cancelResponse.status !== 404) {
      const error = await cancelResponse.json();
      console.error('OpenPay subscription cancellation failed:', error);
      throw new Error('Failed to cancel subscription in OpenPay');
    }

    // Update client in database
    // Note: is_deactivated stays false until subscription_end_date is reached
    await supabase
      .from('clients')
      .update({
        subscription_status: 'cancelled',
        cancellation_date: new Date().toISOString(),
        cancellation_reason: reason || 'user_request',
        subscription_auto_recurring: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    console.log('Subscription cancelled successfully');

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in cancel-openpay-subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
