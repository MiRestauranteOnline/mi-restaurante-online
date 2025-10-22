import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const articleId = 'f9087c92-6880-4fb3-8884-9206a93e17b8';

    // Get current content
    const { data: article, error: fetchError } = await supabase
      .from('generated_articles')
      .select('content')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      throw new Error('Article not found');
    }

    // Remove the problematic links
    const updatedContent = article.content.replace(
      '<li><strong>Diferenciación:</strong> En un mercado competitivo como Lima, un buen testimonio puede ser la diferencia entre que un cliente elija tu restaurante o el de al lado. <a href="https://www.peru.info/es/restaurantes" target="_blank" rel="nofollow noopener noreferrer" class="text-primary hover:underline">Información sobre la industria de restaurantes en Perú</a> <a href="https://www.peruvianrestaurants.com" target="_blank" rel="nofollow noopener noreferrer" class="text-primary hover:underline">estrategias de marketing para restaurantes <a href="https://www.culinaryinstitute.edu" target="_blank" rel="nofollow noopener noreferrer" class="text-primary hover:underline">investigaciones sobre gastronomía</a></a></li>',
      '<li><strong>Diferenciación:</strong> En un mercado competitivo como Lima, un buen testimonio puede ser la diferencia entre que un cliente elija tu restaurante o el de al lado.</li>'
    );

    // Update the article
    const { error: updateError } = await supabase
      .from('generated_articles')
      .update({ content: updatedContent, updated_at: new Date().toISOString() })
      .eq('id', articleId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Article updated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
