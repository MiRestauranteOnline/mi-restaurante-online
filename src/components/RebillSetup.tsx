import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const RebillSetup = () => {
  const [isCreatingPlans, setIsCreatingPlans] = useState(false);
  const [plansCreated, setPlansCreated] = useState(false);
  const [plans, setPlans] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  const createPlans = async () => {
    setIsCreatingPlans(true);
    setError("");

    try {
      const { data, error } = await supabase.functions.invoke('rebill-plans', {
        body: { action: 'create_plans' }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setPlans(data.plans);
        setPlansCreated(true);
        toast({
          title: "¡Planes creados exitosamente!",
          description: "Los planes están ahora disponibles en tu cuenta de Rebill.",
        });
      } else {
        throw new Error("Error creating plans");
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "No se pudieron crear los planes. Revisa tu configuración de Rebill.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPlans(false);
    }
  };

  const checkExistingPlans = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('rebill-plans', {
        body: { action: 'get_plans' }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success && data.plans.length > 0) {
        setPlans(data.plans);
        setPlansCreated(true);
      }
    } catch (err: any) {
      console.error("Error checking plans:", err);
    }
  };

  // Check for existing plans on component mount
  useState(() => {
    checkExistingPlans();
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Planes Rebill</CardTitle>
          <CardDescription>
            Configura los planes de suscripción en tu cuenta de Rebill
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!plansCreated ? (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Los planes deben crearse en tu cuenta de Rebill antes que los clientes puedan suscribirse.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium">Planes a crear:</h4>
                <div className="grid gap-3">
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="font-medium text-primary">Plan Básico</div>
                    <div className="text-sm text-muted-foreground">S/297/mes - Sitio web básico</div>
                  </div>
                  <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                    <div className="font-medium text-accent">Plan Avanzado</div>
                    <div className="text-sm text-muted-foreground">S/497/mes - Sitio web + cambios</div>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={createPlans}
                disabled={isCreatingPlans}
                className="w-full"
              >
                {isCreatingPlans ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando planes...
                  </>
                ) : (
                  "Crear Planes en Rebill"
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">¡Planes creados exitosamente!</span>
              </div>
              
              {plans && (
                <div className="space-y-3">
                  <h4 className="font-medium">Planes activos en Rebill:</h4>
                  <div className="grid gap-3">
                    {plans.basic && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="font-medium text-green-700">Plan Básico</div>
                        <div className="text-sm text-green-600">
                          ID: {plans.basic.id} • S/{plans.basic.amount / 100}/mes
                        </div>
                      </div>
                    )}
                    {plans.advanced && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="font-medium text-green-700">Plan Avanzado</div>
                        <div className="text-sm text-green-600">
                          ID: {plans.advanced.id} • S/{plans.advanced.amount / 100}/mes
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Los clientes ahora pueden suscribirse a estos planes desde la página de registro.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};