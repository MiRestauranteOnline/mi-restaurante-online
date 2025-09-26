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
        "reviews_section_title_first_line": "Primera parte reviews",
        "reviews_section_title_second_line": "Segunda parte reviews",
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
        "stats_item1_number": "15+",
        "stats_item1_label": "Años de Experiencia",
        "stats_item1_icon": "Clock",
        "stats_item2_number": "5K+",
        "stats_item2_label": "Clientes Felices",
        "stats_item2_icon": "Users",
        "stats_item3_number": "10+",
        "stats_item3_label": "Reconocimientos",
        "stats_item3_icon": "Award",
        "stats_experience_number": "15+",
        "stats_experience_label": "Años de Experiencia",
        "stats_clients_number": "5K+",
        "stats_clients_label": "Clientes Felices",
        "stats_awards_number": "10+",
        "stats_awards_label": "Reconocimientos",
        "services_card1_title": "Título del servicio 1",
        "services_card1_description": "Descripción del servicio 1",
        "services_card1_icon": "Utensils",
        "services_card1_button_text": "Más Info",
        "services_card1_button_link": "https://wa.me/51987654321?text=Hola, me gustaría saber más sobre el servicio",
        "services_card2_title": "Título del servicio 2",
        "services_card2_description": "Descripción del servicio 2",
        "services_card2_icon": "Truck",
        "services_card2_button_text": "Más Info",
        "services_card2_button_link": "https://wa.me/51987654321?text=Hola, me gustaría saber más sobre delivery",
        "services_card3_title": "Título del servicio 3",
        "services_card3_description": "Descripción del servicio 3",
        "services_card3_icon": "Users",
        "services_card3_button_text": "Más Info",
        "services_card3_button_link": "https://wa.me/51987654321?text=Hola, me gustaría saber más sobre eventos",
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
      }
    }

    IMPORTANTE:
    - Todo el contenido debe estar en español
    - TÍTULOS DIVIDIDOS: Los campos "_first_line" y "_second_line" NO son dos títulos separados. Son UN SOLO título SEO optimizado que se divide en dos partes equilibradas sin romper palabras. Ejemplo: Si el título optimizado es "Auténtica Comida Peruana Tradicional", lo divides en "Auténtica Comida" (primera línea) y "Peruana Tradicional" (segunda línea)
    - Optimiza para SEO local de Lima, Perú (o la ubicación especificada)
    - Usa el tono de marca apropiado para el tipo de restaurante
    - Los prompts de imágenes deben ser en inglés para Leonardo AI
    - Para los iconos, selecciona de esta lista según el contexto: Utensils, Truck, Users, Clock, Star, MapPin, Award, Heart, Coffee, Zap
    - Los stats deben ser realistas y apropiados para el tipo de restaurante
    - Los servicios deben reflejar lo que realmente ofrece el restaurante según el briefing
    - Los botones de servicios deben usar enlaces de WhatsApp apropiados
    - Crea contenido coherente que refleje la personalidad del restaurante
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

    // Step 2: Save TEXT content immediately (no images yet)
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

    // Step 3: Generate images in parallel to avoid timeouts
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

    // Generate all images in parallel to prevent timeouts
    const imageGenerationPromises = Object.entries(generatedContent.imagePrompts || {}).map(async ([key, prompt]) => {
      const targetField = imageFieldMap[key as keyof typeof imageFieldMap];
      if (!targetField) return null;

      try {
        console.log(`Generating image for ${key}...`);
        const leonardoResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${leonardoApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `${prompt}, ultra-realistic professional restaurant photography, single composition, single scene, no collage, no grid, no split-panel, no montage, no multi-image, shot with DSLR camera, natural lighting, high resolution, food styling, appetizing presentation, clean composition, restaurant setting, ${restaurantName} style, no text overlay, photojournalistic quality, commercial food photography`,
            modelId: "de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3", // Leonardo Phoenix 1.0 - latest foundational model
            styleUUID: "7c3f932b-a572-47cb-9b9b-f20211e63b5b", // Pro color photography style
            width: 1024,
            height: 576,
            num_images: 1,
            contrast: 4, // High contrast for sharp, professional look
            enhancePrompt: true, // AI prompt enhancement for better results
            alchemy: true, // Quality mode enabled (removes ultra as they conflict)
            num_inference_steps: 25, // Higher steps for better quality (default is 15)
            guidance_scale: 8 // Higher guidance for better prompt adherence
          }),
        });

        if (!leonardoResponse.ok) {
          console.error(`Leonardo start failed for ${key}:`, await leonardoResponse.text());
          return null;
        }

        const leonardoData = await leonardoResponse.json();
        if (!leonardoData.sdGenerationJob) {
          console.error(`No generation job for ${key}`);
          return null;
        }

        const generationId = leonardoData.sdGenerationJob.generationId;

        // Poll for completion (reduced to 6 attempts x 5s = 30s max)
        let imageUrl: string | null = null;
        for (let attempts = 0; attempts < 6; attempts++) {
          await new Promise((r) => setTimeout(r, 5000)); // Wait 5 seconds
          
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
            console.error(`Image generation failed for ${key}`);
            break;
          }
        }

        if (imageUrl) {
          console.log(`Generated image URL for ${key}: ${imageUrl}`);
          
          // Optimize the Leonardo image using our optimization function
          try {
            const optimizeResponse = await supabase.functions.invoke('optimize-leonardo-image', {
              body: {
                imageUrl,
                originalPrompt: generatedContent.imagePrompts[key],
                context: `restaurant website ${key.replace(/_/g, ' ')}`
              }
            });

            if (optimizeResponse.data?.success) {
              return { [targetField]: optimizeResponse.data.optimizedUrl };
            } else {
              console.error(`Image optimization failed for ${key}:`, optimizeResponse.error);
              // Fallback: upload the Leonardo image directly to Supabase (never store CDN URL)
              try {
                const imgResp = await fetch(imageUrl);
                const buffer = await imgResp.arrayBuffer();
                const fallbackName = `${restaurantName}-${key}`
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
                console.log(`Uploaded fallback image for ${key}: ${supaUrl}`);
                return { [targetField]: supaUrl };
              } catch (uploadErr) {
                console.error(`Fallback upload failed for ${key}`, uploadErr);
                return null;
              }
            }
          } catch (optimizationError) {
            console.error(`Error optimizing image for ${key}:`, optimizationError);
            // Fallback: upload the Leonardo image directly to Supabase (never store CDN URL)
            try {
              const imgResp = await fetch(imageUrl);
              const buffer = await imgResp.arrayBuffer();
              const fallbackName = `${restaurantName}-${key}`
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
              console.log(`Uploaded fallback image for ${key}: ${supaUrl}`);
              return { [targetField]: supaUrl };
            } catch (uploadErr) {
              console.error(`Fallback upload failed for ${key}`, uploadErr);
              return null;
            }
          }
        } else {
          console.warn(`Timed out generating image for ${key}`);
          return null;
        }
      } catch (error) {
        console.error(`Error generating image for ${key}:`, error);
        return null;
      }
    });

    // Wait for all image generations to complete
    const imageResults = await Promise.all(imageGenerationPromises);
    
    // Merge all successful image updates
    imageResults.forEach(result => {
      if (result) {
        Object.assign(imageUpdates, result);
      }
    });

    // Step 4: Update database with all content including generated images
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