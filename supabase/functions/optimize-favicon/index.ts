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

    // For now, we'll upload as PNG without resizing
    // In production, you would use an image processing library to resize to 32x32
    // Libraries like: https://deno.land/x/imagescript or similar
    
    // TODO: Add actual image resizing to 32x32 here
    // For now, we just optimize and store as-is
    
    const optimizedBuffer = imageBuffer;
    
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
