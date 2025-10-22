import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt: string;
  keywords: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { articleId } = await req.json();

    if (!articleId) {
      throw new Error('Article ID is required');
    }

    console.log(`Creating internal links for article: ${articleId}`);

    // Get the new article
    const { data: newArticle, error: newArticleError } = await supabase
      .from('generated_articles')
      .select('*')
      .eq('id', articleId)
      .eq('status', 'published')
      .single();

    if (newArticleError || !newArticle) {
      throw new Error(`Article not found or not published: ${newArticleError?.message}`);
    }

    // Get all other published articles
    const { data: existingArticles, error: existingError } = await supabase
      .from('generated_articles')
      .select('id, title, slug, category, content, excerpt, keywords')
      .eq('status', 'published')
      .neq('id', articleId)
      .order('publish_date', { ascending: false });

    if (existingError || !existingArticles || existingArticles.length === 0) {
      console.log('No existing articles found for linking');
      return new Response(
        JSON.stringify({ success: true, message: 'No existing articles to link' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${existingArticles.length} existing articles`);

    // Step 1: Find articles to link TO from the new article
    const articlesToLinkTo = await findRelevantArticles(
      newArticle,
      existingArticles,
      3,
      lovableApiKey
    );

    // Step 2: Find articles that should link TO the new article
    const articlesToLinkFrom = await findRelevantArticles(
      newArticle,
      existingArticles,
      3,
      lovableApiKey
    );

    // Step 3: Find external authoritative sources
    const externalLinks = await findExternalLinks(newArticle, lovableApiKey);

    // Step 4: Insert links into the new article
    let updatedNewContent = newArticle.content;
    
    // Add internal links to other articles
    for (const targetArticle of articlesToLinkTo) {
      updatedNewContent = await insertInternalLink(
        updatedNewContent,
        targetArticle,
        newArticle,
        lovableApiKey
      );
    }

    // Add external links
    for (const externalLink of externalLinks) {
      updatedNewContent = await insertExternalLink(
        updatedNewContent,
        externalLink,
        lovableApiKey
      );
    }

    // Update the new article with links
    const { error: updateNewError } = await supabase
      .from('generated_articles')
      .update({ content: updatedNewContent, updated_at: new Date().toISOString() })
      .eq('id', articleId);

    if (updateNewError) {
      console.error('Error updating new article:', updateNewError);
    }

    // Step 5: Insert links FROM other articles TO the new article
    for (const sourceArticle of articlesToLinkFrom) {
      let updatedContent = await insertInternalLink(
        sourceArticle.content,
        newArticle,
        sourceArticle,
        lovableApiKey
      );

      const { error: updateError } = await supabase
        .from('generated_articles')
        .update({ content: updatedContent, updated_at: new Date().toISOString() })
        .eq('id', sourceArticle.id);

      if (updateError) {
        console.error(`Error updating article ${sourceArticle.id}:`, updateError);
      }
    }

    console.log('Internal linking completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        linksAdded: {
          inNewArticle: articlesToLinkTo.length + externalLinks.length,
          toNewArticle: articlesToLinkFrom.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-internal-links:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function findRelevantArticles(
  targetArticle: Article,
  articles: Article[],
  count: number,
  apiKey: string
): Promise<Article[]> {
  const prompt = `Given this article:
Title: ${targetArticle.title}
Category: ${targetArticle.category}
Keywords: ${targetArticle.keywords.join(', ')}
Excerpt: ${targetArticle.excerpt}

From the following articles, identify the ${count} most relevant ones to link to/from:
${articles.map((a, i) => `${i + 1}. "${a.title}" (${a.category}) - Keywords: ${a.keywords.join(', ')}`).join('\n')}

Return ONLY a JSON array of ${count} article indices (0-based) in order of relevance.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO expert specializing in internal linking. Return only valid JSON arrays.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const parsed = JSON.parse(content);
  const indices = parsed.indices || parsed.articles || Object.values(parsed);
  
  return indices.slice(0, count).map((idx: number) => articles[idx]).filter(Boolean);
}

async function findExternalLinks(
  article: Article,
  apiKey: string
): Promise<Array<{ url: string; anchorText: string; topic: string }>> {
  const prompt = `For this article about "${article.title}" in category ${article.category}, suggest 2 authoritative external sources to link to.

Keywords: ${article.keywords.join(', ')}
Excerpt: ${article.excerpt}

Suggest authoritative sites like government agencies, educational institutions, well-known industry publications, or established organizations relevant to restaurants, food, and hospitality in Peru/Latin America.

Return a JSON object with format:
{
  "links": [
    {"url": "https://example.com", "anchorText": "relevant text", "topic": "what it's about"},
    {"url": "https://example2.com", "anchorText": "relevant text", "topic": "what it's about"}
  ]
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO expert. Suggest only real, authoritative websites. Return valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const parsed = JSON.parse(content);
  
  return parsed.links || [];
}

async function insertInternalLink(
  content: string,
  targetArticle: Article,
  sourceArticle: Article,
  apiKey: string
): Promise<string> {
  // Find a contextually relevant place to insert the link
  const prompt = `Given this article content, find the best place to naturally insert a link to another article titled "${targetArticle.title}".

Source article excerpt: ${sourceArticle.excerpt}
Target article: "${targetArticle.title}" about ${targetArticle.excerpt}

Article content (first 2000 chars):
${content.substring(0, 2000)}

Find a relevant sentence or phrase where this link would fit naturally. Return JSON:
{
  "searchText": "exact text to replace (must exist in content)",
  "anchorText": "natural anchor text that fits the context",
  "insertAfter": true/false
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO expert. Find natural places to insert links. Return valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    console.error('Failed to get link placement');
    return content;
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  const link = `<a href="/blog/${targetArticle.category}/${targetArticle.slug}" class="text-primary hover:underline">${result.anchorText}</a>`;
  
  if (result.searchText && content.includes(result.searchText)) {
    if (result.insertAfter) {
      return content.replace(result.searchText, `${result.searchText} ${link}`);
    } else {
      return content.replace(result.searchText, `${link} ${result.searchText}`);
    }
  }
  
  return content;
}

async function insertExternalLink(
  content: string,
  externalLink: { url: string; anchorText: string; topic: string },
  apiKey: string
): Promise<string> {
  const prompt = `Find the best place in this article to insert an external link about "${externalLink.topic}".

Article content (first 2000 chars):
${content.substring(0, 2000)}

Return JSON:
{
  "searchText": "exact text to replace",
  "insertAfter": true/false
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are an SEO expert. Return valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    console.error('Failed to get external link placement');
    return content;
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  const link = `<a href="${externalLink.url}" target="_blank" rel="nofollow noopener noreferrer" class="text-primary hover:underline">${externalLink.anchorText}</a>`;
  
  if (result.searchText && content.includes(result.searchText)) {
    if (result.insertAfter) {
      return content.replace(result.searchText, `${result.searchText} ${link}`);
    } else {
      return content.replace(result.searchText, `${link} ${result.searchText}`);
    }
  }
  
  return content;
}
