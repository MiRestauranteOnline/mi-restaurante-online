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
    const planBasicId = Deno.env.get('OPENPAY_PLAN_BASIC_ID_SANDBOX')!;
    const planAdvancedId = Deno.env.get('OPENPAY_PLAN_ADVANCED_ID_SANDBOX')!;
    const openpayApiBase = Deno.env.get('OPENPAY_API_BASE')!;

    const { clientId, planType, customerData, cardData, couponCode, discountAmount } = await req.json();

    console.log('Creating OpenPay subscription for client:', clientId, 'plan:', planType);

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Create OpenPay customer
    const auth = btoa(`${privateKey}:`);
    const openpayUrl = `${openpayApiBase.replace(/\/$/, '')}/${merchantId}`;
    
    console.log('Using OpenPay API base:', openpayApiBase);
    console.log('OpenPay URL:', openpayUrl);

    // Create customer
    const customerResponse = await fetch(`${openpayUrl}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: customerData.name,
        email: customerData.email,
        phone_number: customerData.phone,
        requires_account: false,
      }),
    });

    if (!customerResponse.ok) {
      const error = await customerResponse.json();
      console.error('OpenPay customer creation failed:', error);
      throw new Error(`Failed to create customer: ${error.description || 'Unknown error'}`);
    }

    const customer = await customerResponse.json();
    console.log('OpenPay customer created:', customer.id);

    // Add card to customer
    const cardResponse = await fetch(`${openpayUrl}/customers/${customer.id}/cards`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        card_number: cardData.cardNumber,
        holder_name: cardData.holderName,
        expiration_year: cardData.expirationYear,
        expiration_month: cardData.expirationMonth,
        cvv2: cardData.cvv2,
      }),
    });

    if (!cardResponse.ok) {
      const error = await cardResponse.json();
      console.error('OpenPay card creation failed:', error);
      throw new Error(`Failed to add card: ${error.description || 'Unknown error'}`);
    }

    const card = await cardResponse.json();
    console.log('Card added to customer:', card.id);

    // Determine plan ID
    const planId = planType === 'basic' ? planBasicId : planAdvancedId;

    // Create subscription
    const subscriptionResponse = await fetch(`${openpayUrl}/customers/${customer.id}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        card_id: card.id,
        trial_end_date: null,
      }),
    });

    if (!subscriptionResponse.ok) {
      const error = await subscriptionResponse.json();
      console.error('OpenPay subscription creation failed:', error);
      throw new Error(`Failed to create subscription: ${error.description || 'Unknown error'}`);
    }

    const subscription = await subscriptionResponse.json();
    console.log('Subscription created:', subscription.id);

    // Update client with subscription info
    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    const updateData: any = {
      subscription_status: 'active',
      subscription_start_date: subscriptionStartDate.toISOString(),
      subscription_end_date: subscriptionEndDate.toISOString(),
      next_billing_date: subscriptionEndDate.toISOString(),
      payment_status: 'paid',
      openpay_customer_id: customer.id,
      openpay_subscription_id: subscription.id,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId);

    if (updateError) {
      console.error('Failed to update client:', updateError);
      throw updateError;
    }

    console.log('Client updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: subscription.id,
        customerId: customer.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-openpay-subscription:', error);
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
