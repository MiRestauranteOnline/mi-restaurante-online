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

    // Process and store client data if websiteRequirements and signupData are provided
    if (websiteRequirements && signupData) {
      console.log('Processing social media and delivery data for client:', actualClientId);
      
      // Process social media links
      const socialMediaLinks: Record<string, string> = {};
      if (websiteRequirements.socialMedia) {
        websiteRequirements.socialMedia.forEach((sm: any) => {
          if (sm.platform && sm.url) {
            const platform = sm.platform.toLowerCase().replace(/\s+/g, '').replace('(twitter)', '');
            let platformKey = platform;
            
            // Map platform names to expected keys
            if (platform === 'facebook') platformKey = 'facebook';
            else if (platform === 'instagram') platformKey = 'instagram';
            else if (platform === 'tiktok') platformKey = 'tiktok';
            else if (platform === 'x' || platform === 'twitter') platformKey = 'x';
            
            socialMediaLinks[platformKey] = sm.url;
          }
        });
      }

      // Process delivery platforms
      const deliveryData: Record<string, any> = {};
      if (websiteRequirements.deliveryPlatforms) {
        Object.entries(websiteRequirements.deliveryPlatforms).forEach(([platform, url]) => {
          if (url && typeof url === 'string' && url.trim()) {
            // Map platform names to match what the dashboard expects
            let platformKey = platform;
            if (platform === 'didifood') platformKey = 'didi_food';
            else if (platform === 'pedidosya') platformKey = 'pedidos_ya';
            else if (platform === 'rappi') platformKey = 'rappi';
            
            deliveryData[platformKey] = url.trim();
          }
        });
      }

      // Update client with social media and delivery data
      const clientUpdateData: any = {};
      if (Object.keys(socialMediaLinks).length > 0) {
        clientUpdateData.social_media_links = socialMediaLinks;
      }
      if (Object.keys(deliveryData).length > 0) {
        clientUpdateData.delivery = deliveryData;
      }
      
      // Also update address if provided
      if (signupData.address) {
        clientUpdateData.address = signupData.address;
      }

      if (Object.keys(clientUpdateData).length > 0) {
        const { error: clientUpdateError } = await supabase
          .from('clients')
          .update(clientUpdateData)
          .eq('id', actualClientId);

        if (clientUpdateError) {
          console.error('Error updating client data:', clientUpdateError);
          // Don't throw here, briefings were already stored successfully
        } else {
          console.log('Successfully updated client with social media and delivery data');
        }
      }

      // Store logo URL in admin_content if provided
      if (websiteRequirements.logoUrl) {
        const { error: logoUpdateError } = await supabase
          .from('admin_content')
          .upsert({
            client_id: actualClientId,
            header_logo_url: websiteRequirements.logoUrl,
            footer_logo_url: websiteRequirements.logoUrl,
            content_briefing: contentBriefing,
            style_briefing: styleBriefing || '',
            contact_delivery_briefing: contactDeliveryBriefing || ''
          }, {
            onConflict: 'client_id'
          });

        if (logoUpdateError) {
          console.error('Error updating admin_content with logo:', logoUpdateError);
        } else {
          console.log('Successfully updated admin_content with logo URL');
        }
      }
    }

    // Generate branding based on the style briefing
    if (styleBriefing) {
      console.log('Generating branding for client:', actualClientId);
      try {
        const brandingResponse = await supabase.functions.invoke('generate-branding', {
          body: {
            briefing: styleBriefing,
            clientId: actualClientId,
            restaurantName: signupData?.restaurantName || ''
          }
        });

        if (brandingResponse.error) {
          console.error('Error generating branding:', brandingResponse.error);
        } else {
          console.log('Successfully generated branding for client:', actualClientId);
        }
      } catch (brandingError) {
        console.error('Error calling generate-branding function:', brandingError);
        // Don't throw here, briefings were already stored successfully
      }
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