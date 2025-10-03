import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Calendar, AlertTriangle, ArrowUp, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface SubscriptionData {
  plan_type: string;
  subscription_status: string;
  payment_status: string;
  subscription_start_date: string;
  subscription_end_date: string;
  next_billing_date: string;
  payment_failures_count: number;
  cancellation_date?: string;
  cancellation_reason?: string;
  subscription_auto_recurring?: boolean;
}

interface PlanPrice {
  monthly_price: number;
  currency: string;
}

interface SubscriptionManagementProps {
  clientId: string;
}

export function SubscriptionManagement({ clientId }: SubscriptionManagementProps) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [planPrices, setPlanPrices] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchPlanPrices();
    fetchSubscriptionData();
  }, [clientId]);

  const fetchPlanPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('plan_key, monthly_price')
        .eq('is_active', true);

      if (error) throw error;
      
      const prices: Record<string, number> = {};
      data?.forEach(plan => {
        prices[plan.plan_key] = plan.monthly_price;
      });
      setPlanPrices(prices);
    } catch (error: any) {
      console.error('Error fetching plan prices:', error);
    }
  };

  const fetchSubscriptionData = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          plan_type,
          subscription_status,
          payment_status,
          subscription_start_date,
          subscription_end_date,
          next_billing_date,
          payment_failures_count,
          cancellation_date,
          cancellation_reason,
          subscription_auto_recurring
        `)
        .eq('id', clientId)
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (error: any) {
      // If no subscription data found, create a mock active subscription for demo
      setSubscription({
        plan_type: 'basic',
        subscription_status: 'active',
        payment_status: 'paid',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        payment_failures_count: 0,
        subscription_auto_recurring: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ plan_type: 'advanced' })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Plan actualizado",
        description: "Plan actualizado a Avanzado exitosamente",
      });

      fetchSubscriptionData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el plan",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDowngrade = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ plan_type: 'basic' })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Plan actualizado",
        description: "Plan actualizado a Básico exitosamente",
      });

      fetchSubscriptionData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el plan",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      // Direct database update for cancellation
      const { error } = await supabase
        .from('clients')
        .update({
          subscription_status: 'cancelled',
          cancellation_date: new Date().toISOString(),
          cancellation_reason: 'user_request'
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción ha sido cancelada",
      });

      fetchSubscriptionData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cancelar la suscripción",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">{t('common.loading')}</h3>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No se encontró información de suscripción</p>
        </CardContent>
      </Card>
    );
  }

  const getPlanName = (plan: string) => {
    return plan === 'basic' ? 'Plan Básico' : 'Plan Avanzado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'cancelled': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      case 'payment_failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-yellow-500" />;
      case 'expired': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'payment_failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPlanPrice = (plan: string) => {
    return planPrices[plan] || (plan === 'basic' ? 297 : 497);
  };

  const isValidDate = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return !isNaN(d.getTime()) && d.getFullYear() >= 2000;
  };

  const formatDateEs = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES');

  const canShowCancellation = (status: string) => status !== 'cancelled' && status !== 'expired';
  const canChangePlan = (status: string) => status !== 'cancelled' && status !== 'expired';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gestión de Suscripción</h2>
        <p className="text-muted-foreground">
          Gestiona tu plan de suscripción y facturación
        </p>
      </div>

      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plan Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{getPlanName(subscription.plan_type)}</h3>
              <p className="text-2xl font-bold">
                S/ {getPlanPrice(subscription.plan_type)}
                <span className="text-base font-normal text-muted-foreground">/mes</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(subscription.subscription_status)}
              <Badge className={getStatusColor(subscription.subscription_status)}>
                {subscription.subscription_status === 'active' ? 'Activo' : 
                 subscription.subscription_status === 'cancelled' ? 'Cancelado' : 
                 subscription.subscription_status === 'expired' ? 'Expirado' :
                 subscription.subscription_status === 'payment_failed' ? 'Pago Fallido' : 'Pendiente'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Próxima Facturación: {isValidDate(subscription.next_billing_date) ? formatDateEs(subscription.next_billing_date) : 'Por confirmar'}
              </span>
            </div>
            {isValidDate(subscription.subscription_end_date) && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Fin del Período Actual: {formatDateEs(subscription.subscription_end_date)}
                </span>
              </div>
            )}
            {!subscription.subscription_auto_recurring && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                ⚠️ Facturación Manual - Los cambios de plan se reflejarán en el próximo ciclo
              </div>
            )}
          </div>

          {subscription.subscription_status === 'payment_failed' && subscription.payment_failures_count > 0 && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Problema de Pago</span>
              </div>
              <p className="text-sm text-red-700">
                Hemos tenido {subscription.payment_failures_count} intentos fallidos de pago. 
                Por favor, actualiza tu método de pago para continuar con el servicio.
              </p>
            </div>
          )}

          {subscription.cancellation_date && (
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Suscripción Cancelada</span>
              </div>
              <p className="text-sm text-yellow-700">
                Cancelado el {new Date(subscription.cancellation_date).toLocaleDateString('es-ES')}
                {subscription.cancellation_reason && ` - Razón: ${subscription.cancellation_reason}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Features Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Plan */}
        <Card className={subscription.plan_type === 'basic' ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Plan Básico
              {subscription.plan_type === 'basic' && (
                <Badge>Plan Actual</Badge>
              )}
            </CardTitle>
            <CardDescription>S/ {getPlanPrice('basic')}/mes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-1 text-sm">
              <li>• Sitio profesional en 72 horas</li>
              <li>• Hosting + SSL incluido</li>
              <li>• SEO básico optimizado</li>
              <li>• Integración Google Maps y Google My Business</li>
              <li>• Cambios auto-gestionables (PIN)</li>
              <li>• Soporte por WhatsApp</li>
              <li>• Hasta 3,000 visitas/mes o 6 GB</li>
            </ul>
            {subscription.plan_type === 'advanced' && canChangePlan(subscription.subscription_status) && (
              <Button className="w-full mt-4" variant="outline" onClick={handleDowngrade} disabled={actionLoading}>
                Cambiar a Básico
                {!subscription.subscription_auto_recurring && (
                  <span className="text-xs block mt-1">(Cambio efectivo próximo ciclo)</span>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Advanced Plan */}
        <Card className={subscription.plan_type === 'advanced' ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Plan Avanzado
              {subscription.plan_type === 'advanced' && (
                <Badge>Plan Actual</Badge>
              )}
            </CardTitle>
            <CardDescription>S/ {getPlanPrice('advanced')}/mes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-1 text-sm">
              <li>• Todo lo del Plan Básico</li>
              <li>• 1 hora/mes de cambios extendidos</li>
              <li>• Cambios de textos e imágenes</li>
              <li>• Nuevas secciones personalizadas</li>
              <li>• Soporte prioritario</li>
            </ul>
            {subscription.plan_type === 'basic' && canChangePlan(subscription.subscription_status) && (
              <Button className="w-full mt-4" onClick={handleUpgrade} disabled={actionLoading}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Actualizar a Avanzado
                {!subscription.subscription_auto_recurring && (
                  <span className="text-xs block mt-1">(Cambio efectivo próximo ciclo)</span>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Failed Actions */}
      {subscription.subscription_status === 'payment_failed' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Acción Requerida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700">
              Tu suscripción ha sido suspendida debido a problemas de pago. Actualiza tu método de pago para continuar con el servicio.
            </p>
            <Button variant="default" disabled={actionLoading}>
              Actualizar Método de Pago
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reactivation for Cancelled/Expired */}
      {(subscription.subscription_status === 'cancelled' || subscription.subscription_status === 'expired') && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Suscripción Inactiva
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-yellow-700">
              Tu suscripción está inactiva. Reactívala para continuar usando todos los servicios.
            </p>
            <Button variant="default" disabled={actionLoading}>
              Reactivar Suscripción
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Warning */}
      {canShowCancellation(subscription.subscription_status) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              ⚠️ Zona de Cancelación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-destructive/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                <strong>ADVERTENCIA IMPORTANTE:</strong> Si cancelas tu suscripción, tu sitio web será <strong>DESACTIVADO PERMANENTEMENTE</strong> al final de tu período de facturación actual{isValidDate(subscription.next_billing_date) ? ` (${formatDateEs(subscription.next_billing_date)})` : ''}.
              </AlertDescription>
            </Alert>
            
            <div className="bg-card p-4 rounded-lg border">
              <h4 className="font-semibold mb-2 text-destructive">Consecuencias de la cancelación:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Tu sitio web será completamente inaccesible para tus clientes</li>
                <li>• Perderás toda la funcionalidad y características de tu plan</li>
                <li>• El hosting y dominio .mirestaurante.com serán desactivados</li>
                <li>• Si tienes un dominio personalizado, podrás usarlo libremente en otro servicio</li>
              </ul>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={actionLoading}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Cancelar Suscripción
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    ⚠️ ¿Estás completamente seguro?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p className="font-semibold text-foreground">Esta acción cancelará tu suscripción permanentemente.</p>
                    <div className="bg-destructive/10 p-3 rounded-md">
                      <p className="font-medium text-destructive mb-2">Tu sitio web será DESACTIVADO el:</p>
                      <p className="text-lg font-bold">{isValidDate(subscription.next_billing_date) ? formatDateEs(subscription.next_billing_date) : 'Fin del período actual'}</p>
                    </div>
                    <ul className="space-y-1 text-sm">
                      <li>• Tus clientes NO podrán acceder a tu página web</li>
                      <li>• Perderás todas las funcionalidades online</li>
                      <li>• El dominio .mirestaurante.com será liberado</li>
                      <li>• Si tienes dominio propio, podrás usarlo en otro servicio</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, mantener mi suscripción</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">
                    Sí, cancelar definitivamente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}