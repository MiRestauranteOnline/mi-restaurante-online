import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

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

    const body = await req.json();
    console.log('Mercado Pago webhook received:', JSON.stringify(body, null, 2));

    // Mercado Pago sends notifications with this structure
    const { type, data } = body;

    if (type === 'subscription_preapproval') {
      const preapprovalId = data.id;
      const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

      // Fetch the subscription details
      const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.status}`);
      }

      const subscription = await response.json();
      console.log('Subscription details:', subscription);

      const clientId = subscription.external_reference;
      const status = subscription.status; // authorized, paused, cancelled, pending, etc.

      // Map Mercado Pago status to our subscription status
      let subscriptionStatus = 'pending';
      let paymentStatus = 'pending';

      switch (status) {
        case 'authorized':
          subscriptionStatus = 'active';
          paymentStatus = 'completed';
          break;
        case 'paused':
          subscriptionStatus = 'paused';
          paymentStatus = 'failed';
          break;
        case 'cancelled':
          subscriptionStatus = 'cancelled';
          paymentStatus = 'failed';
          break;
        case 'pending':
          subscriptionStatus = 'pending';
          paymentStatus = 'pending';
          break;
      }

      // Update client subscription status
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          subscription_status: subscriptionStatus,
          payment_status: paymentStatus,
          rebill_subscription_id: preapprovalId, // Reusing this field for Mercado Pago
          subscription_start_date: subscriptionStatus === 'active' ? new Date().toISOString() : null,
          subscription_end_date: subscriptionStatus === 'active' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
            : null,
          next_billing_date: subscriptionStatus === 'active'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId);

      if (updateError) {
        console.error('Error updating client:', updateError);
        throw updateError;
      }

      console.log(`Client ${clientId} subscription updated to ${subscriptionStatus}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in mercadopago-webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
