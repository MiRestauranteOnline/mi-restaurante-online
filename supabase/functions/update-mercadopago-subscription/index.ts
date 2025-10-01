import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateRequest {
  clientId: string;
  newPlanType: 'basic' | 'advanced';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId, newPlanType }: UpdateRequest = await req.json();
    console.log('Updating subscription:', { clientId, newPlanType });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, mercadopago_subscription_id, mercadopago_preapproval_id, plan_type, subscription_auto_recurring')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    if (client.plan_type === newPlanType) {
      throw new Error('Client is already on this plan');
    }

    // Get new plan price
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('monthly_price, currency')
      .eq('plan_key', newPlanType)
      .eq('is_active', true)
      .single();

    if (planError || !planData) {
      throw new Error('Plan not found');
    }

    // Check if this is a manual billing client
    if (!client.mercadopago_subscription_id && !client.mercadopago_preapproval_id) {
      console.log('Manual billing client - updating plan only');
      
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          plan_type: newPlanType,
        })
        .eq('id', clientId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          message: `Plan updated to ${newPlanType} (manual billing - price change on next payment)`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update MercadoPago subscription
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_SUBSCRIPTION')!;
    const subscriptionId = client.mercadopago_preapproval_id || client.mercadopago_subscription_id;

    console.log('Updating MercadoPago subscription:', subscriptionId, 'to', planData.monthly_price);

    const updateResponse = await fetch(
      `https://api.mercadopago.com/preapproval/${subscriptionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          auto_recurring: {
            transaction_amount: planData.monthly_price,
            currency_id: planData.currency || 'PEN',
          },
        }),
      }
    );

    const updateResult = await updateResponse.json();
    console.log('MercadoPago update result:', updateResult);

    if (!updateResponse.ok) {
      console.error('Failed to update MercadoPago subscription:', updateResult);
      // Continue anyway - update our database
    }

    // Update client plan
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        plan_type: newPlanType,
      })
      .eq('id', clientId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Plan updated to ${newPlanType} successfully`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Update subscription error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to update subscription'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
