import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { AnalyticsOverview } from '@/components/client/AnalyticsOverview';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function ClientAnalytics() {
  const { clientId } = useParams<{ clientId: string }>();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    if (clientId) {
      supabase
        .from('premium_features')
        .select('analytics_enabled')
        .eq('client_id', clientId)
        .single()
        .then(({ data }) => {
          setAnalyticsEnabled(data?.analytics_enabled || false);
        });
    }
  }, [clientId]);

  if (!clientId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No se encontró el ID del cliente</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Analíticas</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Resumen de métricas clave de tu sitio web</p>
      </div>
      
      <AnalyticsOverview clientId={clientId} />
    </div>
  );
}