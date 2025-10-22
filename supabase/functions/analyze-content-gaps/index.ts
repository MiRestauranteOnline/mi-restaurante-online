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
    console.log('Starting content gap analysis...');
    const startTime = Date.now();

    // Log the analysis start
    const { data: logData } = await supabase
      .from('generation_logs')
      .insert({
        type: 'gap_analysis',
        status: 'started',
        details: { analysis_type: 'topical_authority' }
      })
      .select()
      .single();

    // Get existing articles, keywords, and content gaps to avoid duplicates
    const { data: existingArticles } = await supabase
      .from('generated_articles')
      .select('title, category, keywords')
      .eq('status', 'published');

    const { data: targetKeywords } = await supabase
      .from('target_keywords')
      .select('*')
      .eq('is_covered', false)
      .order('priority', { ascending: false });

    const { data: existingGaps } = await supabase
      .from('content_gaps')
      .select('topic, category, target_keywords, status');

    // Analyze content gaps using ChatGPT
    const gapAnalysisPrompt = `
You are a content strategist for "Mi Restaurante Online", a restaurant website design company in Peru.

Current published articles:
${JSON.stringify(existingArticles, null, 2)}

Target keywords not yet covered:
${JSON.stringify(targetKeywords, null, 2)}

EXISTING content gaps already identified (DO NOT DUPLICATE THESE):
${JSON.stringify(existingGaps, null, 2)}

Restaurant industry categories we cover:
- desarrollo-web (web development for restaurants)
- marketing-digital (digital marketing for restaurants)  
- tecnologia-restaurante (restaurant technology)
- casos-exito (success cases)
- guias-practicas (practical guides)

**CRITICAL TOPICAL AUTHORITY GAPS FOR PERU:**

Our analysis shows we need stronger coverage in these strategic areas to build true topical authority:

**1. LEGAL & REGULATORY (Peru-specific):**
- Licenses, permits, and health regulations (DIGESA, INDECOPI, municipal requirements)
- Labor laws and employment regulations for restaurants
- Food safety and sanitation compliance
- Alcohol licensing and requirements

**2. FINANCIAL MANAGEMENT:**
- Cost control and profit margin optimization
- Pricing strategies for the Peruvian market
- Inventory management and waste reduction
- Tax obligations and accounting for restaurants
- POS systems and payment processing

**3. OPERATIONS & LOGISTICS:**
- Supplier management and reliable vendors in Lima/Peru
- Staff training, retention, and productivity
- Kitchen workflow optimization
- Food waste management and sustainability

**4. LOCAL MARKET DYNAMICS:**
- Delivery platforms (Rappi, PedidosYa, Uber Eats) optimization
- Seasonal marketing (Fiestas Patrias, Christmas, etc.)
- Competition analysis and differentiation
- Local food trends and Peruvian gastronomy

**5. CUSTOMER EXPERIENCE:**
- Reservation systems and table management
- Customer loyalty programs specific to Peru
- Handling customer complaints and reviews
- Service quality standards

**CRITICAL ANTI-DUPLICATE RULES:**

1. **NO LOCATION DUPLICATES**: NEVER suggest the same topic with different city names (e.g., "Marketing Digital en Lima" vs "Marketing Digital en Cusco"). Focus on Lima ONLY or create Peru-wide guides.

2. **NO SEMANTIC DUPLICATES**: Avoid topics that are too similar to existing content:
   - "Estrategias de Marketing Digital" is TOO SIMILAR to "Marketing Digital para Restaurantes"
   - "Diseño de Sitios Web" is TOO SIMILAR to "Diseño Web para Restaurantes"
   - Check if existing articles already cover the same concept, even with different wording

3. **PRIORITIZE HIGH-VALUE GAPS**: Focus on topics from the strategic areas above that are:
   - Specific to the Peruvian market context
   - Actionable and practical for restaurant owners
   - Not covered by existing articles
   - High search intent and commercial value

4. **SPECIFICITY OVER BREADTH**: Prefer narrow, specific topics:
   ✅ GOOD: "Guía completa de licencias DIGESA para restaurantes en Lima 2025"
   ✅ GOOD: "Cómo optimizar costos de proveedores para restaurantes en Perú"
   ❌ BAD: "Guía de Gestión de Restaurantes"

5. **CHECK ALL EXISTING**: Before suggesting a topic, verify:
   - No exact match exists
   - No very similar topic exists
   - Keywords aren't already covered

Analyze the content gaps and identify the TOP 3 most important UNIQUE topics we should create articles about to build topical authority for restaurant websites in Peru. Prioritize topics from the strategic gaps identified above.

Return JSON format:
{
  "content_gaps": [
    {
      "topic": "Specific, unique topic focused on strategic gaps",
      "category": "one of the 5 categories",
      "target_keywords": ["keyword1", "keyword2"],
      "priority_score": 1-10,
      "reasoning": "Why this is unique, fills a strategic gap, and builds topical authority"
    }
  ]
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
          { role: 'system', content: 'You are an expert content strategist specializing in restaurant industry content in Peru.' },
          { role: 'user', content: gapAnalysisPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    const gptData = await response.json();
    let rawContent = gptData.choices[0].message.content;
    
    // Clean markdown formatting from ChatGPT response
    rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(rawContent);

    // Store content gaps
    const gaps = [];
    for (const gap of analysis.content_gaps) {
      const { data: insertedGap } = await supabase
        .from('content_gaps')
        .insert({
          topic: gap.topic,
          category: gap.category,
          target_keywords: gap.target_keywords,
          priority_score: gap.priority_score,
          status: 'identified'
        })
        .select()
        .single();
      
      gaps.push(insertedGap);
    }

    const processingTime = Date.now() - startTime;

    // Update log
    await supabase
      .from('generation_logs')
      .update({
        status: 'completed',
        details: { 
          gaps_identified: gaps.length,
          analysis_results: analysis
        },
        processing_time_ms: processingTime
      })
      .eq('id', logData.id);

    console.log(`Content gap analysis completed in ${processingTime}ms`);

    return new Response(JSON.stringify({ 
      success: true, 
      gaps,
      analysis: analysis.content_gaps
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in content gap analysis:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to analyze content gaps'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});