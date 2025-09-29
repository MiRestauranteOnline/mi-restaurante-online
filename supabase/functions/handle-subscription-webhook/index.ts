import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionWebhookPayload {
  event_type: string;
  data: {
    id: string;
    status: string;
    customer_id: string;
    plan_id: string;
    next_billing_date?: string;
    cancelled_at?: string;
    failed_at?: string;
    failure_reason?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Subscription webhook called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const payload: SubscriptionWebhookPayload = await req.json();
    console.log('Subscription webhook payload:', payload);

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Handle different subscription events
    switch (payload.event_type) {
      case 'subscription.payment_succeeded':
        await handlePaymentSucceeded(supabaseAdmin, payload);
        break;
      
      case 'subscription.payment_failed':
        await handlePaymentFailed(supabaseAdmin, payload);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(supabaseAdmin, payload);
        break;
      
      case 'subscription.expired':
        await handleSubscriptionExpired(supabaseAdmin, payload);
        break;
      
      default:
        console.log(`Unhandled event type: ${payload.event_type}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Subscription webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

async function handlePaymentSucceeded(supabase: any, payload: SubscriptionWebhookPayload) {
  const subscriptionEndDate = new Date();
  subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: 'active',
      payment_status: 'paid',
      next_billing_date: payload.data.next_billing_date || subscriptionEndDate.toISOString(),
      payment_failures_count: 0,
      last_payment_attempt: new Date().toISOString(),
    })
    .eq('rebill_subscription_id', payload.data.id);

  if (error) {
    console.error('Error updating client payment success:', error);
    throw error;
  }

  console.log('Payment succeeded for subscription:', payload.data.id);
}

async function handlePaymentFailed(supabase: any, payload: SubscriptionWebhookPayload) {
  // Get current failure count
  const { data: client, error: fetchError } = await supabase
    .from('clients')
    .select('payment_failures_count')
    .eq('rebill_subscription_id', payload.data.id)
    .single();

  if (fetchError) {
    console.error('Error fetching client for payment failure:', fetchError);
    throw fetchError;
  }

  const failureCount = (client?.payment_failures_count || 0) + 1;
  const maxFailures = 3; // Configure based on your business rules

  const updateData: any = {
    payment_status: 'failed',
    payment_failures_count: failureCount,
    last_payment_attempt: new Date().toISOString(),
  };

  // If max failures reached, suspend subscription
  if (failureCount >= maxFailures) {
    updateData.subscription_status = 'payment_failed';
  }

  const { error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('rebill_subscription_id', payload.data.id);

  if (error) {
    console.error('Error updating client payment failure:', error);
    throw error;
  }

  console.log(`Payment failed for subscription: ${payload.data.id}, failure count: ${failureCount}`);
}

async function handleSubscriptionCancelled(supabase: any, payload: SubscriptionWebhookPayload) {
  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: 'cancelled',
      cancellation_date: payload.data.cancelled_at || new Date().toISOString(),
      cancellation_reason: 'user_requested',
    })
    .eq('rebill_subscription_id', payload.data.id);

  if (error) {
    console.error('Error updating client cancellation:', error);
    throw error;
  }

  console.log('Subscription cancelled:', payload.data.id);
}

async function handleSubscriptionExpired(supabase: any, payload: SubscriptionWebhookPayload) {
  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: 'expired',
      subscription_end_date: new Date().toISOString(),
    })
    .eq('rebill_subscription_id', payload.data.id);

  if (error) {
    console.error('Error updating client expiration:', error);
    throw error;
  }

  console.log('Subscription expired:', payload.data.id);
}

serve(handler);