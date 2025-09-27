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
    const { briefing, clientId, restaurantName } = await req.json();

    if (!briefing || !clientId) {
      throw new Error('Missing briefing or clientId');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAIApiKey = Deno.env.get('chatgpt');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating branding for client:', clientId);

    // Analyze the style briefing and generate branding decisions
    const brandingChoices = await generateBrandingChoices(briefing, restaurantName || '', openAIApiKey);

    // Update client branding information
    const { error: clientError } = await supabase
      .from('clients')
      .update({
        brand_colors: brandingChoices.colors,
        theme: brandingChoices.theme
      })
      .eq('id', clientId);

    if (clientError) {
      console.error('Error updating client branding:', clientError);
      throw clientError;
    }

    // Update client settings with fonts and colors
    const { error: settingsError } = await supabase
      .from('client_settings')
      .upsert({
        client_id: clientId,
        primary_color: brandingChoices.colors.primary,
        title_font: brandingChoices.fonts.title,
        body_font: brandingChoices.fonts.body,
        title_font_weight: '400'
      }, {
        onConflict: 'client_id'
      });

    if (settingsError) {
      console.error('Error updating client settings:', settingsError);
      throw settingsError;
    }

    // Update admin content with logo URLs if available
    if (brandingChoices.logoUrl) {
      const { error: adminError } = await supabase
        .from('admin_content')
        .upsert({
          client_id: clientId,
          header_logo_url: brandingChoices.logoUrl,
          footer_logo_url: brandingChoices.logoUrl
        }, {
          onConflict: 'client_id'
        });

      if (adminError) {
        console.error('Error updating admin content with logo:', adminError);
      }
    }

    console.log('Successfully generated branding for client:', clientId);

    return new Response(JSON.stringify({ 
      success: true,
      branding: brandingChoices,
      message: 'Branding generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-branding function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateBrandingChoices(briefing: string, restaurantName: string, apiKey: string) {
  const prompt = `
    Analiza este briefing de estilo para un restaurante y determina las mejores opciones de branding:
    
    Restaurante: ${restaurantName}
    Briefing de estilo: ${briefing}
    
    Devuelve un JSON con esta estructura exacta:
    {
      "colors": {
        "primary": "#HEXCOLOR"
      },
      "fonts": {
        "title": "FONT_NAME",
        "body": "FONT_NAME"
      },
      "theme": "dark" | "light",
      "logoUrl": null
    }
    
    Consideraciones:
    - Para colores, usa códigos hex válidos que funcionen bien para restaurantes
    - Para fuentes de títulos, elige entre: "Playfair Display", "Cormorant Garamond", "Merriweather", "Lora"
    - Para fuentes de cuerpo, elige entre: "Inter", "Open Sans", "Roboto", "Source Sans Pro"
    - Theme debe ser "dark" para ambientes elegantes/modernos, "light" para casuales/familiares
    - logoUrl debe ser null (será manejado por separado)
    
    Si no se especifican preferencias, usa estos defaults basados en el tipo de restaurante:
    - Elegante/Fine dining: colores oscuros, fuentes serif, tema dark
    - Casual/Familiar: colores cálidos, fuentes sans-serif, tema light
    - Moderno: colores minimalistas, fuentes sans-serif clean
    
    Responde SOLO con el JSON, sin texto adicional.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un experto en branding para restaurantes. Responde solo con JSON válido.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      // Return sensible defaults
      return {
        colors: {
          primary: "#8B5CF6"
        },
        fonts: {
          title: "Cormorant Garamond",
          body: "Inter"
        },
        theme: "dark",
        logoUrl: null
      };
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // Return sensible defaults
    return {
      colors: {
        primary: "#8B5CF6"
      },
      fonts: {
        title: "Cormorant Garamond",
        body: "Inter"
      },
      theme: "dark",
      logoUrl: null
    };
  }
}