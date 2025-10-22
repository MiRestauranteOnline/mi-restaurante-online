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

    const { articleId, slug, category } = await req.json();

    if (!articleId && (!slug || !category)) {
      throw new Error('Article ID or (slug + category) is required');
    }

    // Resolve target article
    let newArticle: any = null;
    let newArticleError: any = null;

    if (articleId) {
      console.log(`Creating internal links for article by id: ${articleId}`);
      const res = await supabase
        .from('generated_articles')
        .select('*')
        .eq('id', articleId)
        .eq('status', 'published')
        .single();
      newArticle = res.data; newArticleError = res.error;
    } else {
      console.log(`Creating internal links for article by slug: ${category}/${slug}`);
      const res = await supabase
        .from('generated_articles')
        .select('*')
        .eq('slug', slug)
        .eq('category', category)
        .eq('status', 'published')
        .single();
      newArticle = res.data; newArticleError = res.error;
    }

    if (newArticleError || !newArticle) {
      throw new Error(`Article not found or not published: ${newArticleError?.message}`);
    }

    // Get all other published articles
    const { data: existingArticles, error: existingError } = await supabase
      .from('generated_articles')
      .select('id, title, slug, category, content, excerpt, keywords')
      .eq('status', 'published')
      .neq('id', newArticle.id)
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

    // Add internal links to other articles (one per target max)
    for (const targetArticle of articlesToLinkTo) {
      updatedNewContent = await insertInternalLink(
        updatedNewContent,
        targetArticle,
        newArticle,
        openaiApiKey
      );
    }

    // Add external links (up to 2 and at most one per paragraph)
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
      .eq('id', newArticle.id);

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
          inNewArticle: (articlesToLinkTo?.length || 0) + (externalLinks?.length || 0),
          toNewArticle: (articlesToLinkFrom?.length || 0),
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
Keywords: ${(targetArticle.keywords || []).join(', ')}
Excerpt: ${targetArticle.excerpt}

From the following articles, identify the ${count} most relevant ones to link to/from:
${articles.map((a, i) => `${i + 1}. "${a.title}" (${a.category}) - Keywords: ${(a.keywords || []).join(', ')}`).join('\n')}

Return ONLY a JSON array with key "indices" containing ${count} article indices (0-based) in order of relevance.`;

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
          content: 'You are an SEO expert specializing in internal linking. Return only valid JSON objects.',
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

Keywords: ${(article.keywords || []).join(', ')}
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
  _sourceArticle: Article,
  apiKey: string
): Promise<string> {
  const segments = collectSegments(content);
  const keywords = [
    ...(targetArticle.keywords || []),
    ...targetArticle.title.split(/\s+/)
  ].map((s) => s.toLowerCase());

  const candidate = pickBestSegment(segments, keywords);
  if (!candidate) return content;

  const targetHref = `/blog/${targetArticle.category}/${targetArticle.slug}`;
  if (candidate.html.includes(`href="${targetHref}"`)) return content; // already linked here
  if (/data-autolink="true"/.test(candidate.html)) return content; // avoid stacking

  const previewPlain = candidate.plain.substring(0, 800);
  const prompt = `From the paragraph below, return ONLY a short phrase (2-5 words) that appears VERBATIM and would naturally link to: "${targetArticle.title}". Return JSON only {"anchorText":"..."}.

Paragraph:\n${previewPlain}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Return valid JSON only. Pick a 2-5 word phrase that ALREADY EXISTS verbatim. No explanations.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) return content;

  let anchorText: string | undefined;
  try {
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    anchorText = typeof parsed.anchorText === 'string' ? parsed.anchorText.trim() : undefined;
  } catch {
    return content;
  }

  if (!anchorText) return content;
  // validate phrase length/words to avoid absurd selections
  const words = anchorText.trim().split(/\s+/);
  if (words.length < 1 || words.length > 7 || anchorText.length > 80) return content;

  let plainIdx = candidate.plain.indexOf(anchorText);
  if (plainIdx === -1) {
    const lower = candidate.plain.toLowerCase();
    plainIdx = lower.indexOf(anchorText.toLowerCase());
    if (plainIdx === -1) return content;
    anchorText = candidate.plain.substr(plainIdx, anchorText.length);
  }

  const anchorLen = anchorText.length;
  const mapped = mapPlainToHtml(candidate.html, plainIdx, anchorLen);
  if (!mapped) return content;

  const { htmlStart, htmlEnd } = mapped;

  // Avoid nesting inside existing <a>
  const beforeInner = candidate.html.substring(0, htmlStart);
  const lastOpenA = beforeInner.lastIndexOf('<a');
  const lastCloseA = beforeInner.lastIndexOf('</a>');
  if (lastOpenA > lastCloseA) return content;

  const wrappedInner =
    candidate.html.substring(0, htmlStart) +
    `<a href="${targetHref}" class="text-primary hover:underline" data-autolink="true">` +
    candidate.html.substring(htmlStart, htmlEnd) +
    `</a>` +
    candidate.html.substring(htmlEnd);

  const updated =
    content.substring(0, candidate.start) +
    wrappedInner +
    content.substring(candidate.end);

  return updated;
}

