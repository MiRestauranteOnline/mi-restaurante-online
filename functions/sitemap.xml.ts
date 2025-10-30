interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = context.env;
  const baseUrl = 'https://mirestaurante.online';
  
  try {
    // Fetch static pages (if site_pages table exists)
    let staticPages: Array<{ path: string; priority: number; changefreq: string }> = [
      { path: '/', priority: 1.0, changefreq: 'daily' },
      { path: '/acerca-de', priority: 0.8, changefreq: 'monthly' },
      { path: '/contacto', priority: 0.8, changefreq: 'monthly' },
      { path: '/guia', priority: 0.9, changefreq: 'daily' },
      { path: '/soporte', priority: 0.7, changefreq: 'monthly' },
      { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
      { path: '/terms', priority: 0.3, changefreq: 'yearly' },
    ];

    // Fetch documentation pages
    const docResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/documentation_pages?select=path,priority,changefreq&is_active=eq.true&order=path.asc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    const documentationPages = docResponse.ok ? await docResponse.json() : [];

    // Fetch published blog articles
    const articlesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/generated_articles?select=slug,category,updated_at&status=eq.published&order=publish_date.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    const articles = articlesResponse.ok ? await articlesResponse.json() : [];

    // Build XML sitemap
    const today = new Date().toISOString().split('T')[0];
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Add documentation pages
    for (const page of documentationPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq || 'weekly'}</changefreq>\n`;
      xml += `    <priority>${page.priority || 0.7}</priority>\n`;
      xml += '  </url>\n';
    }

    // Add blog articles
    for (const article of articles) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/guia/${article.category}/${article.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(article.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800', // 30 min cache
        'X-Sitemap-Source': 'cloudflare-pages-direct',
      },
    });
  } catch (err) {
    console.error('Sitemap generation error:', err);
    
    // Fallback minimal sitemap
    const today = new Date().toISOString().split('T')[0];
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `  <url>\n` +
      `    <loc>https://mirestaurante.online/</loc>\n` +
      `    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>daily</changefreq>\n` +
      `    <priority>1.0</priority>\n` +
      `  </url>\n` +
      `  <url>\n` +
      `    <loc>https://mirestaurante.online/guia</loc>\n` +
      `    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>daily</changefreq>\n` +
      `    <priority>0.9</priority>\n` +
      `  </url>\n` +
      `</urlset>`;

    return new Response(fallback, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // 5 min cache for fallback
        'X-Sitemap-Fallback': 'true',
      },
    });
  }
};
