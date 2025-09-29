import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsOverview } from '@/components/client/AnalyticsOverview';

export default function ClientAnalytics() {
  const { clientId } = useParams<{ clientId: string }>();

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analíticas</h1>
        <p className="text-muted-foreground">Resumen de métricas clave de tu sitio web</p>
      </div>
      <AnalyticsOverview clientId={clientId} />
    </div>
  );
}