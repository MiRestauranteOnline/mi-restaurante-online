import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input";
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
  phoneCountryCode: z.string().min(1, "Selecciona un código de país"),
  phone: z.string().min(6, "Número de teléfono inválido"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  hasCustomDomain: z.boolean().optional(),
  customDomain: z.string().optional(),
  referralSource: z.string().min(1, "Por favor selecciona cómo nos encontraste"),
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupStep1Props {
  onComplete: (data: SignupData, selectedPlan: 'basic' | 'advanced') => Promise<void>;
  initialData: SignupData;
  isProcessingPayment?: boolean;
}


export const SignupStep1 = ({ onComplete, initialData, isProcessingPayment = false }: SignupStep1Props) => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'advanced'>('basic');
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainError, setSubdomainError] = useState<string>("");
  const [subdomainCheckTimeout, setSubdomainCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [domainError, setDomainError] = useState<string>("");
  const [domainCheckTimeout, setDomainCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [countryCode, setCountryCode] = useState("+51"); // Default to Peru
  const [phoneNumber, setPhoneNumber] = useState("");

  const { toast } = useToast();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      restaurantName: initialData.restaurantName,
      subdomain: initialData.subdomain,
      email: initialData.email,
      password: initialData.password,
      phoneCountryCode: "+51", // Default to Peru
      phone: initialData.phone,
      address: initialData.address || "", // New address field
      hasCustomDomain: initialData.hasCustomDomain || false,
      customDomain: initialData.customDomain || "",
      referralSource: initialData.referralSource || "",
    }
  });

  // Initialize phone number and country code from initial data
  useEffect(() => {
    if (initialData.phone) {
      setPhoneNumber(initialData.phone);
    }
    if (initialData.phone_country_code) {
      setCountryCode(initialData.phone_country_code);
      form.setValue('phoneCountryCode', initialData.phone_country_code);
    }
  }, [initialData.phone, initialData.phone_country_code, form]);

  // Check subdomain on initial load if there's already a value
  useEffect(() => {
    const currentSubdomain = form.getValues('subdomain');
    if (currentSubdomain && currentSubdomain.length >= 3) {
      checkSubdomainAvailability(currentSubdomain);
    }
  }, []);

  const generateSubdomain = (restaurantName: string) => {
    return restaurantName
      .toLowerCase()
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
      .replace(/[^a-z0-9\s]/g, '') // Remove remaining special characters
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

  const checkDomainAvailability = async (domain: string) => {
    if (!domain || domain.length < 3 || !domain.includes('.')) {
      console.log('Domain too short/invalid:', domain);
      setDomainError("");
      return;
    }

    console.log('🔍 Checking domain availability for:', domain);
    setIsCheckingDomain(true);
    setDomainError("");

    try {
      const cleaned = cleanDomain(domain);
      const { data, error } = await supabase.functions.invoke('check-domain-availability', {
        body: { domain: cleaned },
      });

      console.log('📊 Domain check via edge result:', { searchedFor: cleaned, data, error: error?.message || 'no error' });

      if (error) {
        console.error('❌ Error checking domain (edge):', error);
        setDomainError("Error al verificar dominio");
        return;
      }

      if (data?.exists) {
        console.log('🚫 Domain is taken:', cleaned);
        setDomainError("Este dominio ya está en uso. Por favor elige otro.");
      } else {
        console.log('✅ Domain is available');
        setDomainError("");
      }
    } catch (error) {
      console.error('💥 Exception checking domain (edge):', error);
      setDomainError("Error al verificar dominio");
    } finally {
      setIsCheckingDomain(false);
      console.log('🏁 Domain check completed');
    }
  };

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      console.log('Subdomain too short or empty:', subdomain);
      setSubdomainError("");
      return;
    }

    console.log('🔍 Checking subdomain availability for:', subdomain);
    setIsCheckingSubdomain(true);
    setSubdomainError("");

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, subdomain')
        .eq('subdomain', subdomain.toLowerCase())
        .maybeSingle();

      console.log('📊 Subdomain check result:', { 
        searchedFor: subdomain.toLowerCase(),
        data, 
        error: error?.message || 'no error',
        errorCode: error?.code 
      });

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error checking subdomain:', error);
        setSubdomainError("Error al verificar disponibilidad");
        return;
      }

      if (data) {
        console.log('🚫 Subdomain is taken:', data.subdomain);
        setSubdomainError("Este subdominio ya está en uso. Por favor elige otro.");
      } else {
        console.log('✅ Subdomain is available');
        setSubdomainError("");
      }
    } catch (error) {
      console.error('💥 Exception checking subdomain:', error);
      setSubdomainError("Error al verificar disponibilidad");
    } finally {
      setIsCheckingSubdomain(false);
      console.log('🏁 Subdomain check completed');
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      // Final validation before submission
      if (subdomainError) {
        toast({
          title: "Subdominio no disponible",
          description: subdomainError,
          variant: "destructive",
        });
        return;
      }

      // Validate custom domain if provided
      if (data.hasCustomDomain && data.customDomain) {
        const cleanedDomain = cleanDomain(data.customDomain);
        
        // Check if custom domain is already taken using edge function
        const { data: domainCheck, error: domainCheckError } = await supabase.functions.invoke('check-domain-availability', {
          body: { domain: cleanedDomain },
        });

        if (domainCheckError) {
          toast({
            title: "Error verificando dominio",
            description: "No pudimos verificar la disponibilidad del dominio. Intenta de nuevo.",
            variant: "destructive",
          });
          return;
        }

        if (domainCheck?.exists) {
          toast({
            title: "Dominio no disponible",
            description: "Este dominio ya está en uso. Por favor elige otro.",
            variant: "destructive",
          });
          return;
        }
      }

      // Clean custom domain if provided and combine phone data
      const cleanedData = {
        ...data,
        customDomain: data.hasCustomDomain && data.customDomain ? cleanDomain(data.customDomain) : "",
        phone: phoneNumber,
        phone_country_code: countryCode,
        whatsapp_country_code: countryCode,
      };
      
      await onComplete(cleanedData, selectedPlan);
      
      toast({
        title: "Información guardada",
        description: "Desplázate hacia abajo para completar el pago.",
      });
    } catch (error: any) {
      toast({
        title: "Error en el proceso",
        description: error.message || "Hubo un problema. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
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
                      
                      // Clear any existing subdomain timeout
                      if (subdomainCheckTimeout) {
                        clearTimeout(subdomainCheckTimeout);
                      }
                      
                      // Trigger subdomain availability check for auto-generated subdomain
                      if (subdomain && subdomain.length >= 3) {
                        console.log('Auto-generated subdomain, checking availability:', subdomain);
                        setSubdomainError("");
                        setIsCheckingSubdomain(false);
                        
                        const timeoutId = setTimeout(() => {
                          checkSubdomainAvailability(subdomain);
                        }, 500);
                        setSubdomainCheckTimeout(timeoutId);
                      } else {
                        setSubdomainError("");
                        setIsCheckingSubdomain(false);
                      }
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
                      onChange={(e) => {
                        const newValue = e.target.value;
                        field.onChange(e);
                        
                        console.log('Subdomain input changed to:', newValue);
                        
                        // Clear any existing timeout
                        if (subdomainCheckTimeout) {
                          clearTimeout(subdomainCheckTimeout);
                        }
                        
                        // Clear previous error
                        setSubdomainError("");
                        setIsCheckingSubdomain(false);
                        
                        if (newValue && newValue.length >= 3) {
                          console.log('Setting timeout to check subdomain:', newValue);
                          // Debounce the check with 500ms delay (reduced from 1 second)
                          const timeoutId = setTimeout(() => {
                            console.log('Timeout triggered, checking subdomain:', newValue);
                            checkSubdomainAvailability(newValue);
                          }, 500);
                          setSubdomainCheckTimeout(timeoutId);
                        } else {
                          console.log('Subdomain too short, clearing error');
                          setSubdomainError("");
                          setIsCheckingSubdomain(false);
                        }
                      }}
                      className={subdomainError ? "border-destructive" : ""}
                    />
                    <span className="flex items-center px-3 text-sm text-muted-foreground bg-muted border border-l-0 rounded-r-md">
                      .mirestaurante.online
                    </span>
                  </div>
                </FormControl>
                {isCheckingSubdomain && (
                  <p className="text-sm text-muted-foreground" role="status" aria-live="polite">Verificando disponibilidad...</p>
                )}
                {subdomainError && (
                  <p className="text-sm text-destructive" role="alert" aria-live="assertive">{subdomainError}</p>
                )}
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
                      const raw = e.target.value;
                      const cleaned = cleanDomain(raw);
                      field.onChange(cleaned);

                      // debounce domain availability check
                      if (domainCheckTimeout) {
                        clearTimeout(domainCheckTimeout);
                      }
                      setDomainError("");
                      setIsCheckingDomain(false);

                      if (cleaned && cleaned.includes('.')) {
                        const timeoutId = setTimeout(() => {
                          checkDomainAvailability(cleaned);
                        }, 500);
                        setDomainCheckTimeout(timeoutId);
                      }
                    }}
                  />
                </FormControl>
                {isCheckingDomain && (
                  <p className="text-sm text-muted-foreground">Verificando dominio...</p>
                )}
                {domainError && (
                  <p className="text-sm text-destructive">{domainError}</p>
                )}
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
            name="phoneCountryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <PhoneInput
                    countryCode={countryCode}
                    phoneNumber={phoneNumber}
                    onCountryCodeChange={(code) => {
                      setCountryCode(code);
                      field.onChange(code);
                    }}
                    onPhoneNumberChange={(number) => {
                      // Auto-remove any country code that matches the selected one
                      let cleanNumber = number;
                      const codeWithoutPlus = countryCode.replace('+', '');
                      
                      // Remove country code if it appears at the start
                      if (number.startsWith(codeWithoutPlus)) {
                        cleanNumber = number.slice(codeWithoutPlus.length);
                      }
                      
                      setPhoneNumber(cleanNumber);
                      form.setValue('phone', cleanNumber);
                    }}
                    placeholder="123 456 789"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección del Restaurante</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Av. Larco 123, Miraflores, Lima"
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
                    <span className="text-2xl font-bold text-primary">S/49</span>
                    <span className="text-sm text-muted-foreground">/mes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Precio de Lanzamiento</Badge>
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
                    <span className="text-2xl font-bold text-accent">S/99</span>
                    <span className="text-sm text-muted-foreground">/mes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Precio de Lanzamiento</Badge>
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

            {/* Payment Method Info */}
            <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Pago Seguro</h4>
                  <p className="text-sm text-muted-foreground">
                    Procesamos tu pago de forma segura
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Pago 100% seguro</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Activación inmediata</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isProcessingPayment || !!subdomainError || isCheckingSubdomain}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando registro...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Continuar al Pago - {selectedPlan === 'basic' ? 'S/297' : 'S/497'}/mes
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