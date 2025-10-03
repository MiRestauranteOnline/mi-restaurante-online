import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Activity, Database, DollarSign, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  restaurant_name: string;
  plan_type: string;
  monthly_visits_limit: number;
  monthly_bandwidth_limit_gb: number;
}

interface UsageData {
  client_id: string;
  total_visits: number;
  total_bandwidth_gb: number;
  overage_charge: number;
}

interface ClientUsage extends Client {
  visits_used: number;
  bandwidth_used: number;
  visits_percentage: number;
  bandwidth_percentage: number;
  status: 'ok' | 'warning' | 'critical';
  overage_charge: number;
}

export default function AdminMonitoring() {
  const [clients, setClients] = useState<Client[]>([]);
  const [currentUsage, setCurrentUsage] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all clients
      const { data: clientsData, error: clientsError } = await (supabase as any)
        .from('clients')
        .select('id, restaurant_name, plan_type, monthly_visits_limit, monthly_bandwidth_limit_gb');

      if (clientsError) throw clientsError;

      // Fetch current month usage for all clients
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const { data: usageData, error: usageError } = await (supabase as any)
        .from('client_monthly_usage')
        .select('client_id, total_visits, total_bandwidth_gb, overage_charge')
        .eq('month', currentMonth);

      if (usageError) throw usageError;

      setClients(clientsData || []);
      setCurrentUsage(usageData || []);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      toast.error('Error al cargar datos de monitoreo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const combineClientUsage = (): ClientUsage[] => {
    return clients.map(client => {
      const usage = currentUsage.find(u => u.client_id === client.id);
      const visits = usage?.total_visits || 0;
      const bandwidth = usage?.total_bandwidth_gb || 0;
      
      const visitsPercentage = (visits / client.monthly_visits_limit) * 100;
      const bandwidthPercentage = (bandwidth / client.monthly_bandwidth_limit_gb) * 100;
      
      let status: 'ok' | 'warning' | 'critical' = 'ok';
      if (visitsPercentage >= 100 || bandwidthPercentage >= 100) {
        status = 'critical';
      } else if (visitsPercentage >= 80 || bandwidthPercentage >= 80) {
        status = 'warning';
      }

      return {
        ...client,
        visits_used: visits,
        bandwidth_used: bandwidth,
        visits_percentage: Math.round(visitsPercentage),
        bandwidth_percentage: Math.round(bandwidthPercentage),
        status,
        overage_charge: usage?.overage_charge || 0
      };
    }).sort((a, b) => Math.max(b.visits_percentage, b.bandwidth_percentage) - Math.max(a.visits_percentage, a.bandwidth_percentage));
  };

  const getTotalVisits = () => {
    return currentUsage.reduce((sum, u) => sum + u.total_visits, 0);
  };

  const getTotalBandwidth = () => {
    return currentUsage.reduce((sum, u) => sum + u.total_bandwidth_gb, 0);
  };

  const getTotalRevenue = () => {
    return currentUsage.reduce((sum, u) => sum + (u.overage_charge || 0), 0);
  };

  const getClientsAtRisk = () => {
    const combined = combineClientUsage();
    return combined.filter(c => c.status === 'warning' || c.status === 'critical').length;
  };

  const getStatusBadge = (status: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Advertencia</Badge>;
      default:
        return <Badge variant="default" className="bg-green-500">OK</Badge>;
    }
  };

  const handleClientClick = (clientId: string) => {
    navigate('/admin/usage', { state: { clientId } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Cargando panel de monitoreo...</div>
      </div>
    );
  }

  const clientUsage = combineClientUsage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Monitoreo Admin</h1>
          <p className="text-muted-foreground mt-1">
            Vista general de uso de todos los clientes
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Platform Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">Clientes activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalVisits().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth Total</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalBandwidth().toFixed(2)} GB</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Proyectados</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/{getTotalRevenue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Excedentes este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients at Risk Alert */}
      {getClientsAtRisk() > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Clientes en Riesgo
            </CardTitle>
            <CardDescription>
              {getClientsAtRisk()} clientes han alcanzado o superado el 80% de sus límites
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Client Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard de Uso de Clientes</CardTitle>
          <CardDescription>
            Clientes ordenados por mayor uso (haz clic para ver detalles)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Visitas %</TableHead>
                  <TableHead className="text-right">Bandwidth %</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientUsage.map((client) => (
                  <TableRow
                    key={client.id}
                    className={`cursor-pointer hover:bg-accent ${
                      client.status === 'critical' ? 'bg-red-50 dark:bg-red-950/10' :
                      client.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/10' :
                      'bg-green-50 dark:bg-green-950/10'
                    }`}
                    onClick={() => handleClientClick(client.id)}
                  >
                    <TableCell className="font-medium">{client.restaurant_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {client.plan_type.charAt(0).toUpperCase() + client.plan_type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {client.visits_percentage}%
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {client.bandwidth_percentage}%
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(client.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
