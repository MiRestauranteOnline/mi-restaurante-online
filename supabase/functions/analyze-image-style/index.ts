import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrls } = await req.json();
    
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length < 2) {
      throw new Error('At least 2 image URLs are required for style analysis');
    }

    const openaiApiKey = Deno.env.get('chatgpt');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing style from images:', imageUrls.slice(0, 2));

    // Analyze the first two images
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en análisis visual y fotografía gastronómica. Analiza las imágenes proporcionadas y determina el estilo fotográfico, paleta de colores y atmósfera predominante.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analiza estas dos imágenes de restaurante y proporciona un análisis detallado del estilo fotográfico para que pueda generar imágenes consistentes con IA.

RESPONDE EN FORMATO JSON con esta estructura EXACTA:

{
  "style": "realistic_photo" | "elegant_fine_dining" | "casual_cozy" | "modern_minimalist" | "rustic_traditional" | "vibrant_colorful",
  "colorPalette": "warm_tones" | "cool_tones" | "neutral_earth" | "vibrant_saturated" | "muted_pastel" | "high_contrast",
  "mood": "cozy_intimate" | "elegant_sophisticated" | "bright_energetic" | "calm_peaceful" | "rustic_authentic" | "modern_sleek",
  "detailedAnalysis": {
    "lightingStyle": "descripción del estilo de iluminación predominante",
    "composition": "descripción del estilo de composición y encuadre",
    "focusElements": ["elemento1", "elemento2", "elemento3"],
    "recommendations": "recomendaciones específicas para mantener consistencia visual"
  }
}

OPCIONES VÁLIDAS:
- style: realistic_photo, elegant_fine_dining, casual_cozy, modern_minimalist, rustic_traditional, vibrant_colorful
- colorPalette: warm_tones, cool_tones, neutral_earth, vibrant_saturated, muted_pastel, high_contrast
- mood: cozy_intimate, elegant_sophisticated, bright_energetic, calm_peaceful, rustic_authentic, modern_sleek`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrls[0] }
              },
              {
                type: 'image_url',
                image_url: { url: imageUrls[1] }
              }
            ]
          }
        ],
        max_completion_tokens: 800
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw OpenAI response:', content);

    // Extract JSON from response
    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Return sensible defaults if parsing fails
      analysisResult = {
        style: 'realistic_photo',
        colorPalette: 'warm_tones',
        mood: 'cozy_intimate',
        detailedAnalysis: {
          lightingStyle: 'Natural lighting',
          composition: 'Balanced composition',
          focusElements: ['food', 'presentation', 'ambiance'],
          recommendations: 'Use consistent lighting and composition style'
        }
      };
    }

    console.log('Parsed analysis result:', analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-image-style function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      style: 'realistic_photo',
      colorPalette: 'warm_tones',
      mood: 'cozy_intimate'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
