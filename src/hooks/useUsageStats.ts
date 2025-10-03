import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsageStats {
  current_visits: number;
  visits_limit: number;
  current_bandwidth_gb: number;
  bandwidth_limit_gb: number;
  overage_visits: number;
  overage_bandwidth_gb: number;
  overage_charge: number;
  days_remaining: number;
  plan_type: string;
}

interface UseUsageStatsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useUsageStats(
  clientId?: string,
  options: UseUsageStatsOptions = {}
) {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: invokeError } = await supabase.functions.invoke('get-usage-stats', {
        body: clientId ? { client_id: clientId } : undefined,
      });

      if (invokeError) throw invokeError;
      if (data.error) throw new Error(data.error);

      setStats(data);
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch usage stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [clientId, autoRefresh, refreshInterval]);

  return { stats, loading, error, refetch: fetchStats };
}
