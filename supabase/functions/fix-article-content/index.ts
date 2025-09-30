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
    console.log('Starting article content fixes...');

    // Get all published articles
    const { data: articles, error } = await supabase
      .from('generated_articles')
      .select('id, title, content, slug, category')
      .eq('status', 'published');

    if (error) throw error;

    console.log(`Found ${articles.length} articles to process`);

    let updatedCount = 0;
    const updates = [];

    for (const article of articles) {
      let content = article.content;
      let wasModified = false;

      // Fix 1: Replace 2024 with 2025 for current year references
      // Be careful to only replace year references in appropriate contexts
      const yearReplacements = [
        /en 2024/gi,
        /para 2024/gi,
        /durante 2024/gi,
        /del 2024/gi,
        /año 2024/gi,
        /este año \(2024\)/gi,
        /temporada 2024/gi
      ];

      yearReplacements.forEach(pattern => {
        const replacement = pattern.source.replace('2024', '2025');
        if (content.match(pattern)) {
          content = content.replace(pattern, replacement.replace(/\\/g, ''));
          wasModified = true;
        }
      });

      // Fix 2: Replace hardcoded domain URLs with relative paths
      const domainPatterns = [
        /https:\/\/mirestaurante\.lovable\.app\//gi,
        /https:\/\/mirestaurante\.lovable\.dev\//gi,
        /http:\/\/mirestaurante\.lovable\.app\//gi,
        /http:\/\/mirestaurante\.lovable\.dev\//gi,
        /href="https:\/\/[^"]*lovable\.(app|dev)\/([^"]*)"/gi
      ];

      domainPatterns.forEach(pattern => {
        if (content.match(pattern)) {
          // Replace full URLs with relative paths
          content = content.replace(
            /href="https?:\/\/[^"]*lovable\.(app|dev)\/(guia\/[^"]*)"/gi,
            'href="/$2"'
          );
          content = content.replace(
            /href="https?:\/\/[^"]*lovable\.(app|dev)\/contacto"/gi,
            'href="/contacto"'
          );
          content = content.replace(
            /href="https?:\/\/[^"]*lovable\.(app|dev)\/acerca-de"/gi,
            'href="/acerca-de"'
          );
          content = content.replace(
            /href="https?:\/\/[^"]*lovable\.(app|dev)\/?"/gi,
            'href="/"'
          );
          wasModified = true;
        }
      });

      // Fix 3: Clean up any remaining absolute URLs that should be relative
      content = content.replace(
        /href="https?:\/\/[^"]*mirestauranteonline\.[^"]*\/(guia\/[^"]*)"/gi,
        'href="/$1"'
      );

      if (wasModified) {
        updates.push({
          id: article.id,
          content: content
        });
        updatedCount++;
        console.log(`Updated article: ${article.title}`);
      }
    }

    // Batch update all modified articles
    if (updates.length > 0) {
      for (const update of updates) {
        await supabase
          .from('generated_articles')
          .update({ content: update.content })
          .eq('id', update.id);
      }
    }

    console.log(`Article content fixes completed. Updated ${updatedCount} articles.`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Successfully fixed ${updatedCount} of ${articles.length} articles`,
      updatedCount,
      totalArticles: articles.length,
      fixes: [
        'Replaced 2024 references with 2025 where appropriate',
        'Converted hardcoded domain URLs to relative paths',
        'Cleaned up absolute URLs for internal links'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fixing article content:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to fix article content'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
