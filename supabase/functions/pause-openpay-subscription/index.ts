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

    const { clientId, action } = await req.json();

    console.log(`Processing ${action} subscription for client:`, clientId);

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    if (action === 'pause') {
      if (!client.openpay_customer_id || !client.openpay_subscription_id) {
        throw new Error('No OpenPay subscription found for this client');
      }
    } else if (action === 'resume') {
      if (!client.openpay_customer_id) {
        throw new Error('No OpenPay customer found for this client');
      }
    }

    const auth = btoa(`${privateKey}:`);
    const base = openpayApiBase.replace(/\/+$/, '');
    const openpayUrl = `${base}/${merchantId}`;
    
    console.log('Using OpenPay API base:', base);
    console.log('OpenPay URL:', openpayUrl);

    if (action === 'pause') {
      // Cancel the subscription in OpenPay (will be recreated on resume)
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
        throw new Error(`Failed to pause subscription: ${error.description || 'Unknown error'}`);
      }

      // Update client status
      await supabase
        .from('clients')
        .update({
          subscription_status: 'paused',
          subscription_pause_date: new Date().toISOString(),
          subscription_auto_recurring: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId);

      console.log('Subscription paused successfully');

    } else if (action === 'resume') {
      // Get the plan ID
      const planBasicId = Deno.env.get('OPENPAY_PLAN_BASIC_ID_SANDBOX')!;
      const planAdvancedId = Deno.env.get('OPENPAY_PLAN_ADVANCED_ID_SANDBOX')!;
      const planId = client.plan_type === 'basic' ? planBasicId : planAdvancedId;

      // Get customer's default card
      const cardsResponse = await fetch(
        `${openpayUrl}/customers/${client.openpay_customer_id}/cards`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!cardsResponse.ok) {
        const status = cardsResponse.status;
        const bodyText = await cardsResponse.text();
        console.error('Failed to get customer cards:', { status, bodyText });
        throw new Error(`Failed to get customer cards (status ${status})`);
      }

      const cards = await cardsResponse.json();
      if (!cards || cards.length === 0) {
        throw new Error('No payment method found. Please add a card first.');
      }

      // Prepare subscription body
      // If client has already paid (subscription_end_date exists and is in the future),
      // use trial_end_date to prevent charging until next billing cycle
      const subscriptionBody: any = {
        plan_id: planId,
        card_id: cards[0].id,
      };

      if (client.subscription_end_date) {
        const endDate = new Date(client.subscription_end_date);
        const now = new Date();
        
        // If subscription_end_date is in the future, client has already paid for this period
        if (endDate > now) {
          // Format trial_end_date as YYYY-MM-DD for OpenPay
          const trialEndDate = endDate.toISOString().split('T')[0];
          subscriptionBody.trial_end_date = trialEndDate;
          console.log(`Setting trial_end_date to ${trialEndDate} (no charge until then)`);
        }
      }

      // Create new subscription
      const subscriptionResponse = await fetch(
        `${openpayUrl}/customers/${client.openpay_customer_id}/subscriptions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionBody),
        }
      );

      if (!subscriptionResponse.ok) {
        const error = await subscriptionResponse.json();
        console.error('OpenPay subscription creation failed:', error);
        throw new Error(`Failed to resume subscription: ${error.description || 'Unknown error'}`);
      }

      const subscription = await subscriptionResponse.json();

      // Keep existing billing dates if subscription_end_date is still valid
      const now = new Date();
      const existingEndDate = client.subscription_end_date ? new Date(client.subscription_end_date) : null;
      
      let subscriptionEndDate: Date;
      let nextBillingDate: Date;
      
      if (existingEndDate && existingEndDate > now) {
        // Keep existing dates since client already paid for this period
        subscriptionEndDate = existingEndDate;
        nextBillingDate = existingEndDate;
        console.log('Keeping existing billing dates (already paid for this period)');
      } else {
        // Calculate new billing dates (only if subscription actually expired)
        subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        nextBillingDate = subscriptionEndDate;
        console.log('Creating new billing dates');
      }

      // Update client status
      await supabase
        .from('clients')
        .update({
          subscription_status: 'active',
          subscription_pause_date: null,
          subscription_resume_date: new Date().toISOString(),
          subscription_auto_recurring: true,
          openpay_subscription_id: subscription.id,
          subscription_end_date: subscriptionEndDate.toISOString(),
          next_billing_date: nextBillingDate.toISOString(),
          cancellation_date: null,
          cancellation_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId);

      console.log('Subscription resumed successfully');
    }

    return new Response(
      JSON.stringify({ success: true, action }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in pause-openpay-subscription:', error);
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
