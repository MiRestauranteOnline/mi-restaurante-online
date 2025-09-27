import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ExternalLink, Mail, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SignupData, WebsiteRequirements } from "@/pages/Signup";

interface SignupSuccessProps {
  signupData: SignupData;
  websiteRequirements: WebsiteRequirements;
}

export const SignupSuccess = ({ signupData, websiteRequirements }: SignupSuccessProps) => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(true);
  const [accountCreated, setAccountCreated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    createClientAccount();
  }, []);

  const createClientAccount = async () => {
    try {
      // Call the create-client-user edge function
      // Temporarily skip the edge function call for testing
      console.log('Would create account with:', {
        email: signupData.email,
        restaurantName: signupData.restaurantName,
        subdomain: signupData.subdomain,
        phone: signupData.phone,
        customDomain: signupData.customDomain,
        websiteRequirements: websiteRequirements,
      });
      
      // Simulate success for testing
      setAccountCreated(true);
      toast({
        title: "¡Cuenta creada exitosamente!",
        description: "Tu sitio web será creado en las próximas 24-48 horas.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Hubo un problema creando tu cuenta. Contacta soporte.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      {isCreatingAccount ? (
        <Card className="border-primary/20">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <h2 className="text-2xl font-bold">Creando tu cuenta...</h2>
              <p className="text-muted-foreground">
                Estamos configurando todo para tu restaurante
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-green-500/20 bg-green-50/50">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
                <h2 className="text-3xl font-bold text-green-700">¡Felicitaciones!</h2>
                <p className="text-lg text-muted-foreground">
                  Tu cuenta ha sido creada exitosamente
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Datos de Acceso
                </CardTitle>
                <CardDescription>
                  Guarda esta información para acceder a tu panel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Email:</p>
                  <p className="font-medium">{signupData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contraseña:</p>
                  <p className="font-medium">••••••••</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tu sitio web:</p>
                  <p className="font-medium text-primary">
                    {signupData.hasCustomDomain && signupData.customDomain 
                      ? signupData.customDomain 
                      : `${signupData.subdomain}.mirestaurante.online`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Próximos Pasos
                </CardTitle>
                <CardDescription>
                  Qué esperar después de tu registro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Confirmación por email</p>
                    <p className="text-sm text-muted-foreground">
                      En los próximos minutos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Creación del sitio web</p>
                    <p className="text-sm text-muted-foreground">
                      24-48 horas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Acceso al panel</p>
                    <p className="text-sm text-muted-foreground">
                      Te enviaremos el enlace
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Volver al Inicio
            </Button>
            <Button 
              onClick={() => window.location.href = '/contacto'}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Contactar Soporte
            </Button>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-center text-muted-foreground">
                <strong>¿Necesitas ayuda?</strong> Nuestro equipo está disponible para asistirte.
                Escríbenos a{" "}
                <a href="mailto:soporte@mirestauranteonline.com" className="text-primary hover:underline">
                  soporte@mirestauranteonline.com
                </a>{" "}
                o contacta por WhatsApp.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};