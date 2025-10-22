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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { businessData } from "@/config/businessData";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, Clock, MapPin, Send, CheckCircle, Shield, AlertCircle, Plus, Trash2 } from "lucide-react";

const dnsRecordSchema = z.object({
  type: z.string().min(1, "Tipo de registro requerido"),
  name: z.string().min(1, "Nombre requerido"),
  content: z.string().min(1, "Contenido requerido"),
  priority: z.string().optional(),
  ttl: z.string().optional(),
});

const supportSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
  message: z.string().min(20, "El mensaje debe tener al menos 20 caracteres"),
  clientId: z.string().optional(),
  supportType: z.enum(["regular", "premium"]),
  consultType: z.enum(["general", "dns", "technical", "billing"]),
  premiumEmail: z.string().optional(),
  premiumPin: z.string().optional(),
  dnsRecords: z.array(dnsRecordSchema).optional(),
}).refine((data) => {
  if (data.supportType === "premium") {
    return data.premiumEmail && data.premiumPin && data.premiumPin.length === 8;
  }
  return true;
}, {
  message: "Para soporte premium, debes proporcionar email y PIN de 8 dígitos",
}).refine((data) => {
  if (data.consultType === "dns" && data.dnsRecords && data.dnsRecords.length > 0) {
    // Validate each DNS record based on its type
    return data.dnsRecords.every(record => {
      if (!record.type || !record.name || !record.content) return false;
      
      // Validate based on record type
      switch (record.type) {
        case 'A':
          // A records need IPv4 address
          return /^(\d{1,3}\.){3}\d{1,3}$/.test(record.content);
        case 'AAAA':
          // AAAA records need IPv6 address
          return /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/.test(record.content) || record.content.includes(':');
        case 'CNAME':
          // CNAME records need domain name
          return record.content.includes('.') || record.content === '@';
        case 'MX':
          // MX records need domain and priority
          return record.content.includes('.') && record.priority && /^\d+$/.test(record.priority);
        case 'TXT':
          // TXT records can be anything
          return true;
        default:
          return true;
      }
    });
  }
  return true;
}, {
  message: "Registros DNS inválidos: Verifica que A tenga IP, AAAA tenga IPv6, CNAME tenga dominio, MX tenga dominio y prioridad",
});

type SupportFormData = z.infer<typeof supportSchema>;

