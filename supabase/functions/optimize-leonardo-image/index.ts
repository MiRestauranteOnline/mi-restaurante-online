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

    // Step 3: Resize and compress - blog images should be max 1200px wide  
    const maxWidth = 1200;
    const quality = 80;
    let optimizedBuffer: ArrayBuffer;
    let optimizedSize: number;
    
    try {
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      
      if (!lovableApiKey) {
        console.warn('LOVABLE_API_KEY not found, using original image');
        optimizedBuffer = imageBuffer;
        optimizedSize = originalSize;
      } else {
        // Convert image to base64
        const base64Image = btoa(
          new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;
        
        const resizeResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Resize this image to a maximum width of ${maxWidth}px while maintaining aspect ratio. Optimize for web use with WebP format at ${quality}% quality.`
                  },
                  {
                    type: "image_url",
                    image_url: { url: dataUrl }
                  }
                ]
              }
            ],
            modalities: ["image"]
          })
        });
        
        const resizeData = await resizeResponse.json();
        const editedImageUrl = resizeData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (editedImageUrl && editedImageUrl.startsWith('data:image')) {
          const base64Data = editedImageUrl.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          optimizedBuffer = bytes.buffer;
          optimizedSize = optimizedBuffer.byteLength;
          
          console.log(`Optimized image size: ${(optimizedSize / 1024).toFixed(2)} KB`);
          console.log(`Compression ratio: ${Math.round((1 - optimizedSize / originalSize) * 100)}%`);
        } else {
          optimizedBuffer = imageBuffer;
          optimizedSize = originalSize;
        }
      }
    } catch (error) {
      console.error('Image processing failed, using original:', error);
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
    const optimizedFilename = `${safeBase}${cacheBuster}.webp`;
    
    // Step 4: Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client-assets')
      .upload(`optimized-images/${optimizedFilename}`, optimizedBuffer, {
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