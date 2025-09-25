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

const openAIApiKey = Deno.env.get('chatgpt');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentGapId } = await req.json();
    
    if (!contentGapId) {
      throw new Error('Content gap ID is required');
    }

    console.log('Starting article generation for gap:', contentGapId);
    const startTime = Date.now();

    // Get content gap details
    const { data: contentGap } = await supabase
      .from('content_gaps')
      .select('*')
      .eq('id', contentGapId)
      .single();

    if (!contentGap) {
      throw new Error('Content gap not found');
    }

    // Log generation start
    const { data: logData } = await supabase
      .from('generation_logs')
      .insert({
        type: 'article_generation',
        status: 'started',
        content_gap_id: contentGapId,
        details: { topic: contentGap.topic }
      })
      .select()
      .single();

    // Update content gap status
    await supabase
      .from('content_gaps')
      .update({ status: 'in_progress' })
      .eq('id', contentGapId);

    // Generate article using ChatGPT
    const articlePrompt = `
You are a professional content writer for "Mi Restaurante Online", a restaurant website design company in Peru.

Create a comprehensive, SEO-optimized article about: "${contentGap.topic}"
Category: ${contentGap.category}
Target keywords: ${contentGap.target_keywords.join(', ')}

BRAND GUIDELINES:
- We help restaurants in Peru create professional websites
- Focus on Lima, Arequipa, Cusco and major Peruvian cities
- Emphasize local market knowledge and restaurant industry expertise
- Professional yet approachable tone
- Include costs in Peruvian Soles when relevant

ARTICLE STRUCTURE REQUIREMENTS:
1. ONE H1 title (engaging, includes main keyword)
2. Multiple H2 and H3 headings for structure
3. Use bullet points and numbered lists extensively
4. Include at least one data table with relevant information
5. Add internal links to our services (use relative paths like "/contacto")
6. Include 3-5 high-quality external links (no competitors, use rel="nofollow")
7. All links must have proper aria-labels for accessibility
8. Word count: 2000-3000 words
9. Include practical examples from Peruvian restaurant market

CONTENT REQUIREMENTS:
- Write in Spanish for Peruvian audience
- Include actionable tips and step-by-step guides
- Use local examples (restaurants in Lima districts, Peruvian cuisine types)
- Mention costs in Soles when relevant
- Include current 2025 trends and technologies
- Add FAQ section at the end

TECHNICAL REQUIREMENTS:
- Use proper HTML markup with semantic tags
- Images should have descriptive alt text
- Meta description (150-160 characters)
- Excerpt (150-200 characters)
- Estimated reading time
- Keywords array for SEO

Return ONLY a JSON object with this structure:
{
  "title": "Article title with main keyword",
  "slug": "url-friendly-slug",
  "excerpt": "Brief description 150-200 chars",
  "content": "Full HTML article content with proper markup",
  "metaDescription": "SEO meta description 150-160 chars",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "readingTime": estimated_minutes,
  "featuredImageAlt": "Descriptive alt text for featured image"
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert content writer specializing in restaurant industry content for the Peruvian market. Write comprehensive, SEO-optimized articles that provide real value to restaurant owners.' },
          { role: 'user', content: articlePrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    const gptData = await response.json();
    let articleData;
    
    try {
      let rawContent = gptData.choices[0].message.content;
      // Clean markdown formatting from ChatGPT response
      rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      articleData = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('Failed to parse GPT response:', gptData.choices[0].message.content);
      throw new Error('Invalid response format from AI');
    }

    // Create the article
    const { data: newArticle } = await supabase
      .from('generated_articles')
      .insert({
        title: articleData.title,
        slug: articleData.slug,
        category: contentGap.category,
        excerpt: articleData.excerpt,
        content: articleData.content,
        keywords: articleData.keywords,
        meta_description: articleData.metaDescription,
        reading_time: articleData.readingTime,
        featured_image_alt: articleData.featuredImageAlt,
        status: 'draft'
      })
      .select()
      .single();

    // Update content gap
    await supabase
      .from('content_gaps')
      .update({ 
        status: 'completed',
        article_id: newArticle.id
      })
      .eq('id', contentGapId);

    // Mark target keywords as covered
    for (const keyword of contentGap.target_keywords) {
      await supabase
        .from('target_keywords')
        .update({ 
          is_covered: true,
          covered_by_article_id: newArticle.id
        })
        .eq('keyword', keyword);
    }

    const processingTime = Date.now() - startTime;

    // Update log
    await supabase
      .from('generation_logs')
      .update({
        status: 'completed',
        article_id: newArticle.id,
        details: { 
          word_count: articleData.content.split(' ').length,
          keywords_covered: contentGap.target_keywords.length
        },
        processing_time_ms: processingTime
      })
      .eq('id', logData.id);

    console.log(`Article generation completed in ${processingTime}ms`);

    return new Response(JSON.stringify({ 
      success: true, 
      article: newArticle,
      message: 'Article generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating article:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to generate article'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});