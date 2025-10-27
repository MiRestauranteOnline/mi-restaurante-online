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
    const planAdvancedId = Deno.env.get('OPENPAY_PLAN_ADVANCED_ID_SANDBOX')!;
    const openpayApiBase = Deno.env.get('OPENPAY_API_BASE')!;

    const { clientId } = await req.json();

    console.log(`Processing upgrade for client:`, clientId);

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    if (client.plan_type !== 'basic') {
      throw new Error('Client is not on basic plan');
    }

    if (!client.openpay_customer_id || !client.openpay_subscription_id) {
      throw new Error('No OpenPay subscription found');
    }

    // Calculate prorated charge
    const basicPrice = client.locked_basic_price || 297;
    const advancedPrice = client.locked_advanced_price || 497;
    const priceDifference = advancedPrice - basicPrice;

    // Calculate days remaining in current billing cycle
    const nextBillingDate = new Date(client.next_billing_date);
    const today = new Date();
    const daysRemaining = Math.max(0, Math.ceil((nextBillingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const totalDaysInCycle = 30; // Monthly billing
    const proratedAmount = Math.round((priceDifference * daysRemaining / totalDaysInCycle) * 100) / 100;

    console.log(`Prorated amount: ${proratedAmount} for ${daysRemaining} days remaining`);

    const auth = btoa(`${privateKey}:`);
    const openpayUrl = `${openpayApiBase}/${merchantId}`;

    // 1. Cancel existing basic subscription
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
      throw new Error('Failed to cancel existing subscription');
    }

    // 2. Get customer's card
    const cardsResponse = await fetch(
      `${openpayUrl}/customers/${client.openpay_customer_id}/cards`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    if (!cardsResponse.ok) {
      throw new Error('Failed to get customer cards');
    }

    const cards = await cardsResponse.json();
    if (!cards || cards.length === 0) {
      throw new Error('No payment method found');
    }

    // 3. Process prorated charge (if amount > 0)
    if (proratedAmount > 0) {
      const chargeResponse = await fetch(
        `${openpayUrl}/customers/${client.openpay_customer_id}/charges`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_id: cards[0].id,
            method: 'card',
            amount: proratedAmount,
            currency: 'PEN',
            description: `Upgrade prorrateado a Plan Avanzado (${daysRemaining} días)`,
          }),
        }
      );

      if (!chargeResponse.ok) {
        const error = await chargeResponse.json();
        console.error('OpenPay charge failed:', error);
        throw new Error('Failed to process prorated charge');
      }

      console.log('Prorated charge processed successfully');
    }

    // 4. Create new advanced subscription
    const subscriptionResponse = await fetch(
      `${openpayUrl}/customers/${client.openpay_customer_id}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planAdvancedId,
          card_id: cards[0].id,
        }),
      }
    );

    if (!subscriptionResponse.ok) {
      const error = await subscriptionResponse.json();
      console.error('OpenPay subscription creation failed:', error);
      throw new Error(`Failed to create new subscription: ${error.description || 'Unknown error'}`);
    }

    const subscription = await subscriptionResponse.json();

    // 5. Update client in database
    const newEndDate = new Date(nextBillingDate);
    newEndDate.setMonth(newEndDate.getMonth() + 1);

    await supabase
      .from('clients')
      .update({
        plan_type: 'advanced',
        openpay_subscription_id: subscription.id,
        next_billing_date: nextBillingDate.toISOString(),
        subscription_end_date: newEndDate.toISOString(),
        pending_plan_change: null,
        pending_plan_change_date: null,
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    console.log('Plan upgraded successfully');

    return new Response(
      JSON.stringify({
        success: true,
        proratedAmount,
        daysRemaining,
        newPlanType: 'advanced',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in upgrade-openpay-plan:', error);
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
