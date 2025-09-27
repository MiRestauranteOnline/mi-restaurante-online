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
    const { briefing, clientId } = await req.json();

    if (!briefing || !clientId) {
      throw new Error('Missing briefing or clientId');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing practical info for client:', clientId);

    // Parse the briefing to extract practical information
    const practicalInfo = await extractPracticalInfo(briefing);

    // Get existing client data to preserve current values
    const { data: existingClient } = await supabase
      .from('clients')
      .select('phone, whatsapp, email, address, social_media_links, delivery, opening_hours')
      .eq('id', clientId)
      .single();

    // Only update fields that are currently empty/null to preserve existing data
    const updateData: any = {};
    if (practicalInfo.phone && !existingClient?.phone) updateData.phone = practicalInfo.phone;
    if (practicalInfo.whatsapp && !existingClient?.whatsapp) updateData.whatsapp = practicalInfo.whatsapp;
    if (practicalInfo.whatsapp_country_code && !existingClient?.whatsapp_country_code) updateData.whatsapp_country_code = practicalInfo.whatsapp_country_code;
    if (practicalInfo.phone_country_code && !existingClient?.phone_country_code) updateData.phone_country_code = practicalInfo.phone_country_code;
    if (practicalInfo.email && !existingClient?.email) updateData.email = practicalInfo.email;
    if (practicalInfo.address && !existingClient?.address) updateData.address = practicalInfo.address;
    if (practicalInfo.social_media_links && (!existingClient?.social_media_links || Object.keys(existingClient.social_media_links).length === 0)) {
      updateData.social_media_links = practicalInfo.social_media_links;
    }
    if (practicalInfo.delivery && (!existingClient?.delivery || Object.keys(existingClient.delivery).length === 0)) {
      updateData.delivery = practicalInfo.delivery;
    }
    if (practicalInfo.opening_hours && (!existingClient?.opening_hours || Object.keys(existingClient.opening_hours).length === 0)) {
      updateData.opening_hours = practicalInfo.opening_hours;
    }

    // Only update if there are fields to update
    let clientError = null;
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', clientId);
      clientError = error;
    }

    if (clientError) {
      console.error('Error updating client:', clientError);
      throw clientError;
    }

    console.log('Successfully updated practical info for client:', clientId);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Practical information updated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in populate-practical-info function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function extractPracticalInfo(briefing: string) {
  // Simple text parsing to extract practical information
  // This could be enhanced with AI in the future
  
  const info: any = {};
  
  // Extract phone numbers
  const phoneMatch = briefing.match(/teléfono[:\s]*(\+?\d+[\s\d\-]+)/i);
  if (phoneMatch) {
    const fullPhone = phoneMatch[1].trim();
    if (fullPhone.startsWith('+')) {
      const parts = fullPhone.split(' ');
      info.phone_country_code = parts[0];
      info.phone = parts.slice(1).join('');
    } else {
      info.phone = fullPhone;
      info.phone_country_code = '+51'; // Default to Peru
    }
  }

  // Extract WhatsApp
  const whatsappMatch = briefing.match(/whatsapp[:\s]*(\+?\d+[\s\d\-]+)/i);
  if (whatsappMatch) {
    const fullWhatsapp = whatsappMatch[1].trim();
    if (fullWhatsapp.startsWith('+')) {
      const parts = fullWhatsapp.split(' ');
      info.whatsapp_country_code = parts[0];
      info.whatsapp = parts.slice(1).join('');
    } else {
      info.whatsapp = fullWhatsapp;
      info.whatsapp_country_code = '+51'; // Default to Peru
    }
  }

  // Extract email
  const emailMatch = briefing.match(/email[:\s]*([^\s,]+@[^\s,]+)/i);
  if (emailMatch) {
    info.email = emailMatch[1];
  }

  // Extract address
  const addressMatch = briefing.match(/dirección[:\s]*([^,\n]+)/i);
  if (addressMatch) {
    info.address = addressMatch[1].trim();
  }

  // Extract social media
  const socialMedia: any = {};
  
  const instagramMatch = briefing.match(/instagram[:\s]*@?([^\s,\n]+)/i);
  if (instagramMatch) {
    socialMedia.instagram = `https://instagram.com/${instagramMatch[1].replace('@', '')}`;
  }

  const facebookMatch = briefing.match(/facebook[:\s]*([^,\n]+)/i);
  if (facebookMatch) {
    socialMedia.facebook = facebookMatch[1].includes('facebook.com') 
      ? facebookMatch[1] 
      : `https://facebook.com/${facebookMatch[1]}`;
  }

  if (Object.keys(socialMedia).length > 0) {
    info.social_media_links = socialMedia;
  }

  // Extract delivery platforms
  const delivery: any = {};
  
  if (briefing.toLowerCase().includes('rappi')) {
    delivery.rappi = ''; // Could be enhanced to extract actual URL
  }
  if (briefing.toLowerCase().includes('pedidosya')) {
    delivery.pedidos_ya = '';
  }
  if (briefing.toLowerCase().includes('didi')) {
    delivery.didi_food = '';
  }

  if (Object.keys(delivery).length > 0) {
    info.delivery = delivery;
  }

  // Extract basic opening hours
  const hoursMatch = briefing.match(/horarios?[:\s]*([^.]+)/i);
  if (hoursMatch) {
    // Basic parsing - could be enhanced
    const hoursText = hoursMatch[1].toLowerCase();
    const defaultHours = { open: '09:00', close: '22:00', closed: false };
    
    info.opening_hours = {
      monday: defaultHours,
      tuesday: defaultHours,
      wednesday: defaultHours,
      thursday: defaultHours,
      friday: defaultHours,
      saturday: defaultHours,
      sunday: defaultHours
    };
  }

  return info;
}