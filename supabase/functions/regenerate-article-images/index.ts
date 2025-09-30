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
    const { articleId, regenerateAll } = await req.json();
    
    console.log('Regenerating article images...', { articleId, regenerateAll });

    let articles;
    
    if (regenerateAll) {
      // Get all published articles
      const { data, error } = await supabase
        .from('generated_articles')
        .select('id, title, meta_description, target_keyword, featured_image_url')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      articles = data;
    } else if (articleId) {
      // Get specific article
      const { data, error } = await supabase
        .from('generated_articles')
        .select('id, title, meta_description, target_keyword, featured_image_url')
        .eq('id', articleId)
        .single();
      
      if (error) throw error;
      articles = [data];
    } else {
      throw new Error('Either articleId or regenerateAll must be provided');
    }

    console.log(`Found ${articles.length} articles to regenerate images for`);

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const article of articles) {
      try {
        console.log(`Regenerating image for article: ${article.title}`);
        
        // Create image prompt from article data
        const imagePrompt = `${article.title}. ${article.meta_description || ''}. Keywords: ${article.target_keyword || ''}`.slice(0, 500);
        
        // Call generate-featured-image function
        const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-featured-image', {
          body: {
            articleId: article.id,
            imagePrompt,
            altText: `${article.title} - Professional restaurant image`
          }
        });

        if (imageError) {
          console.error(`Failed to regenerate image for article ${article.id}:`, imageError);
          failureCount++;
          results.push({
            articleId: article.id,
            title: article.title,
            success: false,
            error: imageError.message
          });
        } else {
          console.log(`Successfully regenerated image for article ${article.id}`);
          successCount++;
          results.push({
            articleId: article.id,
            title: article.title,
            success: true,
            imageUrl: imageData.imageUrl
          });
        }

        // Add delay between requests to avoid rate limiting
        if (articles.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error);
        failureCount++;
        results.push({
          articleId: article.id,
          title: article.title,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`Image regeneration complete: ${successCount} successful, ${failureCount} failed`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Regenerated images for ${successCount} of ${articles.length} articles`,
      successCount,
      failureCount,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error regenerating images:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to regenerate article images'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
