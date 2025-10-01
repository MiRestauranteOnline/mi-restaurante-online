import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing expired client discounts...');

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find all active discount assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('client_discount_assignments')
      .select(`
        *,
        client_discounts!inner(discount_type, percentage),
        clients!inner(
          id,
          mercadopago_subscription_id,
          plan_type,
          subscription_plans!inner(monthly_price)
        )
      `)
      .eq('is_active', true);

    if (assignmentsError) {
      throw assignmentsError;
    }

    console.log(`Found ${assignments?.length || 0} active discount assignments`);

    const processedClients: string[] = [];
    const expiredDiscounts: string[] = [];

    // Process each assignment
    for (const assignment of assignments || []) {
      try {
        // Check if it's a one-time discount and if it's been applied for a month
        if (assignment.client_discounts.discount_type === 'one_time' && assignment.applied_at) {
          const appliedDate = new Date(assignment.applied_at);
          const expiryDate = new Date(appliedDate);
          expiryDate.setMonth(expiryDate.getMonth() + 1);

          // If expired
          if (new Date() > expiryDate) {
            console.log(`Discount expired for client ${assignment.client_id}`);
            
            // Revert to original price
            const basePlanPrice = assignment.clients.subscription_plans.monthly_price;
            const subscriptionId = assignment.clients.mercadopago_subscription_id;

            if (subscriptionId) {
              // Update MercadoPago subscription
              const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN_SUBSCRIPTION')!;
              
              const updateData = {
                auto_recurring: {
                  transaction_amount: basePlanPrice,
                  currency_id: 'PEN',
                },
              };

              const mpResponse = await fetch(
                `https://api.mercadopago.com/preapproval/${subscriptionId}`,
                {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify(updateData),
                }
              );

              if (mpResponse.ok) {
                // Deactivate the discount assignment
                await supabase
                  .from('client_discount_assignments')
                  .update({ is_active: false })
                  .eq('id', assignment.id);

                processedClients.push(assignment.client_id);
                expiredDiscounts.push(assignment.id);
                
                console.log(`Successfully reverted discount for client ${assignment.client_id}`);
              } else {
                const error = await mpResponse.json();
                console.error(`Failed to update MercadoPago for client ${assignment.client_id}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing assignment ${assignment.id}:`, error);
        // Continue processing other assignments
      }
    }

    console.log('Discount processing complete:', {
      total_checked: assignments?.length || 0,
      expired: expiredDiscounts.length,
      processed_clients: processedClients.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        total_checked: assignments?.length || 0,
        expired_discounts: expiredDiscounts.length,
        processed_clients: processedClients,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error processing expired discounts:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to process expired discounts'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});