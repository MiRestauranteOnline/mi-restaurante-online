import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
}

interface SubscriptionManagementProps {
  clientId: string;
}

export function SubscriptionManagement({ clientId }: SubscriptionManagementProps) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptionData();
  }, [clientId]);

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
          cancellation_reason
        `)
        .eq('id', clientId)
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información de suscripción",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando datos de suscripción...</div>;
  }

  if (!subscription) {
    return <div>No se encontraron datos de suscripción</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-yellow-500" />;
      case 'expired': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'payment_failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
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

  const getPlanName = (planType: string) => {
    return planType === 'basic' ? 'Plan Básico' : 'Plan Avanzado';
  };

  const getPlanPrice = (planType: string) => {
    return planType === 'basic' ? 'S/ 297' : 'S/ 497';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Gestión de Suscripción
          </CardTitle>
          <CardDescription>
            Administra tu suscripción y detalles de facturación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Plan Actual</span>
              </div>
              <p className="text-lg font-semibold">{getPlanName(subscription.plan_type)}</p>
              <p className="text-sm text-muted-foreground">{getPlanPrice(subscription.plan_type)}/mes</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(subscription.subscription_status)}
                <span className="text-sm font-medium">Estado</span>
              </div>
              <Badge className={getStatusColor(subscription.subscription_status)}>
                {subscription.subscription_status === 'active' ? 'Activo' :
                 subscription.subscription_status === 'cancelled' ? 'Cancelado' :
                 subscription.subscription_status === 'expired' ? 'Expirado' :
                 subscription.subscription_status === 'payment_failed' ? 'Pago Fallido' : 'Pendiente'}
              </Badge>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Próxima Facturación</span>
              </div>
              <p className="text-sm">
                {subscription.next_billing_date ? formatDate(subscription.next_billing_date) : 'No disponible'}
              </p>
            </div>
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
                Cancelado el {formatDate(subscription.cancellation_date)}
                {subscription.cancellation_reason && ` - Razón: ${subscription.cancellation_reason}`}
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            {subscription.subscription_status === 'active' && (
              <>
                <Button variant="outline">
                  Cambiar Plan
                </Button>
                <Button variant="destructive">
                  Cancelar Suscripción
                </Button>
              </>
            )}
            {subscription.subscription_status === 'payment_failed' && (
              <Button variant="default">
                Actualizar Método de Pago
              </Button>
            )}
            {(subscription.subscription_status === 'cancelled' || subscription.subscription_status === 'expired') && (
              <Button variant="default">
                Reactivar Suscripción
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}