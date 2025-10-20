import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Sitemap() {
  useEffect(() => {
    // Fetch and serve the sitemap from storage
    const fetchSitemap = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('client-assets')
          .download('sitemap.xml');

        if (error) {
          console.error('Error fetching sitemap:', error);
          return;
        }

        // Read the blob as text
        const text = await data.text();
        
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
