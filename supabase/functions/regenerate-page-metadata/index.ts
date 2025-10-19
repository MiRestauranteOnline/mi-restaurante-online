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

    if (!clientId || !pageType || !fieldType) {
      throw new Error('Missing required parameters');
    }

    if (!['title', 'description', 'keywords'].includes(fieldType)) {
      throw new Error('Invalid fieldType. Must be title, description, or keywords');
    }

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
    
    const features = { hasReservations, hasDelivery, hasContactSection };

    // Create page-specific context with content awareness
    const pageContext = getPageContext(
      pageType, 
      client, 
      adminContent, 
      features
    );

    let prompt = '';
    if (fieldType === 'keywords') {
      // Generate page-specific keywords based on search intent
      const keywordContext = getKeywordContext(pageType, client, adminContent, features);
      
      prompt = `Genera palabras clave SEO en ESPAÑOL para la página ${pageType} de ${client.restaurant_name}.

Context: ${pageContext}

${keywordContext}

FORMATO: Devuelve SOLO una lista de 5-8 palabras clave separadas por comas, sin numeración, sin explicaciones.
EJEMPLO: restaurante indio lima, comida india auténtica, curry vegetariano, tandoori chicken, delivery comida india

Devuelve SOLO las palabras clave en español, separadas por comas.`;
    } else if (fieldType === 'title') {
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

Requisitos CRÍTICOS:
- LÍMITE ABSOLUTO: 60 caracteres (preferible 57 o menos)
- Cuenta cada carácter incluyendo espacios y símbolos
- Si excede 60 caracteres, acorta hasta cumplir el límite
- Incluir: tipo de cocina, ubicación, nombre del restaurante (cuando tenga sentido)
- Rico en palabras clave y descriptivo
- Natural y atractivo${keywordRequirement}
- NO uses comillas ni símbolos de citación alrededor del título
- Ejemplo corto: Menú de Comida India | ${client.restaurant_name.substring(0, 20)}

IMPORTANTE: El título DEBE ser de 60 caracteres o menos. Si tu primera versión es muy larga, acórtala inmediatamente.

Devuelve SOLO el meta título en español de máximo 60 caracteres, sin comillas, sin explicaciones.`;
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

      constraints += '\n- Llamado a la acción convincente\n- NO uses comillas alrededor de la descripción\n- Ejemplo: ★ Comida India AUTÉNTICA ★ Ingredientes frescos diario. Sabores que te transportan. ¡Descubre HOY!';

      prompt = `Genera una meta descripción SEO optimizada en ESPAÑOL para la página ${pageType} de ${client.restaurant_name}.

Context: ${pageContext}
${constraints}

IMPORTANTE: NO uses comillas alrededor de la descripción.

Devuelve SOLO la meta descripción en español, sin comillas, sin explicaciones.`;
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
    
    let generatedText = data.choices?.[0]?.message?.content?.trim();
    
    if (!generatedText) {
      console.error('Empty or invalid response from OpenAI');
      throw new Error('Generated text is empty');
    }
    
    // Remove surrounding quotes if present
    if ((generatedText.startsWith('"') && generatedText.endsWith('"')) ||
        (generatedText.startsWith("'") && generatedText.endsWith("'"))) {
      generatedText = generatedText.slice(1, -1).trim();
    }
    
    // Trim and validate
    generatedText = generatedText.trim();
    console.log(`Successfully generated ${fieldType}:`, generatedText);

    // For keywords, ensure proper format and validation
    if (fieldType === 'keywords') {
      // Clean up any numbering or extra formatting
      generatedText = generatedText
        .replace(/^\d+\.\s*/gm, '') // Remove numbered lists
        .replace(/^[-•]\s*/gm, '')  // Remove bullet points
        .split(',')
        .map((k: string) => k.trim())
        .filter((k: string) => k.length > 0)
        .join(', ');
      
      console.log('Cleaned keywords:', generatedText);
    }

    // Validate and enforce character limits
    if (fieldType === 'title' && generatedText.length > 60) {
      console.warn(`Generated title too long (${generatedText.length} chars): "${generatedText}"`);
      // Truncate to 60 characters at word boundary
      generatedText = generatedText.substring(0, 57).trim();
      const lastSpace = generatedText.lastIndexOf(' ');
      if (lastSpace > 40) {
        generatedText = generatedText.substring(0, lastSpace);
      }
      console.log(`Truncated to ${generatedText.length} chars: "${generatedText}"`);
    }
    
    if (fieldType === 'description' && generatedText.length > 155) {
      console.warn(`Generated description too long (${generatedText.length} chars)`);
      generatedText = generatedText.substring(0, 152).trim();
      const lastSpace = generatedText.lastIndexOf(' ');
      if (lastSpace > 130) {
        generatedText = generatedText.substring(0, lastSpace);
      }
      console.log(`Truncated to ${generatedText.length} chars`);
    }

    const responseData = 
      fieldType === 'title' ? { success: true, title: generatedText } :
      fieldType === 'description' ? { success: true, description: generatedText } :
      { success: true, keywords: generatedText };
    
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

function getKeywordContext(pageType: string, client: any, adminContent: any, features: { hasReservations: boolean; hasDelivery: boolean; hasContactSection: boolean }): string {
  const cuisineType = client.restaurant_name?.toLowerCase().includes('india') ? 'india' : 
                      client.restaurant_name?.toLowerCase().includes('italian') ? 'italiana' : 
                      client.restaurant_name?.toLowerCase().includes('chino') ? 'china' : 
                      client.restaurant_name?.toLowerCase().includes('japan') ? 'japonesa' : 
                      'gourmet';
  
  const location = client.address?.toLowerCase().includes('miraflores') ? 'miraflores' :
                   client.address?.toLowerCase().includes('barranco') ? 'barranco' :
                   client.address?.toLowerCase().includes('san isidro') ? 'san isidro' : 'lima';

  switch (pageType) {
    case 'home':
      return `INTENCIÓN DE BÚSQUEDA: Usuario busca un restaurante para comer ahora o pronto
- Palabras clave principales: nombre del restaurante, tipo de cocina, ubicación
- Incluir: "${client.restaurant_name}", "restaurante ${cuisineType}", "${location}"
${features.hasReservations ? '- Incluir: "reservas", "reservar mesa"' : ''}
${features.hasDelivery ? '- Incluir: "delivery", "pedido online"' : ''}
- Enfoque: búsquedas generales de restaurante`;

    case 'menu':
      return `INTENCIÓN DE BÚSQUEDA: Usuario quiere ver el menú antes de decidir
- Palabras clave principales: "menú", tipo de cocina, platos específicos populares
- Incluir: "menú ${cuisineType}", "carta", "platos"
- Ejemplos específicos: "curry", "tandoori", "biryani" (para india), etc.
- Enfoque: búsquedas de menú y platos específicos`;

    case 'about':
      return `INTENCIÓN DE BÚSQUEDA: Usuario quiere conocer más sobre el restaurante
- Palabras clave principales: nombre del restaurante, historia, chef
- Incluir: "sobre nosotros", "historia", "chef", "filosofía"
- Enfoque: búsquedas informacionales sobre el restaurante`;

    case 'contact':
      return `INTENCIÓN DE BÚSQUEDA: Usuario busca contactar o ubicar el restaurante
- Palabras clave principales: ubicación, contacto, dirección, teléfono
- Incluir: "${location}", "dirección", "contacto", "teléfono", "ubicación"
${features.hasReservations ? '- Incluir: "reservar", "hacer reserva"' : ''}
${features.hasDelivery ? '- Incluir: "delivery", "pedidos"' : ''}
- Enfoque: búsquedas transaccionales de contacto`;

    case 'reviews':
      return `INTENCIÓN DE BÚSQUEDA: Usuario busca opiniones antes de visitar
- Palabras clave principales: reseñas, opiniones, testimonios
- Incluir: "reseñas", "opiniones", "testimonios", "experiencias"
- Incluir: nombre del restaurante + "opiniones"
- Enfoque: búsquedas de validación social`;

    default:
      return `Contexto general del restaurante ${client.restaurant_name}`;
  }
}

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
