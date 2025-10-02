import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MercadoPagoCheckoutRedirectProps {
  amount: number;
  planType: string;
  clientId: string;
  userEmail: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const MercadoPagoCheckoutRedirect = ({
  amount,
  planType,
  clientId,
  userEmail,
  onSuccess,
  onError,
  onCancel,
}: MercadoPagoCheckoutRedirectProps) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      console.log("Creating MercadoPago checkout redirect...");

      const { data, error } = await supabase.functions.invoke(
        "create-mercadopago-subscription",
        {
          body: {
            clientId,
            planType,
            transaction_amount: amount,
            payer: {
              email: userEmail,
            },
            useCheckoutPro: true, // Use redirect flow
          },
        }
      );

      if (error) {
        console.error("Checkout creation error:", error);
        throw error;
      }

      if (!data.success || !data.checkoutUrl) {
        throw new Error(data.error || "No se pudo crear el checkout");
      }

      console.log("Redirecting to MercadoPago checkout:", data.checkoutUrl);
      
      // Redirect to MercadoPago's hosted checkout
      window.location.href = data.checkoutUrl;
      
    } catch (err: any) {
      console.error("Payment error:", err);
      const errorMessage = err.message || "Error al procesar el pago";
      toast.error(errorMessage);
      onError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Método de Pago Seguro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Plan {planType}</span>
            <span className="font-semibold">S/ {amount.toFixed(2)}</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total a pagar</span>
              <span className="text-2xl font-bold text-primary">S/ {amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
          <div className="flex gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Pago procesado por MercadoPago
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Serás redirigido a la página segura de MercadoPago para completar tu pago. 
                Aceptamos todas las tarjetas de crédito y débito.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Continuar al Pago
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Al continuar, aceptas nuestros términos de servicio y política de privacidad
        </p>
      </CardContent>
    </Card>
  );
};
