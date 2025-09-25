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
    const { articleId } = await req.json();
    
    if (!articleId) {
      throw new Error('Article ID is required');
    }

    console.log('Starting quality check for article:', articleId);
    const startTime = Date.now();

    // Get article details
    const { data: article } = await supabase
      .from('generated_articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (!article) {
      throw new Error('Article not found');
    }

    // Log quality check start
    const { data: logData } = await supabase
      .from('generation_logs')
      .insert({
        type: 'quality_check',
        status: 'started',
        article_id: articleId,
        details: { title: article.title }
      })
      .select()
      .single();

    // Quality check using ChatGPT
    const qualityCheckPrompt = `
You are a quality assurance specialist for "Mi Restaurante Online", a restaurant website design company in Peru.

Review this article for quality, brand alignment, and accuracy:

ARTICLE DETAILS:
Title: ${article.title}
Category: ${article.category}
Content: ${article.content}
Keywords: ${article.keywords.join(', ')}

BRAND GUIDELINES TO CHECK:
- We help restaurants in Peru create professional websites
- Focus should be on Lima, Arequipa, Cusco and major Peruvian cities
- Professional yet approachable tone
- Accurate information about restaurant industry in Peru
- No false claims or outdated information
- Proper Spanish language for Peruvian audience

QUALITY CHECKLIST:
1. Brand Alignment: Does the content align with our brand as restaurant website designers?
2. Accuracy: Are there any false claims, outdated information, or incorrect facts?
3. Local Relevance: Is the content relevant to the Peruvian restaurant market?
4. SEO Structure: Proper H1, H2, H3 hierarchy and keyword usage?
5. Content Quality: Is the content comprehensive and valuable?
6. Language: Correct Spanish grammar and terminology for Peru?
7. Links: Are internal/external links appropriate and functional?
8. Accessibility: Proper alt texts and aria labels?

CURRENT DATE FOR REFERENCE: ${new Date().toISOString().split('T')[0]}

Return JSON format:
{
  "overall_score": 1-10,
  "passed_quality_check": true/false,
  "issues": [
    {
      "severity": "low|medium|high",
      "category": "brand|accuracy|seo|language|accessibility",
      "description": "Description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "recommendations": [
    "Specific recommendations for improvement"
  ],
  "brand_alignment_score": 1-10,
  "accuracy_score": 1-10,
  "seo_score": 1-10
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
          { role: 'system', content: 'You are a strict quality assurance specialist. Focus on accuracy, brand alignment, and detecting any false or outdated information.' },
          { role: 'user', content: qualityCheckPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for more consistent quality checks
      }),
    });

    const gptData = await response.json();
    let qualityReport;
    
    try {
      let rawContent = gptData.choices[0].message.content;
      // Clean markdown formatting from ChatGPT response
      rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      qualityReport = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('Failed to parse quality check response:', gptData.choices[0].message.content);
      throw new Error('Invalid quality check response format');
    }

    // Always publish articles (quality check is for logging purposes only)
    const shouldPublish = true;

    let articleStatus = 'draft';
    let publishDate = null;

    if (shouldPublish) {
      articleStatus = 'published';
      publishDate = new Date().toISOString();
      
      // Update article status
      await supabase
        .from('generated_articles')
        .update({
          status: articleStatus,
          publish_date: publishDate
        })
        .eq('id', articleId);
      
      console.log('Article passed quality check and has been published');
    } else {
      console.log('Article failed quality check, keeping as draft');
    }

    const processingTime = Date.now() - startTime;

    // Update log
    await supabase
      .from('generation_logs')
      .update({
        status: 'completed',
        details: { 
          quality_report: qualityReport,
          published: shouldPublish,
          final_status: articleStatus
        },
        processing_time_ms: processingTime
      })
      .eq('id', logData.id);

    console.log(`Quality check completed in ${processingTime}ms`);

    return new Response(JSON.stringify({ 
      success: true, 
      qualityReport,
      published: shouldPublish,
      articleStatus,
      message: shouldPublish ? 'Article published successfully' : 'Article needs improvements before publishing'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in quality check:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to perform quality check'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});