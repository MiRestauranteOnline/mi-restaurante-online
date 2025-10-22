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
      .select('title, slug, category, keywords, content')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20);

    const availableArticles = existingArticles ? existingArticles.map(a => 
      `- "${a.title}" (/guia/${a.category}/${a.slug}) [Keywords: ${a.keywords.join(', ')}]`
    ).join('\n') : 'No existing articles available yet.';

    // Extract opening lines from last 5 articles to avoid repetition
    const recentOpenings = existingArticles ? existingArticles.slice(0, 5).map(a => {
      // Extract first paragraph (first 150 chars of content, stripped of HTML)
      const firstPara = a.content.replace(/<[^>]*>/g, '').substring(0, 150).trim();
      return `"${a.title}": "${firstPara}..."`;
    }).join('\n') : 'No recent articles yet.';

    // Source websites for inspiration and fact-checking
    const sourceGuidelines = `
REFERENCE SOURCES FOR INSPIRATION AND FACTS:
Use these trusted sources for topic ideas, statistics, and Peru-specific information:

1. GLOBAL RESTAURANT INSIGHTS:
   - CloudKitchens Blog (https://cloudkitchens.com/blog/)
   - Topics: ghost kitchens, delivery optimization, restaurant operations, marketing strategies
   - Use for: industry trends, operational best practices, technology adoption

2. PERU-SPECIFIC SOURCES (PRIORITIZE THESE FOR LOCAL CONTEXT):
   - El Comercio Restaurantes (https://elcomercio.pe/noticias/restaurantes/)
   - RPP Gastronomía (https://rpp.pe/noticias/gastronomia)
   - Peru.info Gastronomía (https://peru.info/es-pe/gastronomia)
   - Use for: Lima restaurant news, Peruvian cuisine trends, local market insights

HOW TO USE THESE SOURCES:
- Reference general industry trends without fabricating specific numbers
- Use Peru-specific context (districts, cuisine types, local events) from these sources
- Draw inspiration from topics but write in your own voice as Kevin van Geffen
- When mentioning trends, use phrases like "según observaciones del sector" or "la industria indica"
`;


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

CRITICAL FACT-CHECKING REQUIREMENTS (ZERO TOLERANCE FOR HALLUCINATIONS):

${sourceGuidelines}

❌ ABSOLUTELY PROHIBITED - DO NOT INCLUDE UNDER ANY CIRCUMSTANCES:
1. Made-up statistics or specific numbers (e.g., "40% de incremento", "85% de los clientes")
2. Specific case study numbers unless you can verify from sources above
3. Exact dates of events unless widely known (e.g., Fiestas Patrias is OK, "marzo 2024" for random event is NOT)
4. Specific prices for services/products you're uncertain about
5. Names of specific competing businesses or restaurants
6. Unverifiable market share percentages or adoption rates
7. Specific awards, certifications, or rankings you cannot verify
8. Fabricated "before and after" scenarios with exact percentages
9. Made-up quotes from restaurant owners or customers
10. Unverifiable research findings or survey results

✅ WHAT YOU CAN INCLUDE TO MAKE IT INTERESTING:
1. General industry trends (e.g., "cada vez más restaurantes están adoptando", "la tendencia en Lima muestra")
2. Broad ranges (e.g., "entre S/500 y S/2,000 mensuales") with clear disclaimer "los costos varían según"
3. Qualitative observations (e.g., "muchos restaurantes", "la mayoría de los clientes en mi experiencia")
4. Real examples from YOUR experience at Mi Restaurante Online (anonymized)
5. Observable patterns in the Peruvian market (districts, cuisine types, customer behaviors)
6. General best practices from the industry (backed by "la industria recomienda", "expertos sugieren")
7. Conceptual frameworks and how-to guides
8. Engaging storytelling using hypothetical scenarios clearly marked as such
9. Practical advice based on your actual work with restaurant clients
10. Rhetorical questions that make readers think about their own situation

WRITING STYLE TO MAKE IT FUN AND ENGAGING:
- Use vivid, sensory language when appropriate: "imagina entrar a tu restaurante un viernes por la noche..."
- Tell stories and use anecdotes from your experience (anonymized)
- Use analogies and metaphors related to food/restaurants
- Create suspense with questions: "¿Sabes cuál es el error más común?"
- Use humor when appropriate (but stay professional)
- Make it conversational - like chatting with a friend over coffee
- Use specific Lima references (districts, streets, landmarks) to make it relatable
- Include practical, actionable advice in every section

