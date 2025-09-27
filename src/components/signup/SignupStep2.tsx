import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Utensils } from "lucide-react";
import type { SignupData, WebsiteRequirements } from "@/pages/Signup";

const requirementsSchema = z.object({
  businessType: z.string().min(1, "Selecciona el tipo de negocio"),
  targetAudience: z.string().min(5, "Describe tu público objetivo"),
  mainServices: z.array(z.string()).min(1, "Selecciona al menos un servicio"),
  specialFeatures: z.array(z.string()),
  colorPreferences: z.string().min(3, "Describe tus preferencias de color"),
  additionalInfo: z.string(),
});

type RequirementsFormData = z.infer<typeof requirementsSchema>;

interface SignupStep2Props {
  onComplete: (requirements: WebsiteRequirements) => void;
  onBack: () => void;
  signupData: SignupData;
  initialData: WebsiteRequirements;
}

export const SignupStep2 = ({ onComplete, onBack, signupData, initialData }: SignupStep2Props) => {
  const form = useForm<RequirementsFormData>({
    resolver: zodResolver(requirementsSchema),
    defaultValues: {
      businessType: initialData.businessType,
      targetAudience: initialData.targetAudience,
      mainServices: initialData.mainServices,
      specialFeatures: initialData.specialFeatures,
      colorPreferences: initialData.colorPreferences,
      additionalInfo: initialData.additionalInfo,
    }
  });

  const onSubmit = async (data: RequirementsFormData) => {
    onComplete(data);
  };

  const mainServiceOptions = [
    "Comida a domicilio",
    "Reservas en línea",
    "Menú digital",
    "Eventos y catering",
    "Takeaway/Para llevar",
    "Bar y cócteles",
    "Desayunos",
    "Almuerzos ejecutivos",
    "Cenas especiales",
  ];

  const specialFeatureOptions = [
    "Sistema de reservas",
    "Carrito de compras",
    "Galería de fotos",
    "Reseñas de clientes",
    "Blog de recetas",
    "Cupones y descuentos",
    "Programa de lealtad",
    "Chat en vivo",
    "Integración WhatsApp",
    "Múltiples idiomas",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Requisitos del Sitio Web
          </h1>
          <p className="text-muted-foreground">
            Para {signupData.restaurantName} • {signupData.subdomain}.mirestauranteonline.com
          </p>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            Información del Restaurante
          </CardTitle>
          <CardDescription>
            Cuéntanos sobre tu restaurante para crear el sitio perfecto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Restaurante</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de restaurante" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="casual-dining">Restaurante Casual</SelectItem>
                        <SelectItem value="fast-food">Comida Rápida</SelectItem>
                        <SelectItem value="fine-dining">Restaurante Gourmet</SelectItem>
                        <SelectItem value="cafe">Café / Cafetería</SelectItem>
                        <SelectItem value="bar">Bar / Pub</SelectItem>
                        <SelectItem value="pizzeria">Pizzería</SelectItem>
                        <SelectItem value="bakery">Panadería</SelectItem>
                        <SelectItem value="food-truck">Food Truck</SelectItem>
                        <SelectItem value="delivery-only">Solo Domicilios</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Público Objetivo</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ej: Familias con niños, jóvenes profesionales, turistas, parejas románticas..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mainServices"
                render={() => (
                  <FormItem>
                    <FormLabel>Servicios Principales</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {mainServiceOptions.map((service) => (
                        <FormField
                          key={service}
                          control={form.control}
                          name="mainServices"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={service}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(service)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, service])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== service
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {service}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialFeatures"
                render={() => (
                  <FormItem>
                    <FormLabel>Funcionalidades Especiales (Opcional)</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {specialFeatureOptions.map((feature) => (
                        <FormField
                          key={feature}
                          control={form.control}
                          name="specialFeatures"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={feature}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(feature)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, feature])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== feature
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {feature}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colorPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferencias de Color y Estilo</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ej: Colores cálidos como naranja y rojo, estilo moderno, elegante y minimalista..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Información Adicional (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Cualquier otra información que consideres importante para tu sitio web..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" size="lg">
                Crear Mi Sitio Web
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};