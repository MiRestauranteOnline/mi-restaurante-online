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

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, imagePrompt, altText } = await req.json();
    
    if (!articleId || !imagePrompt) {
      throw new Error('Article ID and image prompt are required');
    }

    console.log('Starting image generation for article:', articleId);
    const startTime = Date.now();

    // Log generation start
    const { data: logData } = await supabase
      .from('generation_logs')
      .insert({
        type: 'image_generation',
        status: 'started',
        article_id: articleId,
        details: { prompt: imagePrompt }
      })
      .select()
      .single();

    // Generate image with Lovable AI (Nano banana model)
    const imageGenerationPrompt = `Generate a professional, high-quality photograph for a restaurant industry blog article. 
    
    Topic: ${imagePrompt}
    
    Style requirements:
    - Ultra high resolution, photorealistic
    - Professional restaurant/food industry setting
    - Clean, modern composition suitable for blog header
    - 16:9 aspect ratio
    - Vibrant, appetizing colors
    - No text overlays or watermarks
    - Peruvian restaurant context when relevant
    - Natural lighting, inviting atmosphere`;

    console.log('Generating image with Lovable AI...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: imageGenerationPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`Image generation failed: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const imageBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageBase64) {
      throw new Error('No image returned from AI');
    }

    console.log('Image generated successfully with Lovable AI');

    // Optimize the generated image (convert base64 to stored file)
    const optimizeResponse = await supabase.functions.invoke('optimize-user-image', {
      body: {
        imageUrl: imageBase64,
        description: imagePrompt,
        context: 'restaurant blog article',
        articleId,
        storeInDatabase: false
      }
    });

    let finalImageUrl = imageBase64;
    let finalAltText = altText || 'Professional restaurant image';

    if (optimizeResponse.data?.success) {
      finalImageUrl = optimizeResponse.data.optimizedUrl;
      finalAltText = optimizeResponse.data.altText;
      console.log('Image optimized and stored successfully:', finalImageUrl);
      
      // Update article with optimized image
      await supabase
        .from('generated_articles')
        .update({
          featured_image_url: finalImageUrl,
          featured_image_alt: finalAltText
        })
        .eq('id', articleId);
    } else {
      console.warn('Image optimization failed:', optimizeResponse.error);
      throw new Error('Failed to optimize and store image');
    }

    const processingTime = Date.now() - startTime;

    // Update log
    await supabase
      .from('generation_logs')
      .update({
        status: 'completed',
        details: { 
          image_url: finalImageUrl,
          model: 'google/gemini-2.5-flash-image-preview',
          optimized: optimizeResponse.data?.success || false
        },
        processing_time_ms: processingTime
      })
      .eq('id', logData.id);

    console.log(`Image generation and optimization completed in ${processingTime}ms`);

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: finalImageUrl,
      altText: finalAltText,
      optimized: optimizeResponse.data?.success || false,
      message: 'Featured image generated and optimized successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating image:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to generate featured image'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});