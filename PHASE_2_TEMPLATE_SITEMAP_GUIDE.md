# Phase 2: Template Project Multitenant Sitemap Implementation

## Overview
This guide covers implementing dynamic, per-tenant sitemaps for the restaurant template project (restaurant-template-1) hosted on Cloudflare Pages.

## What You'll Need
- Access to the `restaurant-template-1` GitHub repository
- Supabase connection details (same as this project)
- Understanding of tenant identification (via subdomain/custom domain)

---

## Step 1: Create Dynamic Sitemap Pages Function

Create `/functions/sitemap.xml.ts` in the template project:

```typescript
interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = context.env;
  const request = context.request;
  
  // Extract host to identify tenant
  const host = request.headers.get('host') || '';
  const tenantDomain = host.replace(/^www\./, ''); // Remove www prefix
  
  try {
    // Fetch client data by domain or subdomain
    const clientResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/clients?select=id,subdomain,custom_domain,restaurant_name&or=(subdomain.eq.${encodeURIComponent(tenantDomain)},custom_domain.eq.${encodeURIComponent(tenantDomain)})&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    
    const clients = clientResponse.ok ? await clientResponse.json() : [];
    if (!clients || clients.length === 0) {
      throw new Error('Client not found');
    }
    
    const client = clients[0];
    const clientId = client.id;
    const baseUrl = `https://${tenantDomain}`;
    
    // Fetch client's admin_content to check enabled sections
    const contentResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/admin_content?select=*&client_id=eq.${clientId}&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    const contentData = contentResponse.ok ? await contentResponse.json() : [];
    const content = contentData[0] || {};
    
    // Fetch client's menu items
    const menuResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/menu_items?select=id,updated_at&client_id=eq.${clientId}&is_active=eq.true`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    const menuItems = menuResponse.ok ? await menuResponse.json() : [];
    
    // Fetch client's reviews
    const reviewsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/reviews?select=id,updated_at&client_id=eq.${clientId}&is_approved=eq.true`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    const reviews = reviewsResponse.ok ? await reviewsResponse.json() : [];
    
    // Build XML sitemap
    const today = new Date().toISOString().split('T')[0];
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Homepage
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += '  </url>\n';
    
    // Menu page (if has menu items)
    if (menuItems.length > 0) {
      const menuLastMod = menuItems.reduce((latest, item) => {
        const itemDate = new Date(item.updated_at);
        return itemDate > latest ? itemDate : latest;
      }, new Date(0));
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/menu</loc>\n`;
      xml += `    <lastmod>${menuLastMod.toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += '  </url>\n';
    }
    
    // About page
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/about</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
    
    // Contact page
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/contact</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
    
    // Reviews page (if has reviews)
    if (reviews.length > 0) {
      const reviewsLastMod = reviews.reduce((latest, item) => {
        const itemDate = new Date(item.updated_at);
        return itemDate > latest ? itemDate : latest;
      }, new Date(0));
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/reviews</loc>\n`;
      xml += `    <lastmod>${reviewsLastMod.toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += '  </url>\n';
    }
    
    xml += '</urlset>';
    
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800', // 30 min cache
        'X-Tenant-Domain': tenantDomain,
      },
    });
    
  } catch (err) {
    console.error('Sitemap generation error:', err);
    
    // Fallback minimal sitemap
    const today = new Date().toISOString().split('T')[0];
    const baseUrl = `https://${host.replace(/^www\./, '')}`;
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `  <url>\n` +
      `    <loc>${baseUrl}/</loc>\n` +
      `    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>weekly</changefreq>\n` +
      `    <priority>1.0</priority>\n` +
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
```

---

## Step 2: Create Dynamic Robots.txt Pages Function

Create `/functions/robots.txt.ts` in the template project:

```typescript
interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = context.env;
  const request = context.request;
  
  // Extract host to identify tenant
  const host = request.headers.get('host') || '';
  const tenantDomain = host.replace(/^www\./, '');
  
  try {
    // Fetch client to check if it's a demo/sandbox
    const clientResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/clients?select=subdomain,custom_domain,subscription_status&or=(subdomain.eq.${encodeURIComponent(tenantDomain)},custom_domain.eq.${encodeURIComponent(tenantDomain)})&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    
    const clients = clientResponse.ok ? await clientResponse.json() : [];
    const client = clients[0];
    
    // Check if this is a demo/inactive site
    const isDemo = !client || client.subscription_status !== 'active';
    
    let robotsTxt = '';
    
    if (isDemo) {
      // Block all crawlers for demo/inactive sites
      robotsTxt = `User-agent: *
Disallow: /

# This site is not active or is a demo
`;
    } else {
      // Allow crawling for active sites
      robotsTxt = `User-agent: *
Allow: /

# Sitemap location
Sitemap: https://${tenantDomain}/sitemap.xml
`;
    }
    
    return new Response(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 1 hour cache
      },
    });
    
  } catch (err) {
    console.error('Robots.txt generation error:', err);
    
    // Safe fallback - allow but be cautious
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://${tenantDomain}/sitemap.xml
`;
    
    return new Response(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
};
```

---

## Step 3: Configure Environment Variables in Cloudflare Pages

In your Cloudflare Pages project settings:

1. Go to Settings → Environment Variables
2. Add these variables for **Production** and **Preview**:
   - `SUPABASE_URL`: `https://ptzcetvcccnojdbzzlyt.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8`

---

## Step 4: Test the Implementation

### Test locally:
```bash
# Install wrangler if not already installed
npm install -g wrangler

# Run locally
wrangler pages dev . --binding SUPABASE_URL=https://ptzcetvcccnojdbzzlyt.supabase.co --binding SUPABASE_ANON_KEY=your_key_here
```

### Test in production:
1. Deploy to Cloudflare Pages
2. Test with different domains:
   ```bash
   curl -H "Host: clientsubdomain.mirestauranteonline.com" https://your-pages-url/sitemap.xml
   curl -H "Host: customdomain.com" https://your-pages-url/sitemap.xml
   ```

---

## Step 5: Submit Sitemaps to Google Search Console

For each client with an active custom domain:

1. Verify domain ownership in Google Search Console
2. Submit sitemap: `https://client-domain.com/sitemap.xml`
3. Monitor indexing status

### Optional: Automated Submission
Create a webhook endpoint to ping Google when content changes:

```typescript
// In supabase/functions/notify-sitemap-update/index.ts
const sitemapUrl = `https://${clientDomain}/sitemap.xml`;
await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
```

---

## Step 6: Monitor and Optimize

### Caching Strategy:
- **30 minutes** for active sites (frequent updates expected)
- **5 minutes** for fallback (errors should recover quickly)
- **1 hour** for robots.txt (changes infrequently)

### Cache Purging:
Optionally, purge sitemap cache when:
- Client publishes/updates content
- Menu items change
- Reviews are approved

Use Cloudflare API:
```typescript
await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    files: [`https://${domain}/sitemap.xml`]
  })
});
```

---

## Key Differences from Main Project

| Feature | Main Project (mirestaurante.online) | Template Project (client sites) |
|---------|-------------------------------------|----------------------------------|
| Host detection | Static (mirestaurante.online) | Dynamic (reads Host header) |
| Content | Static pages + blog articles | Client-specific menu, reviews, pages |
| Robots.txt | Static file | Dynamic per tenant |
| Cache TTL | 30 min | 30 min (10 min for demos) |
| Fallback | Minimal homepage + blog | Minimal homepage only |

---

## Troubleshooting

### Issue: Sitemap returns 404
- **Check**: Environment variables are set in Cloudflare Pages
- **Check**: Function file is at `/functions/sitemap.xml.ts` (exact path)
- **Check**: Deployment succeeded without errors

### Issue: Wrong client data returned
- **Check**: Host header detection logic
- **Check**: Database query (subdomain vs custom_domain)
- **Check**: RLS policies allow public read for clients table

### Issue: Sitemap has wrong URLs
- **Check**: `baseUrl` uses the actual host, not a hardcoded value
- **Check**: Tenant domain is extracted correctly (www prefix removed)

### Issue: Cache not updating
- **Solution**: Lower TTL temporarily or implement cache purging
- **Check**: Cloudflare cache settings in dashboard

---

## Success Criteria

✅ Each tenant gets a unique sitemap with only their URLs
✅ All URLs use the tenant's canonical domain
✅ Demo/inactive sites return noindex robots.txt
✅ Sitemap updates within 30 minutes of content changes
✅ Fallback sitemap returns 200 (not 5xx) on errors
✅ Cache is set appropriately (30 min for normal, 5 min for fallback)

---

## Next Steps

After implementing Phase 2:
1. Monitor sitemap generation in Cloudflare Analytics
2. Track indexing status in Google Search Console
3. Consider implementing sitemap index for large sites (50k+ URLs)
4. Add image sitemaps if clients upload many images
5. Implement automated cache purging on content updates
