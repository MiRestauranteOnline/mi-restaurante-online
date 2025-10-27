import { CloudflareMonitoring as MonitoringComponent } from '@/components/admin/CloudflareMonitoring';
import { ResendMonitoring } from '@/components/admin/ResendMonitoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, AlertTriangle, CheckCircle, Server, Globe, Hammer, Zap, Shield } from 'lucide-react';
import { useCloudflareMetrics } from '@/hooks/useCloudflareMetrics';
import { TurnstileMonitoring } from './TurnstileMonitoring';

export function CloudflareMonitoring() {
  const { metrics, loading, error, refetch } = useCloudflareMetrics();

  const getProgressColor = (percentage: number) => {
    if (percentage < 60) return 'bg-green-600';
    if (percentage < 80) return 'bg-amber-600';
    return 'bg-red-600';
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage < 60) return <Badge className="bg-green-600">Saludable</Badge>;
    if (percentage < 80) return <Badge className="bg-amber-600">Vigilar</Badge>;
    return <Badge variant="destructive">Crítico</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error || 'No se pudieron cargar las métricas de Cloudflare'}
        </AlertDescription>
      </Alert>
    );
  }

  const projectsPercentage = (metrics.total_projects / metrics.projects_limit) * 100;
  const domainsPercentage = (metrics.total_domains / metrics.domains_limit) * 100;
  const buildsPercentage = (metrics.builds_this_month / metrics.builds_limit) * 100;
  const workersPercentage = (metrics.worker_requests_today / metrics.worker_requests_limit) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Monitoreo Cloudflare</h2>
          <p className="text-muted-foreground">
            Seguimiento de recursos y protección Turnstile
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Tabs for different monitoring sections */}
      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Cloudflare Pages
          </TabsTrigger>
          <TabsTrigger value="turnstile" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Turnstile Protection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-6">{/* Pages monitoring content */}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plan Actual</CardTitle>
            <Badge variant="outline" className="text-lg">
              {metrics.current_plan}
            </Badge>
          </div>
          <CardDescription>
            Plan de Cloudflare Pages activo
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Upgrade Recommendations */}
      {metrics.upgrade_recommendations.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Recomendaciones de Actualización</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {metrics.upgrade_recommendations.map((rec, index) => (
                <li key={index} className="text-sm">• {rec}</li>
              ))}
            </ul>
            <div className="mt-4 text-sm">
              <strong>Cloudflare Pro:</strong> $20/mes - 250+ dominios, soporte prioritario<br />
              <strong>Workers Paid:</strong> $5/mes - 10M requests/día para Functions
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Proyectos (Sitios)</CardTitle>
              </div>
              {getStatusBadge(projectsPercentage)}
            </div>
            <CardDescription>
              {metrics.total_projects} de {metrics.projects_limit} proyectos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={Math.min(projectsPercentage, 100)}>
              <div
                className={`h-full ${getProgressColor(projectsPercentage)} transition-all`}
                style={{ width: `${Math.min(projectsPercentage, 100)}%` }}
              />
            </Progress>
            <p className="text-xs text-muted-foreground">
              {projectsPercentage.toFixed(1)}% del límite - 100 sitios por proyecto
            </p>
          </CardContent>
        </Card>

        {/* Custom Domains */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Dominios Personalizados</CardTitle>
              </div>
              {getStatusBadge(domainsPercentage)}
            </div>
            <CardDescription>
              {metrics.total_domains} de {metrics.domains_limit} dominios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={Math.min(domainsPercentage, 100)}>
              <div
                className={`h-full ${getProgressColor(domainsPercentage)} transition-all`}
                style={{ width: `${Math.min(domainsPercentage, 100)}%` }}
              />
            </Progress>
            <p className="text-xs text-muted-foreground">
              {domainsPercentage.toFixed(1)}% del límite - Actualizar a Pro para más
            </p>
          </CardContent>
        </Card>

        {/* Builds This Month */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hammer className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Builds Este Mes</CardTitle>
              </div>
              {getStatusBadge(buildsPercentage)}
            </div>
            <CardDescription>
              {metrics.builds_this_month} de {metrics.builds_limit} builds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={Math.min(buildsPercentage, 100)}>
              <div
                className={`h-full ${getProgressColor(buildsPercentage)} transition-all`}
                style={{ width: `${Math.min(buildsPercentage, 100)}%` }}
              />
            </Progress>
            <p className="text-xs text-muted-foreground">
              {buildsPercentage.toFixed(1)}% del límite mensual - Se resetea cada mes
            </p>
          </CardContent>
        </Card>

        {/* Pages Functions Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Functions Requests (Hoy)</CardTitle>
              </div>
              {getStatusBadge(workersPercentage)}
            </div>
            <CardDescription>
              {metrics.worker_requests_today.toLocaleString()} de {metrics.worker_requests_limit.toLocaleString()} requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={Math.min(workersPercentage, 100)}>
              <div
                className={`h-full ${getProgressColor(workersPercentage)} transition-all`}
                style={{ width: `${Math.min(workersPercentage, 100)}%` }}
              />
            </Progress>
            <p className="text-xs text-muted-foreground">
              {workersPercentage.toFixed(1)}% del límite diario - Workers Paid para 10M/día
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Recursos Ilimitados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong className="text-green-600">✓ Ancho de banda:</strong> Ilimitado en todos los planes<br />
            <strong className="text-green-600">✓ Requests:</strong> Ilimitados para contenido estático<br />
            <strong className="text-green-600">✓ SSL/TLS:</strong> Gratis y automático<br />
            <strong className="text-green-600">✓ DDoS Protection:</strong> Incluido sin costo
          </p>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="resend">
          <ResendMonitoring />
        </TabsContent>

        <TabsContent value="turnstile">
          <TurnstileMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
}