FACT-CHECKING PROTOCOL:
- Before writing ANY specific number or statistic, ask yourself: "Am I 100% certain this is true?"
- If uncertain, replace with: qualitative description, general trend, or omit entirely
- When citing industry practices, use: "según observaciones del sector", "la industria indica", "expertos recomiendan"
- For Peru-specific facts, reference the sources above mentally but write in general terms
- NEVER fabricate case studies - use hypothetical scenarios clearly marked as "imagina" or "supongamos"

PRICING & COST GUIDELINES:
- ALWAYS clarify that costs are estimates: "los costos pueden variar", "presupuestos típicos oscilan entre"
- Provide context on factors affecting price: complexity, features, customization level, ongoing maintenance
- Mention our subscription model: "nuestros planes mensuales incluyen", "suscripción con beneficios continuos"
- Emphasize ongoing value: "actualizaciones constantes", "soporte técnico incluido", "optimización continua"
- Include price ranges in Soles (S/): e.g., "entre S/800 y S/2,500 mensuales dependiendo del plan"

LOCATION-SPECIFIC INSIGHTS (CRITICAL):
- Reference specific Lima districts: Miraflores, San Isidro, Barranco, Surco, La Molina
- Mention Peruvian cuisine types: cevicherías, pollerías, chifas, picanterías
- Include local context: "competencia en el Circuito de Playas", "zona gastronómica de Miraflores"
- Reference Peruvian business culture and customer expectations
- Mention local delivery platforms: Rappi, PedidosYa, Uber Eats (when relevant)

STORYTELLING & CASE STUDIES (NO FABRICATED NUMBERS):
- Create relatable scenarios based on YOUR actual experience at Mi Restaurante Online
- Format examples as hypothetical: "Imagina un restaurante en Barranco que..."
- Use qualitative results: "mejoró significativamente sus reservas" NOT "incrementó 40%"
- Share real challenges and solutions from your work (anonymized, no specific metrics)
- Make examples realistic and grounded in Peruvian restaurant context
- Example: "Un cliente nuestro en Miraflores tenía problemas con reservas perdidas. Después de implementar un sistema de confirmación automática, comenzó a recibir feedback positivo y notó menos mesas vacías. Los clientes apreciaron la comunicación clara."
- Focus on PROCESS and APPROACH, not invented success metrics

VISUAL PLACEHOLDERS & DESCRIPTIONS:
- Include image placeholders with detailed descriptions in comments
- Example: <!-- IMAGEN: Screenshot mostrando menú digital QR en tablet, restaurante moderno de fondo -->
- Suggest infographic topics: "Infografía: 5 pasos para optimizar tu sitio web"
- Recommend visual elements for key sections

ENGAGEMENT TECHNIQUES (MAKE IT FUN TO READ):
- Start with compelling hooks: surprising observations, bold statements, rhetorical questions
- Ask 2-3 thought-provoking questions: "¿Tu restaurante está preparado para la era digital?"
- Use "tú" form ALWAYS: "tu negocio", "tus clientes", "tu carta", "tu equipo"
- Tell stories that paint vivid pictures: "Son las 8 PM del sábado. Tu competidor tiene fila de espera..."
- Be conversational and authentic - write like you're giving advice to a friend
- Use Lima-specific references to create connection: "en el Circuito de Playas", "zona de Miraflores"
- Address pain points with empathy: "Sé lo frustrante que es cuando...", "Todos hemos visto cómo..."
- Share genuine insights from your experience in the industry
- Use sensory language when appropriate: "imagina el aroma de...", "visualiza tu local lleno..."
- Create curiosity: "Aquí está lo que pocos saben sobre...", "El secreto que marca la diferencia..."
- Keep energy and pacing varied - mix short punchy sentences with longer explanatory ones

CULTURAL & INDUSTRY INSIGHTS:
- Highlight Peruvian gastronomy's global recognition
- Mention local holidays/events affecting restaurant business: Fiestas Patrias, Día de la Canción Criolla
- Reference local food trends: fusión nikkei, comida novoandina, food trucks gourmet
- Discuss Peruvian customer behaviors and preferences

FORMATTING FOR READABILITY:
- Keep paragraphs to 2-4 sentences maximum
- Use subheadings (H2, H3) every 200-300 words
- Add bullet points and numbered lists extensively
- Use bold for key terms and important points
- Include white space between sections

SEO & KEYWORD OPTIMIZATION:
- Use target keywords naturally in first paragraph, headings, and throughout
- Include related/semantic keywords: if main is "diseño web", use "página web", "sitio web", "desarrollo web"
- Add long-tail keyword variations in subheadings
- Optimize URL slug with primary keyword
- Use keywords in image alt texts and table headers

