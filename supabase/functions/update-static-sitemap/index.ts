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

    // Base URL for the site
    const baseUrl = 'https://mirestaurante.online';

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/acerca-de', priority: '0.8', changefreq: 'monthly' },
      { url: '/contacto', priority: '0.8', changefreq: 'monthly' },
      { url: '/guia', priority: '0.9', changefreq: 'daily' },
      { url: '/soporte', priority: '0.7', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms', priority: '0.3', changefreq: 'yearly' },
    ];

    // Fetch published blog articles
    const { data: articles, error } = await supabase
      .from('generated_articles')
      .select('slug, category, updated_at, publish_date')
      .eq('status', 'published')
      .not('publish_date', 'is', null)
      .order('publish_date', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }

    // Build XML sitemap with XSLT styling
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
    xml += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
    xml += 'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 ';
    xml += 'http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Add blog posts
    if (articles && articles.length > 0) {
      for (const article of articles) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/guia/${article.category}/${article.slug}</loc>\n`;
        xml += `    <lastmod>${new Date(article.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';

    // Upload to storage bucket as public file
    const { error: uploadError } = await supabase
      .storage
      .from('client-assets')
      .upload('sitemap.xml', new Blob([xml], { type: 'application/xml' }), {
        contentType: 'application/xml',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Error uploading sitemap:', uploadError);
      throw uploadError;
    }

    console.log(`Updated sitemap with ${staticPages.length} static pages and ${articles?.length || 0} blog posts`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sitemap updated successfully',
        urls: staticPages.length + (articles?.length || 0)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error updating sitemap:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
