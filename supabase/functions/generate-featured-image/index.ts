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

    const imageGenerationPrompt = `${imagePrompt}, ultra-realistic professional restaurant photography, single composition, single scene, no collage, no grid, no split-panel, no montage, no multi-image, shot with DSLR camera, natural lighting, high resolution, food styling, appetizing presentation, clean composition, restaurant setting, blog header quality, photojournalistic quality, commercial food photography, Peruvian restaurant context, pure photography without any overlays`;

    const leonardoResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${leonardoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: imageGenerationPrompt,
        negative_prompt: "text, words, letters, typography, writing, captions, titles, headlines, labels, signs, signage, menu text, price tags, numbers, characters, fonts, logos with text, watermarks, subtitles, annotations, overlays, banners, ribbons with text, speech bubbles, text boxes, business names, restaurant names written, taglines",
        modelId: "de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3", // Leonardo Phoenix 1.0 - latest foundational model
        styleUUID: "7c3f932b-a572-47cb-9b9b-f20211e63b5b", // Pro color photography style
        width: 1280,
        height: 720, // 16:9 aspect ratio for blog header
        num_images: 1,
        contrast: 4, // High contrast for sharp, professional look
        enhancePrompt: true, // AI prompt enhancement for better results
        alchemy: true, // Quality mode enabled
        num_inference_steps: 25, // Higher steps for better quality
        guidance_scale: 8 // Higher guidance for better prompt adherence
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
          model: 'Leonardo Phoenix 1.0 (de7d3faf)',
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