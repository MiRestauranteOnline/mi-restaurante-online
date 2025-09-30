import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

interface EmbeddedPaymentProps {
  signupData: {
    email: string;
    restaurantName: string;
    paymentId?: string; // we'll store clientId here
  };
  selectedPlan: 'basic' | 'advanced';
  onSuccess: () => void;
  onBack: () => void;
}


export const EmbeddedPayment: React.FC<EmbeddedPaymentProps> = ({ signupData, selectedPlan, onSuccess, onBack }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const amount = selectedPlan === 'basic' ? 297 : 497;

  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mercadopago-public-key');
        if (error || !data?.success) {
          throw new Error(data?.error || error?.message || 'Failed to get Mercado Pago public key');
        }
        // Initialize React SDK
        initMercadoPago(data.publicKey, { locale: 'es-PE' });
        setLoading(false);
      } catch (err: any) {
        console.error('Embedded payment init error:', err);
        setInitError(err?.message || 'No se pudo cargar el pago');
        toast({ title: 'Error', description: err?.message || 'No se pudo cargar el pago', variant: 'destructive' });
        setLoading(false);
      }
    };

    init();
  }, []);
  const startHostedCheckout = async () => {
    try {
      setCreating(true);
      const { data, error } = await supabase.functions.invoke('create-mercadopago-checkout', {
        body: {
          customerEmail: signupData.email,
          customerName: signupData.restaurantName,
          clientId: signupData.paymentId,
          planType: selectedPlan,
        },
      });
      if (error || !data?.success) {
        throw new Error((data as any)?.error || (error as any)?.message || 'No se pudo iniciar el pago');
      }
      const url = (data as any).initPoint || (data as any).sandbox_init_point;
      if (!url) throw new Error('URL de pago no recibida');
      window.location.href = url;
    } catch (err: any) {
      console.error('Checkout redirect error:', err);
      toast({ title: 'Error al iniciar pago', description: err?.message || 'Inténtalo nuevamente', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Completa tu pago
        </h2>
        <p className="text-muted-foreground">
          Paga con tarjeta de crédito o débito de forma segura sin salir del sitio.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">S/ {amount}<span className="text-sm text-muted-foreground font-normal">/mes</span></div>
            <ul className="mt-4 text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Diseño profesional</li>
              <li>Menú digital</li>
              <li>{selectedPlan === 'advanced' ? 'Cambios ilimitados y soporte prioritario' : 'Soporte estándar'}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pago con tarjeta</CardTitle>
          </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-4 text-sm text-muted-foreground">Cargando formulario de pago...</div>
              ) : (
                <>
                  <CardPayment
                    initialization={{
                      amount,
                      payer: { email: signupData.email },
                    }}
                    customization={{
                      paymentMethods: { maxInstallments: 1 },
                    }}
                    onReady={() => setLoading(false)}
                    onSubmit={(formData: any) => {
                      return new Promise<void>(async (resolve, reject) => {
                        try {
                          setCreating(true);
                          const fd = formData || {};
                          console.log('CardPayment onSubmit formData:', fd);
                          const token = fd.token || fd.cardToken || fd.card_token;
                          const paymentMethodId = fd.payment_method_id || fd.paymentMethodId;
                          const issuerId = fd.issuer_id || fd.issuerId;
                          const installments = fd.installments || 1;

                          if (!token) {
                            throw new Error('No se pudo generar el token de la tarjeta. Verifica los datos e inténtalo nuevamente.');
                          }

                          const { data, error } = await supabase.functions.invoke('process-mercadopago-card-payment', {
                            body: {
                              token,
                              payment_method_id: paymentMethodId,
                              issuer_id: issuerId,
                              installments,
                              amount,
                              description: `${selectedPlan === 'basic' ? 'Plan Básico' : 'Plan Avanzado'} - Mi Restaurante Online`,
                              payer: {
                                email: signupData.email,
                                first_name: signupData.restaurantName,
                                identification: fd?.payer?.identification || undefined,
                              },
                              metadata: {
                                client_id: signupData.paymentId || null,
                                plan_type: selectedPlan,
                              },
                            }
                          });

                          if (error || !data?.success) {
                            throw new Error(data?.error || error?.message || 'Payment failed');
                          }

                          const status = data?.payment?.status;
                          if (status !== 'approved') {
                            toast({ title: 'Pago en proceso', description: 'Tu pago está siendo procesado. Te notificaremos cuando se apruebe.' });
                            resolve();
                            return;
                          }

                          toast({ title: 'Pago exitoso', description: 'Tu suscripción ha sido activada.' });
                          onSuccess();
                          resolve();
                        } catch (err: any) {
                          console.error('Payment error:', err);
                          toast({ title: 'Error en el pago', description: err.message || 'No se pudo procesar el pago', variant: 'destructive' });
                          reject(err);
                        } finally {
                          setCreating(false);
                        }
                      });
                    }}
                    onError={(error: any) => {
                      console.error('Brick error:', error);
                      toast({ title: 'Error', description: 'Ocurrió un error con el formulario de pago', variant: 'destructive' });
                    }}
                  />

                  <div className="mt-4 space-y-2">
                    {initError && (
                      <div className="text-sm text-destructive">{initError}</div>
                    )}
                    <Button onClick={startHostedCheckout} disabled={creating || !signupData.email} variant="secondary">
                      Pagar con Mercado Pago (Checkout)
                    </Button>
                    <p className="text-xs text-muted-foreground">Si el formulario no carga o falla, usa el checkout.</p>
                  </div>
                </>
              )}
            </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onBack} disabled={creating}>Volver</Button>
      </div>
    </div>
  );
};