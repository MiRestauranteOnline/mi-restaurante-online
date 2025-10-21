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

    // Step 4: Resize/compress via Supabase Image Transformations with strict size caps
    let optimizedBuffer: ArrayBuffer | undefined;
    let optimizedSize: number | undefined;

    try {
      // Build a render URL from the original public object URL
      const buildRenderUrl = (width: number, quality: number) => {
        try {
          const u = new URL(imageUrl);
          u.pathname = u.pathname.replace('/object/', '/render/image/');
          u.searchParams.set('width', String(width));
          u.searchParams.set('format', 'webp');
          u.searchParams.set('quality', String(quality));
          u.searchParams.set('resize', 'contain');
          return u.toString();
        } catch {
          // Fallback string replace
          const base = imageUrl.replace('/object/', '/render/image/');
          const sep = base.includes('?') ? '&' : '?';
          return `${base}${sep}width=${width}&format=webp&quality=${quality}&resize=contain`;
        }
      };

        const attemptTransform = async (q: number, width: number): Promise<{ buffer: ArrayBuffer; size: number } | null> => {
          const isLikelyWebP = (buf: ArrayBuffer) => {
            const b = new Uint8Array(buf);
            return b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
          };

          const url = buildRenderUrl(width, q);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          try {
            const resp = await fetch(url, { signal: controller.signal });
            if (!resp.ok) return null;
            const buf = await resp.arrayBuffer();
            if (resp.headers.get('content-type')?.includes('image/webp') !== true) {
              console.warn(`Transform content-type not webp (w=${width}, q=${q}) => ${resp.headers.get('content-type')}`);
            }
            if (!isLikelyWebP(buf)) {
              console.warn(`Transform returned non-WebP bytes (w=${width}, q=${q}), ignoring.`);
              return null;
            }
            return { buffer: buf, size: buf.byteLength };
          } finally {
            clearTimeout(timeoutId);
          }
        };

      // Iteratively try qualities first, then reduce width if still above target
      let widthCandidates: number[];
      let qCandidatesBase: number[];
      if (context === 'menu-item') {
        widthCandidates = [Math.min(maxWidth, 800), 700, 600];
        qCandidatesBase = [70, 60, 50, 40, 35];
      } else if (context === 'hero-background') {
        widthCandidates = [maxWidth, 1600, 1400];
        qCandidatesBase = [70, 60, 50];
      } else if (context === 'carousel') {
        widthCandidates = [maxWidth, 900, 800];
        qCandidatesBase = [70, 60, 50];
      } else {
        widthCandidates = [maxWidth, Math.floor(maxWidth * 0.9), Math.floor(maxWidth * 0.8)];
        qCandidatesBase = [75, 65, 55, 45];
      }
      qCandidatesBase = qCandidatesBase.filter((q) => q >= Math.max(35, minQuality));
      const results: Array<{ size: number; q: number; w: number; buffer: ArrayBuffer }> = [];
      const start = Date.now();
      const maxMs = 15000;

      outer: for (const w of widthCandidates) {
        for (const q of qCandidatesBase) {
          if (Date.now() - start > maxMs) {
            console.warn('Transform attempts timed out by total budget');
            break outer;
          }
          try {
            const r = await attemptTransform(q, w);
            if (r) {
              results.push({ size: r.size, q, w, buffer: r.buffer });
              console.log(`Transform attempt: width=${w}, q=${q} → ${(r.size / 1024).toFixed(1)} KB`);
              if (r.size <= targetKB * 1024) {
                optimizedBuffer = r.buffer;
                optimizedSize = r.size;
                break outer;
              }
            } else {
              console.warn(`Transform attempt failed to return data (w=${w}, q=${q})`);
            }
          } catch (e) {
            console.warn(`Transform attempt error (w=${w}, q=${q}):`, e);
          }
        }
      }

      // Choose smallest result if target not reached
      if (!optimizedBuffer || optimizedSize === undefined) {
        if (results.length > 0) {
          results.sort((a, b) => a.size - b.size);
          optimizedBuffer = results[0].buffer;
          optimizedSize = results[0].size;
        } else {
          optimizedBuffer = undefined;
          optimizedSize = undefined;
        }
      }

      // If still above target or no valid transform, try Lovable AI fallback once
      if (!optimizedBuffer || optimizedSize! > targetKB * 1024) {
        try {
          const base64Image = btoa(
            new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          const dataUrl = `data:image/jpeg;base64,${base64Image}`;

          const aiAttempt = async (q: number, width: number): Promise<{ buffer: ArrayBuffer; size: number } | null> => {
            const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-image-preview",
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: `Resize to width ${width}px (keep aspect). Re-encode as WebP with quality ${q}. Strip all metadata. Max size ${targetKB} KB. Prioritize strong compression with acceptable visual quality for web menus.` },
                      { type: "image_url", image_url: { url: dataUrl } }
                    ]
                  }
                ],
                modalities: ["image"]
              })
            });
            const data = await resp.json();
            const editedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            if (editedImageUrl && editedImageUrl.startsWith('data:image')) {
              const b64 = editedImageUrl.split(',')[1];
              const bin = atob(b64);
              const bytes = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
              // validate WebP header
              if (bytes.length > 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
                return { buffer: bytes.buffer, size: bytes.byteLength };
              }
            }
            return null;
          };

          const aiWidths = [maxWidth, Math.floor(maxWidth * 0.9), Math.floor(maxWidth * 0.8), 700, 600, 500];
          const aiQualities = [60, 50, 40, 35];
          const aiResults: Array<{ size: number; q: number; w: number; buffer: ArrayBuffer }> = [];

          outerAI: for (const w of aiWidths) {
            for (const q of aiQualities) {
              const r = await aiAttempt(q, w);
              if (r) {
                aiResults.push({ size: r.size, q, w, buffer: r.buffer });
                console.log(`AI attempt: width=${w}, q=${q} → ${(r.size / 1024).toFixed(1)} KB`);
                if (r.size <= targetKB * 1024) {
                  optimizedBuffer = r.buffer;
                  optimizedSize = r.size;
                  break outerAI;
                }
              }
            }
          }

          if (!optimizedBuffer || optimizedSize === undefined) {
            if (aiResults.length > 0) {
              aiResults.sort((a, b) => a.size - b.size);
              optimizedBuffer = aiResults[0].buffer;
              optimizedSize = aiResults[0].size;
            } else {
              optimizedBuffer = imageBuffer;
              optimizedSize = originalSize;
            }
          }
        } catch (e) {
          console.warn('AI fallback failed, using original image:', e);
          optimizedBuffer = imageBuffer;
          optimizedSize = originalSize;
        }
      }

      console.log(`Final optimized size: ${(optimizedSize! / 1024).toFixed(1)} KB (target ${targetKB} KB)`);
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