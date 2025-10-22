export const onRequest: PagesFunction = async () => {
  const upstream = 'https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/serve-sitemap';

  try {
    const res = await fetch(upstream, {
      headers: {
        'Accept': 'application/xml; charset=utf-8',
        'User-Agent': 'CloudflarePagesFunction/1.0 (+sitemap-proxy)'
      },
    });

    const text = await res.text();

    return new Response(text, {
      status: res.ok ? 200 : res.status,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Sitemap-Source': 'supabase-serve-sitemap',
      },
    });
  } catch (err) {
    // Fallback minimal sitemap to avoid 5xx for crawlers
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
      `    <loc>https://mirestaurante.online/blog</loc>\n` +
      `    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>daily</changefreq>\n` +
      `    <priority>0.9</priority>\n` +
      `  </url>\n` +
      `</urlset>`;

    return new Response(fallback, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-Sitemap-Fallback': 'true',
      },
    });
  }
};
