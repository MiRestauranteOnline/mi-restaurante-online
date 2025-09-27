import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Calendar, AlertTriangle, ArrowUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SubscriptionData {
  plan: 'basic' | 'advanced';
  status: 'active' | 'cancelled' | 'expired';
  nextBilling: string;
  amount: number;
  currency: string;
}

export function SubscriptionManagement({ clientId }: { clientId: string }) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Mock subscription data - in real implementation, fetch from Rebill API
    setTimeout(() => {
      setSubscription({
        plan: 'basic',
        status: 'active',
        nextBilling: '2025-10-27',
        amount: 297,
        currency: 'PEN'
      });
      setLoading(false);
    }, 1000);
  }, [clientId]);

  const handleUpgrade = () => {
    // Redirect to Rebill checkout for advanced plan
    window.open('https://checkout.rebill.com/advanced-plan', '_blank');
  };

  const handleCancel = () => {
    // Call Rebill API to cancel subscription
    console.log('Cancelling subscription...');
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
    return plan === 'basic' ? t('subscription.basic') : t('subscription.advanced');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'cancelled': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('subscription.title')}</h2>
        <p className="text-muted-foreground">
          Gestiona tu plan de suscripción y facturación
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('subscription.currentPlan')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{getPlanName(subscription.plan)}</h3>
              <p className="text-2xl font-bold">
                S/ {subscription.amount}
                <span className="text-base font-normal text-muted-foreground">/mes</span>
              </p>
            </div>
            <Badge className={getStatusColor(subscription.status)}>
              {subscription.status === 'active' ? 'Activo' : 
               subscription.status === 'cancelled' ? 'Cancelado' : 'Expirado'}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {t('subscription.nextBilling')}: {new Date(subscription.nextBilling).toLocaleDateString('es-ES')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Plan */}
        <Card className={subscription.plan === 'basic' ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('subscription.basic')}
              {subscription.plan === 'basic' && (
                <Badge>Plan Actual</Badge>
              )}
            </CardTitle>
            <CardDescription>S/ 297/mes</CardDescription>
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
          </CardContent>
        </Card>

        {/* Advanced Plan */}
        <Card className={subscription.plan === 'advanced' ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('subscription.advanced')}
              {subscription.plan === 'advanced' && (
                <Badge>Plan Actual</Badge>
              )}
            </CardTitle>
            <CardDescription>S/ 497/mes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-1 text-sm">
              <li>• Todo lo del Plan Básico</li>
              <li>• 1 hora/mes de cambios extendidos</li>
              <li>• Cambios de textos e imágenes</li>
              <li>• Nuevas secciones personalizadas</li>
              <li>• Soporte prioritario</li>
            </ul>
            {subscription.plan === 'basic' && (
              <Button className="w-full mt-4" onClick={handleUpgrade}>
                <ArrowUp className="h-4 w-4 mr-2" />
                {t('subscription.upgrade')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Warning */}
      {subscription.status === 'active' && (
        <Card className="border-yellow-200">
          <CardContent className="pt-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('subscription.cancelWarning')}
              </AlertDescription>
            </Alert>
            
            <div className="mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    {t('subscription.cancel')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar Suscripción</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('subscription.confirmCancel')}
                      <br /><br />
                      Su sitio web permanecerá activo hasta: {new Date(subscription.nextBilling).toLocaleDateString('es-ES')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>
                      Confirmar Cancelación
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}