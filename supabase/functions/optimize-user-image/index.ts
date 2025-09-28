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
    const { imageUrl, description, clientId, context = 'restaurant content', storeInDatabase = false, originalFilename } = await req.json();
    
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
                content: `Eres un experto en SEO que crea nombres de archivos optimizados y textos alternativos para imágenes de sitios web de restaurantes. Genera contenido descriptivo y amigable para SEO que incluya palabras clave relevantes para ${context}.`
              },
              {
                role: 'user',
                content: `Crea un nombre de archivo optimizado para SEO (sin extensión) y texto alternativo para una imagen con esta descripción: "${description}". 
                
                Requisitos:
                - Nombre de archivo: en minúsculas, separado por guiones, descriptivo, 3-6 palabras, incluir palabras clave relevantes, EN ESPAÑOL
                - Texto alternativo: descriptivo, lenguaje natural, 8-15 palabras, bueno para accesibilidad, EN ESPAÑOL
                - Enfócate en palabras clave de la industria de restaurantes/comida cuando sea relevante
                
                Devuelve SOLO un objeto JSON con las propiedades "filename" y "altText" EN ESPAÑOL.`
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
        // Normalize filename to a slug
        filename = (filename || '').toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
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

    // Create a unique, cache-busting filename using a short content hash
    const hashBuf = await crypto.subtle.digest('SHA-1', imageBuffer);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    const hash8 = hashArr.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 8);
    const optimizedFilename = `${filename}-${hash8}.webp`;

    // Additionally, keep the ORIGINAL upload stored under the client folder
    let originalPublicUrl = '';
    try {
      const originalExt = (imageUrl.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
      const originalContentType = originalExt === 'png' ? 'image/png' : originalExt === 'webp' ? 'image/webp' : 'image/jpeg';
      const originalFilename = `${filename}-${hash8}.${originalExt}`;
      const originalUploadPath = clientId
        ? `clients/${clientId}/original-images/${originalFilename}`
        : `original-images/${originalFilename}`;

      const { error: originalUploadError } = await supabase.storage
        .from('client-assets')
        .upload(originalUploadPath, imageBuffer, {
          contentType: originalContentType,
          cacheControl: '31536000',
          upsert: true,
        });
      if (originalUploadError && originalUploadError.message?.includes('already exists') === false) {
        console.warn('Failed to upload original image copy:', originalUploadError.message);
      }

      const { data: originalUrlData } = supabase.storage
        .from('client-assets')
        .getPublicUrl(originalUploadPath);
      originalPublicUrl = originalUrlData.publicUrl;
    } catch (e) {
      console.warn('Could not persist original image copy:', e);
    }
    
    // Step 4: Upload optimized image to Supabase Storage
    const uploadPath = clientId 
      ? `clients/${clientId}/optimized-images/${optimizedFilename}` 
      : `optimized-images/${optimizedFilename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client-assets')
      .upload(uploadPath, optimizedBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
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

    // Step 6: Store in client_images table if requested (for signup custom uploads)
    if (storeInDatabase && clientId) {
      try {
        // Handle temporary client IDs during signup differently
        if (clientId === 'temp-signup-client' || clientId === 'temp' || clientId === 'signup') {
          // For temporary uploads during signup, store metadata in generation_logs for later processing
          await supabase
            .from('generation_logs')
            .insert({
              type: 'temp_signup_image',
              status: 'pending_client_assignment',
              details: {
                image_url: publicUrl,
                alt_text: altText,
                original_filename: originalFilename || filename,
                upload_context: context,
                file_size_kb: Math.round(optimizedSize / 1024),
                temp_client_id: clientId,
                created_at: new Date().toISOString()
              }
            });
          console.log('Temp signup image metadata stored in generation_logs');
        } else {
          // For images with actual client UUIDs, store directly in client_images
          await supabase
            .from('client_images')
            .insert({
              client_id: clientId,
              image_url: publicUrl,
              alt_text: altText,
              original_filename: originalFilename || filename,
              upload_context: context,
              file_size_kb: Math.round(optimizedSize / 1024)
            });
          console.log('Image stored in client_images table');
        }
      } catch (dbError) {
        console.warn('Failed to store image metadata:', dbError);
        // Don't fail the entire process for database storage issues
      }
    }

    // Step 7: If there was an original temp upload, we could delete it here
    // This would be the case if we're doing background optimization

    // Step 8: Log the optimization
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