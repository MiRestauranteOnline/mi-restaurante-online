import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Sitemap() {
  useEffect(() => {
    // Fetch and serve the sitemap from storage
    const fetchSitemap = async () => {
      try {
        // Prefer a cache-busted public URL to avoid CDN caching
        const { data: pub } = supabase.storage
          .from('client-assets')
          .getPublicUrl('sitemap.xml');

        const cacheBustedUrl = `${pub.publicUrl}?cb=${Date.now()}`;
        const resp = await fetch(cacheBustedUrl, { cache: 'no-store' });
        if (!resp.ok) {
          console.error('HTTP error fetching sitemap:', resp.status, resp.statusText);
          return;
        }

        const text = await resp.text();
        
        // Replace the entire document with the XML
        document.open();
        document.write(text);
        document.close();
      } catch (err) {
        console.error('Failed to load sitemap:', err);
      }
    };

    fetchSitemap();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      Loading sitemap...
    </div>
  );
}
