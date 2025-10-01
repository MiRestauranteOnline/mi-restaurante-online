import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CancelRequest {
  clientId: string;
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId, reason = 'user_request' }: CancelRequest = await req.json();
    console.log('Cancelling subscription for client:', clientId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, mercadopago_subscription_id, mercadopago_preapproval_id, subscription_auto_recurring, subscription_status')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Check if this is a manual billing client (no MercadoPago subscription)
    if (!client.mercadopago_subscription_id && !client.mercadopago_preapproval_id) {
      console.log('Manual billing client - updating status only');
      
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          subscription_status: 'cancelled',
          cancellation_date: new Date().toISOString(),
          cancellation_reason: reason,
        })
        .eq('id', clientId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription cancelled (manual billing)',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cancel MercadoPago subscription
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_SUBSCRIPTION')!;
    const subscriptionId = client.mercadopago_preapproval_id || client.mercadopago_subscription_id;

    console.log('Cancelling MercadoPago subscription:', subscriptionId);

    const cancelResponse = await fetch(
      `https://api.mercadopago.com/preapproval/${subscriptionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          status: 'cancelled',
        }),
      }
    );

    const cancelResult = await cancelResponse.json();
    console.log('MercadoPago cancel result:', cancelResult);

    if (!cancelResponse.ok) {
      console.error('Failed to cancel MercadoPago subscription:', cancelResult);
      // Continue anyway - update our database
    }

    // Update client status
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        subscription_status: 'cancelled',
        cancellation_date: new Date().toISOString(),
        cancellation_reason: reason,
        subscription_auto_recurring: false,
      })
      .eq('id', clientId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription cancelled successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to cancel subscription'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