async function insertExternalLink(
  content: string,
  externalLink: { url: string; anchorText: string; topic: string },
  apiKey: string
): Promise<string> {
  const segments = collectSegments(content);

  const topicKeywords = externalLink.topic
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 3)
    .map((w) => w.toLowerCase());

  const candidate = pickBestSegment(segments, topicKeywords);
  if (!candidate) return content;

  if (candidate.html.includes(`href="${externalLink.url}"`)) return content;
  if (/data-autolink="true"/.test(candidate.html)) return content;

  const previewPlain = candidate.plain.substring(0, 800);
  const prompt = `From the paragraph below, return ONLY a short phrase (2-5 words) that appears VERBATIM and would naturally reference the external topic: "${externalLink.topic}". Return JSON only {"anchorText":"..."}.

Paragraph:\n${previewPlain}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Return valid JSON only. Pick a 2-5 word phrase that ALREADY EXISTS verbatim. No explanations.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) return content;

  let anchorText: string | undefined;
  try {
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    anchorText = typeof parsed.anchorText === 'string' ? parsed.anchorText.trim() : undefined;
  } catch {
    return content;
  }

  if (!anchorText) return content;
  const words = anchorText.trim().split(/\s+/);
  if (words.length < 1 || words.length > 7 || anchorText.length > 80) return content;

  let plainIdx = candidate.plain.indexOf(anchorText);
  if (plainIdx === -1) {
    const lower = candidate.plain.toLowerCase();
    plainIdx = lower.indexOf(anchorText.toLowerCase());
    if (plainIdx === -1) return content;
    anchorText = candidate.plain.substr(plainIdx, anchorText.length);
  }

  const anchorLen = anchorText.length;
  const mapped = mapPlainToHtml(candidate.html, plainIdx, anchorLen);
  if (!mapped) return content;

  const { htmlStart, htmlEnd } = mapped;

  const beforeInner = candidate.html.substring(0, htmlStart);
  const lastOpenA = beforeInner.lastIndexOf('<a');
  const lastCloseA = beforeInner.lastIndexOf('</a>');
  if (lastOpenA > lastCloseA) return content;

  const wrappedInner =
    candidate.html.substring(0, htmlStart) +
    `<a href="${externalLink.url}" target="_blank" rel="nofollow noopener noreferrer" class="text-primary hover:underline" data-autolink="true">` +
    candidate.html.substring(htmlStart, htmlEnd) +
    `</a>` +
    candidate.html.substring(htmlEnd);

  const updated =
    content.substring(0, candidate.start) +
    wrappedInner +
    content.substring(candidate.end);

  return updated;
}

// Remove previously auto-inserted links that may not be relevant
function sanitizeContent(content: string): string {
  return content
    // Internal auto-links
    .replace(/<a[^>]*href="\/blog\/[^\"]+"[^>]*class="[^"]*text-primary[^"]*hover:underline[^"]*"[^>]*data-autolink="true"[^>]*>(.*?)<\/a>/g, '$1')
    // External auto-links
    .replace(/<a[^>]*href="https?:\/\/[^\"]+"[^>]*target="_blank"[^>]*rel="nofollow noopener noreferrer"[^>]*class="[^"]*text-primary[^"]*hover:underline[^"]*"[^>]*data-autolink="true"[^>]*>(.*?)<\/a>/g, '$1');
}

// --- Helper Types & Utilities for paragraph-scoped linking ---

type Segment = { start: number; end: number; html: string; plain: string; tag: string };

function collectSegments(html: string): Segment[] {
  const segs: Segment[] = [];
  const tags = ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  for (const tag of tags) segs.push(...findSegmentsByTag(html, tag));
  return segs;
}

function findSegmentsByTag(html: string, tag: string): Segment[] {
  const segments: Segment[] = [];
  const lower = html.toLowerCase();
  let cursor = 0;
  while (true) {
    const openIdx = lower.indexOf(`<${tag}`, cursor);
    if (openIdx === -1) break;
    const openEnd = html.indexOf('>', openIdx);
    if (openEnd === -1) break;
    const closeToken = `</${tag}>`;
    const closeIdx = lower.indexOf(closeToken, openEnd + 1);
    if (closeIdx === -1) break;
    const innerStart = openEnd + 1;
    const innerEnd = closeIdx;
    const innerHtml = html.substring(innerStart, innerEnd);
    const plain = innerHtml.replace(/<[^>]*>/g, '');
    segments.push({ start: innerStart, end: innerEnd, html: innerHtml, plain, tag });
    cursor = closeIdx + closeToken.length;
  }
  return segments;
}

function pickBestSegment(segments: Segment[], keywords: string[]): Segment | null {
  let best: Segment | null = null;
  let bestScore = 0;
  for (const seg of segments) {
    const anchorCount = (seg.html.match(/<a\b/gi) || []).length;
    if (anchorCount >= 2) continue; // don't overcrowd

    const text = seg.plain.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (!kw || kw.length < 3) continue;
      if (text.includes(kw)) score += 1;
    }
    if (/^h[1-6]$/i.test(seg.tag)) score -= 0.5; // prefer body text

    if (score > bestScore) { bestScore = score; best = seg; }
  }
  return bestScore > 0 ? best : null;
}

function mapPlainToHtml(innerHtml: string, plainTargetIndex: number, plainLen: number): { htmlStart: number; htmlEnd: number } | null {
  let htmlIdx = 0;
  let plainIdx = 0;
  let inTag = false;

  while (plainIdx < plainTargetIndex && htmlIdx < innerHtml.length) {
    const ch = innerHtml[htmlIdx];
    if (ch === '<') inTag = true;
    else if (ch === '>') { inTag = false; htmlIdx++; continue; }
    if (!inTag) plainIdx++;
    htmlIdx++;
  }

  let skip = 0;
  let consumed = 0;
  inTag = false;
  while (consumed < plainLen && htmlIdx + skip < innerHtml.length) {
    const ch = innerHtml[htmlIdx + skip];
    if (ch === '<') inTag = true;
    else if (ch === '>') { inTag = false; skip++; continue; }
    if (!inTag) consumed++;
    skip++;
  }

  return { htmlStart: htmlIdx, htmlEnd: htmlIdx + skip };
}
