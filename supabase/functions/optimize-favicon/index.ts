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
    const { imageUrl, clientId, restaurantName } = await req.json();
    
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    console.log('Starting favicon optimization for:', imageUrl);

    // Generate filename based on restaurant name
    const slugify = (s: string) => s.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    const baseFilename = slugify(restaurantName || 'restaurant') + '-favicon';

    // Download the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download original image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const originalSize = imageBuffer.byteLength;
    console.log(`Original image size: ${(originalSize / 1024).toFixed(2)} KB`);

    // Resize favicon to 32x32
    let optimizedBuffer: ArrayBuffer;
    let optimizedSize: number;
    
    try {
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      
      if (!lovableApiKey) {
        console.warn('LOVABLE_API_KEY not found, using original image');
        optimizedBuffer = imageBuffer;
        optimizedSize = originalSize;
      } else {
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
                    text: "Resize this image to exactly 32x32 pixels for use as a website favicon. Maintain the key visual elements."
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
          
          console.log(`Optimized favicon size: ${(optimizedSize / 1024).toFixed(2)} KB`);
        } else {
          optimizedBuffer = imageBuffer;
          optimizedSize = originalSize;
        }
      }
    } catch (error) {
      console.error('Favicon processing failed, using original:', error);
      optimizedBuffer = imageBuffer;
      optimizedSize = originalSize;
    }
    
    // Create hash for cache-busting
    const hashBuf = await crypto.subtle.digest('SHA-1', imageBuffer);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    const hash8 = hashArr.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 8);
    const optimizedFilename = `${baseFilename}-${hash8}.png`;

    // Upload to storage
    const uploadPath = clientId 
      ? `clients/${clientId}/favicon/${optimizedFilename}` 
      : `favicons/${optimizedFilename}`;

    const { error: uploadError } = await supabase.storage
      .from('client-assets')
      .upload(uploadPath, optimizedBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload favicon: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('client-assets')
      .getPublicUrl(uploadPath);

    console.log('Favicon optimized successfully:', publicUrl);

    // Log the optimization
    try {
      await supabase
        .from('generation_logs')
        .insert({
          type: 'favicon_optimization',
          status: 'completed',
          details: {
            original_url: imageUrl,
            optimized_url: publicUrl,
            filename: optimizedFilename,
            original_size_kb: Math.round(originalSize / 1024),
            optimized_size_kb: Math.round(optimizedSize / 1024),
            client_id: clientId,
            restaurant_name: restaurantName
          }
        });
    } catch (logError) {
      console.warn('Failed to log optimization:', logError);
    }

    return new Response(JSON.stringify({
      success: true,
      optimizedUrl: publicUrl,
      filename: optimizedFilename,
      message: 'Favicon optimized and stored successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error optimizing favicon:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to optimize favicon'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
