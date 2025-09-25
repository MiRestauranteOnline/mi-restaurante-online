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
    console.log('Seeding target keywords for restaurant industry...');

    const targetKeywords = [
      // Desarrollo Web
      { keyword: 'diseño web restaurante Lima', category: 'desarrollo-web', search_volume: 1200, difficulty: 6, priority: 9 },
      { keyword: 'página web restaurante Peru', category: 'desarrollo-web', search_volume: 800, difficulty: 5, priority: 8 },
      { keyword: 'sitio web restaurante Arequipa', category: 'desarrollo-web', search_volume: 300, difficulty: 4, priority: 7 },
      { keyword: 'web design restaurante Cusco', category: 'desarrollo-web', search_volume: 250, difficulty: 4, priority: 6 },
      { keyword: 'crear página web restaurante', category: 'desarrollo-web', search_volume: 900, difficulty: 5, priority: 8 },
      { keyword: 'diseño responsive restaurante', category: 'desarrollo-web', search_volume: 400, difficulty: 6, priority: 7 },
      
      // Marketing Digital
      { keyword: 'marketing digital restaurantes Peru', category: 'marketing-digital', search_volume: 600, difficulty: 6, priority: 8 },
      { keyword: 'publicidad online restaurante Lima', category: 'marketing-digital', search_volume: 450, difficulty: 5, priority: 7 },
      { keyword: 'redes sociales restaurante', category: 'marketing-digital', search_volume: 800, difficulty: 4, priority: 7 },
      { keyword: 'SEO restaurante local', category: 'marketing-digital', search_volume: 350, difficulty: 7, priority: 8 },
      { keyword: 'email marketing restaurante', category: 'marketing-digital', search_volume: 200, difficulty: 5, priority: 6 },
      { keyword: 'Google Ads restaurante', category: 'marketing-digital', search_volume: 500, difficulty: 6, priority: 7 },
      
      // Tecnología Restaurante
      { keyword: 'sistema POS restaurante', category: 'tecnologia-restaurante', search_volume: 700, difficulty: 6, priority: 8 },
      { keyword: 'menu digital QR restaurante', category: 'tecnologia-restaurante', search_volume: 900, difficulty: 5, priority: 9 },
      { keyword: 'delivery online restaurante', category: 'tecnologia-restaurante', search_volume: 1100, difficulty: 7, priority: 8 },
      { keyword: 'reservas online restaurante', category: 'tecnologia-restaurante', search_volume: 600, difficulty: 5, priority: 7 },
      { keyword: 'app restaurante Peru', category: 'tecnologia-restaurante', search_volume: 400, difficulty: 6, priority: 6 },
      { keyword: 'sistema inventario restaurante', category: 'tecnologia-restaurante', search_volume: 300, difficulty: 5, priority: 6 },
      
      // Casos de Éxito
      { keyword: 'casos exitosos restaurantes Peru', category: 'casos-exito', search_volume: 150, difficulty: 3, priority: 5 },
      { keyword: 'restaurantes famosos Lima web', category: 'casos-exito', search_volume: 200, difficulty: 4, priority: 6 },
      { keyword: 'testimonios clientes restaurante', category: 'casos-exito', search_volume: 100, difficulty: 3, priority: 5 },
      
      // Guías Prácticas
      { keyword: 'como abrir restaurante Peru', category: 'guias-practicas', search_volume: 1500, difficulty: 5, priority: 9 },
      { keyword: 'licencias restaurante Lima', category: 'guias-practicas', search_volume: 800, difficulty: 4, priority: 7 },
      { keyword: 'costos abrir restaurante', category: 'guias-practicas', search_volume: 1200, difficulty: 5, priority: 8 },
      { keyword: 'equipos cocina restaurante', category: 'guias-practicas', search_volume: 600, difficulty: 4, priority: 6 },
      { keyword: 'personal restaurante contratar', category: 'guias-practicas', search_volume: 400, difficulty: 4, priority: 6 },
      { keyword: 'carta restaurante diseño', category: 'guias-practicas', search_volume: 500, difficulty: 4, priority: 7 },
      { keyword: 'precios restaurante estrategia', category: 'guias-practicas', search_volume: 300, difficulty: 5, priority: 6 },
      { keyword: 'ubicación restaurante elegir', category: 'guias-practicas', search_volume: 450, difficulty: 4, priority: 7 },
      { keyword: 'decoración restaurante ideas', category: 'guias-practicas', search_volume: 350, difficulty: 3, priority: 5 },
      { keyword: 'higiene restaurante normas', category: 'guias-practicas', search_volume: 250, difficulty: 4, priority: 6 },
    ];

    console.log(`Inserting ${targetKeywords.length} keywords...`);

    // Insert keywords in batches to avoid overwhelming the system
    const batchSize = 10;
    let inserted = 0;
    
    for (let i = 0; i < targetKeywords.length; i += batchSize) {
      const batch = targetKeywords.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('target_keywords')
        .upsert(batch, { 
          onConflict: 'keyword',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Error inserting batch ${i}-${i + batch.length}:`, error);
      } else {
        inserted += batch.length;
        console.log(`Inserted batch ${i}-${i + batch.length}`);
      }
    }

    console.log(`Successfully seeded ${inserted} target keywords`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Successfully seeded ${inserted} target keywords`,
      total_keywords: inserted
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error seeding keywords:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to seed keywords'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});