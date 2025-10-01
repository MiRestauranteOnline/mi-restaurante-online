import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MercadoPagoCardPaymentProps {
  amount: number;
  planType: 'basic' | 'advanced';
  clientId: string;
  clientEmail: string;
  couponCode?: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export const MercadoPagoCardPayment = ({
  amount,
  planType,
  clientId,
  clientEmail,
  couponCode,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}: MercadoPagoCardPaymentProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [mp, setMp] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMercadoPagoSDK();
  }, []);

  const loadMercadoPagoSDK = async () => {
    try {
      // Get public key from backend
      const { data, error } = await supabase.functions.invoke('get-mercadopago-public-key');
      
      if (error || !data?.publicKey) {
        throw new Error('Failed to load payment configuration');
      }

      // Load MercadoPago SDK
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      
      script.onload = () => {
        const mercadopago = new window.MercadoPago(data.publicKey, {
          locale: 'es-PE'
        });
        
        setMp(mercadopago);
        initializeCardForm(mercadopago);
      };

      script.onerror = () => {
        throw new Error('Failed to load payment system');
      };

      document.body.appendChild(script);
    } catch (err: any) {
      console.error('SDK loading error:', err);
      setError(err.message || 'Error loading payment system');
      setIsLoading(false);
    }
  };

  const initializeCardForm = (mercadopago: any) => {
    try {
      const cardForm = mercadopago.cardForm({
        amount: amount.toString(),
        iframe: true,
        form: {
          id: "form-checkout",
          cardNumber: {
            id: "form-checkout__cardNumber",
            placeholder: "Número de tarjeta",
          },
          expirationDate: {
            id: "form-checkout__expirationDate",
            placeholder: "MM/YY",
          },
          securityCode: {
            id: "form-checkout__securityCode",
            placeholder: "CVV",
          },
          cardholderName: {
            id: "form-checkout__cardholderName",
            placeholder: "Titular de la tarjeta",
          },
          issuer: {
            id: "form-checkout__issuer",
            placeholder: "Banco emisor",
          },
          installments: {
            id: "form-checkout__installments",
            placeholder: "Pago único",
          },
          identificationType: {
            id: "form-checkout__identificationType",
            placeholder: "Tipo de documento",
          },
          identificationNumber: {
            id: "form-checkout__identificationNumber",
            placeholder: "Número de documento",
          },
          cardholderEmail: {
            id: "form-checkout__cardholderEmail",
            placeholder: "E-mail",
          },
        },
        installments: {
          minInstallments: 1,
          maxInstallments: 1,
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error) {
              console.error('Form mount error:', error);
              setError('Error initializing payment form');
            } else {
              console.log('Form mounted successfully');
              setIsLoading(false);
            }
          },
          onSubmit: async (event: Event) => {
            event.preventDefault();
            setIsProcessing(true);
            setError("");

            try {
              const {
                paymentMethodId: payment_method_id,
                issuerId: issuer_id,
                cardholderEmail: email,
                amount,
                token,
                installments,
                identificationNumber,
                identificationType,
              } = cardForm.getCardFormData();

              // Create subscription through our backend
              const { data, error: paymentError } = await supabase.functions.invoke(
                'create-mercadopago-subscription',
                {
                  body: {
                    token,
                    issuer_id,
                    payment_method_id,
                    transaction_amount: parseFloat(amount),
                    installments: parseInt(installments),
                    payer: {
                      email: email || clientEmail,
                      identification: {
                        type: identificationType,
                        number: identificationNumber,
                      },
                    },
                    clientId,
                    planType,
                    couponCode,
                  },
                }
              );

              if (paymentError || !data?.success) {
                throw new Error(data?.error || paymentError?.message || 'Payment failed');
              }

              if (data.status === 'approved') {
                toast({
                  title: "¡Pago exitoso!",
                  description: "Tu suscripción ha sido activada.",
                });
                onPaymentSuccess();
              } else if (data.status === 'pending') {
                toast({
                  title: "Pago pendiente",
                  description: "Tu pago está siendo procesado.",
                });
                onPaymentSuccess();
              } else {
                throw new Error(data.status_detail || 'Payment was not approved');
              }
            } catch (err: any) {
              console.error('Payment error:', err);
              const errorMsg = err.message || 'Error processing payment';
              setError(errorMsg);
              onPaymentError(errorMsg);
              toast({
                title: "Error en el pago",
                description: errorMsg,
                variant: "destructive",
              });
            } finally {
              setIsProcessing(false);
            }
          },
        },
      });
    } catch (err: any) {
      console.error('Card form initialization error:', err);
      setError('Error initializing payment form');
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Información de Pago
        </CardTitle>
        <CardDescription>
          Completa los datos de tu tarjeta para activar tu suscripción
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        <form id="form-checkout" className="space-y-4">
          <div id="form-checkout__cardNumber" className="min-h-[40px]"></div>
          <div className="grid grid-cols-2 gap-4">
            <div id="form-checkout__expirationDate" className="min-h-[40px]"></div>
            <div id="form-checkout__securityCode" className="min-h-[40px]"></div>
          </div>
          <input 
            type="text" 
            id="form-checkout__cardholderName" 
            placeholder="Titular de la tarjeta"
            className="w-full px-3 py-2 border rounded-md"
          />
          <input 
            type="email" 
            id="form-checkout__cardholderEmail" 
            placeholder="E-mail"
            className="w-full px-3 py-2 border rounded-md"
          />
          <div className="grid grid-cols-2 gap-4">
            <select 
              id="form-checkout__identificationType"
              className="w-full px-3 py-2 border rounded-md"
            ></select>
            <input 
              type="text" 
              id="form-checkout__identificationNumber" 
              placeholder="Número de documento"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <select 
            id="form-checkout__issuer"
            className="w-full px-3 py-2 border rounded-md"
          ></select>
          <select 
            id="form-checkout__installments"
            className="hidden"
          ></select>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                `Pagar S/. ${amount.toFixed(2)}`
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <CreditCard className="w-4 h-4" />
          <span>Pago seguro procesado por MercadoPago</span>
        </div>
      </CardContent>
    </Card>
  );
};
