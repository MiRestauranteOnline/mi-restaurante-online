import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Redirect to the edge function that serves the actual sitemap
    window.location.replace('https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/generate-sitemap');
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#666'
    }}>
      <p>Redirecting to sitemap...</p>
    </div>
  );
};

export default Sitemap;
