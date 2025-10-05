import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PaymentError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorMessage = searchParams.get("error") || "Hubo un problema procesando tu pago";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Pago No Completado</CardTitle>
          <CardDescription>
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              No se ha realizado ningún cargo a tu tarjeta.
            </p>
            <p className="text-sm text-muted-foreground">
              Por favor, intenta nuevamente o contacta con soporte si el problema persiste.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => navigate("/signup")} 
              className="w-full"
            >
              Intentar Nuevamente
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

export default PaymentError;
