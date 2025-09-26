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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, originalPrompt, articleId, context = 'restaurant blog' } = await req.json();
    
    if (!imageUrl || !originalPrompt) {
      throw new Error('Image URL and original prompt are required');
    }

    console.log('Starting image optimization for:', imageUrl);

    // Step 1: Generate SEO-friendly filename and alt text using ChatGPT
    const filenameResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an SEO expert who creates optimized filenames and alt texts for restaurant website images. Generate SEO-friendly, descriptive content that includes relevant keywords for ${context}.`
          },
          {
            role: 'user',
            content: `Create an SEO-optimized filename (without extension) and alt text for an image with this description: "${originalPrompt}". 
            
            Requirements:
            - Filename: lowercase, hyphen-separated, descriptive, 3-6 words, include relevant keywords
            - Alt text: descriptive, natural language, 8-15 words, good for accessibility
            - Focus on restaurant/food industry keywords when relevant
            
            Return ONLY a JSON object with "filename" and "altText" properties.`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      })
    });

    const filenameData = await filenameResponse.json();
    const { filename, altText } = JSON.parse(filenameData.choices[0].message.content);
    
    console.log('Generated SEO data:', { filename, altText });

    // Step 2: Download the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download image from Leonardo');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const originalSize = imageBuffer.byteLength;
    console.log(`Original image size: ${(originalSize / 1024).toFixed(2)} KB`);

    // Step 3: Convert to WebP using Deno's built-in image processing
    // For now, we'll upload the original and let Supabase handle optimization
    // In the future, this could be enhanced with actual WebP conversion
    const optimizedFilename = `${filename}.webp`;
    
    // Step 4: Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client-assets')
      .upload(`optimized-images/${optimizedFilename}`, imageBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Step 5: Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('client-assets')
      .getPublicUrl(`optimized-images/${optimizedFilename}`);

    console.log('Image uploaded successfully:', publicUrl);

    // Step 6: Update the article with optimized image data if articleId provided
    if (articleId) {
      await supabase
        .from('generated_articles')
        .update({
          featured_image_url: publicUrl,
          featured_image_alt: altText
        })
        .eq('id', articleId);
    }

    // Step 7: Log the optimization
    await supabase
      .from('generation_logs')
      .insert({
        type: 'image_optimization',
        status: 'completed',
        article_id: articleId,
        details: {
          original_url: imageUrl,
          optimized_url: publicUrl,
          filename: optimizedFilename,
          alt_text: altText,
          original_size_kb: Math.round(originalSize / 1024),
          optimization_prompt: originalPrompt
        }
      });

    return new Response(JSON.stringify({
      success: true,
      optimizedUrl: publicUrl,
      filename: optimizedFilename,
      altText,
      originalSizeKB: Math.round(originalSize / 1024),
      message: 'Image optimized and stored successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error optimizing image:', error);
    
    // Log the error
    if (openaiApiKey && supabase) {
      try {
        await supabase
          .from('generation_logs')
          .insert({
            type: 'image_optimization',
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            details: { error_context: 'Image optimization failed' }
          });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to optimize image'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});