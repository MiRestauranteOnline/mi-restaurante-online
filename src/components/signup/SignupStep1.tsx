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
import { Loader2, CreditCard, Shield, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  onComplete: (data: SignupData, selectedPlan: 'basic' | 'advanced') => Promise<void>;
  initialData: SignupData;
  isProcessingPayment?: boolean;
}

declare global {
  interface Window {
    Rebill: any;
  }
}

export const SignupStep1 = ({ onComplete, initialData, isProcessingPayment = false }: SignupStep1Props) => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'advanced'>('basic');
  const [paymentMethod, setPaymentMethod] = useState<'rebill' | 'demo'>('demo');

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
    try {
      // Clean custom domain if provided
      const cleanedData = {
        ...data,
        customDomain: data.hasCustomDomain && data.customDomain ? cleanDomain(data.customDomain) : "",
      };
      
      await onComplete(cleanedData, selectedPlan);
      
      toast({
        title: "Información guardada",
        description: paymentMethod === 'demo' ? "Continuando sin pago..." : "Procesando pago...",
      });
    } catch (error) {
      toast({
        title: "Error en el proceso",
        description: "Hubo un problema. Inténtalo de nuevo.",
        variant: "destructive",
      });
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

          {/* Plan Selection Section */}
          <div className="space-y-6 pt-6 border-t">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Elige tu Plan</h3>
              <p className="text-sm text-muted-foreground">Precio fijo de por vida</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Plan Básico */}
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPlan === 'basic' 
                    ? 'border-primary shadow-primary ring-2 ring-primary/20' 
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => setSelectedPlan('basic')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary text-primary-foreground">Más Popular</Badge>
                    <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                      {selectedPlan === 'basic' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                  <CardTitle className="text-lg">Plan Básico</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">S/297</span>
                    <span className="text-sm text-muted-foreground">/mes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-muted-foreground">S/500</span>
                    <Badge variant="destructive" className="text-xs">-41%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1 text-xs">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-primary" />
                      Sitio profesional en 72 horas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-primary" />
                      Hosting + SSL incluido
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-primary" />
                      SEO básico optimizado
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-primary" />
                      Hasta 3,000 visitas/mes
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Plan Avanzado */}
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPlan === 'advanced' 
                    ? 'border-accent shadow-accent ring-2 ring-accent/20' 
                    : 'border-muted hover:border-accent/50'
                }`}
                onClick={() => setSelectedPlan('advanced')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-end">
                    <div className="w-4 h-4 rounded-full border-2 border-accent bg-accent flex items-center justify-center">
                      {selectedPlan === 'advanced' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                  <CardTitle className="text-lg">Plan Avanzado</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-accent">S/497</span>
                    <span className="text-sm text-muted-foreground">/mes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-muted-foreground">S/1000</span>
                    <Badge variant="destructive" className="text-xs">-50%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1 text-xs">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-accent" />
                      Todo lo del Plan Básico
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-accent" />
                      1 hora/mes cambios extendidos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-accent" />
                      Nuevas secciones personalizadas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-accent" />
                      Soporte prioritario
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <h4 className="font-semibold">Método de Pago</h4>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'rebill' | 'demo')}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="demo" id="demo" />
                    <label htmlFor="demo" className="flex-1 cursor-pointer">
                      <div className="font-medium">Continuar sin Pago (Demo)</div>
                      <div className="text-sm text-muted-foreground">
                        Tu cuenta Rebill está en revisión. Puedes crear tu sitio web gratis mientras tanto.
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg opacity-50">
                    <RadioGroupItem value="rebill" id="rebill" disabled />
                    <label htmlFor="rebill" className="flex-1">
                      <div className="font-medium text-muted-foreground">Pago con Tarjeta (Próximamente)</div>
                      <div className="text-sm text-muted-foreground">
                        Disponible cuando se active tu cuenta Rebill
                      </div>
                    </label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Procesando Pago...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                {paymentMethod === 'demo' ? 'Crear Cuenta (Demo)' : `Pagar ${selectedPlan === 'basic' ? 'S/297' : 'S/497'} y Crear Cuenta`}
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