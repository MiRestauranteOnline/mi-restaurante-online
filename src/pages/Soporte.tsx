import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { businessData } from "@/config/businessData";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, Clock, MapPin, Send, CheckCircle, Shield, AlertCircle } from "lucide-react";

const supportSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
  message: z.string().min(20, "El mensaje debe tener al menos 20 caracteres"),
  clientId: z.string().optional(),
  supportType: z.enum(["regular", "premium"]),
  premiumEmail: z.string().optional(),
  premiumPin: z.string().optional(),
}).refine((data) => {
  if (data.supportType === "premium") {
    return data.premiumEmail && data.premiumPin && data.premiumPin.length === 8;
  }
  return true;
}, {
  message: "Para soporte premium, debes proporcionar email y PIN de 8 dígitos",
});

type SupportFormData = z.infer<typeof supportSchema>;

const Soporte = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isPremiumVerified, setIsPremiumVerified] = useState(false);
  const [verifyingPremium, setVerifyingPremium] = useState(false);
  const { toast } = useToast();

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      clientId: "",
      supportType: "regular",
      premiumEmail: "",
      premiumPin: "",
    },
  });

  const supportType = form.watch("supportType");
  const premiumEmail = form.watch("premiumEmail");
  const premiumPin = form.watch("premiumPin");

  const verifyPremiumSupport = async () => {
    if (!premiumEmail || !premiumPin || premiumPin.length !== 8) {
      toast({
        title: "Datos incompletos",
        description: "Por favor ingresa email y PIN de 8 dígitos",
        variant: "destructive",
      });
      return;
    }

    setVerifyingPremium(true);
    
    try {
      // First get the client by email
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id, restaurant_name, plan_type')
        .eq('email', premiumEmail)
        .maybeSingle();

      if (clientError || !client) {
        toast({
          title: "Email no encontrado",
          description: "No encontramos ningún cliente con ese email",
          variant: "destructive",
        });
        return;
      }

      if (client.plan_type !== 'advanced') {
        toast({
          title: "Plan no válido",
          description: "Este cliente no tiene plan avanzado activo",
          variant: "destructive",
        });
        return;
      }

      // Check if PIN matches
      const { data: premiumFeatures, error: pinError } = await supabase
        .from('premium_features')
        .select('unique_support_pin')
        .eq('client_id', client.id)
        .eq('unique_support_pin', premiumPin)
        .maybeSingle();

      if (pinError || !premiumFeatures) {
        toast({
          title: "PIN incorrecto",
          description: "El PIN no coincide con nuestros registros",
          variant: "destructive",
        });
        return;
      }

      // Success
      setIsPremiumVerified(true);
      toast({
        title: "Verificación exitosa",
        description: `Bienvenido, ${client.restaurant_name}. Tienes acceso a soporte premium.`,
      });

    } catch (error) {
      console.error("Error verifying premium support:", error);
      toast({
        title: "Error de verificación",
        description: "Hubo un problema verificando tus datos. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setVerifyingPremium(false);
    }
  };

  const onSubmit = async (data: SupportFormData) => {
    if (data.supportType === "premium" && !isPremiumVerified) {
      toast({
        title: "Verificación requerida",
        description: "Debes verificar tu PIN premium antes de enviar el mensaje",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-support-email', {
        body: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          clientId: data.clientId || null,
          supportType: data.supportType,
          premiumEmail: data.premiumEmail || null,
          premiumPin: data.premiumPin || null
        }
      });

      if (error) {
        throw error;
      }

      setSubmitted(true);
      toast({
        title: "Ticket creado exitosamente",
        description: "Hemos recibido tu solicitud y creado un ticket de soporte. Te responderemos pronto.",
      });
    } catch (error: any) {
      console.error('Error submitting support request:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al enviar tu mensaje. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Centro de Soporte
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Estamos aquí para ayudarte. Envíanos tu consulta y te responderemos lo antes posible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Información de Contacto
                  </CardTitle>
                  <CardDescription>
                    Otras formas de contactarnos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Email de Soporte</p>
                      <a 
                        href="mailto:soporte@mirestaurante.online" 
                        className="text-sm text-primary hover:underline"
                      >
                        soporte@mirestaurante.online
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Ventas por WhatsApp</p>
                      <p className="text-sm text-muted-foreground">
                        {businessData.contact.whatsapp.displayNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Solo para consultas de ventas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Horario de Atención</p>
                      <p className="text-sm text-muted-foreground">
                        {businessData.businessHours.weekdays.display}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {businessData.businessHours.sunday.display}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-sm text-muted-foreground">
                        {businessData.address.displayShort}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-blue-600 text-2xl mb-2">💡</div>
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Respuesta Rápida
                    </h3>
                    <p className="text-sm text-blue-700">
                      Respondemos a todos los mensajes de soporte dentro de 24 horas durante días laborables.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Support Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Enviar Mensaje de Soporte
                  </CardTitle>
                  <CardDescription>
                    Completa el formulario y nos pondremos en contacto contigo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-700 mb-2">
                        ¡Mensaje Enviado!
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Gracias por contactarnos. Te responderemos pronto a tu email.
                      </p>
                      <Button 
                        onClick={() => {
                          setSubmitted(false);
                          form.reset();
                        }}
                        variant="outline"
                      >
                        Enviar Otro Mensaje
                      </Button>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre Completo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Tu nombre completo" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="tu@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="clientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID de Cliente o Subdominio (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="ej: mi-restaurante o cliente123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Support Type Selection */}
                        <FormField
                          control={form.control}
                          name="supportType"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Tipo de Soporte</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-2"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="regular" id="regular" />
                                    <Label htmlFor="regular">Soporte Regular</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="premium" id="premium" />
                                    <Label htmlFor="premium" className="flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-primary" />
                                      Soporte Premium (Plan Avanzado)
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Premium Support Verification */}
                        {supportType === "premium" && (
                          <div className="bg-muted p-4 rounded-lg space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                              <Shield className="h-5 w-5" />
                              <h3 className="font-semibold">Verificación de Soporte Premium</h3>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              Para acceder al soporte premium, verifica tu identidad con tu email y PIN único.
                            </p>

                            <div className="grid md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="premiumEmail"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email registrado</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="email@registrado.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="premiumPin"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>PIN único (8 dígitos)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="text" 
                                        placeholder="12345678" 
                                        maxLength={8}
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <Button 
                                type="button"
                                onClick={verifyPremiumSupport}
                                disabled={verifyingPremium || !premiumEmail || !premiumPin || premiumPin.length !== 8}
                                variant="outline"
                              >
                                {verifyingPremium ? (
                                  <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Verificando...
                                  </div>
                                ) : (
                                  "Verificar PIN"
                                )}
                              </Button>
                              
                              {isPremiumVerified && (
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Verificado</span>
                                </div>
                              )}
                            </div>

                            {!isPremiumVerified && (
                              <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-md">
                                <AlertCircle className="h-4 w-4 mt-0.5" />
                                <p className="text-sm">
                                  Debes verificar tu PIN antes de enviar el mensaje de soporte premium.
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Asunto</FormLabel>
                              <FormControl>
                                <Input placeholder="¿En qué podemos ayudarte?" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mensaje</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe tu consulta o problema de la manera más detallada posible..."
                                  rows={6}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          disabled={isSubmitting || (supportType === "premium" && !isPremiumVerified)}
                          className="w-full"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Enviando...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4" />
                              Enviar Mensaje
                            </div>
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Soporte;