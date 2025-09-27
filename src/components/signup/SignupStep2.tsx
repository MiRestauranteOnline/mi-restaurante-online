import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Utensils, Plus, X } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import type { SignupData, WebsiteRequirements, SocialMedia } from "@/pages/Signup";

const requirementsSchema = z.object({
  businessType: z.string().min(1, "Selecciona el tipo de negocio"),
  targetAudience: z.string().min(5, "Describe tu público objetivo"),
  socialMedia: z.array(z.object({
    platform: z.string(),
    url: z.string()
  })),
  hasDelivery: z.boolean(),
  deliveryPlatforms: z.object({
    rappi: z.string().optional(),
    pedidosya: z.string().optional(),
    didifood: z.string().optional(),
  }),
  deliveryPhoneWhatsapp: z.string(),
  logoUrl: z.string(),
  additionalInfo: z.string().min(10, "Cuéntanos más sobre tu restaurante (mínimo 10 caracteres)"),
  websiteStyle: z.string().min(1, "Selecciona un estilo para tu sitio web"),
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
      socialMedia: initialData.socialMedia.length > 0 ? initialData.socialMedia : [{ platform: "", url: "" }],
      hasDelivery: initialData.hasDelivery,
      deliveryPlatforms: initialData.deliveryPlatforms,
      deliveryPhoneWhatsapp: initialData.deliveryPhoneWhatsapp,
      logoUrl: initialData.logoUrl,
      additionalInfo: initialData.additionalInfo,
      websiteStyle: initialData.websiteStyle,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialMedia"
  });

  const onSubmit = async (data: RequirementsFormData) => {
    // Filter out empty social media entries
    const filteredData = {
      ...data,
      socialMedia: data.socialMedia.filter(sm => sm.platform && sm.url)
    };
    onComplete(filteredData);
  };

  const socialMediaOptions = ["Facebook", "Instagram", "TikTok", "X (Twitter)"];
  
  const websiteStyleOptions = [
    { value: "elegant", label: "Elegante" },
    { value: "modern", label: "Moderno" },
    { value: "rustic", label: "Rústico" },
    { value: "minimalist", label: "Minimalista" },
    { value: "colorful", label: "Colorido" },
    { value: "traditional", label: "Tradicional" },
  ];

  const getAvailablePlatforms = (currentIndex: number) => {
    const usedPlatforms = fields
      .map((field, index) => index !== currentIndex ? form.watch(`socialMedia.${index}.platform`) : null)
      .filter(Boolean);
    return socialMediaOptions.filter(platform => !usedPlatforms.includes(platform));
  };

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
            Para {signupData.restaurantName} • {signupData.subdomain}.mirestaurante.online
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

              {/* Social Media Section */}
              <div className="space-y-4">
                <FormLabel>Redes Sociales</FormLabel>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-end">
                    <FormField
                      control={form.control}
                      name={`socialMedia.${index}.platform`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          {index === 0 && <FormLabel>Plataforma</FormLabel>}
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona plataforma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getAvailablePlatforms(index).map((platform) => (
                                <SelectItem key={platform} value={platform}>
                                  {platform}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`socialMedia.${index}.url`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          {index === 0 && <FormLabel>URL</FormLabel>}
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {fields.length < 4 && getAvailablePlatforms(-1).length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ platform: "", url: "" })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Red Social
                  </Button>
                )}
              </div>

              {/* Delivery Services */}
              <FormField
                control={form.control}
                name="hasDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Tienes servicios de delivery?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value?.toString()}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="delivery-yes" />
                          <FormLabel htmlFor="delivery-yes">Sí</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="delivery-no" />
                          <FormLabel htmlFor="delivery-no">No</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Platforms - conditional */}
              {form.watch("hasDelivery") && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <FormLabel>Plataformas de Delivery (Opcional)</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="deliveryPlatforms.rappi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rappi</FormLabel>
                          <FormControl>
                            <Input placeholder="URL de tu tienda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryPlatforms.pedidosya"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PedidosYa</FormLabel>
                          <FormControl>
                            <Input placeholder="URL de tu tienda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryPlatforms.didifood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Didi Food</FormLabel>
                          <FormControl>
                            <Input placeholder="URL de tu tienda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Phone/WhatsApp Delivery */}
              <FormField
                control={form.control}
                name="deliveryPhoneWhatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Ofreces delivery por teléfono y/o WhatsApp?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="whatsapp" id="delivery-whatsapp" />
                          <FormLabel htmlFor="delivery-whatsapp">Sí, WhatsApp</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="delivery-phone" />
                          <FormLabel htmlFor="delivery-phone">Sí, Teléfono</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id="delivery-both" />
                          <FormLabel htmlFor="delivery-both">Sí, Ambos</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="delivery-none" />
                          <FormLabel htmlFor="delivery-none">No</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Logo Upload */}
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo del Restaurante</FormLabel>
                    <FormControl>
                      <ImageUpload
                        label=""
                        value={field.value}
                        onChange={field.onChange}
                        clientId="temp"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website Style */}
              <FormField
                control={form.control}
                name="websiteStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estilo del Sitio Web</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estilo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {websiteStyleOptions.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Info */}
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuéntanos un poco más sobre tu restaurante</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      (Mientras más información nos des, mejor podremos crear el contenido para tu sitio. Si tienes códigos de colores exactos y fuentes que usa tu marca, añádelos aquí, de lo contrario solo lista los colores que te gustan)
                    </p>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe tu restaurante, tipo de comida, ambiente, historia, colores preferidos, fuentes específicas, etc..."
                        className="min-h-[120px]"
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