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
      .select('*, subscription_plans!inner(monthly_price)')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    if (!client.mercadopago_subscription_id) {
      throw new Error('Client does not have an active MercadoPago subscription');
    }

    // Get current plan price
    const basePlanPrice = client.subscription_plans.monthly_price;
    
    // Calculate new price
    let newPrice = basePlanPrice;
    if (discountPercentage) {
      const discountAmount = (basePlanPrice * discountPercentage) / 100;
      newPrice = basePlanPrice - discountAmount;
    }

    console.log('Price calculation:', { basePlanPrice, discountPercentage, newPrice });

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