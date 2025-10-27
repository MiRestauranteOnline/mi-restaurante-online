import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResendMetrics {
  current_plan: string;
  daily_limit: number;
  monthly_limit: number;
  emails_sent_today: number;
  emails_sent_this_month: number;
  daily_usage_percentage: number;
  monthly_usage_percentage: number;
  emails_by_type: {
    support_requests: number;
    support_responses: number;
    reclamaciones: number;
  };
  failed_emails_count: number;
  upgrade_recommendations: string[];
}

export function useResendMetrics(autoRefresh = false, refreshInterval = 60000) {
  const [metrics, setMetrics] = useState<ResendMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: invokeError } = await supabase.functions.invoke('get-resend-metrics');

      if (invokeError) throw invokeError;
      if (data.error) throw new Error(data.error);

      setMetrics(data);
    } catch (err) {
      console.error('Error fetching Resend metrics:', err);
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
