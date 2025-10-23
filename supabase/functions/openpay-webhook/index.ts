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

    const webhook = await req.json();
    console.log('Received OpenPay webhook:', JSON.stringify(webhook, null, 2));

    const { type, transaction } = webhook;

    // Handle different webhook types
    switch (type) {
      case 'subscription.charge.succeeded':
        await handleChargeSucceeded(supabase, transaction);
        break;
      
      case 'subscription.charge.failed':
        await handleChargeFailed(supabase, transaction);
        break;
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(supabase, transaction);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(supabase, transaction);
        break;
      
      default:
        console.log('Unhandled webhook type:', type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing OpenPay webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleChargeSucceeded(supabase: any, transaction: any) {
  console.log('Processing successful charge:', transaction.id);
  
  // Find client by OpenPay subscription ID
  const customerId = transaction.customer_id;
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('openpay_customer_id', customerId);

  if (clients && clients.length > 0) {
    const client = clients[0];
    
    // Check if there's a pending plan change
    const updates: any = {
      payment_status: 'paid',
      payment_failures_count: 0,
      last_payment_attempt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If there's a pending plan change and it's time to apply it
    if (client.pending_plan_change && client.pending_plan_change_date) {
      const changeDate = new Date(client.pending_plan_change_date);
      if (changeDate <= new Date()) {
        updates.plan_type = client.pending_plan_change;
        updates.pending_plan_change = null;
        updates.pending_plan_change_date = null;
        console.log('Applied pending plan change to:', client.pending_plan_change);
      }
    }

    // Update next billing date
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    updates.next_billing_date = nextBillingDate.toISOString();
    updates.subscription_end_date = nextBillingDate.toISOString();

    await supabase
      .from('clients')
      .update(updates)
      .eq('id', client.id);

    console.log('Client payment status updated successfully');
  }
}

async function handleChargeFailed(supabase: any, transaction: any) {
  console.log('Processing failed charge:', transaction.id);
  
  const customerId = transaction.customer_id;
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('openpay_customer_id', customerId);

  if (clients && clients.length > 0) {
    const client = clients[0];
    const failureCount = (client.payment_failures_count || 0) + 1;

    const updates: any = {
      payment_failures_count: failureCount,
      last_payment_attempt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // After 3 failed attempts, suspend the subscription
    if (failureCount >= 3) {
      updates.subscription_status = 'suspended';
      updates.payment_status = 'failed';
    }

    await supabase
      .from('clients')
      .update(updates)
      .eq('id', client.id);

    console.log(`Client payment failure recorded (${failureCount} failures)`);
  }
}

async function handleSubscriptionUpdated(supabase: any, transaction: any) {
  console.log('Processing subscription update:', transaction.id);
  
  // Handle subscription updates if needed
  // This could include plan changes, etc.
}

async function handleSubscriptionCancelled(supabase: any, transaction: any) {
  console.log('Processing subscription cancellation:', transaction.id);
  
  const customerId = transaction.customer_id;
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('openpay_customer_id', customerId);

  if (clients && clients.length > 0) {
    const client = clients[0];

    await supabase
      .from('clients')
      .update({
        subscription_status: 'cancelled',
        cancellation_date: new Date().toISOString(),
        subscription_auto_recurring: false,
        is_deactivated: true, // Automatically deactivate site when subscription is cancelled
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id);

    console.log('Client subscription cancelled and site deactivated');
  }
}
