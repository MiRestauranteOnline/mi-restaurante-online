import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { clientId, pageType, fieldType } = await req.json();
    
    console.log(`Regenerating ${fieldType} for ${pageType} page of client ${clientId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIKey = Deno.env.get('chatgpt');
    
    if (!openAIKey) {
      console.error('OpenAI API key not found in environment');
      throw new Error('OpenAI API key not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch client data and settings
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('restaurant_name, address, subdomain, delivery')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error(`Failed to fetch client: ${clientError?.message}`);
    }

    // Fetch existing admin_content for context
    const { data: adminContent } = await supabase
      .from('admin_content')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle();

    // Fetch client_settings to check enabled features
    const { data: clientSettings } = await supabase
      .from('client_settings')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle();

    // Determine enabled features
    const hasReservations = adminContent?.homepage_reservations_section_visible !== false;
    const hasDelivery = client.delivery?.rappi || client.delivery?.pedidosya || client.delivery?.uber_eats;
    const hasContactSection = adminContent?.homepage_contact_section_visible !== false;

    // Create page-specific context with content awareness
    const pageContext = getPageContext(
      pageType, 
      client, 
      adminContent, 
      { hasReservations, hasDelivery, hasContactSection }
    );

    let prompt = '';
    if (fieldType === 'title') {
      // Build page-specific keyword requirements
      let keywordRequirement = '';
      switch (pageType) {
        case 'menu':
          keywordRequirement = '\n- DEBE incluir la palabra "Menú" o "Carta"';
          break;
        case 'contact':
          keywordRequirement = '\n- DEBE incluir la palabra "Contacto"';
          break;
        case 'reviews':
          keywordRequirement = '\n- DEBE incluir la palabra "Reseñas" o "Testimonios"';
          break;
      }

      prompt = `Genera un meta título SEO optimizado en ESPAÑOL para la página ${pageType} de ${client.restaurant_name}.

Context: ${pageContext}

Requisitos:
- Máximo 57 caracteres (límite estricto: 60)
- Incluir: tipo de cocina, ubicación, nombre del restaurante (cuando tenga sentido)
- Rico en palabras clave y descriptivo
- Natural y atractivo${keywordRequirement}
- Ejemplo: "Mejor Comida India en Miraflores | ${client.restaurant_name}"

Devuelve SOLO el meta título en español, sin explicaciones.`;
    } else {
      // Build page-specific keyword requirements for descriptions
      let keywordRequirement = '';
      switch (pageType) {
        case 'menu':
          keywordRequirement = '\n- DEBE incluir la palabra "menú" o "carta"';
          break;
        case 'contact':
          keywordRequirement = '\n- DEBE incluir la palabra "contacto" o "contáctanos"';
          break;
        case 'reviews':
          keywordRequirement = '\n- DEBE incluir la palabra "reseñas" o "testimonios"';
          break;
      }

      // Build content-aware constraints for description
      let constraints = `
Requisitos:
- Máximo 155 caracteres (límite estricto)
- Incluir keyword principal de forma natural${keywordRequirement}
- Usar MAYÚSCULAS o emojis (✓, ➤, ★) para destacar beneficios
- Crear sensación de urgencia o curiosidad`;

      // Add feature-specific constraints
      if (hasReservations) {
        constraints += '\n- Puedes mencionar reservas/reservar mesa si es relevante';
      } else {
        constraints += '\n- NO mencionar reservas ni reservar mesa';
      }

      if (hasDelivery) {
        constraints += '\n- Puedes mencionar delivery/entrega a domicilio si es relevante';
      } else {
        constraints += '\n- NO mencionar delivery ni entrega a domicilio';
      }

      constraints += '\n- Llamado a la acción convincente\n- Ejemplo: "★ Comida India AUTÉNTICA ★ Ingredientes frescos diario. Sabores que te transportan. ¡Descubre HOY!"';

      prompt = `Genera una meta descripción SEO optimizada en ESPAÑOL para la página ${pageType} de ${client.restaurant_name}.

Context: ${pageContext}
${constraints}

Devuelve SOLO la meta descripción en español, sin explicaciones.`;
    }

    // Call OpenAI to regenerate using gpt-4o-mini (cheaper, stable, no reasoning overhead)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto copywriter SEO especializado en marketing para restaurantes. Genera contenido persuasivo y rico en palabras clave que impulse clics, siempre respetando los límites de caracteres. Todo en ESPAÑOL.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI full response:', JSON.stringify(data, null, 2));
    
    const generatedText = data.choices?.[0]?.message?.content?.trim();
    
    if (!generatedText) {
      console.error('Empty or invalid response from OpenAI');
      throw new Error('Generated text is empty');
    }
    
    console.log(`Successfully generated ${fieldType}:`, generatedText);

    const responseData = fieldType === 'title' 
      ? { success: true, title: generatedText }
      : { success: true, description: generatedText };
    
    console.log('Sending response:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in regenerate-page-metadata:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getPageContext(
  pageType: string, 
  client: any, 
  adminContent: any, 
  features: { hasReservations: boolean; hasDelivery: boolean; hasContactSection: boolean }
): string {
  const baseContext = `Restaurante: ${client.restaurant_name}, Ubicación: ${client.address || 'Perú'}`;
  
  let featuresContext = '\nCaracterísticas activas:';
  if (features.hasReservations) featuresContext += ' reservas';
  if (features.hasDelivery) featuresContext += ' delivery';
  if (features.hasContactSection) featuresContext += ' contacto';
  
  switch (pageType) {
    case 'home':
      return `${baseContext}${featuresContext}. Página principal mostrando la propuesta de valor única del restaurante.`;
    case 'about':
      return `${baseContext}${featuresContext}. Página sobre la historia, misión y equipo del restaurante. ${adminContent?.about_story || ''}`;
    case 'menu':
      return `${baseContext}${featuresContext}. Página del menú completo mostrando todos los platos y categorías. Especialidades culinarias.`;
    case 'contact':
      return `${baseContext}${featuresContext}. Página de contacto${features.hasReservations ? ' y reservas' : ''}. Ubicación: ${client.address}, Web: ${client.subdomain}.mirestauranteonline.com`;
    case 'reviews':
      return `${baseContext}${featuresContext}. Página de testimonios y reseñas mostrando prueba social y satisfacción del cliente.`;
    default:
      return `${baseContext}${featuresContext}`;
  }
}
