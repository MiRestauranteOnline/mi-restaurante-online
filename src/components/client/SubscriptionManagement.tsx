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
  locked_basic_price?: number;
  locked_advanced_price?: number;
  pending_plan_change?: string;
  pending_plan_change_date?: string;
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
          subscription_auto_recurring,
          locked_basic_price,
          locked_advanced_price,
          pending_plan_change,
          pending_plan_change_date
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

  const calculateProratedAmount = () => {
    if (!subscription?.subscription_end_date) return null;
    
    const now = new Date();
    const endDate = new Date(subscription.subscription_end_date);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) return null;
    
    const currentPlanPrice = getPlanPrice(subscription.plan_type);
    const newPlanPrice = getPlanPrice('advanced');
    const priceDifference = newPlanPrice - currentPlanPrice;
    
    // Calculate actual billing cycle length
    let totalDaysInCycle = 30; // Default fallback
    if (subscription.subscription_start_date) {
      const startDate = new Date(subscription.subscription_start_date);
      totalDaysInCycle = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      // Estimate: go back one month from end date
      const estimatedStartDate = new Date(endDate);
      estimatedStartDate.setMonth(estimatedStartDate.getMonth() - 1);
      totalDaysInCycle = Math.ceil((endDate.getTime() - estimatedStartDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    // Ensure totalDaysInCycle is at least daysRemaining
    totalDaysInCycle = Math.max(totalDaysInCycle, daysRemaining);
    
    const dailyRate = priceDifference / totalDaysInCycle;
    const proratedAmount = dailyRate * daysRemaining;
    
    return {
      amount: proratedAmount,
      daysRemaining,
      newPlanPrice,
      currentPlanPrice
    };
  };

  const handleUpgrade = async () => {
    setActionLoading(true);
    try {
      // Ensure OpenPay antifraud scripts are loaded and get device_session_id
      const ensureOpenPayLoaded = () => new Promise<void>((resolve, reject) => {
        const w = window as any;
        if (w.OpenPay) return resolve();
        const script1 = document.createElement('script');
        script1.src = 'https://js.openpay.mx/openpay.v1.min.js';
        const script2 = document.createElement('script');
        script2.src = 'https://js.openpay.mx/openpay-data.v1.min.js';
        script1.onload = () => {
          script2.onload = () => resolve();
          script2.onerror = reject;
          document.body.appendChild(script2);
        };
        script1.onerror = reject;
        document.body.appendChild(script1);
      });

      await ensureOpenPayLoaded();
      const OpenPay = (window as any).OpenPay;
      if (OpenPay?.setSandboxMode) OpenPay.setSandboxMode(true);
      const deviceSessionId = OpenPay?.deviceData?.setup ? OpenPay.deviceData.setup() : undefined;

      const { data, error } = await supabase.functions.invoke('upgrade-openpay-plan', {
        body: { clientId, deviceSessionId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: 'Plan actualizado',
        description: `Upgrade exitoso. Cargo prorrateado: S/ ${data.proratedAmount.toFixed(2)} por ${data.daysRemaining} días restantes.`,
      });

      fetchSubscriptionData();
    } catch (error: any) {
      toast({
        title: 'Error al actualizar',
        description: error.message || 'No se pudo procesar el upgrade',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDowngrade = async () => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('change-openpay-plan', {
        body: { 
          clientId,
          newPlanType: 'basic',
          immediate: false // Schedule for end of billing period
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      const scheduledDate = new Date(data.scheduledDate).toLocaleDateString('es-ES');
      
      toast({
        title: "Downgrade programado",
        description: `Tu plan cambiará a Básico el ${scheduledDate} (fin del periodo actual)`,
      });

      fetchSubscriptionData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo programar el downgrade",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (reason?: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-openpay-subscription', {
        body: { 
          clientId,
          reason: reason || 'user_request'
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción ha sido cancelada en OpenPay. Tu sitio web quedará inactivo.",
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

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pause-openpay-subscription', {
        body: { 
          clientId,
          action: 'resume'
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "Suscripción reactivada",
        description: "Tu suscripción ha sido reactivada exitosamente.",
      });

      fetchSubscriptionData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo reactivar la suscripción",
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
    // Use locked prices if available, otherwise fall back to current prices or defaults
    if (plan === 'basic') {
      return subscription?.locked_basic_price || planPrices[plan] || 297;
    } else {
      return subscription?.locked_advanced_price || planPrices[plan] || 497;
    }
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

          {subscription.pending_plan_change === 'basic' && isValidDate(subscription.pending_plan_change_date) && !subscription.cancellation_date && (
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Cambio de Plan Programado</span>
              </div>
              <p className="text-sm text-blue-700">
                El plan será degradado a Plan Básico el {formatDateEs(subscription.pending_plan_change_date!)}
              </p>
            </div>
          )}

          {subscription.cancellation_date && subscription.subscription_status !== 'active' && (
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Suscripción Cancelada</span>
              </div>
              <p className="text-sm text-yellow-700">
                {isValidDate(subscription.subscription_end_date) ? (
                  <>El plan será cancelado el {formatDateEs(subscription.subscription_end_date)}</>
                ) : (
                  <>Cancelado el {formatDateEs(subscription.cancellation_date)}</>
                )}
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
              <li className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600 inline" />
                <span className="font-semibold">Visitas y ancho de banda ilimitados</span>
              </li>
            </ul>
            {subscription.plan_type === 'advanced' && canChangePlan(subscription.subscription_status) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full mt-4" variant="outline" disabled={actionLoading}>
                    Cambiar a Básico
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cambiar a Plan Básico?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>El cambio se aplicará al final de tu periodo de facturación actual.</p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="font-semibold text-yellow-900 mb-2">Perderás acceso a:</p>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Google Analytics tracking</li>
                          <li>• Panel de Analytics avanzado</li>
                          <li>• Soporte por WhatsApp directo</li>
                          <li>• Soporte prioritario</li>
                          <li>• 1 hora mensual de asistencia profesional para cambios</li>
                        </ul>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDowngrade} disabled={actionLoading}>
                      Confirmar Cambio
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full mt-4" disabled={actionLoading}>
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Actualizar a Avanzado
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Actualizar a Plan Avanzado?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      {(() => {
                        const prorated = calculateProratedAmount();
                        return prorated ? (
                          <>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="font-semibold text-blue-900 mb-2">Cargos de Upgrade</p>
                              <div className="text-sm text-blue-800 space-y-2">
                                <div className="flex justify-between">
                                  <span>Plan actual (Básico):</span>
                                  <span className="font-medium">S/ {prorated.currentPlanPrice}/mes</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Nuevo plan (Avanzado):</span>
                                  <span className="font-medium">S/ {prorated.newPlanPrice}/mes</span>
                                </div>
                                <div className="border-t border-blue-300 pt-2 mt-2">
                                  <div className="flex justify-between">
                                    <span>Días restantes en periodo:</span>
                                    <span className="font-medium">{prorated.daysRemaining} días</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-base mt-2">
                                    <span>Cargo prorrateado hoy:</span>
                                    <span className="text-blue-900">S/ {prorated.amount.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="font-semibold text-green-900 mb-2">Acceso inmediato a:</p>
                              <ul className="text-sm text-green-800 space-y-1">
                                <li>• Google Analytics tracking completo</li>
                                <li>• Panel de Analytics avanzado</li>
                                <li>• Soporte prioritario por WhatsApp</li>
                                <li>• 1 hora mensual de asistencia profesional</li>
                              </ul>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                              <p className="flex items-start gap-2 mb-2">
                                <CreditCard className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>
                                  <strong>Cargo inmediato:</strong> S/ {prorated.amount.toFixed(2)} se cargará hoy a tu tarjeta registrada.
                                </span>
                              </p>
                              {subscription.next_billing_date && isValidDate(subscription.next_billing_date) && (
                                <p className="flex items-start gap-2">
                                  <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>
                                    <strong>Próximo pago completo:</strong> S/ {prorated.newPlanPrice} el {formatDateEs(subscription.next_billing_date)}
                                  </span>
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <p>No se pudo calcular el monto prorrateado. ¿Deseas continuar?</p>
                        );
                      })()}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUpgrade} disabled={actionLoading}>
                      Confirmar Upgrade
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
            <Button variant="default" disabled={actionLoading} onClick={handleReactivate}>
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
                La cancelación se procesa inmediatamente en OpenPay y tu sitio será desactivado.
              </AlertDescription>
            </Alert>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={actionLoading}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Cancelar Suscripción
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>Esta acción no se puede deshacer y tendrá efecto inmediato.</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="font-semibold text-red-900 mb-2">Perderás:</p>
                      <ul className="text-sm text-red-800 space-y-1">
                        <li>• Acceso completo a tu sitio web</li>
                        <li>• Todas las funcionalidades y características</li>
                        <li>• Tu dominio personalizado</li>
                        <li>• Configuraciones y datos guardados</li>
                      </ul>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tu sitio web será desactivado inmediatamente tras confirmar.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, mantener suscripción</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleCancel('user_request')} 
                    className="bg-destructive hover:bg-destructive/90" 
                    disabled={actionLoading}
                  >
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