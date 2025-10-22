import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CloudflareMetrics {
  current_plan: string;
  total_projects: number;
  total_domains: number;
  builds_this_month: number;
  builds_limit: number;
  projects_limit: number;
  domains_limit: number;
  worker_requests_today: number;
  worker_requests_limit: number;
  upgrade_recommendations: string[];
}

export function useCloudflareMetrics(autoRefresh = false, refreshInterval = 60000) {
  const [metrics, setMetrics] = useState<CloudflareMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: invokeError } = await supabase.functions.invoke('get-cloudflare-metrics');

      if (invokeError) throw invokeError;
      if (data.error) throw new Error(data.error);

      setMetrics(data);
    } catch (err) {
      console.error('Error fetching Cloudflare metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return { metrics, loading, error, refetch: fetchMetrics };
}
