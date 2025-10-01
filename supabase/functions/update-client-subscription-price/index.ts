import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateRequest {
  clientId: string;
  discountPercentage?: number;
  months?: number; // Duration of discount in months (for one-time discounts)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId, discountPercentage, months }: UpdateRequest = await req.json();

    console.log('Updating subscription price for client:', { clientId, discountPercentage, months });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, plan_type, mercadopago_subscription_id, subscription_auto_recurring')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Fetch plan price by plan_key
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('monthly_price, currency')
      .eq('plan_key', client.plan_type)
      .eq('is_active', true)
      .maybeSingle();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    // Get current plan price
    const basePlanPrice = plan.monthly_price;
    
    // Calculate new price
    let newPrice = basePlanPrice;
    if (typeof discountPercentage === 'number' && discountPercentage > 0) {
      const discountAmount = (basePlanPrice * discountPercentage) / 100;
      newPrice = Math.max(0, basePlanPrice - discountAmount);
    }

    console.log('Price calculation:', { basePlanPrice, discountPercentage, newPrice });

    // If client doesn't have auto-recurring subscription in MP, skip MP update and return success
    if (!client.mercadopago_subscription_id || client.subscription_auto_recurring === false) {
      console.log('No auto-recurring MP subscription. Skipping MercadoPago update.');
      await supabase
        .from('clients')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', clientId);

      return new Response(
        JSON.stringify({
          success: true,
          old_price: basePlanPrice,
          new_price: newPrice,
          discount_percentage: discountPercentage ?? 0,
          note: 'Manual billing: price adjustment will be reflected on next cycle.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Update MercadoPago subscription
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_SUBSCRIPTION')!;
    
    const updateData: any = {
      auto_recurring: {
        transaction_amount: newPrice,
        currency_id: 'PEN',
      },
    };

    // If it's a temporary discount, set end date
    if (months && months > 0) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);
      updateData.auto_recurring.end_date = endDate.toISOString();
    }

    console.log('Updating MercadoPago subscription:', client.mercadopago_subscription_id);

    const mpResponse = await fetch(
      `https://api.mercadopago.com/preapproval/${client.mercadopago_subscription_id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      }
    );

    const mpResult = await mpResponse.json();
    console.log('MercadoPago update result:', mpResult);

    if (!mpResponse.ok) {
      throw new Error(mpResult.message || 'Failed to update subscription in MercadoPago');
    }

    // Update local database record (optional - for tracking)
    await supabase
      .from('clients')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    console.log('Subscription price updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        old_price: basePlanPrice,
        new_price: newPrice,
        discount_percentage: discountPercentage,
        mercadopago_response: mpResult,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error updating subscription price:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to update subscription price'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});