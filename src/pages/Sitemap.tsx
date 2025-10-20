import { useEffect } from 'react';

export default function Sitemap() {
  useEffect(() => {
    // Redirect to the edge function that serves raw XML
    const target = 'https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/serve-sitemap';
    window.location.replace(target);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      Redirecting to sitemap...
      <br />
      If you are not redirected, open
      {' '}
      <a href="https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/serve-sitemap">
        sitemap.xml
      </a>
      .
    </div>
  );
}
