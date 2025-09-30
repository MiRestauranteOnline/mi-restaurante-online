import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, CreditCard, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionActionsProps {
  clientId: string;
  subscription: {
    plan_type: string;
    subscription_status: string;
    payment_status: string;
    next_billing_date: string;
    payment_failures_count: number;
  };
  onUpdate: () => void;
}

export function SubscriptionActions({ clientId, subscription, onUpdate }: SubscriptionActionsProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePlanChange = async (newPlan: 'basic' | 'advanced') => {
    setLoading(true);
    try {
      // Placeholder for future plan change implementation
      const { error } = await supabase
        .from('clients')
        .update({ plan_type: newPlan })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Plan actualizado",
        description: `Plan cambiado a ${newPlan === 'basic' ? 'Básico' : 'Avanzado'}`,
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const updateData: any = { subscription_status: newStatus };
      
      if (newStatus === 'cancelled') {
        updateData.cancellation_date = new Date().toISOString();
        updateData.cancellation_reason = 'admin_action';
      } else if (newStatus === 'active') {
        updateData.cancellation_date = null;
        updateData.cancellation_reason = null;
        updateData.payment_failures_count = 0;
      }

      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `Estado cambiado a ${newStatus}`,
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'cancelled': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      case 'payment_failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Acciones de Suscripción
        </CardTitle>
        <CardDescription>
          Administrar plan y estado de suscripción del cliente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan Actual</label>
            <Select 
              value={subscription.plan_type} 
              onValueChange={handlePlanChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Plan Básico - S/ 297</SelectItem>
                <SelectItem value="advanced">Plan Avanzado - S/ 497</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
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
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>
            Próxima facturación: {new Date(subscription.next_billing_date).toLocaleDateString('es-PE')}
          </span>
        </div>

        {subscription.payment_failures_count > 0 && (
          <div className="p-3 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Fallos de Pago</span>
            </div>
            <p className="text-sm text-red-700">
              {subscription.payment_failures_count} intentos fallidos
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {subscription.subscription_status === 'active' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                  Cancelar Suscripción
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cancelar suscripción?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción cancelará la suscripción del cliente. El sitio web será desactivado al final del período de facturación.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleStatusChange('cancelled')}>
                    Confirmar Cancelación
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {(subscription.subscription_status === 'cancelled' || subscription.subscription_status === 'expired') && (
            <Button onClick={() => handleStatusChange('active')} disabled={loading}>
              Reactivar Suscripción
            </Button>
          )}

          {subscription.subscription_status === 'payment_failed' && (
            <Button onClick={() => handleStatusChange('active')} disabled={loading}>
              Marcar como Pagado
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}