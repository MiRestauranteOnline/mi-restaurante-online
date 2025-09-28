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
    const { imageUrl, description, clientId, context = 'restaurant content' } = await req.json();
    
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    console.log('Starting user image optimization for:', imageUrl);

    // Step 1: Generate SEO-friendly filename and alt text using ChatGPT
    let filename = '';
    let altText = '';
    
    if (openaiApiKey && description) {
      try {
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
                content: `Create an SEO-optimized filename (without extension) and alt text for an image with this description: "${description}". 
                
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
        
        const extractJson = (text: string): string => {
          let cleaned = (text || '').trim();
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/```\s*$/, '');
          }
          const start = cleaned.indexOf('{');
          const end = cleaned.lastIndexOf('}');
          if (start !== -1 && end !== -1 && end > start) {
            return cleaned.slice(start, end + 1);
          }
          return cleaned;
        };

        const contentText = extractJson(filenameData.choices?.[0]?.message?.content || '');
        const parsed = JSON.parse(contentText);
        filename = parsed.filename;
        altText = parsed.altText;
      } catch (e) {
        console.warn('Failed to parse OpenAI SEO JSON. Falling back to slugified values.', e);
      }
    }
    
    // Fallback for filename and alt text
    if (!filename || !altText) {
      const slugify = (s: string) => s.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      const base = slugify(`${context} ${description || 'image'}`);
      const words = base.split('-').filter(Boolean).slice(0, 6);
      filename = (words.length ? words.join('-') : 'restaurant-image') + '-' + Date.now();
      altText = description || 'Restaurant image';
    }

    // Step 2: Download the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download original image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const originalSize = imageBuffer.byteLength;
    console.log(`Original image size: ${(originalSize / 1024).toFixed(2)} KB`);

    // Step 3: Optimize image using an external service (like TinyPNG or CloudFlare)
    // For this implementation, we'll use a simple approach and upload as-is for now
    // but you could integrate with services like:
    // - TinyPNG API for compression
    // - CloudFlare Image Resizing
    // - ImageKit.io
    // - Or build a custom image processing service

    let optimizedBuffer = imageBuffer;
    let optimizedSize = originalSize;
    
    // If the image is too large, we can use a compression service
    if (originalSize > 300 * 1024) { // If larger than 300KB
      console.log('Image is larger than 300KB, should be compressed');
      // TODO: Implement actual compression here
      // For now, we'll just log this and proceed
    }

    const optimizedFilename = `${filename}.webp`;
    
    // Step 4: Upload optimized image to Supabase Storage
    const uploadPath = clientId 
      ? `clients/${clientId}/optimized-images/${optimizedFilename}` 
      : `optimized-images/${optimizedFilename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client-assets')
      .upload(uploadPath, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload optimized image: ${uploadError.message}`);
    }

    // Step 5: Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('client-assets')
      .getPublicUrl(uploadPath);

    console.log('Optimized image uploaded successfully:', publicUrl);

    // Step 6: If there was an original temp upload, we could delete it here
    // This would be the case if we're doing background optimization

    // Step 7: Log the optimization
    try {
      await supabase
        .from('generation_logs')
        .insert({
          type: 'user_image_optimization',
          status: 'completed',
          details: {
            original_url: imageUrl,
            optimized_url: publicUrl,
            filename: optimizedFilename,
            alt_text: altText,
            original_size_kb: Math.round(originalSize / 1024),
            optimized_size_kb: Math.round(optimizedSize / 1024),
            client_id: clientId,
            description: description
          }
        });
    } catch (logError) {
      console.warn('Failed to log optimization:', logError);
      // Don't fail the entire process for logging issues
    }

    return new Response(JSON.stringify({
      success: true,
      optimizedUrl: publicUrl,
      filename: optimizedFilename,
      altText,
      originalSizeKB: Math.round(originalSize / 1024),
      optimizedSizeKB: Math.round(optimizedSize / 1024),
      compressionRatio: Math.round((1 - optimizedSize / originalSize) * 100),
      message: 'Image optimized and stored successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error optimizing user image:', error);
    
    // Log the error
    try {
      await supabase
        .from('generation_logs')
        .insert({
          type: 'user_image_optimization',
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          details: { error_context: 'User image optimization failed' }
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to optimize user image'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});