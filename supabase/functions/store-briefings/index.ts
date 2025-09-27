import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      clientId, 
      contentBriefing, 
      styleBriefing, 
      contactDeliveryBriefing,
      signupData,
      websiteRequirements 
    } = await req.json();

    if (!clientId || !contentBriefing) {
      throw new Error('Missing required briefing data');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Storing briefings for client:', clientId);

    // Find the client by subdomain (since we're passing subdomain as clientId during signup)
    const { data: client, error: clientFindError } = await supabase
      .from('clients')
      .select('id')
      .eq('subdomain', clientId)
      .single();

    if (clientFindError || !client) {
      console.error('Client not found:', clientFindError);
      throw new Error('Client not found');
    }

    const actualClientId = client.id;

    // Store the briefings in admin_content
    const { error: briefingError } = await supabase
      .from('admin_content')
      .upsert({
        client_id: actualClientId,
        content_briefing: contentBriefing,
        style_briefing: styleBriefing || '',
        contact_delivery_briefing: contactDeliveryBriefing || ''
      }, {
        onConflict: 'client_id'
      });

    if (briefingError) {
      console.error('Error storing briefings:', briefingError);
      throw briefingError;
    }

    console.log('Successfully stored briefings for client:', actualClientId);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Briefings stored successfully',
      clientId: actualClientId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in store-briefings function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});