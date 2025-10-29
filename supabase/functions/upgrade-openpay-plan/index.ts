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

    const body = await req.json();
    const clientId = body.clientId;
    const deviceSessionId: string | undefined = body.deviceSessionId || body.device_session_id;


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
    
    // Always compute prorated difference for remaining days
    const proratedAmount = Math.max(0, Math.round((priceDifference * daysRemaining / totalDaysInCycle) * 100) / 100);

    console.log(`Prorated amount: ${proratedAmount} for ${daysRemaining} days remaining out of ${totalDaysInCycle} total days (using manual proration + trial on new subscription)`);

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
    const openpayUrl = `${openpayApiBase.replace(/\/$/, '')}/${merchantId}`;

    // 1. Try to resolve a usable card_id BEFORE any mutations
    let cardId: string | undefined = undefined;

    // 1.a Try reading the current subscription details (often includes the card object)
    try {
      const subDetailsResp = await fetch(
        `${openpayUrl}/customers/${client.openpay_customer_id}/subscriptions/${client.openpay_subscription_id}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Basic ${auth}` },
        }
      );
      if (subDetailsResp.ok) {
        const subDetails = await subDetailsResp.json();
        cardId = subDetails?.card?.id;
        if (cardId) {
          console.log('Using card id from existing subscription:', cardId);
        }
      } else {
        let body: any = null; try { body = await subDetailsResp.json(); } catch (_) {}
        console.warn('Failed to read current subscription for card id:', subDetailsResp.status, body);
      }
    } catch (e) {
      console.warn('Error fetching current subscription details:', e);
    }

    // 1.b If still no card id, list customer cards (with retries for timing issues)
    if (!cardId) {
      let cardsResponse: Response | null = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        cardsResponse = await fetch(
          `${openpayUrl}/customers/${client.openpay_customer_id}/cards`,
          {
            method: 'GET',
            headers: { 'Authorization': `Basic ${auth}` },
          }
        );

        if (cardsResponse.ok) break;

        let errorBody: any = null;
        try { errorBody = await cardsResponse.json(); } catch (_) { /* ignore */ }
        console.warn(`Get cards attempt ${attempt} failed: ${cardsResponse.status}`, errorBody);

        const retryable = [412, 429, 500, 502, 503, 504].includes(cardsResponse.status);
        if (retryable && attempt < 3) {
          await new Promise((res) => setTimeout(res, 1500 * attempt));
          continue;
        }

        // If we can't list cards, continue without cardId (we will try creating subscription without it)
        console.warn('Proceeding without card_id; will attempt subscription creation without explicit card.');
        break;
      }

      if (cardsResponse && cardsResponse.ok) {
        const cards = await cardsResponse.json();
        if (cards && cards.length > 0) {
          cardId = cards[0].id;
          console.log('Using first available card id:', cardId);
        }
      }
    }

    // Defer cancellation of existing basic subscription until after creating the new one
    // (avoids timing issues in OpenPay sandbox that return 412)


    // (Prorated charge moved after subscription creation)


    // 4. Create new advanced subscription (with retries)
    let subscriptionResponse: Response | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const trialEndDateStr = nextBillingDate.toISOString().slice(0, 10); // YYYY-MM-DD
      const subBody: any = { plan_id: planAdvancedId, trial_end_date: trialEndDateStr };
      if (cardId) subBody.card_id = cardId;
      subscriptionResponse = await fetch(
        `${openpayUrl}/customers/${client.openpay_customer_id}/subscriptions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subBody),
        }
      );

      if (subscriptionResponse.ok) break;

      let errorBody: any = null;
      try { errorBody = await subscriptionResponse.json(); } catch (_) { /* ignore */ }
      console.warn(`Create subscription attempt ${attempt} failed: ${subscriptionResponse.status}`, errorBody);
      const retryable = [412, 429, 500, 502, 503, 504].includes(subscriptionResponse.status);
      if (retryable && attempt < 3) {
        await new Promise((res) => setTimeout(res, 1500 * attempt));
        continue;
      }
      throw new Error(`Failed to create new subscription: ${errorBody?.description || 'Unknown error'}`);
    }

    const subscription = await subscriptionResponse!.json();

    // Use card from new subscription if we couldn't resolve earlier
    if (!cardId) {
      try {
        const subCardId = subscription?.card?.id;
        if (subCardId) {
          cardId = subCardId;
          console.log('Using card id from new subscription:', cardId);
        }
      } catch (_) { /* ignore */ }
    }

    // Process prorated charge after subscription creation (safer ordering)
    if (proratedAmount > 0) {
      if (!deviceSessionId) {
        console.warn('Missing device_session_id for manual prorated charge');
        return new Response(
          JSON.stringify({ success: false, error: 'device_session_id_required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!cardId) {
        // Try to pick up card from created subscription if not resolved earlier
        try {
          const subCardId = subscription?.card?.id;
          if (subCardId) {
            cardId = subCardId;
            console.log('Using card id from new subscription (post-create):', cardId);
          }
        } catch (_) { /* ignore */ }
      }

      if (!cardId) {
        throw new Error('No card available to process prorated charge');
      }

      let chargeResponse: Response | null = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        chargeResponse = await fetch(
          `${openpayUrl}/customers/${client.openpay_customer_id}/charges`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              source_id: cardId,
              method: 'card',
              amount: proratedAmount,
              currency: 'PEN',
              description: `Upgrade prorrateado a Plan Avanzado (${daysRemaining} días)`,
              device_session_id: deviceSessionId,
            }),
          }
        );

        if (chargeResponse.ok) break;

        let errorBody: any = null;
        try { errorBody = await chargeResponse.json(); } catch (_) { /* ignore */ }
        console.warn(`Charge attempt ${attempt} failed: ${chargeResponse.status}`, errorBody);
        const retryable = [412, 429, 500, 502, 503, 504].includes(chargeResponse.status);
        if (retryable && attempt < 3) {
          await new Promise((res) => setTimeout(res, 1500 * attempt));
          continue;
        }
        throw new Error(`Failed to process prorated charge: ${errorBody?.description || 'Unknown error'}`);
      }

      console.log('Prorated charge processed successfully');
    }

    // Now cancel old basic subscription (ignore 404/412)
    try {
      const cancelResponse = await fetch(
        `${openpayUrl}/customers/${client.openpay_customer_id}/subscriptions/${client.openpay_subscription_id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Basic ${auth}` },
        }
      );
      if (!cancelResponse.ok && cancelResponse.status !== 404 && cancelResponse.status !== 412) {
        let body: any = null; try { body = await cancelResponse.json(); } catch (_) {}
        console.warn('Cancellation of old subscription failed:', cancelResponse.status, body);
      } else if (cancelResponse.status === 412) {
        console.log('Old subscription too new to cancel; OpenPay should handle transition.');
      } else {
        console.log('Old subscription cancelled (or already cancelled).');
      }
    } catch (e) {
      console.warn('Error attempting to cancel old subscription:', e);
    }

    // 5. Update client in database
    const now = new Date();

    await supabase
      .from('clients')
      .update({
        plan_type: 'advanced',
        subscription_status: 'active',
        subscription_start_date: client.subscription_start_date || now.toISOString(),
        openpay_subscription_id: subscription.id,
        next_billing_date: nextBillingDate.toISOString(),
        subscription_end_date: client.subscription_end_date || nextBillingDate.toISOString(),
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
