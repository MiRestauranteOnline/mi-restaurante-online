import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openaiApiKey = Deno.env.get('chatgpt');
const leonardoApiKey = Deno.env.get('leonardo');

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting generate-client-content function');
    
    // Check if API keys are available
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment');
      throw new Error('OpenAI API key not configured');
    }
    
    if (!leonardoApiKey) {
      console.error('Leonardo API key not found in environment');
      throw new Error('Leonardo API key not configured');
    }
    
    const { briefing, clientId, restaurantName, address } = await req.json();
    console.log('Request body parsed:', { briefing: briefing?.substring(0, 100), clientId, restaurantName, address });
    
    if (!briefing || !clientId || !restaurantName) {
      throw new Error('Briefing, client ID, and restaurant name are required');
    }

    console.log('Starting content generation for client:', clientId);

    // Step 1: Generate client profile and content with ChatGPT
    const contentPrompt = `
    Eres un experto en marketing para restaurantes y SEO local. Basándote en este briefing del cliente, necesitas crear contenido completo para su sitio web en español.

    INFORMACIÓN DEL CLIENTE:
    - Nombre del restaurante: ${restaurantName}
    - Ubicación: ${address || 'Lima, Perú'}
    - Briefing: ${briefing}

    TAREAS:
    1. Analiza el tipo de restaurante y su nicho
    2. Identifica a su audiencia objetivo
    3. Define el tono de marca apropiado
    4. Crea contenido optimizado para SEO local

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
        "about_story": "Historia del restaurante (2-3 párrafos)",
        "about_chef_info": "Información del chef/equipo",
        "about_mission": "Misión del restaurante",
        "stats_item1_number": "15+",
        "stats_item1_label": "Años de Experiencia",
        "stats_item1_icon": "Clock",
        "stats_item2_number": "5K+",
        "stats_item2_label": "Clientes Felices",
        "stats_item2_icon": "Users",
        "stats_item3_number": "10+",
        "stats_item3_label": "Reconocimientos",
        "stats_item3_icon": "Award",
        "services_card1_title": "Título del servicio 1",
        "services_card1_description": "Descripción del servicio 1",
        "services_card1_icon": "Utensils",
        "services_card2_title": "Título del servicio 2",
        "services_card2_description": "Descripción del servicio 2",
        "services_card2_icon": "Truck",
        "services_card3_title": "Título del servicio 3",
        "services_card3_description": "Descripción del servicio 3",
        "services_card3_icon": "Users"
      },
      "imagePrompts": {
        "homepage_hero_background": "Prompt para imagen del hero principal",
        "homepage_about_section_image": "Prompt para imagen de la sección about",
        "about_page_hero_background": "Prompt para imagen del hero de la página about",
        "menu_page_hero_background": "Prompt para imagen del hero del menú",
        "contact_page_hero_background": "Prompt para imagen del hero de contacto"
      }
    }

    IMPORTANTE:
    - Todo el contenido debe estar en español
    - Los títulos de dos partes deben dividirse equilibradamente
    - Optimiza para SEO local de Lima, Perú
    - Usa el tono de marca apropiado para el tipo de restaurante
    - Los prompts de imágenes deben ser en inglés para Leonardo AI
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
          { role: 'system', content: 'Eres un experto en marketing para restaurantes y SEO local. Responde siempre en formato JSON válido.' },
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
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', openaiData.choices[0].message.content);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log('Content generated successfully');

    // Step 2: Generate images with Leonardo AI
    const imageUrls: Record<string, string> = {};
    
    for (const [key, prompt] of Object.entries(generatedContent.imagePrompts)) {
      try {
        console.log(`Generating image for ${key}`);
        
        const leonardoResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${leonardoApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `${prompt}, professional restaurant photography, high quality, vibrant colors, modern restaurant setting, Peruvian context, no text overlay, clean composition`,
            modelId: "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3",
            width: 1024,
            height: 576,
            num_images: 1,
            guidance_scale: 7,
            num_inference_steps: 15,
            presetStyle: "PHOTOGRAPHY"
          }),
        });

        const leonardoData = await leonardoResponse.json();
        
        if (leonardoData.sdGenerationJob) {
          const generationId = leonardoData.sdGenerationJob.generationId;
          
          // Poll for completion
          let imageUrl = null;
          let attempts = 0;
          const maxAttempts = 6; // ~60s max to avoid function timeout
          
          while (!imageUrl && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
            attempts++;

            const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
              headers: {
                'Authorization': `Bearer ${leonardoApiKey}`,
              },
            });

            const statusData = await statusResponse.json();
            
            if (statusData.generations_by_pk?.status === 'COMPLETE' && statusData.generations_by_pk.generated_images?.length > 0) {
              imageUrl = statusData.generations_by_pk.generated_images[0].url;
              imageUrls[key] = imageUrl;
              console.log(`Image generated for ${key}:`, imageUrl);
              break;
            } else if (statusData.generations_by_pk?.status === 'FAILED') {
              console.error(`Image generation failed for ${key}`);
              break;
            }
          }
        }
      } catch (error) {
        console.error(`Error generating image for ${key}:`, error);
      }
    }

    // Step 3: Update admin_content table with generated content and images
    const updateData = {
      ...generatedContent.content,
      homepage_hero_background_url: imageUrls.homepage_hero_background || null,
      homepage_about_section_image_url: imageUrls.homepage_about_section_image || null,
      about_page_hero_background_url: imageUrls.about_page_hero_background || null,
      menu_page_hero_background_url: imageUrls.menu_page_hero_background || null,
      contact_page_hero_background_url: imageUrls.contact_page_hero_background || null,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('admin_content')
      .upsert({
        client_id: clientId,
        ...updateData
      });

    if (updateError) {
      throw new Error(`Failed to update content: ${updateError.message}`);
    }

    console.log('Content generation completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contenido generado y actualizado exitosamente',
      analysis: generatedContent.analysis,
      generatedImages: Object.keys(imageUrls).length
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