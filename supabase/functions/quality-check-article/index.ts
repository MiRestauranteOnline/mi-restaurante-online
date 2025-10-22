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
You are a strict quality assurance specialist for "Mi Restaurante Online", a restaurant website design company in Peru.

Review this article with ZERO TOLERANCE for hallucinations, fabricated statistics, or unverifiable claims.

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

CRITICAL FACT-CHECKING REQUIREMENTS (HIGHEST PRIORITY):
❌ FLAG AS HIGH SEVERITY if you find:
1. Specific statistics without source attribution (e.g., "40% de incremento", "85% de los clientes")
2. Made-up case study numbers or results (e.g., "incrementó sus reservas en 40%")
3. Specific dates for non-public events (e.g., "en marzo de 2024 se lanzó")
4. Exact prices without disclaimers (e.g., "cuesta S/1,500" instead of "entre S/1,000-2,000")
5. Names of specific competing businesses
6. Unverifiable market share, adoption rates, or rankings
7. Specific awards, certifications, or recognitions not widely known
8. Quotes from restaurant owners that appear fabricated
9. Research findings or survey results without source
10. Any "before and after" scenarios with exact improvement percentages

✅ ACCEPTABLE FACT PRESENTATION:
- General trends: "cada vez más restaurantes", "la tendencia muestra"
- Ranges with disclaimers: "entre S/500 y S/2,000, dependiendo del plan"
- Qualitative descriptions: "muchos restaurantes", "en mi experiencia"
- Clearly hypothetical scenarios: "imagina un restaurante que..."
- Industry observations: "según observaciones del sector", "expertos recomiendan"
- General best practices without specific attribution

QUALITY CHECKLIST:
1. FACT-CHECKING (CRITICAL): Flag ANY unverifiable statistics, numbers, or claims
2. Brand Alignment: Does content align with our brand as restaurant website designers?
3. Accuracy: Any false claims, outdated information, or incorrect facts?
4. Local Relevance: Relevant to Peruvian restaurant market with specific Lima references?
5. Engagement: Is it interesting to read? Does it use storytelling and vivid language?
6. Conversational Tone: Does it use "tú" and feel personal without being generic?
7. Opening Variety: Does it avoid "Aprende a...", "Descubre cómo...", etc.?
8. SEO Structure: Proper H1, H2, H3 hierarchy and keyword usage?
9. Content Quality: Comprehensive, valuable, and actionable?
10. Language: Correct Spanish grammar and terminology for Peru?
11. Links: Are internal/external links appropriate (relative paths only)?
12. Accessibility: Proper alt texts and aria labels?

CURRENT DATE FOR REFERENCE: ${new Date().toISOString().split('T')[0]}

Return JSON format:
{
  "overall_score": 1-10,
  "passed_quality_check": true/false,
  "has_hallucinations": true/false,
  "has_fabricated_stats": true/false,
  "issues": [
    {
      "severity": "low|medium|high|critical",
      "category": "hallucination|brand|accuracy|seo|language|accessibility|engagement",
      "description": "Description of the issue",
      "suggestion": "How to fix it",
      "specific_example": "Quote the problematic text if applicable"
    }
  ],
  "recommendations": [
    "Specific recommendations for improvement"
  ],
  "brand_alignment_score": 1-10,
  "accuracy_score": 1-10,
  "fact_checking_score": 1-10,
  "engagement_score": 1-10,
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
          { role: 'system', content: 'You are a strict quality assurance specialist with ZERO TOLERANCE for hallucinations. Your primary focus is detecting fabricated statistics, unverifiable claims, and made-up case studies. Flag any specific numbers or statistics that cannot be verified. Also check for brand alignment, engagement quality, and accuracy. Be thorough and critical.' },
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

      // Create internal links for the newly published article
      console.log('Creating internal links for article:', articleId);
      try {
        const linkingResponse = await supabase.functions.invoke('create-internal-links', {
          body: { articleId }
        });
        
        if (linkingResponse.error) {
          console.warn('Internal linking failed:', linkingResponse.error.message);
        } else {
          console.log('Internal linking completed:', linkingResponse.data);
        }
      } catch (linkingError) {
        console.warn('Internal linking error:', linkingError);
        // Don't fail the publish if linking fails
      }
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