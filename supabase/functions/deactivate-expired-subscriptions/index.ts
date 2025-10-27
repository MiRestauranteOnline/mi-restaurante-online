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

    console.log('🔍 Checking for expired subscriptions...');

    // Find subscriptions that are cancelled and past their end date but not yet deactivated
    const { data: expiredClients, error: fetchError } = await supabase
      .from('clients')
      .select('id, subdomain, subscription_end_date, plan_type')
      .eq('subscription_status', 'cancelled')
      .eq('is_deactivated', false)
      .lte('subscription_end_date', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired subscriptions:', fetchError);
      throw fetchError;
    }

    if (!expiredClients || expiredClients.length === 0) {
      console.log('✅ No expired subscriptions found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No expired subscriptions to deactivate',
          deactivated: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`📋 Found ${expiredClients.length} expired subscription(s) to deactivate`);

    // Deactivate each expired subscription
    const deactivationPromises = expiredClients.map(async (client) => {
      console.log(`🔒 Deactivating client ${client.subdomain} (${client.id})`);
      
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          is_deactivated: true,
          subscription_status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', client.id);

      if (updateError) {
        console.error(`❌ Failed to deactivate client ${client.subdomain}:`, updateError);
        return { success: false, client_id: client.id, error: updateError };
      }

      console.log(`✅ Successfully deactivated client ${client.subdomain}`);
      return { success: true, client_id: client.id };
    });

    const results = await Promise.all(deactivationPromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`✨ Deactivation complete: ${successCount} succeeded, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        deactivated: successCount,
        failed: failureCount,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in deactivate-expired-subscriptions:', error);
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
