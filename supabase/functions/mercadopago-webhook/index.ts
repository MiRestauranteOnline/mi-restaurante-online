import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('MercadoPago webhook received:', JSON.stringify(body, null, 2));

    // MercadoPago sends notifications for various events
    if (body.type !== 'payment') {
      console.log('Ignoring non-payment notification');
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      throw new Error('No payment ID in webhook');
    }

    // Fetch payment details from MercadoPago
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!mpResponse.ok) {
      throw new Error(`Failed to fetch payment details: ${mpResponse.status}`);
    }

    const payment = await mpResponse.json();
    console.log('Payment details:', JSON.stringify(payment, null, 2));

    const externalReference = payment.external_reference;
    const status = payment.status; // approved, rejected, cancelled, etc.
    const paymentMethod = payment.payment_type_id;

    if (!externalReference) {
      console.error('No external reference in payment');
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update payment record
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('subscription_payments')
      .update({
        status: status,
        mercadopago_payment_id: paymentId,
        payment_method: paymentMethod,
        paid_at: status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', externalReference)
      .select('*, clients(*)')
      .single();

    if (paymentError) {
      console.error('Failed to update payment record:', paymentError);
      throw paymentError;
    }

    console.log('Updated payment record:', paymentRecord);

    // If payment approved, activate subscription
    if (status === 'approved' && paymentRecord) {
      const clientId = paymentRecord.client_id;
      const periodEnd = new Date(paymentRecord.period_end);

      await supabase
        .from('clients')
        .update({
          subscription_status: 'active',
          payment_status: 'paid',
          subscription_start_date: paymentRecord.period_start,
          subscription_end_date: paymentRecord.period_end,
          next_billing_date: periodEnd.toISOString(),
          plan_type: paymentRecord.clients.plan_type || 'basic',
          payment_failures_count: 0,
        })
        .eq('id', clientId);

      console.log(`Activated subscription for client ${clientId}`);
    } else if (status === 'rejected' || status === 'cancelled') {
      // Handle failed payment
      const clientId = paymentRecord.client_id;
      
      await supabase
        .from('clients')
        .update({
          payment_status: 'failed',
          last_payment_attempt: new Date().toISOString(),
          payment_failures_count: supabase.rpc('increment'),
        })
        .eq('id', clientId);

      console.log(`Payment failed for client ${clientId}`);
    }

    return new Response(
      JSON.stringify({ received: true, status }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
