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
    const openaiApiKey = Deno.env.get('chatgpt')!;
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
      openaiApiKey
    );

    // Step 2: Find articles that should link TO the new article
    const articlesToLinkFrom = await findRelevantArticles(
      newArticle,
      existingArticles,
      3,
      openaiApiKey
    );

    // Step 3: Find external authoritative sources
    const externalLinks = await findExternalLinks(newArticle, openaiApiKey);

    // Step 4: Insert links into the new article
    let updatedNewContent = sanitizeContent(newArticle.content);
    
    // Add internal links to other articles
    for (const targetArticle of articlesToLinkTo) {
      updatedNewContent = await insertInternalLink(
        updatedNewContent,
        targetArticle,
        newArticle,
        openaiApiKey
      );
    }

    // Add external links
    for (const externalLink of externalLinks) {
      updatedNewContent = await insertExternalLink(
        updatedNewContent,
        externalLink,
        openaiApiKey
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
    const sanitizedSource = sanitizeContent(sourceArticle.content);
      let updatedContent = await insertInternalLink(
        sanitizedSource,
        newArticle,
        sourceArticle,
        openaiApiKey
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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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
  // Always link using existing native text only (wrap exact substring)
  const contentPlain = content.replace(/<[^>]*>/g, '');
  const previewPlain = contentPlain.substring(0, 2000);

  const prompt = `You are an SEO internal linking assistant. From the article text below, pick ONE short phrase (2-5 words) that ALREADY EXISTS verbatim in the text and would naturally link to the topic "${targetArticle.title}". The phrase must be exactly as it appears in the text.

Return JSON only: {"anchorText":"exact substring from the text"}

Article text (first 2000 chars):\n${previewPlain}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Return only valid JSON. Choose a 2-5 word phrase that already exists verbatim in the provided text. Do not invent words. Do not return explanations.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    console.error('Failed to get internal link anchor phrase');
    return content;
  }

  const data = await response.json();
  let anchorText: string | undefined;
  try {
    const parsed = JSON.parse(data.choices[0].message.content);
    anchorText = typeof parsed.anchorText === 'string' ? parsed.anchorText.trim() : undefined;
  } catch {
    return content;
  }

  if (!anchorText || anchorText.split(/\s+/).length < 1) return content;

  // Ensure the anchor text appears in plain content
  const plainTextIndex = contentPlain.indexOf(anchorText);
  if (plainTextIndex === -1) {
    console.warn('Anchor text not found in content:', anchorText);
    return content;
  }

  // Map plain text index to HTML index
  let htmlIndex = 0;
  let plainIndex = 0;
  let inTag = false;

  while (plainIndex < plainTextIndex && htmlIndex < content.length) {
    const ch = content[htmlIndex];
    if (ch === '<') inTag = true;
    else if (ch === '>') {
      inTag = false;
      htmlIndex++;
      continue;
    }
    if (!inTag) plainIndex++;
    htmlIndex++;
  }

  // Determine HTML length for the anchor text
  let skipChars = 0;
  let skippedPlain = 0;
  inTag = false;
  while (skippedPlain < anchorText.length && htmlIndex + skipChars < content.length) {
    const ch = content[htmlIndex + skipChars];
    if (ch === '<') inTag = true;
    else if (ch === '>') {
      inTag = false;
      skipChars++;
      continue;
    }
    if (!inTag) skippedPlain++;
    skipChars++;
  }

  const before = content.substring(0, htmlIndex);
  const after = content.substring(htmlIndex + skipChars);

  // Avoid linking inside an existing <a>
  const lastOpenA = before.lastIndexOf('<a');
  const lastCloseA = before.lastIndexOf('</a>');
  if (lastOpenA > lastCloseA) {
    console.warn('Skipping link to avoid nesting inside existing anchor');
    return content;
  }

  const wrapped = `<a href="/blog/${targetArticle.category}/${targetArticle.slug}" class="text-primary hover:underline" data-autolink="true">` +
    content.substring(htmlIndex, htmlIndex + skipChars) + `</a>`;

  return before + wrapped + after;
}

async function insertExternalLink(
  content: string,
  externalLink: { url: string; anchorText: string; topic: string },
  apiKey: string
): Promise<string> {
  // Always link using existing native text only (wrap exact substring)
  const contentPlain = content.replace(/<[^>]*>/g, '');
  const previewPlain = contentPlain.substring(0, 2000);

  const prompt = `You are an SEO assistant. From the article text below, pick ONE short phrase (2-5 words) that ALREADY EXISTS verbatim in the text and would naturally reference the external topic: "${externalLink.topic}".
Return JSON only: {"anchorText":"exact substring from the text"}

Article text (first 2000 chars):\n${previewPlain}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Return only valid JSON. Choose a 2-5 word phrase that already exists verbatim in the provided text. Do not invent words.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    console.error('Failed to get external link anchor phrase');
    return content;
  }

  const data = await response.json();
  let anchorText: string | undefined;
  try {
    const parsed = JSON.parse(data.choices[0].message.content);
    anchorText = typeof parsed.anchorText === 'string' ? parsed.anchorText.trim() : undefined;
  } catch {
    return content;
  }

  if (!anchorText || anchorText.split(/\s+/).length < 1) return content;

  const plainTextIndex = contentPlain.indexOf(anchorText);
  if (plainTextIndex === -1) {
    console.warn('External anchor text not found in content:', anchorText);
    return content;
  }

  // Map plain position to HTML indices
  let htmlIndex = 0;
  let plainIndex = 0;
  let inTag = false;

  while (plainIndex < plainTextIndex && htmlIndex < content.length) {
    const ch = content[htmlIndex];
    if (ch === '<') inTag = true;
    else if (ch === '>') {
      inTag = false;
      htmlIndex++;
      continue;
    }
    if (!inTag) plainIndex++;
    htmlIndex++;
  }

  let skipChars = 0;
  let skippedPlain = 0;
  inTag = false;
  while (skippedPlain < anchorText.length && htmlIndex + skipChars < content.length) {
    const ch = content[htmlIndex + skipChars];
    if (ch === '<') inTag = true;
    else if (ch === '>') {
      inTag = false;
      skipChars++;
      continue;
    }
    if (!inTag) skippedPlain++;
    skipChars++;
  }

  const before = content.substring(0, htmlIndex);
  const after = content.substring(htmlIndex + skipChars);

  // Avoid nesting inside existing <a>
  const lastOpenA = before.lastIndexOf('<a');
  const lastCloseA = before.lastIndexOf('</a>');
  if (lastOpenA > lastCloseA) {
    console.warn('Skipping external link to avoid nesting');
    return content;
  }

  const wrapped = `<a href="${externalLink.url}" target="_blank" rel="nofollow noopener noreferrer" class="text-primary hover:underline" data-autolink="true">` +
    content.substring(htmlIndex, htmlIndex + skipChars) + `</a>`;

  return before + wrapped + after;
}

// Remove previously auto-inserted links that may not be relevant
function sanitizeContent(content: string): string {
  return content
    // Internal auto-links
    .replace(/<a[^>]*href="\\/blog\\/[^\"]+"[^>]*class="[^"]*text-primary[^"]*hover:underline[^"]*"[^>]*>(.*?)<\\/a>/g, '$1')
    // External auto-links
    .replace(/<a[^>]*href="https?:\\/\\/[^\"]+"[^>]*rel="nofollow noopener noreferrer"[^>]*class="[^"]*text-primary[^"]*hover:underline[^"]*"[^>]*>(.*?)<\\/a>/g, '$1');
}
