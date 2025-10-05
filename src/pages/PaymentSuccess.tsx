import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Simulate verification (in real implementation, verify with backend)
    const timer = setTimeout(() => {
      setVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const orderId = searchParams.get("orderId") || searchParams.get("vads_order_id");

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium">Verificando tu pago...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">¡Pago Exitoso!</CardTitle>
          <CardDescription>
            Tu pago ha sido procesado correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Número de orden</p>
              <p className="font-mono text-lg font-semibold">{orderId}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Recibirás un correo de confirmación con los detalles de tu suscripción.
            </p>
            <p className="text-sm text-muted-foreground">
              Ya puedes acceder a tu panel de administración y comenzar a configurar tu restaurante.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="w-full"
            >
              Ir al Panel de Administración
            </Button>
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="w-full"
            >
              Volver al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
