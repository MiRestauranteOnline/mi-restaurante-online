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

    // Get current date for context
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' });

    // Get brand profile
    const { data: brandProfile } = await supabase
      .from('brand_profile')
      .select('*')
      .limit(1)
      .single();

    if (!brandProfile) {
      throw new Error('Brand profile not found. Please configure brand profile first.');
    }

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

    // Get existing published articles for internal linking
    const { data: existingArticles } = await supabase
      .from('generated_articles')
      .select('title, slug, category, keywords')
      .eq('status', 'published')
      .limit(20);

    const availableArticles = existingArticles ? existingArticles.map(a => 
      `- "${a.title}" (/guia/${a.category}/${a.slug}) [Keywords: ${a.keywords.join(', ')}]`
    ).join('\n') : 'No existing articles available yet.';

    console.log('Loaded brand profile and context for generation');

    // Generate article using ChatGPT
    const articlePrompt = `
You are Kevin van Geffen, writing for "Mi Restaurante Online", a restaurant website design company in Peru.

CURRENT DATE CONTEXT:
- Today's date: ${currentDate.toLocaleDateString('es-ES')}
- Current year: ${currentYear}
- Current month: ${currentMonth}
- CRITICAL: Always reference ${currentYear} for current trends, statistics, and "this year" references
- When discussing recent events, they should be from 2024 or ${currentYear}

YOUR AUTHOR PROFILE (Kevin van Geffen):
${brandProfile.founder_bio}

ABOUT YOUR COMPANY (${brandProfile.company_name}):
${brandProfile.company_description}

Target Audience: ${brandProfile.target_audience}

Key Differentiators:
${brandProfile.key_differentiators.map((d: string) => `- ${d}`).join('\n')}

Services We Offer:
${brandProfile.primary_services.map((s: string) => `- ${s}`).join('\n')}

Geographic Focus: ${brandProfile.geographic_focus.join(', ')}

Brand Values:
${brandProfile.brand_values.map((v: string) => `- ${v}`).join('\n')}

Tone of Voice: ${brandProfile.tone_of_voice}

ARTICLE ASSIGNMENT:
Create a comprehensive, SEO-optimized article about: "${contentGap.topic}"
Category: ${contentGap.category}
Target keywords: ${contentGap.target_keywords.join(', ')}

CRITICAL FACT-CHECKING REQUIREMENTS:
❌ ABSOLUTELY PROHIBITED - DO NOT INCLUDE:
1. Specific statistics or numbers you're not 100% certain about
2. Exact dates of events unless widely known
3. Specific prices for services/products you don't know
4. Names of specific businesses or competitors
5. Claims about market share percentages
6. Exact user counts or adoption rates
7. Specific awards or certifications unless verified

✅ WHAT YOU CAN INCLUDE:
1. General trends and observations (e.g., "cada vez más restaurantes", "la tendencia actual")
2. Ranges instead of exact numbers (e.g., "entre S/500 y S/2,000" instead of "S/1,247")
3. Qualitative descriptions (e.g., "muchos restaurantes", "la mayoría de los clientes")
4. General best practices and recommendations
5. Your own company's services and approach
6. Generic advice that applies broadly
7. Conceptual explanations and how-to guides

FACT-CHECKING APPROACH:
- If you're about to write a specific statistic, STOP and ask: "Am I 100% certain this is accurate?"
- If uncertain, rephrase to be more general or omit entirely
- Use phrases like "según estudios recientes", "se estima que", "aproximadamente" when discussing trends
- Never fabricate numbers, dates, or specific claims
- When in doubt, focus on actionable advice rather than statistics

INTERNAL LINKING REQUIREMENTS (MANDATORY):
1. HOMEPAGE LINK: Include exactly 1 link to "/" with keyword-rich anchor text related to restaurant websites (e.g., "crear página web para restaurante", "diseño web restaurante Lima", "sitio web restaurante profesional")

2. ARTICLE LINKS: Include 2-3 internal links to existing articles when contextually relevant:
${availableArticles}

3. CONTACT LINK: Include 1 link to "/contacto" with relevant anchor text (e.g., "contacta con nuestros especialistas", "solicita una consulta gratuita")

CRITICAL LINK FORMATTING REQUIREMENTS:
- ⚠️ ONLY use RELATIVE paths: /guia/category/slug, /, /contacto, /acerca-de
- ❌ NEVER use full domain URLs like https://mirestaurante.lovable.app/...
- ❌ NEVER hardcode any domain names in links
- ✅ CORRECT: <a href="/guia/diseno-web/precios-web">precios de diseño web</a>
- ❌ INCORRECT: <a href="https://mirestaurante.lovable.app/guia/diseno-web/precios-web">precios de diseño web</a>
- All links must have descriptive anchor text with target keywords
- Add proper aria-labels for accessibility
- Natural integration within the content flow
- No external competitor links

ARTICLE STRUCTURE REQUIREMENTS:
1. ONE H1 title (engaging, includes main keyword)
2. Multiple H2 and H3 headings for structure
3. Use bullet points and numbered lists extensively
4. Include at least one data table with relevant information
5. Add the required internal links naturally throughout content
6. Include 2-3 high-quality external links (authoritative sources, no competitors, use rel="nofollow")
7. Word count: 2000-3000 words
8. Include practical examples from Peruvian restaurant market

CONTENT REQUIREMENTS:
- Write in Spanish for Peruvian audience from Kevin van Geffen's perspective
- Include actionable tips and step-by-step guides
- Use local examples (restaurants in Lima districts, Peruvian cuisine types) but keep them general
- Mention cost ranges in Soles when relevant (use ranges, not exact amounts)
- Reference ${currentYear} trends and current technologies
- Add FAQ section at the end
- Write as an expert sharing knowledge, not making unverifiable claims
- Focus on practical, actionable advice over statistics

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
          { 
            role: 'system', 
            content: `You are Kevin van Geffen, co-founder of Mi Restaurante Online. You are an expert in restaurant website development and digital marketing for the Peruvian market. 

CRITICAL INSTRUCTIONS:
1. Write from your perspective as Kevin van Geffen
2. Always use the current year ${currentYear} when discussing trends, "this year", or recent developments
3. NEVER fabricate statistics, specific numbers, or unverifiable claims
4. When uncertain about a fact, either omit it or make it more general
5. Focus on actionable advice and your actual expertise
6. Use ONLY relative paths for internal links (/, /contacto, /guia/category/slug)
7. NEVER include full domain URLs in links

Your goal is to write helpful, accurate, and valuable content for restaurant owners based on your real experience and knowledge.` 
          },
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