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

    // Calculate days remaining and total days in current billing cycle
    const nextBillingDate = new Date(client.next_billing_date || new Date());
    const today = new Date();
    const daysRemaining = Math.max(0, Math.ceil((nextBillingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate actual billing cycle length
    // If we have subscription_start_date, use it; otherwise estimate from next_billing_date
    let totalDaysInCycle = 30; // Default fallback
    if (client.subscription_start_date) {
      const startDate = new Date(client.subscription_start_date);
      totalDaysInCycle = Math.ceil((nextBillingDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      // Estimate: go back one month from next_billing_date
      const estimatedStartDate = new Date(nextBillingDate);
      estimatedStartDate.setMonth(estimatedStartDate.getMonth() - 1);
      totalDaysInCycle = Math.ceil((nextBillingDate.getTime() - estimatedStartDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    // Ensure totalDaysInCycle is at least daysRemaining to avoid charging more than the difference
    totalDaysInCycle = Math.max(totalDaysInCycle, daysRemaining);
    
    // If upgrading with 0-1 days left, charge full advanced price for next month
    // Otherwise, charge prorated difference for remaining days
    const proratedAmount = daysRemaining <= 1 
      ? advancedPrice 
      : Math.round((priceDifference * daysRemaining / totalDaysInCycle) * 100) / 100;

    console.log(`Prorated amount: ${proratedAmount} for ${daysRemaining} days remaining out of ${totalDaysInCycle} total days (${daysRemaining <= 1 ? 'full month charge' : 'prorated'})`);

    // Short-circuit in test mode: if using mock/test OpenPay IDs, skip external API calls
    const isTestMode = (client.openpay_customer_id?.startsWith('test_') || client.openpay_subscription_id?.startsWith('test_'));
    if (isTestMode) {
      console.log('Test mode detected (mock OpenPay IDs). Skipping OpenPay API calls and updating DB directly.');
      const subscriptionId = client.openpay_subscription_id || `test_sub_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

      // Compute new dates
      const now = new Date();
      const newNextBillingDate = new Date(now);
      newNextBillingDate.setMonth(newNextBillingDate.getMonth() + 1);
      const newEndDate = new Date(newNextBillingDate);

      await supabase
        .from('clients')
        .update({
          plan_type: 'advanced',
          subscription_status: 'active',
          subscription_start_date: client.subscription_start_date || now.toISOString(),
          openpay_subscription_id: subscriptionId,
          next_billing_date: newNextBillingDate.toISOString(),
          subscription_end_date: newEndDate.toISOString(),
          pending_plan_change: null,
          pending_plan_change_date: null,
          payment_status: 'paid',
          updated_at: now.toISOString(),
        })
        .eq('id', clientId);

      console.log('Plan upgraded successfully (test mode).');

      return new Response(
        JSON.stringify({
          success: true,
          proratedAmount,
          daysRemaining,
          newPlanType: 'advanced',
          testMode: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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

    // Handle cancellation response
    // 404: subscription already cancelled (ok to proceed)
    // 412: subscription too new, can't cancel yet (ok to proceed, OpenPay will handle transition)
    if (!cancelResponse.ok && cancelResponse.status !== 404 && cancelResponse.status !== 412) {
      const error = await cancelResponse.json();
      console.error('OpenPay subscription cancellation failed:', error);
      throw new Error('Failed to cancel existing subscription');
    }
    
    if (cancelResponse.status === 412) {
      console.log('Subscription is too new to cancel, proceeding with upgrade (OpenPay will handle transition)');
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
      const error = await cardsResponse.json();
      console.error('Failed to get customer cards:', cardsResponse.status, error);
      throw new Error(`Failed to get customer cards: ${error.description || 'Unknown error'}`);
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
    const now = new Date();
    const newNextBillingDate = new Date(now);
    newNextBillingDate.setMonth(newNextBillingDate.getMonth() + 1);
    const newEndDate = new Date(newNextBillingDate);

    await supabase
      .from('clients')
      .update({
        plan_type: 'advanced',
        subscription_status: 'active',
        subscription_start_date: client.subscription_start_date || now.toISOString(),
        openpay_subscription_id: subscription.id,
        next_billing_date: newNextBillingDate.toISOString(),
        subscription_end_date: newEndDate.toISOString(),
        pending_plan_change: null,
        pending_plan_change_date: null,
        payment_status: 'paid',
        updated_at: now.toISOString(),
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
