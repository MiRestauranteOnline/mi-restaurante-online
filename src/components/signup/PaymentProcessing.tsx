import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const PaymentProcessing = () => {
  return (
    <Card className="border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          Procesando Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Estamos redirigiendo al sistema de pago seguro...
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
      </CardContent>
    </Card>
  );
};