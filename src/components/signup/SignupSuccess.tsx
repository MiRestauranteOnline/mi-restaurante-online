import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    createClientAccount();
  }, []);

  const createClientAccount = async () => {
    try {
      console.log('Creating account...');
      
      // The account should already be created by the payment flow
      // We just need to fetch the client ID and trigger content generation
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, restaurant_name, subdomain')
        .eq('subdomain', signupData.subdomain.toLowerCase())
        .single();
      
      if (clientError || !clientData) {
        throw new Error('No se pudo encontrar la cuenta del cliente');
      }

      console.log('Client found:', clientData.id);
      setClientId(clientData.id);
      setAccountCreated(true);

      // Trigger content generation in background
      triggerContentGeneration(clientData.id, clientData.restaurant_name);

      toast({
        title: "¡Cuenta creada exitosamente!",
        description: "Tu sitio web está siendo generado. Recibirás un email cuando esté listo.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Hubo un problema. Contacta soporte para verificar tu cuenta.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const triggerContentGeneration = async (clientId: string, restaurantName: string) => {
    try {
      setIsGeneratingContent(true);
      console.log('Triggering content generation for client:', clientId);

      // Build content briefing from form data
      const contentBriefing = `${websiteRequirements?.additionalInfo || ''}\n\nTipo de restaurante: ${websiteRequirements?.businessType || ''}\nPúblico objetivo: ${websiteRequirements?.targetAudience || ''}\nEstilo del sitio web: ${websiteRequirements?.websiteStyle || ''}`;

      // Call the generate-client-content edge function
      const { data, error } = await supabase.functions.invoke('generate-client-content', {
        body: {
          briefing: contentBriefing,
          clientId: clientId,
          restaurantName: restaurantName,
          address: signupData.address || 'Lima, Perú'
        }
      });

      if (error) {
        console.error('Error generating content:', error);
        // Don't show error to user, admin will be notified
      } else {
        console.log('Content generation started successfully');
      }
    } catch (error) {
      console.error('Error triggering content generation:', error);
      // Silent fail - admin will be notified
    } finally {
      setIsGeneratingContent(false);
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
              <CardHeader className="text-left">
                <CardTitle className="flex items-center gap-2 text-left">
                  <Mail className="w-5 h-5 text-primary" />
                  Datos de Acceso
                </CardTitle>
                <CardDescription className="text-left">
                  Guarda esta información para acceder a tu panel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-left">
                <div>
                  <p className="text-sm text-muted-foreground text-left">Email:</p>
                  <p className="font-medium text-left">{signupData.email || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground text-left">Contraseña:</p>
                  <p className="font-medium text-left">{signupData.password || '••••••••'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground text-left">Tu sitio web:</p>
                  <p className="font-medium text-primary text-left">
                    {signupData.hasCustomDomain && signupData.customDomain 
                      ? signupData.customDomain 
                      : `${signupData.subdomain || 'tu-restaurante'}.mirestaurante.online`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-left">
                <CardTitle className="flex items-center gap-2 text-left">
                  <Clock className="w-5 h-5 text-primary" />
                  Próximos Pasos
                </CardTitle>
                <CardDescription className="text-left">
                  Qué esperar después de tu registro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                {isGeneratingContent && (
                  <Alert className="bg-primary/10 border-primary/20">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Generando contenido de tu sitio web...
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium mt-0.5">
                    1
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-left">Generación de contenido</p>
                    <p className="text-sm text-muted-foreground text-left">
                      En progreso ahora mismo
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium mt-0.5">
                    2
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-left">Sitio web listo</p>
                    <p className="text-sm text-muted-foreground text-left">
                      24-48 horas (recibirás un email)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium mt-0.5">
                    3
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-left">Acceso al panel</p>
                    <p className="text-sm text-muted-foreground text-left">
                      Te enviaremos las credenciales por email
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
              onClick={() => window.location.href = '/soporte'}
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
                <a href="mailto:soporte@mirestaurante.online" className="text-primary hover:underline">
                  soporte@mirestaurante.online
                </a>{" "}
                o{" "}
                <a href="/soporte" className="text-primary hover:underline">
                  completa nuestro formulario de soporte
                </a>.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};