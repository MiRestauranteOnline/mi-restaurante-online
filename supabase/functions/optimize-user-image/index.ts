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

    // Step 3: Determine max width based on context and call image optimization API
    const contextMaxWidths: Record<string, number> = {
      'hero-background': 1920,
      'carousel': 1000,
      'menu-item': 800,
      'logo': 512,
      'favicon': 32,
      'team-member': 600,
      'custom_upload': 1200,
      'restaurant content': 1200, // default
    };
    
    const maxWidth = contextMaxWidths[context] || 1200;
    
    // Define target sizes (in KB) and minimum acceptable qualities per context
    const contextTargets: Record<string, { targetKB: number; minQuality: number }> = {
      'hero-background': { targetKB: 300, minQuality: 60 },
      'carousel': { targetKB: 140, minQuality: 60 },
      'menu-item': { targetKB: 60, minQuality: 55 }, // aggressive for menu items
      'logo': { targetKB: 80, minQuality: 75 },
      'favicon': { targetKB: 20, minQuality: 80 },
      'team-member': { targetKB: 120, minQuality: 60 },
      'custom_upload': { targetKB: 300, minQuality: 60 },
      'restaurant content': { targetKB: 300, minQuality: 60 }, // default
    };

    const { targetKB, minQuality } = contextTargets[context] || contextTargets['restaurant content'];
    const initialQuality = context === 'menu-item' ? 68 
      : context === 'hero-background' ? 70 
      : (context === 'logo' || context === 'favicon' ? 85 : 75);
    
    console.log(`Max width for context "${context}": ${maxWidth}px, quality start: ${initialQuality}, target: ${targetKB}KB`);

    // Step 4: Use Lovable AI Gateway to resize and compress with iterative attempts
    let optimizedBuffer: ArrayBuffer | undefined;
    let optimizedSize: number | undefined;
    
    try {
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      
      if (!lovableApiKey) {
        console.warn('LOVABLE_API_KEY not found, using original image');
        optimizedBuffer = imageBuffer;
        optimizedSize = originalSize;
      } else {
        // Convert original image to data URL once for reuse
        const base64Image = btoa(
          new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        const originalDataUrl = `data:image/jpeg;base64,${base64Image}`;

        const attemptOptimize = async (q: number, width: number): Promise<{ buffer: ArrayBuffer; size: number } | null> => {
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
                      text: `Resize to a maximum width of ${width}px (maintain aspect ratio). Re-encode as WebP with quality ${q} and high compression effort, strip all metadata. Optimize for web use and aim for file size under ${targetKB} KB while preserving reasonable visual quality.`,
                    },
                    {
                      type: "image_url",
                      image_url: { url: originalDataUrl },
                    },
                  ],
                },
              ],
              modalities: ["image"],
            }),
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
            return { buffer: bytes.buffer, size: bytes.byteLength };
          }

          return null;
        };

        let q = initialQuality;
        let w = maxWidth;
        const maxAttempts = 3;
        const results: Array<{ size: number; q: number; w: number; buffer: ArrayBuffer }> = [];

        for (let i = 0; i < maxAttempts; i++) {
          try {
            const res = await attemptOptimize(q, w);
            if (res) {
              results.push({ size: res.size, q, w, buffer: res.buffer });
              console.log(`Optimization attempt ${i + 1}: width=${w}, q=${q} → ${(res.size / 1024).toFixed(1)} KB`);
              if (res.size <= targetKB * 1024) {
                optimizedBuffer = res.buffer;
                optimizedSize = res.size;
                break;
              }
            } else {
              console.warn(`Optimization attempt ${i + 1} returned no image`);
            }
          } catch (e) {
            console.warn(`Optimization attempt ${i + 1} failed:`, e);
          }

          if (q > minQuality) {
            q = Math.max(minQuality, q - 10);
          } else {
            w = Math.max(Math.floor(maxWidth * 0.7), Math.floor(w * 0.9));
          }
        }

        if (!optimizedBuffer || optimizedSize === undefined) {
          if (results.length > 0) {
            results.sort((a, b) => a.size - b.size);
            optimizedBuffer = results[0].buffer;
            optimizedSize = results[0].size;
          } else {
            console.warn('Image optimization failed, using original');
            optimizedBuffer = imageBuffer;
            optimizedSize = originalSize;
          }
        }

        console.log(`Final optimized size: ${(optimizedSize! / 1024).toFixed(1)} KB (target ${targetKB} KB)`);
      }
    } catch (error) {
      console.error('Image processing failed, using original:', error);
      optimizedBuffer = imageBuffer;
      optimizedSize = originalSize;
    }

    // Ensure safe values for next steps
    const finalBuffer: ArrayBuffer = optimizedBuffer ?? imageBuffer;
    const finalSize: number = optimizedSize ?? originalSize;

    // Create a unique, cache-busting filename using a short content hash
    const hashBuf = await crypto.subtle.digest('SHA-1', imageBuffer);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    const hash8 = hashArr.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 8);
    const optimizedFilename = `${filename}-${hash8}.webp`;

    // Step 5: Upload optimized image to Supabase Storage
    const uploadPath = clientId 
      ? `clients/${clientId}/optimized-images/${optimizedFilename}` 
      : `optimized-images/${optimizedFilename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client-assets')
      .upload(uploadPath, finalBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload optimized image: ${uploadError.message}`);
    }

    // Step 6: Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('client-assets')
      .getPublicUrl(uploadPath);

    console.log('Optimized image uploaded successfully:', publicUrl);

    // Step 6.5: Delete the original temp file to save storage space
    try {
      const tempPathMatch = imageUrl.match(/client-assets\/(.+)$/);
      if (tempPathMatch && tempPathMatch[1].startsWith('temp/')) {
        const tempPath = tempPathMatch[1];
        const { error: deleteError } = await supabase.storage
          .from('client-assets')
          .remove([tempPath]);
        
        if (deleteError) {
          console.warn('Failed to delete temp file:', tempPath, deleteError);
        } else {
          console.log('Deleted temp file:', tempPath);
        }
      }
    } catch (cleanupError) {
      console.warn('Error during temp file cleanup:', cleanupError);
      // Don't fail the entire process if cleanup fails
    }

    // Step 7: Store in client_images table if requested (for signup custom uploads)
    if (storeInDatabase && clientId) {
      try {
        // Handle temporary client IDs during signup differently
        if (clientId === 'temp-signup-client' || clientId === 'temp' || clientId === 'signup') {
          // For temporary uploads during signup, store metadata in generation_logs for later processing
          await supabase
            .from('generation_logs')
            .insert({
              type: 'image_optimization',
              status: 'pending_client_assignment',
              details: {
                image_url: publicUrl,
                alt_text: altText,
                original_filename: originalFilename || filename,
                upload_context: context,
                file_size_kb: Math.round(finalSize / 1024),
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
              file_size_kb: Math.round(finalSize / 1024)
            });
          console.log('Image stored in client_images table');
        }
      } catch (dbError) {
        console.warn('Failed to store image metadata:', dbError);
        // Don't fail the entire process for database storage issues
      }
    }

    // Step 8: Log the optimization
    try {
      await supabase
        .from('generation_logs')
        .insert({
          type: 'image_optimization',
          status: 'completed',
          details: {
            original_url: imageUrl,
            optimized_url: publicUrl,
            filename: optimizedFilename,
            alt_text: altText,
            original_size_kb: Math.round(originalSize / 1024),
            optimized_size_kb: Math.round(finalSize / 1024),
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
      optimizedSizeKB: Math.round(finalSize / 1024),
      compressionRatio: Math.round((1 - finalSize / originalSize) * 100),
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
          type: 'image_optimization',
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