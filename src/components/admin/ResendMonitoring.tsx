import { RefreshCw, Mail, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useResendMetrics } from "@/hooks/useResendMetrics";

export function ResendMonitoring() {
  const { metrics, loading, error, refetch } = useResendMetrics();

  const getProgressColor = (percentage: number) => {
    if (percentage >= 95) return "bg-red-500";
    if (percentage >= 90) return "bg-orange-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 95) return <Badge variant="destructive">Crítico</Badge>;
    if (percentage >= 90) return <Badge className="bg-orange-500">Alerta</Badge>;
    if (percentage >= 70) return <Badge className="bg-yellow-500">Vigilar</Badge>;
    return <Badge className="bg-green-500">Saludable</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error al cargar métricas: {error}</AlertDescription>
      </Alert>
    );
  }

  if (!metrics) return null;

  const dailyPercentage = metrics.daily_usage_percentage;
  const monthlyPercentage = metrics.monthly_usage_percentage;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoreo de Resend</h2>
          <p className="text-muted-foreground">
            Seguimiento del uso de correos electrónicos • El uso se reinicia el {metrics.usage_resets_on}
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Plan & Usage Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Actual</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.current_plan}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.daily_limit}/día • {metrics.monthly_limit}/mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Diario</CardTitle>
            {getStatusBadge(dailyPercentage)}
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{metrics.emails_sent_today}</div>
              <div className="text-sm text-muted-foreground">/ {metrics.daily_limit}</div>
            </div>
            <Progress 
              value={dailyPercentage} 
              className={`h-2 ${getProgressColor(dailyPercentage)}`}
            />
            <p className="text-xs text-muted-foreground">
              {dailyPercentage.toFixed(1)}% utilizado hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Mensual</CardTitle>
            {getStatusBadge(monthlyPercentage)}
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{metrics.emails_sent_this_month}</div>
              <div className="text-sm text-muted-foreground">/ {metrics.monthly_limit}</div>
            </div>
            <Progress 
              value={monthlyPercentage} 
              className={`h-2 ${getProgressColor(monthlyPercentage)}`}
            />
            <p className="text-xs text-muted-foreground">
              {monthlyPercentage.toFixed(1)}% utilizado este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose por Tipo de Email</CardTitle>
          <CardDescription>Emails enviados este mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Solicitudes de Soporte</p>
                <p className="text-2xl font-bold">{metrics.emails_by_type.support_requests}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Respuestas de Soporte</p>
                <p className="text-2xl font-bold">{metrics.emails_by_type.support_responses}</p>
              </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reclamaciones</p>
                <p className="text-2xl font-bold">{metrics.emails_by_type.reclamaciones}</p>
              </div>
              <Mail className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failed Emails & Recommendations */}
      {(metrics.failed_emails_count > 0 || metrics.upgrade_recommendations.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {metrics.failed_emails_count > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Emails Fallidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">
                  {metrics.failed_emails_count}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Emails que no pudieron enviarse este mes
                </p>
              </CardContent>
            </Card>
          )}

          {metrics.upgrade_recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {metrics.upgrade_recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
