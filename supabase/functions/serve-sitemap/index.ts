import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://mirestaurante.online';

    // Site pages (optional table)
    let sitePages: Array<{ path: string; priority: number; changefreq: string }> = [];
    const { data: sp, error: spErr } = await supabase
      .from('site_pages')
      .select('path, priority, changefreq')
      .eq('is_active', true)
      .order('priority', { ascending: false });
    if (!spErr && sp) sitePages = sp as any;

    // Documentation pages
    let documentationPages: Array<{ path: string; priority: number; changefreq: string }> = [];
    const { data: dp, error: dpErr } = await supabase
      .from('documentation_pages')
      .select('path, priority, changefreq')
      .eq('is_active', true)
      .order('path', { ascending: true });
    if (!dpErr && dp) documentationPages = dp as any;

    // Blog posts
    let articles: Array<{ slug: string; category: string; updated_at: string }> = [];
    const { data: ar, error: arErr } = await supabase
      .from('generated_articles')
      .select('slug, category, updated_at, publish_date')
      .eq('status', 'published')
      .not('publish_date', 'is', null)
      .order('publish_date', { ascending: false });
    if (!arErr && ar) articles = ar as any;

    // Build pure XML (no XSL so browsers show raw XML; crawlers ignore styling anyway)
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
    xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

    const today = new Date().toISOString().split('T')[0];

    for (const page of sitePages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    for (const page of documentationPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    for (const article of articles) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog/${article.category}/${article.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(article.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', {
      status: 500,
      headers: corsHeaders,
    });
  }
});