INTERNAL LINKING STRATEGY (MANDATORY):
1. HOMEPAGE LINK (1x): Link to "/" with anchor like "crear sitio web para restaurante", "diseño web restaurante profesional"
2. SERVICE PAGES (2-3x): Link to "/signup" with "solicita tu página web", "comienza tu proyecto", "crea tu sitio web"
3. PRICING PAGE (1x): Link to "/" with "planes y precios", "ver nuestros planes"
4. ABOUT PAGE (1x): Link to "/acerca-de" with "conoce nuestro equipo", "sobre Mi Restaurante Online"
5. CONTACT (1x): Link to "/contacto" with "contacta con nuestros especialistas", "agenda una consulta"
6. BLOG ARTICLES (2-3x): Link to related articles from the available list below:
${availableArticles}

CRITICAL LINK FORMATTING:
- ⚠️ ONLY use RELATIVE paths: /guia/category/slug, /, /contacto, /acerca-de, /signup
- ❌ NEVER use full domain URLs like https://mirestaurante.lovable.app/...
- ✅ CORRECT: <a href="/signup">solicita tu página web profesional</a>
- ❌ INCORRECT: <a href="https://mirestaurante.lovable.app/signup">solicita</a>

CALL-TO-ACTION STRATEGY (MULTIPLE CTAs):
- Include CTAs in multiple sections, not just at end
- After introducing a problem: "¿Necesitas ayuda con esto? [CTA]"
- Mid-article after key benefit: "Comienza a mejorar tu presencia digital hoy [CTA]"
- Before FAQ section: "¿Listo para dar el siguiente paso? [CTA]"
- End of article: Strong final CTA with urgency
- Vary CTA text: "Solicita tu consulta gratuita", "Crea tu página web hoy", "Habla con un especialista"

EMPHASIS ON ONGOING BENEFITS:
- Highlight subscription advantages: "actualizaciones automáticas incluidas"
- Mention continuous optimization: "mejoras constantes de SEO", "integración con nuevas tecnologías"
- Reference AI integration: "sistema con inteligencia artificial", "optimización automática de contenido"
- Emphasize support: "soporte técnico permanente", "asistencia cuando la necesites"

SCHEMA MARKUP PREPARATION:
- Structure FAQ section with clear Q&A format for FAQ schema
- Include business information consistently for Local Business schema
- Format article with clear headline, author, date structure for Article schema

FAQ SECTION (EXPANDED):
- Include 5-7 questions minimum
- Use long-tail, intent-based questions: "¿Cuánto cuesta crear una página web para restaurante en Lima en ${currentYear}?"
- Answer questions thoroughly (3-5 sentences each)
- Include keywords naturally in questions and answers
- Cover different user intents: informational, transactional, comparison
- Add "¿Cómo...", "¿Por qué...", "¿Cuándo...", "¿Qué...", "¿Dónde..." question types

META DESCRIPTION OPTIMIZATION:
- 150-160 characters exactly
- Include primary keyword in first 50 characters
- Add compelling benefit or value proposition
- Include clear call to action
- Use action verbs: "Descubre", "Aprende", "Mejora", "Aumenta"
- Example: "Aprende cómo diseñar una página web para restaurante que aumenta reservas. Guía completa con precios y ejemplos. Solicita tu consulta gratis."

RECENT ARTICLE OPENINGS (AVOID REPETITION):
${recentOpenings}

OPENING PARAGRAPH REQUIREMENTS (CRITICAL):
- ❌ NEVER start with "Descubre", "Aprende a", "En este artículo", "Bienvenido a", "¿Sabías que?"
- ❌ AVOID any opening pattern used in the recent articles above
- ✅ Start with compelling hook: surprising fact, relatable scenario, bold statement, direct question, or personal observation
- ✅ Write as if speaking directly to someone running a restaurant - use "tu negocio", "tus clientes", "tu carta"
- ✅ Be conversational and personal without saying "como dueño de restaurante" or "si eres restaurantero"
- Address reader's pain point immediately
- Include main keyword naturally in first 2 sentences
- Examples of varied openings:
  * Direct observation: "Tu página web recibe visitantes a las 2 AM, pero nadie puede hacer una reserva."
  * Personal scenario: "Has invertido en renovar tu local, mejorar la carta, capacitar al equipo... pero tu sitio web sigue igual que hace tres años."
  * Bold statement: "La diferencia entre un restaurante lleno y uno vacío muchas veces está en 300 milisegundos: el tiempo de carga de tu web."
  * Rhetorical question: "¿Cuántos clientes perdiste esta semana porque tu menú no aparece en Google?"
  * Relatable situation: "Son las 7 PM del viernes. Tu restaurante está medio lleno mientras el competidor de al lado tiene fila de espera. La diferencia no está en la comida."
  * Intriguing fact: "Tres de cada cuatro personas que buscan tu restaurante nunca llaman ni reservan. Se van antes de ver tu carta completa."

