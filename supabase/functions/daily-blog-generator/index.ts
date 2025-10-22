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
    console.log('Starting daily blog generation process...');
    const overallStartTime = Date.now();

    // Step 1: Analyze content gaps
    console.log('Step 1: Analyzing content gaps...');
    const gapAnalysisResponse = await supabase.functions.invoke('analyze-content-gaps');
    
    if (gapAnalysisResponse.error) {
      throw new Error('Content gap analysis failed: ' + gapAnalysisResponse.error.message);
    }
    
    const gapAnalysis = gapAnalysisResponse.data;
    
    if (!gapAnalysis || !gapAnalysis.success) {
      throw new Error('Content gap analysis failed: ' + (gapAnalysis?.error || 'Unknown error'));
    }

    // Get the highest priority content gap
    const { data: topGap } = await supabase
      .from('content_gaps')
      .select('*')
      .eq('status', 'identified')
      .order('priority_score', { ascending: false })
      .limit(1)
      .single();

    if (!topGap) {
      console.log('No content gaps found to work on today');
      return new Response(JSON.stringify({ 
        success: true,
        message: 'No content gaps to process today'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Selected topic for today:', topGap.topic);

    // Step 2: Generate article
    console.log('Step 2: Generating article...');
    const articleResponse = await supabase.functions.invoke('generate-article', {
      body: { contentGapId: topGap.id }
    });
    
    if (articleResponse.error) {
      throw new Error('Article generation failed: ' + articleResponse.error.message);
    }
    
    const articleResult = articleResponse.data;
    
    if (!articleResult || !articleResult.success) {
      throw new Error('Article generation failed: ' + (articleResult?.error || 'Unknown error'));
    }

    const article = articleResult.article;
    console.log('Article generated:', article.title);

    // Step 3: Generate featured image
    console.log('Step 3: Generating featured image...');
    // Create visual-only prompt that describes the scene without any text elements
    const imagePrompt = `Professional high-quality restaurant photography showing the concept of ${article.category}. Scene description: ${article.featured_image_alt}. Pure visual composition, no typography, no words, no letters, no signage, no menu text, no price tags visible.`;
    
    const imageResponse = await supabase.functions.invoke('generate-featured-image', {
      body: { 
        articleId: article.id,
        imagePrompt: imagePrompt,
        altText: article.featured_image_alt
      }
    });
    
    const imageResult = imageResponse.data;
    
    if (imageResponse.error || !imageResult || !imageResult.success) {
      console.warn('Image generation failed:', imageResponse.error?.message || imageResult?.error || 'Unknown error');
      // Continue without image - not critical
    } else {
      console.log('Featured image generated successfully');
    }

    // Step 4: Quality check
    console.log('Step 4: Performing quality check...');
    const qualityResponse = await supabase.functions.invoke('quality-check-article', {
      body: { articleId: article.id }
    });
    
    if (qualityResponse.error) {
      throw new Error('Quality check failed: ' + qualityResponse.error.message);
    }
    
    const qualityResult = qualityResponse.data;
    
    if (!qualityResult || !qualityResult.success) {
      throw new Error('Quality check failed: ' + (qualityResult?.error || 'Unknown error'));
    }

    const overallProcessingTime = Date.now() - overallStartTime;

    // Final summary log
    const { data: summaryLog } = await supabase
      .from('generation_logs')
      .insert({
        type: 'publish',
        status: 'completed',
        article_id: article.id,
        content_gap_id: topGap.id,
        details: {
          daily_generation: true,
          article_title: article.title,
          published: qualityResult.published,
          quality_score: qualityResult.qualityReport?.overall_score,
          has_featured_image: !!imageResult.success,
          total_processing_time_ms: overallProcessingTime
        },
        processing_time_ms: overallProcessingTime
      })
      .select()
      .single();

    console.log(`Daily blog generation completed in ${overallProcessingTime}ms`);
    console.log(`Article "${article.title}" - Published: ${qualityResult.published}`);

    return new Response(JSON.stringify({ 
      success: true,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        published: qualityResult.published,
        status: qualityResult.articleStatus
      },
      qualityReport: qualityResult.qualityReport,
      processingTime: overallProcessingTime,
      message: `Daily article "${article.title}" ${qualityResult.published ? 'published' : 'created as draft'} successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in daily blog generation:', error);
    
    // Log the error
    await supabase
      .from('generation_logs')
      .insert({
        type: 'publish',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        details: { daily_generation: true }
      });
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Daily blog generation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});