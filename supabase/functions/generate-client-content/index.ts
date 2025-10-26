import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openaiApiKey = Deno.env.get('chatgpt');
const leonardoApiKey = Deno.env.get('leonardo');

console.log('Environment check:', { 
  hasOpenAI: !!openaiApiKey, 
  hasLeonardo: !!leonardoApiKey,
  openaiLength: openaiApiKey?.length || 0,
  leonardoLength: leonardoApiKey?.length || 0
});

function extractJson(text: string): string {
  // Remove code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/```\s*$/, '');
  }
  // Extract between first { and last }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return cleaned.slice(start, end + 1);
  }
  return cleaned;
}

// Fact-checking function to validate content
async function factCheckContent(content: any, briefing: string, restaurantName: string) {
  const warnings: string[] = [];
  
  // Check for potentially made-up numerical data
  const statsFields = ['stats_item1_number', 'stats_item2_number', 'stats_item3_number', 
                      'stats_experience_number', 'stats_clients_number', 'stats_awards_number'];
  
  statsFields.forEach(field => {
    const value = content.content?.[field];
    if (value && typeof value === 'string') {
      // Check for specific numbers that might be hallucinated
      if (/\d+/.test(value) && !briefing.toLowerCase().includes(value.toLowerCase())) {
        warnings.push(`Warning: Specific number "${value}" in ${field} may be fabricated - not found in briefing`);
        // Replace with generic terms
        if (field.includes('experience')) {
          content.content[field] = 'Experiencia';
        } else if (field.includes('client')) {
          content.content[field] = 'Clientes';
        } else if (field.includes('award')) {
          content.content[field] = 'Calidad';
        } else {
          content.content[field] = '✓';
        }
      }
    }
  });
  
  // Check about_story for potentially made-up dates or specific claims
  const aboutStory = content.content?.about_story;
  if (aboutStory && typeof aboutStory === 'string') {
    // Look for specific years that might be fabricated
    const yearMatches = aboutStory.match(/\b(19|20)\d{2}\b/g);
    if (yearMatches) {
      yearMatches.forEach(year => {
        if (!briefing.includes(year)) {
          warnings.push(`Warning: Year "${year}" in about_story may be fabricated - not found in briefing`);
          content.content.about_story = aboutStory.replace(new RegExp(`\\b${year}\\b`, 'g'), 'hace años');
        }
      });
    }
    
    // Check for specific awards or recognitions not in briefing
    const awardKeywords = ['premio', 'reconocimiento', 'galardón', 'certificación', 'distinción'];
    awardKeywords.forEach(keyword => {
      if (aboutStory.toLowerCase().includes(keyword) && !briefing.toLowerCase().includes(keyword)) {
        warnings.push(`Warning: Mention of "${keyword}" in about_story may be fabricated - not found in briefing`);
      }
    });
  }
  
  // Log warnings for debugging
  if (warnings.length > 0) {
    console.log('Fact-check warnings for', restaurantName, ':', warnings);
  }
  
  return warnings;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting generate-client-content function');
    console.log('Environment check:', { 
      hasOpenAI: !!openaiApiKey, 
      hasLeonardo: !!leonardoApiKey,
      openaiLength: openaiApiKey?.length || 0,
      leonardoLength: leonardoApiKey?.length || 0
    });
    
    // Check if API keys are available
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        details: 'The chatgpt secret is missing or empty'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!leonardoApiKey) {
      console.error('Leonardo API key not found in environment');
      return new Response(JSON.stringify({ 
        error: 'Leonardo API key not configured',
        details: 'The leonardo secret is missing or empty'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { briefing, clientId, restaurantName, address } = await req.json();
    console.log('Request body parsed:', { briefing: briefing?.substring(0, 100), clientId, restaurantName, address });
    
    if (!briefing || !clientId || !restaurantName) {
      throw new Error('Briefing, client ID, and restaurant name are required');
    }

    console.log('Starting content generation for client:', clientId);

    // Step 1: Get client data for trusted sources
    const { data: clientData } = await supabase
      .from('clients')
      .select('social_media_links, domain, email, phone, whatsapp, delivery')
      .eq('id', clientId)
      .single();
    
    // Get admin_content to check enabled features
    const { data: adminContent } = await supabase
      .from('admin_content')
      .select('homepage_reservations_section_visible, homepage_contact_section_visible')
      .eq('client_id', clientId)
      .maybeSingle();

    // Determine enabled features for content-aware generation
    const hasReservations = adminContent?.homepage_reservations_section_visible !== false;
    const hasDelivery = clientData?.delivery?.rappi || clientData?.delivery?.pedidosya || clientData?.delivery?.uber_eats;

    // Build content-aware constraints for SEO metadata
    let seoConstraints = '';
    if (!hasReservations) {
      seoConstraints += '\n- NO mencionar reservas ni "reservar mesa" en las descripciones';
    }
    if (!hasDelivery) {
      seoConstraints += '\n- NO mencionar delivery ni entrega a domicilio en las descripciones';
    }

    // Step 3: Get custom images uploaded by client (if any)
    const { data: clientImages } = await supabase
      .from('client_images')
      .select('image_url')
      .eq('client_id', clientId)
      .eq('upload_context', 'signup_custom_upload')
      .order('created_at', { ascending: true });

    // Get image preference settings
    const { data: imageSettings } = await supabase
      .from('admin_content')
      .select('image_preference, ai_image_style, ai_color_palette, ai_image_mood, detected_image_style')
      .eq('client_id', clientId)
      .maybeSingle();

    const imagePreference = imageSettings?.image_preference || 'ai_only';
    const customImageUrls = clientImages?.map(img => img.image_url) || [];
    
    console.log('Image preference:', imagePreference);
    console.log('Custom images found:', customImageUrls.length);

    // Define all image slots needed for the website (7 slots)
    const imageSlots = [
      'homepage_hero_background',
      'homepage_about_section_image',
      'about_page_hero_background',
      'about_page_about_section_image',
      'menu_page_hero_background',
      'contact_page_hero_background',
      'reviews_page_hero_background',
    ];

    // Map custom images to slots (in order)
    const customImageMapping: Record<string, string> = {};
    customImageUrls.forEach((url, index) => {
      if (index < imageSlots.length) {
        customImageMapping[imageSlots[index]] = url;
      }
    });

    console.log('Custom image mapping:', customImageMapping);

    // Determine which slots need AI generation
    const slotsNeedingAI = imageSlots.filter(slot => !customImageMapping[slot]);
    
    console.log('Slots needing AI generation:', slotsNeedingAI.length);

    // If custom_only mode, all slots must be filled with custom images
    if (imagePreference === 'custom_only' && customImageUrls.length < imageSlots.length) {
      throw new Error(`Custom_only mode requires ${imageSlots.length} images, but only ${customImageUrls.length} were provided`);
    }

    // Step 4: Generate client profile and content with ChatGPT using trusted sources
    const contentPrompt = `
    Eres un experto en marketing para restaurantes y SEO local. Basándote en este briefing del cliente, necesitas crear contenido completo para su sitio web en español.

    IMPORTANTE: SOLO USA INFORMACIÓN VERIFICABLE. NO INVENTES DATOS ESPECÍFICOS como años de experiencia, números de clientes, premios, o fechas de fundación si no están en el briefing.

    INFORMACIÓN DEL CLIENTE:
    - Nombre del restaurante: ${restaurantName}
    - Ubicación: ${address || 'Lima, Perú'}
    - Briefing: ${briefing}
    - Sitio web actual: ${clientData?.domain || 'No especificado'}
    - Redes sociales: ${JSON.stringify(clientData?.social_media_links || {})}
    - Email: ${clientData?.email || 'No especificado'}
    - Teléfono: ${clientData?.phone || 'No especificado'}
    - WhatsApp: ${clientData?.whatsapp || 'No especificado'}

    TAREAS:
    1. Analiza el tipo de restaurante y su nicho
    2. Identifica a su audiencia objetivo
    3. Define el tono de marca apropiado
    4. Verifica que no inventes datos específicos (fechas, números, premios)
    5. Usa solo información del briefing y fuentes proporcionadas
    6. Crea contenido optimizado para SEO local

    RESPONDE EN FORMATO JSON con esta estructura EXACTA:

    {
      "analysis": {
        "restaurantType": "tipo de restaurante",
        "targetAudience": "descripción de la audiencia",
        "brandTone": "tono de marca",
        "searchKeywords": ["palabra clave 1", "palabra clave 2", "etc"]
      },
      "content": {
        "homepage_hero_title_first_line": "Primera parte del título",
        "homepage_hero_title_second_line": "Segunda parte del título",
        "homepage_hero_description": "Descripción del hero",
        "homepage_hero_right_button_text": "Texto del botón",
        "homepage_hero_right_button_link": "#contact",
        "homepage_about_section_title_first_line": "Primera parte",
        "homepage_about_section_title_second_line": "Segunda parte",
        "homepage_about_section_description": "Descripción de la sección about",
        "homepage_services_section_title_first_line": "Primera parte",
        "homepage_services_section_title_second_line": "Segunda parte",
        "homepage_services_section_description": "Descripción de servicios",
        "homepage_menu_section_title_first_line": "Primera parte",
        "homepage_menu_section_title_second_line": "Segunda parte",
        "homepage_menu_section_description": "Descripción del menú",
        "homepage_contact_section_title_first_line": "Primera parte",
        "homepage_contact_section_title_second_line": "Segunda parte",
        "homepage_contact_section_description": "Descripción de contacto",
        "homepage_delivery_section_title": "Título de delivery",
        "homepage_delivery_section_description": "Descripción de delivery",
        "homepage_cta_title": "Título llamativo para CTA",
        "homepage_cta_description": "Descripción persuasiva para CTA",
        "homepage_cta_button1_text": "WhatsApp",
        "homepage_cta_button1_link": "",
        "homepage_cta_button2_text": "Llamar",
        "homepage_cta_button2_link": "",
        "reviews_section_title_first_line": "Primera parte reviews",
        "reviews_section_title_second_line": "Segunda parte reviews",
        "reviews_section_description": "Descripción de la sección de reseñas que refleje el compromiso con la excelencia y servicio del restaurante",
        "about_page_hero_title_first_line": "Primera parte about hero",
        "about_page_hero_title_second_line": "Segunda parte about hero",
        "about_page_hero_description": "Descripción about hero",
        "about_team_section_title_first_line": "Primera parte team",
        "about_team_section_title_second_line": "Segunda parte team",
        "about_team_section_description": "Descripción team section",
        "contact_page_hero_title_first_line": "Primera parte contact hero",
        "contact_page_hero_title_second_line": "Segunda parte contact hero",
        "contact_page_hero_description": "Descripción contact hero",
        "menu_page_hero_title_first_line": "Primera parte menu hero",
        "menu_page_hero_title_second_line": "Segunda parte menu hero",
        "menu_page_hero_description": "Descripción menu hero",
        "reviews_page_hero_title_first_line": "Primera parte reviews hero",
        "reviews_page_hero_title_second_line": "Segunda parte reviews hero",
        "reviews_page_hero_description": "Descripción reviews hero",
        "about_story": "Historia del restaurante (2-3 párrafos)",
        "about_chef_info": "Información del chef/equipo",
        "about_mission": "Misión del restaurante",
        "contact_reservation_title": "Título para caja de reservas",
        "contact_reservation_description": "Descripción para caja de reservas",
        "whatsapp_reservation_message": "Hola, me gustaría hacer una reserva para [fecha] a las [hora] para [número de personas] personas.",
        "whatsapp_general_message": "Hola, me gustaría hacer una reserva",
        "our_story_label": "Nuestra Historia",
        "culinary_masterpieces_label": "Obras Maestras Culinarias",
        "testimonials_label": "Testimonios",
        "our_services_label": "Nuestros Servicios",
        "contact_us_label": "Contáctanos",
        "about_us_label": "Acerca de Nosotros",
        "our_menu_label": "Nuestro Menú",
        "our_team_label": "Nuestro Equipo",
        "stats_item1_number": "GENERAL (no específico inventado)",
        "stats_item1_label": "Experiencia Gastronómica",
        "stats_item1_icon": "Clock",
        "stats_item2_number": "GENERAL (no específico inventado)", 
        "stats_item2_label": "Clientes Satisfechos",
        "stats_item2_icon": "Users",
        "stats_item3_number": "GENERAL (no específico inventado)",
        "stats_item3_label": "Calidad Garantizada",
        "stats_item3_icon": "Award",
        "stats_experience_number": "GENERAL (no específico inventado)",
        "stats_experience_label": "Experiencia Gastronómica", 
        "stats_clients_number": "GENERAL (no específico inventado)",
        "stats_clients_label": "Clientes Satisfechos",
        "stats_awards_number": "GENERAL (no específico inventado)",
        "stats_awards_label": "Calidad Garantizada",
        "services_card1_title": "Título del servicio 1",
        "services_card1_description": "Descripción del servicio 1",
        "services_card1_icon": "Utensils",
        "services_card1_button_text": "Más Info",
        "services_card1_button_link": "${clientData?.whatsapp ? `https://wa.me/${clientData.whatsapp.replace('+', '')}?text=Hola, me gustaría saber más sobre el servicio` : 'https://wa.me/51987654321?text=Hola, me gustaría saber más sobre el servicio'}",
        "services_card2_title": "Título del servicio 2 (SOLO si está en briefing)",
        "services_card2_description": "Descripción del servicio 2 (SOLO si está en briefing)",
        "services_card2_icon": "Truck",
        "services_card2_button_text": "Más Info",
        "services_card2_button_link": "${clientData?.whatsapp ? `https://wa.me/${clientData.whatsapp.replace('+', '')}?text=Hola, me gustaría saber más sobre delivery` : 'https://wa.me/51987654321?text=Hola, me gustaría saber más sobre delivery'}",
        "services_card3_title": "Título del servicio 3 (SOLO si está en briefing)",
        "services_card3_description": "Descripción del servicio 3 (SOLO si está en briefing)",
        "services_card3_icon": "Users",
        "services_card3_button_text": "Más Info",
        "services_card3_button_link": "${clientData?.whatsapp ? `https://wa.me/${clientData.whatsapp.replace('+', '')}?text=Hola, me gustaría saber más sobre eventos` : 'https://wa.me/51987654321?text=Hola, me gustaría saber más sobre eventos'}",
        "services_feature1_icon": "Clock",
        "services_feature1_text": "Texto feature 1",
        "services_feature2_icon": "Star",
        "services_feature2_text": "Texto feature 2",
        "services_feature3_icon": "MapPin",
        "services_feature3_text": "Texto feature 3",
        "footer_description": "Descripción del footer del restaurante"
      },
      "imagePrompts": {
        "homepage_hero_background": "Prompt para imagen del hero principal - enfócate en platos de comida, ingredientes frescos, detalles culinarios, ambiente gastronómico sin mostrar un restaurante específico ficticio",
        "homepage_about_section_image": "Prompt para imagen de la sección about - enfócate en ingredientes frescos, proceso de cocina, manos del chef preparando comida, detalles artesanales",
        "about_page_hero_background": "Prompt para imagen del hero de la página about - enfócate en la cocina, ingredientes, proceso culinario, ambiente de cocina profesional",
        "about_page_about_section_image": "Prompt para la imagen de la sección 'about' en la página About - enfócate en un solo encuadre con ingredientes frescos y proceso artesanal del chef, sin collage ni mosaicos",
        "menu_page_hero_background": "Prompt para imagen del hero del menú - enfócate en platos principales, presentación de comida, ingredientes frescos, detalles gastronómicos",
        "contact_page_hero_background": "Prompt para imagen del hero de contacto - enfócate en ambiente acogedor, mesa con comida, detalles del servicio, sin mostrar restaurante específico",
        "reviews_page_hero_background": "Prompt para imagen del hero de reviews - enfócate en clientes satisfechos disfrutando la comida, momentos de felicidad, ambiente familiar"
      },
      "seoMetadata": {
        "home": {
          "meta_title": "Título SEO EN ESPAÑOL - MÁXIMO 60 caracteres (preferible 57) con tipo de comida, ubicación, nombre. Si excede, ACORTA. Ejemplo: Comida India en Miraflores | ${restaurantName.substring(0, 15)}",
          "meta_description": "Descripción SEO EN ESPAÑOL (máx 155 chars) con keyword principal, beneficios en MAYÚSCULAS o emojis ✓★, urgencia. ${seoConstraints} Ejemplo: ★ Comida India AUTÉNTICA ★ Ingredientes frescos. Sabores tradicionales. ¡Visita HOY!"
        },
        "about": {
          "meta_title": "Título SEO EN ESPAÑOL - MÁXIMO 60 caracteres (preferible 57). Si excede, ACORTA inmediatamente",
          "meta_description": "Descripción SEO EN ESPAÑOL (máx 155 chars) con keyword, beneficios destacados, urgencia${seoConstraints}"
        },
        "menu": {
          "meta_title": "Título SEO EN ESPAÑOL - MÁXIMO 60 caracteres - DEBE incluir 'Menú' o 'Carta'. Si excede, ACORTA",
          "meta_description": "Descripción SEO EN ESPAÑOL (máx 155 chars) - DEBE incluir 'menú' o 'carta', beneficios destacados, urgencia${seoConstraints}"
        },
        "contact": {
          "meta_title": "Título SEO EN ESPAÑOL - MÁXIMO 60 caracteres - DEBE incluir 'Contacto'. Si excede, ACORTA",
          "meta_description": "Descripción SEO EN ESPAÑOL (máx 155 chars) - DEBE incluir 'contacto' o 'contáctanos', beneficios destacados, urgencia${seoConstraints}"
        },
        "reviews": {
          "meta_title": "Título SEO EN ESPAÑOL - MÁXIMO 60 caracteres - DEBE incluir 'Reseñas' o 'Testimonios'. Si excede, ACORTA",
          "meta_description": "Descripción SEO EN ESPAÑOL (máx 155 chars) - DEBE incluir 'reseñas' o 'testimonios', beneficios destacados, urgencia${seoConstraints}"
        }
      }
    }

    REGLAS CRÍTICAS PARA EVITAR ALUCINACIONES:
    1. NO INVENTES DATOS ESPECÍFICOS: No uses números de años de experiencia, cantidad de clientes, premios, o fechas de fundación específicas a menos que estén explícitamente en el briefing
    2. USA TÉRMINOS GENERALES: En lugar de "15 años" usa "Años de experiencia", en lugar de "5K+ clientes" usa "Clientes satisfechos"
    3. SOLO INCLUYE SERVICIOS MENCIONADOS: No agregues servicios (delivery, eventos, etc.) que no estén mencionados en el briefing
    4. VERIFICA INFORMACIÓN: Si el briefing menciona redes sociales o sitio web, úsalos como referencia para validar información
    5. SÉ CONSERVADOR: Es mejor ser general que específico si no tienes datos verificables
    6. NO INVENTES ESTADÍSTICAS: Nunca crees números, porcentajes, rankings, premios o reconocimientos que no estén en el briefing
    7. NO AFIRMES HECHOS NO VERIFICABLES: Evita declaraciones como "el mejor", "número 1", "ganador de", "fundado en [año específico]" si no están en el briefing

    IMPORTANTE:
    - Todo el contenido debe estar en ESPAÑOL
    - SEO metadata debe estar en ESPAÑOL
    - TÍTULOS DIVIDIDOS: Los campos "_first_line" y "_second_line" NO son dos títulos separados. Son UN SOLO título SEO optimizado que se divide en dos partes equilibradas sin romper palabras
    - Optimiza para SEO local de Lima, Perú (o la ubicación especificada)
    - Usa el tono de marca apropiado para el tipo de restaurante
    - Los prompts de imágenes deben ser en inglés para Leonardo AI
    - Para los iconos, selecciona de esta lista según el contexto: Utensils, Truck, Users, Clock, Star, MapPin, Award, Heart, Coffee, Zap
    - Los stats deben ser GENERALES y apropiados (no específicos inventados)
    - Los servicios deben reflejar SOLO lo que está en el briefing
    - Los botones de servicios deben usar enlaces de WhatsApp del cliente si está disponible
    - Crea contenido coherente que refleje la personalidad del restaurante
    - LABELS: Las etiquetas deben ser cortas y descriptivas
    - CTA: Crea un título y descripción persuasivos pero realistas
    - WHATSAPP: Usa el número real del cliente si está disponible
    - RESERVAS: El título y descripción deben ser claros y motivadores
    - CONSISTENCIA: Todo el contenido debe mantener el mismo tono y personalidad de marca
    - SEO: Solo menciona características activas (reservas solo si enabled, delivery solo si configurado)${seoConstraints}
    `;

    console.log('Calling OpenAI API...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un experto en marketing para restaurantes y SEO local. CRÍTICO: NO INVENTES datos específicos como años de experiencia, números de clientes, premios o fechas. NO CREES estadísticas, rankings, premios o reconocimientos que no estén explícitamente en el briefing. NO AFIRMES ser "el mejor", "número 1" o "ganador de" sin evidencia del briefing. Usa solo información del briefing y fuentes verificables. Responde siempre en formato JSON válido.' },
          { role: 'user', content: contentPrompt }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', openaiResponse.status);
    
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API failed: ${openaiResponse.status} - ${errorData}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('OpenAI response received');
    
    if (!openaiData?.choices?.[0]?.message?.content) {
      console.error('Unexpected OpenAI response shape:', JSON.stringify(openaiData).slice(0, 1000));
      throw new Error('OpenAI response did not contain content');
    }
    
    let generatedContent;
    try {
      const contentText = extractJson(openaiData.choices[0].message.content);
      generatedContent = JSON.parse(contentText);
      
      // Step 3: Fact-check and validate content
      console.log('Running fact-check validation...');
      await factCheckContent(generatedContent, briefing, restaurantName);
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', openaiData.choices[0].message.content);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Step 4: Save metadata to page_metadata table
    if (generatedContent.seoMetadata) {
      console.log('Saving SEO metadata...');
      
      const metadataEntries = Object.entries(generatedContent.seoMetadata).map(([pageType, meta]: [string, any]) => ({
        client_id: clientId,
        page_type: pageType,
        meta_title: meta.meta_title,
        meta_description: meta.meta_description,
        og_title: meta.meta_title,
        og_description: meta.meta_description,
        twitter_title: meta.meta_title,
        twitter_description: meta.meta_description,
      }));

      const { error: metadataError } = await supabase
        .from('page_metadata')
        .upsert(metadataEntries, { onConflict: 'client_id,page_type' });

      if (metadataError) {
        console.error('Failed to save metadata:', metadataError);
        // Don't fail the entire operation, just log the error
      } else {
        console.log('SEO metadata saved successfully');
      }
    }

    console.log('Content generated and fact-checked successfully');

    // Step 5: Save TEXT content immediately (no images yet)
    const textUpdate = {
      ...generatedContent.content,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from('admin_content')
      .upsert({
        client_id: clientId,
        ...textUpdate,
      }, { onConflict: 'client_id' as any });

    if (upsertError) {
      throw new Error(`Failed to upsert content: ${upsertError.message}`);
    }

    // Step 6: Handle images - custom first, then AI for remaining slots
    const imageFieldMap: Record<string, string> = {
      homepage_hero_background: 'homepage_hero_background_url',
      homepage_about_section_image: 'homepage_about_section_image_url',
      about_page_hero_background: 'about_page_hero_background_url',
      about_page_about_section_image: 'about_page_about_section_image_url',
      menu_page_hero_background: 'menu_page_hero_background_url',
      contact_page_hero_background: 'contact_page_hero_background_url',
      reviews_page_hero_background: 'reviews_page_hero_background_url',
    };

    const imageUpdates: Record<string, string> = {};

    // First, assign custom images to their slots
    Object.entries(customImageMapping).forEach(([slot, url]) => {
      const targetField = imageFieldMap[slot];
      if (targetField) {
        imageUpdates[targetField] = url;
        console.log(`Assigned custom image to ${targetField}`);
      }
    });

    // Determine AI style to use
    let aiStyleModifier = '';
    if (imagePreference === 'custom_plus_ai' && imageSettings?.detected_image_style) {
      // Use detected style
      const detected = imageSettings.detected_image_style;
      aiStyleModifier = `matching style: ${detected.style}, ${detected.colorPalette} color palette, ${detected.mood} atmosphere`;
      console.log('Using detected style:', aiStyleModifier);
    } else if (imageSettings?.ai_image_style) {
      // Use manually selected style
      const style = imageSettings.ai_image_style.replace(/_/g, ' ');
      const palette = imageSettings.ai_color_palette?.replace(/_/g, ' ') || '';
      const mood = imageSettings.ai_image_mood?.replace(/_/g, ' ') || '';
      aiStyleModifier = `${style} style, ${palette} colors, ${mood} mood`;
      console.log('Using manual style:', aiStyleModifier);
    }

    // Generate AI images only for remaining slots
    if (slotsNeedingAI.length > 0 && imagePreference !== 'custom_only') {
      console.log(`Generating ${slotsNeedingAI.length} AI images...`);
      
      const imageGenerationPromises = slotsNeedingAI.map(async (slotKey) => {
        const targetField = imageFieldMap[slotKey];
        if (!targetField) return null;

        const basePrompt = generatedContent.imagePrompts?.[slotKey] || `Professional restaurant image for ${slotKey}`;
        const enhancedPrompt = aiStyleModifier 
          ? `${basePrompt}, ${aiStyleModifier}, ultra-realistic professional restaurant photography`
          : `${basePrompt}, ultra-realistic professional restaurant photography`;

        try {
          console.log(`Generating AI image for ${slotKey}...`);
          const leonardoResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${leonardoApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: `${enhancedPrompt}, single composition, single scene, no collage, no grid, no split-panel, no montage, no multi-image, shot with DSLR camera, natural lighting, high resolution, food styling, appetizing presentation, clean composition, restaurant setting, ${restaurantName} style, no text overlay, photojournalistic quality, commercial food photography`,
              modelId: "de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3",
              styleUUID: "7c3f932b-a572-47cb-9b9b-f20211e63b5b",
              width: 1024,
              height: 576,
              num_images: 1,
              contrast: 4,
              enhancePrompt: true,
              alchemy: true,
              num_inference_steps: 25,
              guidance_scale: 8
            }),
          });

          if (!leonardoResponse.ok) {
            console.error(`Leonardo start failed for ${slotKey}:`, await leonardoResponse.text());
            return null;
          }

          const leonardoData = await leonardoResponse.json();
          if (!leonardoData.sdGenerationJob) {
            console.error(`No generation job for ${slotKey}`);
            return null;
          }

          const generationId = leonardoData.sdGenerationJob.generationId;

          let imageUrl: string | null = null;
          for (let attempts = 0; attempts < 6; attempts++) {
            await new Promise((r) => setTimeout(r, 5000));
            
            const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
              headers: { 'Authorization': `Bearer ${leonardoApiKey}` },
            });
            
            if (!statusResponse.ok) continue;
            
            const statusData = await statusResponse.json();
            if (statusData.generations_by_pk?.status === 'COMPLETE' && statusData.generations_by_pk.generated_images?.length > 0) {
              imageUrl = statusData.generations_by_pk.generated_images[0].url;
              break;
            }
            if (statusData.generations_by_pk?.status === 'FAILED') {
              console.error(`Image generation failed for ${slotKey}`);
              break;
            }
          }

          if (imageUrl) {
            console.log(`Generated AI image URL for ${slotKey}: ${imageUrl}`);
            
            try {
              const optimizeResponse = await supabase.functions.invoke('optimize-leonardo-image', {
                body: {
                  imageUrl,
                  originalPrompt: enhancedPrompt,
                  context: `restaurant website ${slotKey.replace(/_/g, ' ')}`
                }
              });

              if (optimizeResponse.data?.success) {
                return { [targetField]: optimizeResponse.data.optimizedUrl };
              } else {
                console.error(`Image optimization failed for ${slotKey}:`, optimizeResponse.error);
                try {
                  const imgResp = await fetch(imageUrl);
                  const buffer = await imgResp.arrayBuffer();
                  const fallbackName = `${restaurantName}-${slotKey}`
                    .toLowerCase()
                    .replace(/[^a-z0-9\-]+/g, '-')
                    .replace(/-+/g, '-');
                  const optimizedPath = `optimized-images/${fallbackName}-${Date.now()}.webp`;
                  const { error: upErr } = await supabase.storage
                    .from('client-assets')
                    .upload(optimizedPath, buffer, { contentType: 'image/webp', upsert: true });
                  if (upErr) throw upErr;
                  const { data: { publicUrl: supaUrl } } = supabase.storage
                    .from('client-assets')
                    .getPublicUrl(optimizedPath);
                  console.log(`Uploaded fallback image for ${slotKey}: ${supaUrl}`);
                  return { [targetField]: supaUrl };
                } catch (uploadErr) {
                  console.error(`Fallback upload failed for ${slotKey}`, uploadErr);
                  return null;
                }
              }
            } catch (optimizationError) {
              console.error(`Error optimizing image for ${slotKey}:`, optimizationError);
              try {
                const imgResp = await fetch(imageUrl);
                const buffer = await imgResp.arrayBuffer();
                const fallbackName = `${restaurantName}-${slotKey}`
                  .toLowerCase()
                  .replace(/[^a-z0-9\-]+/g, '-')
                  .replace(/-+/g, '-');
                const optimizedPath = `optimized-images/${fallbackName}-${Date.now()}.webp`;
                const { error: upErr } = await supabase.storage
                  .from('client-assets')
                  .upload(optimizedPath, buffer, { contentType: 'image/webp', upsert: true });
                if (upErr) throw upErr;
                const { data: { publicUrl: supaUrl } } = supabase.storage
                  .from('client-assets')
                  .getPublicUrl(optimizedPath);
                console.log(`Uploaded fallback image for ${slotKey}: ${supaUrl}`);
                return { [targetField]: supaUrl };
              } catch (uploadErr) {
                console.error(`Fallback upload failed for ${slotKey}`, uploadErr);
                return null;
              }
            }
          } else {
            console.warn(`Timed out generating AI image for ${slotKey}`);
            return null;
          }
        } catch (error) {
          console.error(`Error generating AI image for ${slotKey}:`, error);
          return null;
        }
      });

      const imageResults = await Promise.all(imageGenerationPromises);
      
      imageResults.forEach(result => {
        if (result) {
          Object.assign(imageUpdates, result);
        }
      });
    }

    console.log(`Total images assigned: ${Object.keys(imageUpdates).length} (${Object.keys(customImageMapping).length} custom + ${Object.keys(imageUpdates).length - Object.keys(customImageMapping).length} AI)`);

    // Step 7: Update database with all content including images
    const finalUpdate = {
      ...generatedContent.content,
      ...imageUpdates,
      updated_at: new Date().toISOString(),
    };

    const { error: finalUpdateError } = await supabase
      .from('admin_content')
      .upsert({
        client_id: clientId,
        ...finalUpdate,
      }, { onConflict: 'client_id' as any });

    if (finalUpdateError) {
      throw new Error(`Failed to update content with images: ${finalUpdateError.message}`);
    }

    console.log('Content and images generated successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Contenido e imágenes generados exitosamente.',
      analysis: generatedContent.analysis,
      imagesGenerated: Object.keys(imageUpdates).length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });


  } catch (error) {
    console.error('Error generating content:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to generate client content',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});