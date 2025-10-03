import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, RefreshCw, TrendingUp, Calendar, Database, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
}

interface UsageData {
  currentMonth: string;
  plan_type: string;
  limits: {
    visits: number;
    bandwidth_gb: number;
  };
  usage: {
    visits: number;
    bandwidth_gb: number;
    visits_percentage: number;
    bandwidth_percentage: number;
  };
  overage: {
    visits: number;
    bandwidth_gb: number;
    projected_charge: number;
    currency: string;
  };
  warnings: {
    visits_warning: boolean;
    visits_exceeded: boolean;
    bandwidth_warning: boolean;
    bandwidth_exceeded: boolean;
  };
}

export default function UsageMonitoring() {
  const { selectedClientId, selectedClient } = useOutletContext<{
    selectedClientId: string;
    selectedClient: Client;
  }>();
  
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsageData = async () => {
    if (!selectedClientId) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-usage-stats', {
        body: { client_id: selectedClientId }
      });

      if (error) throw error;
      setUsageData(data);
    } catch (error) {
      console.error('Error fetching usage data:', error);
      toast.error('Error al cargar datos de uso');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, [selectedClientId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsageData();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const getDaysRemainingInMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysRemaining = lastDay.getDate() - now.getDate();
    return daysRemaining;
  };

  const getProjectedUsage = (currentUsage: number, daysRemaining: number) => {
    const now = new Date();
    const daysElapsed = now.getDate();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    if (daysElapsed === 0) return currentUsage;
    const dailyAverage = currentUsage / daysElapsed;
    return Math.round(dailyAverage * totalDays);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Cargando datos de uso...</div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">No se encontraron datos de uso</div>
      </div>
    );
  }

  const daysRemaining = getDaysRemainingInMonth();
  const projectedVisits = getProjectedUsage(usageData.usage.visits, daysRemaining);
  const projectedBandwidth = (usageData.usage.bandwidth_gb / (new Date().getDate())) * new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoreo de Uso</h1>
          <p className="text-muted-foreground mt-1">
            {selectedClient?.restaurant_name} • {new Date(usageData.currentMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Plan {usageData.plan_type.charAt(0).toUpperCase() + usageData.plan_type.slice(1)}
          </Badge>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(usageData.warnings.visits_exceeded || usageData.warnings.bandwidth_exceeded) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>¡Límite excedido!</AlertTitle>
          <AlertDescription>
            Has superado tu límite mensual. Se aplicarán cargos por excedente: S/15 por cada 1,000 visitas adicionales o 3GB de ancho de banda.
          </AlertDescription>
        </Alert>
      )}

      {(usageData.warnings.visits_warning || usageData.warnings.bandwidth_warning) && 
       !(usageData.warnings.visits_exceeded || usageData.warnings.bandwidth_exceeded) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Advertencia de uso</AlertTitle>
          <AlertDescription>
            Has utilizado el 80% o más de tu límite mensual. Considera monitorear tu uso para evitar cargos adicionales.
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Progress Bars */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visitas Mensuales</CardTitle>
            <CardDescription>
              {usageData.usage.visits.toLocaleString()} / {usageData.limits.visits.toLocaleString()} visitas ({usageData.usage.visits_percentage}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={usageData.usage.visits_percentage} 
              className={`h-3 ${getProgressColor(usageData.usage.visits_percentage)}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ancho de Banda Mensual</CardTitle>
            <CardDescription>
              {usageData.usage.bandwidth_gb.toFixed(2)} / {usageData.limits.bandwidth_gb} GB ({usageData.usage.bandwidth_percentage}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={usageData.usage.bandwidth_percentage} 
              className={`h-3 ${getProgressColor(usageData.usage.bandwidth_percentage)}`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Overage Card */}
      {(usageData.overage.visits > 0 || usageData.overage.bandwidth_gb > 0) && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Cargo por Excedente Proyectado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-destructive">
                {usageData.overage.currency}{usageData.overage.projected_charge.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Basado en {usageData.overage.visits > 0 && `${usageData.overage.visits.toLocaleString()} visitas adicionales`}
                {usageData.overage.visits > 0 && usageData.overage.bandwidth_gb > 0 && ' y '}
                {usageData.overage.bandwidth_gb > 0 && `${usageData.overage.bandwidth_gb.toFixed(2)}GB de ancho de banda adicional`}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas Actuales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.usage.visits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              de {usageData.limits.visits.toLocaleString()} límite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ancho de Banda</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.usage.bandwidth_gb.toFixed(2)} GB</div>
            <p className="text-xs text-muted-foreground">
              de {usageData.limits.bandwidth_gb} GB límite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Días Restantes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysRemaining}</div>
            <p className="text-xs text-muted-foreground">
              días en este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Proyectado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectedVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              visitas proyectadas fin de mes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
