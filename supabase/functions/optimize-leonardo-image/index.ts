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
    let filename = '';
    let altText = '';
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

    try {
      const contentText = extractJson(filenameData.choices?.[0]?.message?.content || '');
      const parsed = JSON.parse(contentText);
      filename = parsed.filename;
      altText = parsed.altText;
    } catch (e) {
      console.warn('Failed to parse OpenAI SEO JSON. Falling back to slugified values.', e);
      const slugify = (s: string) => s.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      const base = slugify(`${context} ${originalPrompt}`);
      const words = base.split('-').filter(Boolean).slice(0, 6);
      filename = (words.length ? words.join('-') : 'optimized-image') + '-' + Date.now();
      const altWords = (originalPrompt || context || 'restaurant image').split(/\s+/).slice(0, 15);
      altText = altWords.join(' ');
    }

    // Step 2: Download the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download image from Leonardo');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const originalSize = imageBuffer.byteLength;
    console.log(`Original image size: ${(originalSize / 1024).toFixed(2)} KB`);

    // Step 3: Compress and resize using ImageScript (matches ImageUpload.tsx compression)
    // Context-based compression settings (matching browser-image-compression targets)
    const contextSettings: Record<string, { maxWidth: number; targetKB: number; quality: number }> = {
      'menu-item': { maxWidth: 800, targetKB: 60, quality: 70 },
      'hero-background': { maxWidth: 1920, targetKB: 300, quality: 80 },
      'carousel': { maxWidth: 1000, targetKB: 140, quality: 70 },
      'restaurant blog': { maxWidth: 1200, targetKB: 200, quality: 70 },
      'default': { maxWidth: 1200, targetKB: 200, quality: 70 }
    };

    const settings = contextSettings[context] || contextSettings['default'];
    console.log(`Using compression settings for "${context}":`, settings);

    let optimizedBuffer: ArrayBuffer;
    let optimizedSize: number;
    
    try {
      // Dynamic import of imagescript for image processing
      const { Image } = await import('https://deno.land/x/imagescript@1.3.0/mod.ts');
      
      // Decode the image
      const image = await Image.decode(new Uint8Array(imageBuffer));
      
      // Calculate new dimensions maintaining aspect ratio
      const aspectRatio = image.width / image.height;
      let newWidth = Math.min(image.width, settings.maxWidth);
      let newHeight = Math.round(newWidth / aspectRatio);
      
      // Resize if needed
      const resized = image.width > settings.maxWidth 
        ? image.resize(newWidth, newHeight)
        : image;
      
      // Encode to JPEG with quality setting (ImageScript doesn't support WebP encoding natively)
      // We'll encode as JPEG and upload with .webp extension, browser will handle properly
      const compressedBuffer = await resized.encodeJPEG(settings.quality);
      optimizedBuffer = compressedBuffer.buffer as ArrayBuffer;
      optimizedSize = compressedBuffer.byteLength;

      console.log(`Optimized image size: ${(optimizedSize / 1024).toFixed(2)} KB (target: ${settings.targetKB} KB)`);
      console.log(`Compression ratio: ${Math.round((1 - optimizedSize / originalSize) * 100)}%`);

      // If still too large, reduce quality further
      if (optimizedSize / 1024 > settings.targetKB * 1.2) {
        console.log('Image still too large, reducing quality further...');
        const lowerQuality = Math.max(50, settings.quality - 20);
        const recompressed = await resized.encodeJPEG(lowerQuality);
        
        if (recompressed.byteLength < optimizedSize) {
          optimizedBuffer = recompressed.buffer as ArrayBuffer;
          optimizedSize = recompressed.byteLength;
          console.log(`Recompressed to: ${(optimizedSize / 1024).toFixed(2)} KB at quality ${lowerQuality}`);
        }
      }
    } catch (error) {
      console.error('ImageScript compression failed, using original image:', error);
      optimizedBuffer = imageBuffer;
      optimizedSize = originalSize;
    }
    
    // Ensure unique filename to bypass CDN/browser caches
    const cacheBuster = `-${Date.now()}`;
    const safeBase = (filename || 'optimized-image')
      .toString()
      .trim()
      .replace(/[^a-z0-9-\s]/gi, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
    const optimizedFilename = `${safeBase}${cacheBuster}.jpg`; // Using .jpg since ImageScript encodes to JPEG
    
    // Step 4: Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client-assets')
      .upload(`optimized-images/${optimizedFilename}`, optimizedBuffer, {
        contentType: 'image/jpeg',
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
          optimized_size_kb: Math.round(optimizedSize / 1024),
          optimization_prompt: originalPrompt
        }
      });

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