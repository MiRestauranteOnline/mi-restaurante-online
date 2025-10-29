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

    // Environment-based configuration
    const environment = Deno.env.get('OPENPAY_ENVIRONMENT') || 'sandbox';
    const suffix = environment === 'production' ? '_PROD' : '_SANDBOX';
    
    const merchantId = Deno.env.get(`OPENPAY_MERCHANT_ID${suffix}`)!;
    const privateKey = Deno.env.get(`OPENPAY_PRIVATE_KEY${suffix}`)!;
    const planBasicId = Deno.env.get(`OPENPAY_PLAN_BASIC_ID${suffix}`)!;
    const planAdvancedId = Deno.env.get(`OPENPAY_PLAN_ADVANCED_ID${suffix}`)!;
    const openpayApiBase = Deno.env.get('OPENPAY_API_BASE')!;
    
    console.log(`Using OpenPay ${environment} environment`);

    const { clientId, newPlanType, immediate } = await req.json();

    console.log(`Processing plan change for client:`, clientId, 'to:', newPlanType, 'immediate:', immediate);

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
      throw new Error('No OpenPay subscription found for this client');
    }

    const auth = btoa(`${privateKey}:`);
    const openpayUrl = `${openpayApiBase}/${merchantId}`;
    
    console.log('Using OpenPay API base:', openpayApiBase);
    console.log('OpenPay URL:', openpayUrl);
    const isUpgrade = (client.plan_type === 'basic' && newPlanType === 'advanced');

    if (immediate && isUpgrade) {
      // UPGRADE: Cancel current subscription and create new one immediately
      
      // Cancel existing subscription
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
      }

      // Get customer's cards
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

      // Create new subscription with higher plan
      const newPlanId = planAdvancedId;
      const subscriptionResponse = await fetch(
        `${openpayUrl}/customers/${client.openpay_customer_id}/subscriptions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan_id: newPlanId,
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

      // Calculate new billing dates
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

      // Update client
      await supabase
        .from('clients')
        .update({
          plan_type: newPlanType,
          openpay_subscription_id: subscription.id,
          subscription_end_date: subscriptionEndDate.toISOString(),
          next_billing_date: subscriptionEndDate.toISOString(),
          pending_plan_change: null,
          pending_plan_change_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId);

      console.log('Plan upgraded successfully');

    } else {
      // DOWNGRADE: Schedule for next billing cycle
      const nextBillingDate = client.next_billing_date || client.subscription_end_date;
      
      await supabase
        .from('clients')
        .update({
          pending_plan_change: newPlanType,
          pending_plan_change_date: nextBillingDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId);

      console.log('Plan downgrade scheduled for:', nextBillingDate);
    }

    return new Response(
      JSON.stringify({
        success: true,
        immediate: immediate && isUpgrade,
        scheduledDate: (!immediate || !isUpgrade) ? (client.next_billing_date || client.subscription_end_date) : null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in change-openpay-plan:', error);
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
