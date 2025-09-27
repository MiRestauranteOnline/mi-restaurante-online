import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupStep1Props {
  onComplete: (data: SignupData) => void;
  initialData: SignupData;
}

export const SignupStep1 = ({ onComplete, initialData }: SignupStep1Props) => {
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
    }
  });

  const generateSubdomain = (restaurantName: string) => {
    return restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsProcessingPayment(true);
    
    try {
      // Initialize Rebill payment (mock implementation - replace with actual Rebill integration)
      await initiateRebillPayment(data);
      
      // If payment successful, proceed to next step
      onComplete({
        ...data,
        paymentId: "mock-payment-id", // This would come from Rebill
      });
      
      toast({
        title: "Pago procesado exitosamente",
        description: "Ahora completa los requisitos de tu sitio web",
      });
    } catch (error) {
      toast({
        title: "Error en el pago",
        description: "Hubo un problema procesando tu pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const initiateRebillPayment = async (data: SignupFormData) => {
    // Call Supabase function to create Rebill payment
    const { data: paymentData, error } = await supabase.functions.invoke('create-rebill-payment', {
      body: {
        amount: 99000, // $99 in cents (adjust for your currency)
        currency: 'COP', // Colombian Peso
        customer: {
          email: data.email,
          name: data.restaurantName,
          phone: data.phone,
        },
        signup_data: JSON.stringify(data),
        return_url: `${window.location.origin}/registro?step=2`,
        webhook_url: `${window.location.origin}/api/rebill-webhook`,
      },
    });

    if (error) {
      throw new Error('Error creating payment');
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

      {/* Pricing Display */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Plan Profesional</CardTitle>
          <CardDescription>
            <span className="text-3xl font-bold text-foreground">$99</span>
            <span className="text-muted-foreground">/mes</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>SSL Incluido</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Soporte 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Dominio Personalizado</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
                      .mirestauranteonline.com
                    </span>
                  </div>
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
                Pagar $99 y Continuar
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