import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = 'https://mirestaurante.online';

    // Fetch site pages
    const { data: sitePages } = await supabase
      .from('site_pages')
      .select('path, priority, changefreq')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    // Fetch documentation pages
    const { data: documentationPages } = await supabase
      .from('documentation_pages')
      .select('path, priority, changefreq')
      .eq('is_active', true)
      .order('path', { ascending: true });

    // Fetch published articles
    const { data: articles } = await supabase
      .from('generated_articles')
      .select('slug, category, updated_at')
      .eq('status', 'published')
      .not('publish_date', 'is', null)
      .order('publish_date', { ascending: false });

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Site pages
    for (const page of sitePages || []) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Documentation pages
    for (const page of documentationPages || []) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Blog articles
    for (const article of articles || []) {
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
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
});