const Soporte = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isPremiumVerified, setIsPremiumVerified] = useState(false);
  const [verifyingPremium, setVerifyingPremium] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<Array<{
    type: string;
    name: string;
    content: string;
    priority?: string;
    ttl?: string;
  }>>([]);
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
      consultType: "general",
      premiumEmail: "",
      premiumPin: "",
      dnsRecords: [],
    },
  });

  const supportType = form.watch("supportType");
  const consultType = form.watch("consultType");
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
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Support form data:", data);
    if (data.supportType === "premium" && !isPremiumVerified) {
      toast({
        title: "Verificación requerida",
        description: "Debes verificar tu PIN premium antes de enviar el mensaje",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    console.log("Submitting support request:", data);

    // Quick health check (does not create a ticket)
    try {
      const pingResp = await fetch('https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/send-support-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8' },
        body: JSON.stringify({ ping: true })
      });
      console.log('Ping status:', pingResp.status);
    } catch (e) {
      console.warn('Ping failed:', e);
    }
    
    try {
      console.log("Calling send-support-email function...");
      const body = {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        clientId: data.clientId || null,
        supportType: data.supportType,
        consultType: data.consultType,
        dnsRecords: data.consultType === 'dns' ? dnsRecords : null,
        premiumEmail: data.premiumEmail || null,
        premiumPin: data.premiumPin || null
      };

      let invokeError: any = null;
      try {
        const { error } = await supabase.functions.invoke('send-support-email', { body });
        invokeError = error || null;
        console.log("Edge function invoke returned", { error });
      } catch (err) {
        invokeError = err;
        console.error("Invoke threw error", err);
      }

      if (invokeError) {
        console.warn("Falling back to direct fetch for edge function...");
        const resp = await fetch('https://ptzcetvcccnojdbzzlyt.supabase.co/functions/v1/send-support-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0emNldHZjY2Nub2pkYnp6bHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NjExNzksImV4cCI6MjA3NDMzNzE3OX0.2HS2wP06xe8PryWW_VdzTu7TDYg303BjwmzyA_5Ang8',
          },
          body: JSON.stringify(body)
        });
        if (!resp.ok) {
          const txt = await resp.text();
          console.error("Direct fetch failed", resp.status, txt);
          throw new Error(`Edge function failed: ${resp.status}`);
        }
        console.log("Direct fetch succeeded");
      }

      console.log("Ticket submitted successfully");

      // Reset DNS records if it was a DNS request
      if (data.consultType === 'dns') {
        setDnsRecords([]);
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
      
      <main className="pt-32 pb-16">
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
                      Respondemos dentro de 48 horas para soporte estándar, y menos de 24 horas para soporte premium (plan avanzado).
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
                          setDnsRecords([]);
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

                        {/* Consult Type Selection */}
                        <FormField
                          control={form.control}
                          name="consultType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Consulta</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el tipo de consulta" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="general">Consulta General</SelectItem>
                                  <SelectItem value="dns">Solicitud de Configuración DNS</SelectItem>
                                  <SelectItem value="technical">Soporte Técnico</SelectItem>
                                  <SelectItem value="billing">Facturación</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* DNS Records Input */}
                        {consultType === "dns" && (
                          <div className="bg-muted p-4 rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">Registros DNS</h3>
                                <p className="text-sm text-muted-foreground">
                                  Agrega los registros DNS que necesitas configurar
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDnsRecords([...dnsRecords, { type: 'A', name: '', content: '', priority: '10', ttl: 'Auto' }])}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Registro
                              </Button>
                            </div>

                            {dnsRecords.length === 0 ? (
                              <div className="text-center py-6 text-muted-foreground">
                                <p className="text-sm">No hay registros DNS agregados</p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => setDnsRecords([{ type: 'A', name: '', content: '', priority: '10', ttl: 'Auto' }])}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Agregar primer registro
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {dnsRecords.map((record, index) => (
                                  <Card key={index} className="p-4">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Registro #{index + 1}</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const newRecords = dnsRecords.filter((_, i) => i !== index);
                                            setDnsRecords(newRecords);
                                            form.setValue('dnsRecords', newRecords);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      <div className="grid md:grid-cols-3 gap-3">
                                        <div>
                                          <Label>Tipo</Label>
                                          <Select
                                            value={record.type}
                                            onValueChange={(value) => {
                                              const newRecords = [...dnsRecords];
                                              newRecords[index].type = value;
                                              setDnsRecords(newRecords);
                                              form.setValue('dnsRecords', newRecords);
                                            }}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="A">A</SelectItem>
                                              <SelectItem value="AAAA">AAAA</SelectItem>
                                              <SelectItem value="CNAME">CNAME</SelectItem>
                                              <SelectItem value="MX">MX</SelectItem>
                                              <SelectItem value="TXT">TXT</SelectItem>
                                              <SelectItem value="SRV">SRV</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div>
                                          <Label>Nombre / Host</Label>
                                          <Input
                                            placeholder="@ o subdomain"
                                            value={record.name}
                                            onChange={(e) => {
                                              const newRecords = [...dnsRecords];
                                              newRecords[index].name = e.target.value;
                                              setDnsRecords(newRecords);
                                              form.setValue('dnsRecords', newRecords);
                                            }}
                                          />
                                        </div>

                                        <div>
                                          <Label>Contenido / Valor</Label>
                                          <Input
                                            placeholder={
                                              record.type === 'A' ? 'e.g., 192.0.2.1' :
                                              record.type === 'AAAA' ? 'e.g., 2001:0db8::1' :
                                              record.type === 'CNAME' ? 'e.g., example.com' :
                                              record.type === 'MX' ? 'e.g., mail.example.com' :
                                              record.type === 'TXT' ? 'e.g., "v=spf1 include:example.com"' :
                                              'IP o valor'
                                            }
                                            value={record.content}
                                            onChange={(e) => {
                                              const newRecords = [...dnsRecords];
                                              newRecords[index].content = e.target.value;
                                              setDnsRecords(newRecords);
                                              form.setValue('dnsRecords', newRecords);
                                            }}
                                          />
                                        </div>
                                      </div>

                                      {record.type === 'MX' && (
                                        <div className="grid md:grid-cols-2 gap-3">
                                          <div>
                                            <Label>Prioridad</Label>
                                            <Input
                                              type="number"
                                              placeholder="10"
                                              value={record.priority}
                                              onChange={(e) => {
                                                const newRecords = [...dnsRecords];
                                                newRecords[index].priority = e.target.value;
                                                setDnsRecords(newRecords);
                                                form.setValue('dnsRecords', newRecords);
                                              }}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                              Menor número = mayor prioridad (típicamente 10)
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {/* Validation hints based on record type */}
                                      <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded">
                                        {record.type === 'A' && (
                                          <p>✓ Registro A requiere una dirección IPv4 (e.g., 192.0.2.1)</p>
                                        )}
                                        {record.type === 'AAAA' && (
                                          <p>✓ Registro AAAA requiere una dirección IPv6 (e.g., 2001:0db8::1)</p>
                                        )}
                                        {record.type === 'CNAME' && (
                                          <p>✓ Registro CNAME requiere un nombre de dominio (e.g., example.com)</p>
                                        )}
                                        {record.type === 'MX' && (
                                          <p>✓ Registro MX requiere un nombre de dominio y prioridad (e.g., mail.example.com, prioridad 10)</p>
                                        )}
                                        {record.type === 'TXT' && (
                                          <p>✓ Registro TXT puede contener cualquier texto (e.g., verificación de dominio, SPF, DKIM)</p>
                                        )}
                                      </div>

                                      <div>
                                        <Label>TTL</Label>
                                        <Select
                                          value={record.ttl || 'Auto'}
                                          onValueChange={(value) => {
                                            const newRecords = [...dnsRecords];
                                            newRecords[index].ttl = value;
                                            setDnsRecords(newRecords);
                                            form.setValue('dnsRecords', newRecords);
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Auto">Auto</SelectItem>
                                            <SelectItem value="60">1 minuto</SelectItem>
                                            <SelectItem value="300">5 minutos</SelectItem>
                                            <SelectItem value="3600">1 hora</SelectItem>
                                            <SelectItem value="86400">1 día</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
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