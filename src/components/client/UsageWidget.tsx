import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, HardDrive, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsageStats } from '@/hooks/useUsageStats';

interface UsageWidgetProps {
  clientId: string;
  analyticsEnabled: boolean;
}

export function UsageWidget({ clientId, analyticsEnabled }: UsageWidgetProps) {
  const navigate = useNavigate();
  const { stats, loading, error } = useUsageStats(clientId);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'No se pudieron cargar las estadísticas de uso'}
        </AlertDescription>
      </Alert>
    );
  }

  const visitsPercentage = (stats.current_visits / stats.visits_limit) * 100;
  const bandwidthPercentage = (stats.current_bandwidth_gb / stats.bandwidth_limit_gb) * 100;

  const getStatusColor = (percentage: number) => {
    if (percentage < 80) return 'text-green-600';
    if (percentage < 95) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 80) return 'bg-green-600';
    if (percentage < 95) return 'bg-amber-600';
    return 'bg-red-600';
  };

  const showUpgradeCTA = stats.plan_type === 'basic' || visitsPercentage > 80 || bandwidthPercentage > 80;
  const isNearLimit = visitsPercentage >= 80 || bandwidthPercentage >= 80;
  const isOverLimit = stats.overage_charge > 0;

  return (
    <div className="space-y-4">
      {!analyticsEnabled && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            Actualiza a Analíticas Avanzadas para obtener información detallada
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Uso del Plan</CardTitle>
          <CardDescription>
            Monitoreo de visitas y ancho de banda del mes actual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visits Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Visitas</span>
              </div>
              <span className={`text-sm font-semibold ${getStatusColor(visitsPercentage)}`}>
                {stats.current_visits.toLocaleString()} / {stats.visits_limit.toLocaleString()}
              </span>
            </div>
            <Progress value={Math.min(visitsPercentage, 100)} className="h-2">
              <div 
                className={`h-full ${getProgressColor(visitsPercentage)} transition-all`}
                style={{ width: `${Math.min(visitsPercentage, 100)}%` }}
              />
            </Progress>
            <p className="text-xs text-muted-foreground">
              {visitsPercentage.toFixed(1)}% utilizado
            </p>
          </div>

          {/* Bandwidth Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Ancho de Banda</span>
              </div>
              <span className={`text-sm font-semibold ${getStatusColor(bandwidthPercentage)}`}>
                {stats.current_bandwidth_gb.toFixed(2)} GB / {stats.bandwidth_limit_gb} GB
              </span>
            </div>
            <Progress value={Math.min(bandwidthPercentage, 100)} className="h-2">
              <div 
                className={`h-full ${getProgressColor(bandwidthPercentage)} transition-all`}
                style={{ width: `${Math.min(bandwidthPercentage, 100)}%` }}
              />
            </Progress>
            <p className="text-xs text-muted-foreground">
              {bandwidthPercentage.toFixed(1)}% utilizado
            </p>
          </div>

          {/* Status Message */}
          <div className="pt-4 border-t">
            {isOverLimit ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold">Cargo por exceso: S/ {stats.overage_charge.toFixed(2)}</div>
                  <div className="text-sm mt-1">
                    Se aplicará en tu próxima factura
                  </div>
                </AlertDescription>
              </Alert>
            ) : isNearLimit ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Estás cerca de alcanzar tus límites. {stats.days_remaining} días restantes en este período.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-sm text-muted-foreground">
                <span className="text-green-600 font-semibold">✓ Dentro de los límites</span>
                <p className="mt-1">{stats.days_remaining} días restantes en este período</p>
              </div>
            )}
          </div>

          {/* Upgrade CTA */}
          {showUpgradeCTA && (
            <Button 
              onClick={() => navigate('/client/subscription')} 
              className="w-full"
              variant={isNearLimit ? 'default' : 'outline'}
            >
              {stats.plan_type === 'basic' ? 'Actualizar Plan' : 'Ver Opciones de Plan'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
