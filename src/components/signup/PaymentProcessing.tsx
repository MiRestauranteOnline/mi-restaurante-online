import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

interface PaymentProcessingProps {
  checkoutUrl?: string;
  onCancel?: () => void;
}

export const PaymentProcessing = ({ checkoutUrl, onCancel }: PaymentProcessingProps) => {
  if (checkoutUrl) {
    // Redirect to MercadoPago immediately
    window.location.href = checkoutUrl;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          Procesando Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center">
          <CreditCard className="w-16 h-16 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground">
          Redirigiendo al sistema de pago seguro de MercadoPago...
        </p>
        <div className="flex items-center justify-center">
          <div className="animate-pulse flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          No cierres esta ventana hasta completar el pago
        </p>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="mt-4">
            Cancelar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};