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

    // Generate image with Leonardo AI to match dashboard quality standards
    const leonardoApiKey = Deno.env.get('leonardo');
    if (!leonardoApiKey) {
      throw new Error('Leonardo API key is not configured');
    }

    const imageGenerationPrompt = `
${imagePrompt}

Style: Realistic photograph, professional, high quality, restaurant industry related,
no text overlay, clean composition, suitable for blog header, 16:9 aspect ratio,
vibrant colors, modern restaurant setting, Peruvian context when relevant
`;

    const leonardoResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${leonardoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: imageGenerationPrompt,
        modelId: "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3", // Leonardo Phoenix model for realistic photos
        width: 1280,
        height: 720, // 16:9 aspect ratio
        num_images: 1,
        guidance_scale: 7,
        num_inference_steps: 18,
        presetStyle: "PHOTOGRAPHY"
      }),
    });

    const leonardoData = await leonardoResponse.json();
    if (!leonardoData.sdGenerationJob) {
      console.error('Leonardo response:', leonardoData);
      throw new Error('Failed to start image generation');
    }

    const generationId = leonardoData.sdGenerationJob.generationId;
    console.log('Image generation started with ID:', generationId);

    // Poll for completion (Leonardo AI is async)
    let imageUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 30; // ~5 minutes

    while (!imageUrl && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 6000)); // Wait 6 seconds
      attempts++;

      const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${leonardoApiKey}`,
        },
      });

      const statusData = await statusResponse.json();
      if (statusData.generations_by_pk?.status === 'COMPLETE' && statusData.generations_by_pk.generated_images?.length > 0) {
        imageUrl = statusData.generations_by_pk.generated_images[0].url;
        console.log('Image generation completed:', imageUrl);
        break;
      } else if (statusData.generations_by_pk?.status === 'FAILED') {
        console.error('Leonardo status:', statusData);
        throw new Error('Image generation failed');
      }
    }

    if (!imageUrl) {
      throw new Error('Image generation timed out');
    }

    // Optimize and store the generated image
    const optimizeResponse = await supabase.functions.invoke('optimize-leonardo-image', {
      body: {
        imageUrl,
        originalPrompt: imagePrompt,
        articleId,
        context: 'restaurant blog'
      }
    });

    let finalImageUrl = imageUrl;
    let finalAltText = altText || 'Professional restaurant image';

    if (optimizeResponse.data?.success) {
      finalImageUrl = optimizeResponse.data.optimizedUrl;
      finalAltText = optimizeResponse.data.altText;
      console.log('Image optimized successfully:', finalImageUrl);
    } else {
      console.warn('Image optimization failed, using original:', optimizeResponse.error);
      // Fall back to updating with original image
      await supabase
        .from('generated_articles')
        .update({
          featured_image_url: imageUrl,
          featured_image_alt: altText || 'Professional restaurant image'
        })
        .eq('id', articleId);
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