import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Fetch the sitemap from the edge function and display it
    fetch('https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/generate-sitemap')
      .then(response => response.text())
      .then(xml => {
        // Replace the entire document with the XML
        document.open();
        document.write(xml);
        document.close();
      })
      .catch(error => {
        console.error('Error fetching sitemap:', error);
        document.body.innerHTML = '<error>Failed to load sitemap</error>';
      });
  }, []);

  return null;
};

export default Sitemap;
