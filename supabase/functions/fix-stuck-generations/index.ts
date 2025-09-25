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
    console.log('Cleaning up stuck generation operations...');

    // Clean up stuck article generations (over 10 minutes old)
    const { data: stuckGenerations, error: selectError } = await supabase
      .from('generation_logs')
      .select('*')
      .eq('status', 'started')
      .lt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

    if (selectError) {
      throw new Error('Failed to query stuck generations: ' + selectError.message);
    }

    if (stuckGenerations && stuckGenerations.length > 0) {
      // Update stuck logs to failed
      const { error: updateError } = await supabase
        .from('generation_logs')
        .update({
          status: 'failed',
          error_message: 'Operation timed out - cleaned up by fix function',
          processing_time_ms: 600000 // 10 minutes
        })
        .eq('status', 'started')
        .lt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

      if (updateError) {
        throw new Error('Failed to update stuck generations: ' + updateError.message);
      }

      console.log(`Cleaned up ${stuckGenerations.length} stuck generation logs`);
    }

    // Clean up stuck content gaps
    const { data: stuckGaps, error: gapSelectError } = await supabase
      .from('content_gaps')
      .select('*')
      .eq('status', 'in_progress')
      .lt('updated_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

    if (gapSelectError) {
      throw new Error('Failed to query stuck content gaps: ' + gapSelectError.message);
    }

    if (stuckGaps && stuckGaps.length > 0) {
      // Reset stuck content gaps to identified
      const { error: gapUpdateError } = await supabase
        .from('content_gaps')
        .update({
          status: 'identified'
        })
        .eq('status', 'in_progress')
        .lt('updated_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

      if (gapUpdateError) {
        throw new Error('Failed to update stuck content gaps: ' + gapUpdateError.message);
      }

      console.log(`Reset ${stuckGaps.length} stuck content gaps`);
    }

    // Check for draft articles that should be published
    const { data: draftArticles, error: draftError } = await supabase
      .from('generated_articles')
      .select('*')
      .eq('status', 'draft');

    if (draftError) {
      throw new Error('Failed to query draft articles: ' + draftError.message);
    }

    let publishedCount = 0;
    if (draftArticles && draftArticles.length > 0) {
      for (const article of draftArticles) {
        // Simple quality check - if article has content and is complete, publish it
        if (article.content && article.content.length > 1000 && article.title && article.excerpt) {
          const { error: publishError } = await supabase
            .from('generated_articles')
            .update({
              status: 'published',
              publish_date: new Date().toISOString()
            })
            .eq('id', article.id);

          if (!publishError) {
            publishedCount++;
            console.log(`Published article: ${article.title}`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      stuck_generations_cleaned: stuckGenerations?.length || 0,
      stuck_gaps_reset: stuckGaps?.length || 0,
      articles_published: publishedCount,
      message: 'Cleanup completed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in cleanup function:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to cleanup stuck operations'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});