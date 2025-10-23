import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { subdomain, domain } = await req.json();
    const targetDomain = subdomain || domain || 'demo';

    console.log(`📦 Generating fast-load data for domain: ${targetDomain}`);

    // Fetch client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('subdomain', targetDomain)
      .single();

    if (clientError || !client) {
      console.error('Client not found:', clientError);
      return new Response(
        JSON.stringify({ error: 'Client not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Fetch admin content
    const { data: adminContent } = await supabase
      .from('admin_content')
      .select('*')
      .eq('client_id', client.id)
      .single();

    // Fetch client settings
    const { data: settings } = await supabase
      .from('client_settings')
      .select('*')
      .eq('client_id', client.id)
      .single();

    // Fetch premium features (includes GA and GSC)
    const { data: premiumFeatures } = await supabase
      .from('premium_features')
      .select('google_analytics_id, google_search_console_verification')
      .eq('client_id', client.id)
      .single();

    // Fetch reviews to check if reviews page should be shown
    const { data: reviews } = await supabase
      .from('reviews')
      .select('id')
      .eq('client_id', client.id)
      .limit(1);

    // Build fast-load data object
    const fastLoadData = {
      // Client basics
      restaurant_name: client.restaurant_name,
      phone: client.phone,
      whatsapp: client.whatsapp,
      theme: client.theme,

      // Critical admin content
      header_logo_url: adminContent?.header_logo_url,
      footer_logo_url: adminContent?.footer_logo_url,
      footer_description: adminContent?.footer_description,

      // Homepage hero
      homepage_hero_background_url: adminContent?.homepage_hero_background_url,
      homepage_hero_title: adminContent?.homepage_hero_title,
      homepage_hero_title_first_line: adminContent?.homepage_hero_title_first_line,
      homepage_hero_title_second_line: adminContent?.homepage_hero_title_second_line,
      homepage_hero_description: adminContent?.homepage_hero_description,

      // Menu page hero
      menu_page_hero_title_first_line: adminContent?.menu_page_hero_title_first_line,
      menu_page_hero_title_second_line: adminContent?.menu_page_hero_title_second_line,
      menu_page_hero_description: adminContent?.menu_page_hero_description,
      menu_page_hero_background_url: adminContent?.menu_page_hero_background_url,
      downloadable_menu_url: adminContent?.downloadable_menu_url,

      // About page hero
      about_page_hero_title_first_line: adminContent?.about_page_hero_title_first_line,
      about_page_hero_title_second_line: adminContent?.about_page_hero_title_second_line,
      about_page_hero_description: adminContent?.about_page_hero_description,
      about_page_hero_background_url: adminContent?.about_page_hero_background_url,

      // Reviews page hero
      reviews_page_hero_title_first_line: adminContent?.reviews_page_hero_title_first_line,
      reviews_page_hero_title_second_line: adminContent?.reviews_page_hero_title_second_line,
      reviews_page_hero_description: adminContent?.reviews_page_hero_description,
      reviews_page_hero_background_url: adminContent?.reviews_page_hero_background_url,

      // Contact page hero
      contact_page_hero_title_first_line: adminContent?.contact_page_hero_title_first_line,
      contact_page_hero_title_second_line: adminContent?.contact_page_hero_title_second_line,
      contact_page_hero_description: adminContent?.contact_page_hero_description,
      contact_page_hero_background_url: adminContent?.contact_page_hero_background_url,

      // Critical settings
      primary_color: settings?.primary_color,
      primary_button_text_style: settings?.primary_button_text_style,
      header_background_enabled: settings?.header_background_enabled,
      header_background_style: settings?.header_background_style,

      // Font settings - critical for preventing FOUC
      title_font: settings?.title_font,
      body_font: settings?.body_font,
      title_font_weight: settings?.title_font_weight,

      // Navigation critical data
      has_reviews: (reviews && reviews.length > 0) || false,
      delivery_services: [
        {
          name: 'Rappi',
          url: client.rappi_link || '',
          show: !!client.rappi_link
        },
        {
          name: 'PedidosYa',
          url: client.pedidosya_link || '',
          show: !!client.pedidosya_link
        },
        {
          name: 'Uber Eats',
          url: client.ubereats_link || '',
          show: !!client.ubereats_link
        }
      ],

      // Analytics and SEO - THIS IS THE KEY ADDITION
      google_analytics_id: premiumFeatures?.google_analytics_id || null,
      google_search_console_verification: premiumFeatures?.google_search_console_verification || null,

      // Metadata
      generated_at: new Date().toISOString(),
      domain: targetDomain
    };

    console.log('📦 Fast-load data compiled:', {
      domain: targetDomain,
      has_ga: !!fastLoadData.google_analytics_id,
      has_gsc: !!fastLoadData.google_search_console_verification
    });

    // Store in Supabase storage
    const jsonData = JSON.stringify(fastLoadData, null, 2);
    const { error: uploadError } = await supabase.storage
      .from('client-assets')
      .upload(`fast-load/${targetDomain}.json`, jsonData, {
        contentType: 'application/json',
        upsert: true
      });

    if (uploadError) {
      console.error('Failed to upload fast-load data:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to store fast-load data', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('✅ Fast-load data generated and stored successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        domain: targetDomain,
        has_analytics: !!fastLoadData.google_analytics_id,
        has_search_console: !!fastLoadData.google_search_console_verification
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating fast-load data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
