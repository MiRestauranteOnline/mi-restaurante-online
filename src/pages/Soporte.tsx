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
import { useToast } from "@/hooks/use-toast";
import { businessData } from "@/config/businessData";
import { Mail, Phone, Clock, MapPin, Send, CheckCircle } from "lucide-react";

const supportSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
  message: z.string().min(20, "El mensaje debe tener al menos 20 caracteres"),
  clientId: z.string().optional(),
});

type SupportFormData = z.infer<typeof supportSchema>;

const Soporte = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      clientId: "",
    },
  });

  const onSubmit = async (data: SupportFormData) => {
    setIsSubmitting(true);
    
    try {
      // Here you would normally send the form data to your backend
      // For now, we'll simulate a successful submission
      console.log("Support form submitted:", data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      toast({
        title: "Mensaje enviado exitosamente",
        description: "Te contactaremos pronto para ayudarte.",
      });
    } catch (error) {
      console.error("Error sending support message:", error);
      toast({
        title: "Error al enviar mensaje",
        description: "Por favor intenta nuevamente o contáctanos directamente.",
        variant: "destructive",
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
                          disabled={isSubmitting}
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