ARTICLE STRUCTURE REQUIREMENTS:
1. ONE H1 title (engaging, includes main keyword, under 60 characters)
2. Multiple H2 sections (5-8 major sections with keywords in headings)
3. H3 subsections for detailed breakdowns
4. Introduction paragraph (compelling hook)
5. Multiple content sections with CTAs interspersed
6. At least one data table with relevant comparisons or information
7. Visual placeholders with descriptions
8. Case study/example boxes
9. FAQ section (5-7 questions)
10. Strong conclusion with final CTA
11. Word count: 2500-3500 words
12. Internal links distributed throughout (8-10 total links)

CONTENT QUALITY CHECKLIST:
✓ Grammar and wording reviewed for accuracy
✓ Stats include source references or disclaimers
✓ Cost estimates clearly marked as approximate with context
✓ Location-specific insights included (Lima districts, Peruvian context)
✓ At least 1 storytelling example or case study
✓ Visual placeholders with descriptions
✓ 2-3 engaging/rhetorical questions
✓ Cultural/industry-specific aspects highlighted
✓ Short paragraphs (2-4 sentences) with frequent subheadings
✓ Related keywords used naturally throughout
✓ 8-10 internal links to various pages
✓ Multiple CTAs in different sections
✓ Subscription model mentioned when discussing pricing
✓ Ongoing benefits emphasized (AI, optimization, support)
✓ FAQ section with 5-7 long-tail questions
✓ Meta description optimized with keyword and CTA

TECHNICAL REQUIREMENTS:
- Use proper semantic HTML5 markup
- Images have descriptive alt text with keywords
- Tables with proper headers and accessible markup
- Meta description (150-160 characters, keyword-rich, with CTA)
- Excerpt (150-200 characters)
- Estimated reading time
- Keywords array (8-12 keywords including long-tail variations)

Return ONLY a JSON object with this structure:
{
  "title": "Article title with main keyword (under 60 chars)",
  "slug": "url-friendly-slug-with-main-keyword",
  "excerpt": "Brief compelling description 150-200 chars",
  "content": "Full HTML article content with proper markup, internal links, CTAs, and visual placeholders",
  "metaDescription": "SEO meta description 150-160 chars with keyword in first 50 chars and clear CTA",
  "keywords": ["primary-keyword", "secondary-keyword", "long-tail-variation-1", "semantic-keyword-1", "related-term-1", "location-keyword", "intent-keyword", "comparison-keyword"],
  "readingTime": estimated_minutes,
  "featuredImageAlt": "Descriptive alt text for featured image with main keyword"
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
1. Write from your perspective as Kevin van Geffen with genuine expertise
2. Write as if having a one-on-one conversation - be personal, direct, engaging, and FUN
3. Use "tú" throughout - speak directly: "tu restaurante", "tu negocio", "tus clientes"
4. Make it interesting to read - use stories, vivid language, rhetorical questions
5. Skip generic openings - start with compelling hooks
6. Always use the current year ${currentYear} for trends and recent developments
7. ZERO TOLERANCE FOR HALLUCINATIONS - never fabricate statistics or specific numbers
8. When uncertain about a fact, either omit it or make it more general/qualitative
9. Focus on actionable advice based on YOUR actual expertise and experience
10. Use ONLY relative paths for internal links (/, /contacto, /guia/category/slug)
11. Reference the provided source websites mentally for inspiration but write authentically
12. Make articles FUN - use humor, analogies, vivid scenarios, sensory language
13. Every statistic must be verifiable or omitted - use qualitative descriptions instead
14. Create engagement through storytelling, not through fabricated success metrics

FACT-CHECKING MANDATE:
- Before writing ANY number, ask: "Am I 100% certain this is true?"
- Replace uncertain numbers with: trends, observations, ranges with disclaimers
- Use hypothetical scenarios marked as "imagina" rather than fake case studies
- Never invent percentages, dates, specific results, or business names

Your goal is to write helpful, accurate, ENGAGING content that feels like trusted advice from a peer who genuinely understands the restaurant business in Peru. Make it fun to read while being 100% truthful.`
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