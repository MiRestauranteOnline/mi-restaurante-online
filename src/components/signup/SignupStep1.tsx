import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SignupData } from "@/pages/Signup";

const signupSchema = z.object({
  restaurantName: z.string().min(2, "El nombre del restaurante debe tener al menos 2 caracteres"),
  subdomain: z.string()
    .min(3, "El subdominio debe tener al menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo se permiten letras minúsculas, números y guiones"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  phone: z.string().min(10, "Número de teléfono inválido"),
  hasCustomDomain: z.boolean().optional(),
  customDomain: z.string().optional(),
  referralSource: z.string().optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupStep1Props {
  onComplete: (data: SignupData) => void;
  initialData: SignupData;
}

export const SignupStep1 = ({ onComplete, initialData }: SignupStep1Props) => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'advanced'>('basic');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { toast } = useToast();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      restaurantName: initialData.restaurantName,
      subdomain: initialData.subdomain,
      email: initialData.email,
      password: initialData.password,
      phone: initialData.phone,
      hasCustomDomain: initialData.hasCustomDomain || false,
      customDomain: initialData.customDomain || "",
      referralSource: initialData.referralSource || "",
    }
  });

  const generateSubdomain = (restaurantName: string) => {
    return restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
  };

  const cleanDomain = (domain: string) => {
    return domain
      .toLowerCase()
      .replace(/^https?:\/\//, '') // Remove protocol
      .replace(/^www\./, '') // Remove www
      .replace(/\/$/, '') // Remove trailing slash
      .trim();
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsProcessingPayment(true);
    
    try {
      // For now, skip payment and go directly to next step
      // TODO: Re-enable when Rebill account is verified
      // await initiateRebillPayment(data);
      
      // Clean custom domain if provided
      const cleanedData = {
        ...data,
        customDomain: data.hasCustomDomain && data.customDomain ? cleanDomain(data.customDomain) : "",
        paymentId: "test-payment-id", // Mock payment ID
      };
      
      onComplete(cleanedData);
      
      toast({
        title: "Cuenta creada exitosamente",
        description: "Ahora completa los requisitos de tu sitio web",
      });
    } catch (error) {
      toast({
        title: "Error en el proceso",
        description: "Hubo un problema. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const initiateRebillPayment = async (data: SignupFormData) => {
    const planAmounts = {
      basic: 29700, // S/297 in centavos
      advanced: 49700, // S/497 in centavos
    };

    // Call Supabase function to create Rebill subscription
    const { data: paymentData, error } = await supabase.functions.invoke('create-rebill-subscription', {
      body: {
        plan_type: selectedPlan,
        amount: planAmounts[selectedPlan],
        currency: 'PEN', // Peruvian Sol
        customer: {
          email: data.email,
          name: data.restaurantName,
          phone: data.phone,
        },
        signup_data: JSON.stringify(data),
        return_url: `${window.location.origin}/registro?step=2&plan=${selectedPlan}`,
        webhook_url: `${window.location.origin}/api/rebill-webhook`,
      },
    });

    if (error) {
      throw new Error('Error creating subscription');
    }

    // Redirect to Rebill payment page
    window.location.href = paymentData.payment_url;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Crea tu Cuenta
        </h1>
        <p className="text-muted-foreground">
          Primero, vamos a crear tu cuenta y procesar el pago para tu sitio web
        </p>
      </div>

      {/* Plan Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className={`cursor-pointer border-2 transition-colors ${
          selectedPlan === 'basic' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`} onClick={() => setSelectedPlan('basic')}>
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-primary">Plan Básico</CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">S/297</span>
              <span className="text-muted-foreground">/mes</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>SSL + Hosting</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Entrega 72h</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>WhatsApp</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer border-2 transition-colors ${
          selectedPlan === 'advanced' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
        }`} onClick={() => setSelectedPlan('advanced')}>
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-accent">Plan Avanzado</CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">S/497</span>
              <span className="text-muted-foreground">/mes</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span>Todo Básico +</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <span>1h/mes cambios</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" />
                <span>Soporte prioritario</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="restaurantName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Restaurante</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: La Parrilla del Chef"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      const subdomain = generateSubdomain(e.target.value);
                      form.setValue('subdomain', subdomain);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subdomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subdominio</FormLabel>
                <FormControl>
                  <div className="flex">
                    <Input 
                      placeholder="mi-restaurante"
                      {...field}
                    />
                    <span className="flex items-center px-3 text-sm text-muted-foreground bg-muted border border-l-0 rounded-r-md">
                      .mirestaurante.online
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hasCustomDomain"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Tengo mi dominio personalizado
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {form.watch("hasCustomDomain") && (
            <FormField
              control={form.control}
              name="customDomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dominio Personalizado</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="mirestaurante.com"
                      {...field}
                      onChange={(e) => {
                        const cleaned = cleanDomain(e.target.value);
                        field.onChange(cleaned);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="chef@mirestaurante.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input 
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input 
                    type="tel"
                    placeholder="+57 300 123 4567"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referralSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Cómo nos encontraste?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background border border-border z-50">
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="advertisement">Publicidad Online</SelectItem>
                    <SelectItem value="flyers">Volantes</SelectItem>
                    <SelectItem value="recommendations">Recomendación de amigos</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando Pago...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Crear Cuenta
              </>
            )}
          </Button>
        </form>
      </Form>

      <p className="text-xs text-muted-foreground text-center">
        Al proceder, aceptas nuestros{" "}
        <a href="/terms" className="text-primary hover:underline">
          Términos de Servicio
        </a>{" "}
        y{" "}
        <a href="/privacy" className="text-primary hover:underline">
          Política de Privacidad
        </a>
      </p>
    </div>
  );
};