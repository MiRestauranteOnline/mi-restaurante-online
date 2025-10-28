import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Utensils, Plus, X } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { MenuUpload } from "@/components/MenuUpload";
import type { SignupData, WebsiteRequirements, SocialMedia } from "@/pages/Signup";

const requirementsSchema = z.object({
  businessType: z.string().min(1, "Selecciona el tipo de negocio"),
  targetAudience: z.string().min(5, "Describe tu público objetivo"),
  downloadableMenuUrl: z.string().optional(),
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
  faviconUrl: z.string().optional(),
  additionalInfo: z.string().min(10, "Cuéntanos más sobre tu restaurante (mínimo 10 caracteres)"),
  websiteStyle: z.string().min(1, "Selecciona un estilo para tu sitio web"),
  theme: z.string().min(1, "Selecciona un tema"),
  primary_color: z.string().min(1, "Selecciona un color primario"),
  title_font: z.string().min(1, "Selecciona una fuente para títulos"),
  title_font_weight: z.string().min(1, "Selecciona un peso de fuente"),
  body_font: z.string().min(1, "Selecciona una fuente para el cuerpo"),
});

type RequirementsFormData = z.infer<typeof requirementsSchema>;

interface SignupStep2Props {
  onComplete: (requirements: WebsiteRequirements) => void;
  onBack: () => void;
  signupData: SignupData;
  initialData: WebsiteRequirements;
}

// Template ID mapping
const templateMapping: Record<string, string> = {
  "modern": "df1d7326-452b-44ab-9821-cbc71941bf1d",
  "rustic": "4156da13-d507-4099-a99d-4cee57c2cc22",
  "minimalist": "fe77ed70-022d-4648-a559-da2baf077aec",
};

// Font options
const titleFonts = [
  "Cormorant Garamond", "Playfair Display", "Merriweather", "Lora", "Crimson Text",
  "Bitter", "PT Serif", "Libre Baskerville", "Source Serif Pro", "Abril Fatface",
  "Montserrat", "Oswald", "Roboto", "Open Sans", "Poppins", "Nunito", "Raleway",
  "Inter", "Lato", "Dancing Script", "Great Vibes", "Lobster", "Pacifico", "Satisfy"
];

const bodyFonts = [
  "Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Nunito", "Source Sans Pro",
  "Raleway", "PT Sans", "Fira Sans", "Montserrat", "Work Sans", "Noto Sans", "Rubik",
  "DM Sans", "Merriweather", "Lora", "Crimson Text", "PT Serif", "Libre Baskerville",
  "Source Serif Pro", "Cormorant Garamond", "Playfair Display"
];

const fontWeights = [
  { value: "100", label: "100 - Thin" },
  { value: "200", label: "200 - Extra Light" },
  { value: "300", label: "300 - Light" },
  { value: "400", label: "400 - Normal" },
  { value: "500", label: "500 - Medium" },
  { value: "600", label: "600 - Semi Bold" },
  { value: "700", label: "700 - Bold" },
  { value: "800", label: "800 - Extra Bold" },
  { value: "900", label: "900 - Black" },
];

export const SignupStep2 = ({ onComplete, onBack, signupData, initialData }: SignupStep2Props) => {
  const form = useForm<RequirementsFormData>({
    resolver: zodResolver(requirementsSchema),
    defaultValues: {
      businessType: initialData.businessType,
      targetAudience: initialData.targetAudience,
      downloadableMenuUrl: initialData.downloadableMenuUrl || "",
      socialMedia: initialData.socialMedia.length > 0 ? initialData.socialMedia : [{ platform: "", url: "" }],
      hasDelivery: initialData.hasDelivery,
      deliveryPlatforms: initialData.deliveryPlatforms,
      deliveryPhoneWhatsapp: initialData.deliveryPhoneWhatsapp,
      logoUrl: initialData.logoUrl,
      faviconUrl: initialData.faviconUrl || "",
      additionalInfo: initialData.additionalInfo,
      websiteStyle: initialData.websiteStyle,
      theme: initialData.theme || "dark",
      primary_color: initialData.primary_color || "#FFD700",
      title_font: initialData.title_font || "Cormorant Garamond",
      title_font_weight: initialData.title_font_weight || "400",
      body_font: initialData.body_font || "Inter",
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
      socialMedia: data.socialMedia.filter(sm => sm.platform && sm.url),
      template_id: templateMapping[data.websiteStyle] || undefined,
    };
    
    onComplete(filteredData);
  };

  const socialMediaOptions = ["Facebook", "Instagram", "TikTok", "X (Twitter)", "YouTube", "LinkedIn"];
  
  const websiteStyleOptions = [
    { value: "modern", label: "Moderno" },
    { value: "rustic", label: "Rústico" },
    { value: "minimalist", label: "Minimalista" },
  ];

  const getAvailablePlatforms = (currentIndex: number) => {
    const usedPlatforms = fields
      .map((field, index) => index !== currentIndex ? form.watch(`socialMedia.${index}.platform`) : null)
      .filter(Boolean);
    return socialMediaOptions.filter(platform => !usedPlatforms.includes(platform));
  };

  // Get current font values for preview
  const titleFont = form.watch("title_font");
  const titleFontWeight = form.watch("title_font_weight");
  const bodyFont = form.watch("body_font");

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
                    <FormDescription>
                      Describe el tipo de clientes que visitan tu restaurante (familias, jóvenes, turistas, etc.)
                    </FormDescription>
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
                name="downloadableMenuUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MenuUpload
                        label="Menú Descargable (Opcional)"
                        description="Sube tu menú en PDF o proporciona un enlace directo"
                        value={field.value || ""}
                        onChange={field.onChange}
                        clientId={signupData.subdomain}
                        maxSizeMB={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Social Media Section */}
              <div className="space-y-4">
                <div>
                  <FormLabel>Redes Sociales</FormLabel>
                  <FormDescription>
                    Conecta tus redes sociales para que tus clientes puedan seguirte
                  </FormDescription>
                </div>
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
                     {form.watch(`socialMedia.${index}.platform`) && (
                       <FormField
                         control={form.control}
                         name={`socialMedia.${index}.url`}
                         render={({ field }) => {
                           const platform = form.watch(`socialMedia.${index}.platform`);
                           let placeholder = "https://...";
                           let example = "";
                           
                           if (platform === "Facebook") {
                             placeholder = "https://facebook.com/yourpage";
                             example = "https://facebook.com/yourpage";
                           } else if (platform === "Instagram") {
                             placeholder = "https://instagram.com/yourusername";
                             example = "https://instagram.com/yourusername";
                           } else if (platform === "TikTok") {
                             placeholder = "https://tiktok.com/@yourusername";
                             example = "https://tiktok.com/@yourusername";
                            } else if (platform === "X (Twitter)") {
                              placeholder = "https://x.com/yourusername";
                              example = "https://x.com/yourusername";
                            } else if (platform === "YouTube") {
                              placeholder = "https://youtube.com/@yourchannel";
                              example = "https://youtube.com/@yourchannel";
                            } else if (platform === "LinkedIn") {
                              placeholder = "https://linkedin.com/company/yourcompany";
                              example = "https://linkedin.com/company/yourcompany";
                            }

                           // Validate URL for the selected platform
                           const validatePlatformUrl = (url: string, platformType: string) => {
                             if (!url || !platformType) return true;
                             
                             const cleanUrl = url.toLowerCase().trim();
                             
                             switch (platformType) {
                               case "Facebook":
                                 return cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.com');
                               case "Instagram":
                                 return cleanUrl.includes('instagram.com');
                               case "TikTok":
                                 return cleanUrl.includes('tiktok.com');
                                case "X (Twitter)":
                                  return cleanUrl.includes('x.com') || cleanUrl.includes('twitter.com');
                                case "YouTube":
                                  return cleanUrl.includes('youtube.com');
                                case "LinkedIn":
                                  return cleanUrl.includes('linkedin.com');
                                default:
                                  return true;
                             }
                           };

                           const isValidUrl = validatePlatformUrl(field.value, platform);
                           
                           return (
                             <FormItem className="flex-1">
                               {index === 0 && <FormLabel>URL</FormLabel>}
                               <FormControl>
                                 <Input 
                                   placeholder={placeholder} 
                                   {...field}
                                   className={!isValidUrl && field.value ? "border-destructive" : ""}
                                   onChange={(e) => {
                                     let value = e.target.value.trim();
                                     
                                     // Auto-format username to full URL if it doesn't start with http
                                     if (platform && value && !value.startsWith('http')) {
                                       if (platform === "Facebook") {
                                         value = `https://facebook.com/${value.replace('@', '').replace(/^\/+/, '')}`;
                                       } else if (platform === "Instagram") {
                                         value = `https://instagram.com/${value.replace('@', '').replace(/^\/+/, '')}`;
                                       } else if (platform === "TikTok") {
                                         value = `https://tiktok.com/@${value.replace('@', '').replace(/^\/+/, '')}`;
                                        } else if (platform === "X (Twitter)") {
                                          value = `https://x.com/${value.replace('@', '').replace(/^\/+/, '')}`;
                                        } else if (platform === "YouTube") {
                                          value = `https://youtube.com/@${value.replace('@', '').replace(/^\/+/, '')}`;
                                        } else if (platform === "LinkedIn") {
                                          value = `https://linkedin.com/company/${value.replace(/^\/+/, '')}`;
                                        }
                                      }
                                     
                                     field.onChange(value);
                                   }}
                                 />
                               </FormControl>
                                {!isValidUrl && field.value && (
                                  <p className="text-sm text-destructive mt-1">
                                    Por favor ingresa una URL válida de {platform}. Ejemplo: {example}
                                  </p>
                                )}
                               <FormMessage />
                             </FormItem>
                           );
                         }}
                       />
                     )}
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
                {fields.length < 6 && getAvailablePlatforms(-1).length > 0 && (
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
                            <Input 
                              placeholder="URL completa de tu tienda en Rappi" 
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.trim();
                                field.onChange(value);
                              }}
                            />
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
                            <Input 
                              placeholder="URL completa de tu tienda en PedidosYa" 
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.trim();
                                field.onChange(value);
                              }}
                            />
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
                          <FormLabel>DiDi Food</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="URL completa de tu tienda en DiDi Food" 
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.trim();
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {form.watch("hasDelivery") && (
                <FormField
                  control={form.control}
                  name="deliveryPhoneWhatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿Aceptas pedidos de delivery por teléfono o WhatsApp?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-wrap gap-4"
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
              )}

              {/* Logo Upload */}
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo del Restaurante</FormLabel>
                    <FormDescription>
                      Sube el logo de tu restaurante en formato PNG, JPG o SVG. Se recomienda usar un logo en alta resolución con fondo transparente.
                    </FormDescription>
                    <FormControl>
                      <ImageUpload
                        label=""
                        value={field.value}
                        onChange={field.onChange}
                        clientId="temp"
                        context="logo"
                        description="restaurant logo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Favicon Upload */}
              <FormField
                control={form.control}
                name="faviconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favicon (Opcional)</FormLabel>
                    <FormDescription>
                      El favicon es el pequeño ícono que aparece en la pestaña del navegador. Se recomienda usar una imagen cuadrada simple de 512x512px o mayor.
                    </FormDescription>
                    <FormControl>
                      <ImageUpload
                        label=""
                        value={field.value || ""}
                        onChange={field.onChange}
                        clientId="temp"
                        context="favicon"
                        description="website favicon icon"
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
                    <FormDescription>
                      Elige el estilo visual que mejor representa tu restaurante
                    </FormDescription>
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

              {/* Theme */}
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema</FormLabel>
                    <FormDescription>
                      Elige si prefieres un diseño con colores claros u oscuros
                    </FormDescription>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tema" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bright">Claro</SelectItem>
                        <SelectItem value="dark">Oscuro</SelectItem>
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
                    <FormDescription>
                      Mientras más información nos des, mejor podremos crear el contenido para tu sitio
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe tu restaurante, tipo de comida, ambiente, historia, etc..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand Colors and Fonts */}
              <div className="space-y-6 p-6 border rounded-lg bg-muted/50">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Identidad Visual</h3>
                  <p className="text-sm text-muted-foreground">
                    Personaliza los colores y tipografías de tu sitio web
                  </p>
                </div>

                {/* Primary Color */}
                <FormField
                  control={form.control}
                  name="primary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color Primario</FormLabel>
                      <FormDescription>
                        Color principal que se usará en botones, enlaces y elementos destacados
                      </FormDescription>
                      <FormControl>
                        <div className="flex gap-2 items-center">
                          <Input 
                            type="color"
                            className="w-20 h-10 cursor-pointer"
                            {...field}
                          />
                          <Input 
                            type="text"
                            placeholder="#FFD700"
                            value={field.value}
                            onChange={field.onChange}
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title Font */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title_font"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuente de Títulos</FormLabel>
                        <FormDescription>
                          Tipografía para todos los títulos de tu sitio
                        </FormDescription>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una fuente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {titleFonts.map((font) => (
                              <SelectItem key={font} value={font}>
                                {font}
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
                    name="title_font_weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso de Fuente de Títulos</FormLabel>
                        <FormDescription>
                          Grosor de la fuente para los títulos
                        </FormDescription>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un peso" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fontWeights.map((weight) => (
                              <SelectItem key={weight.value} value={weight.value}>
                                {weight.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Title Preview */}
                <div className="p-4 border rounded-lg bg-background">
                  <p className="text-xs text-muted-foreground mb-2">Vista previa de títulos:</p>
                  <h2 
                    style={{ 
                      fontFamily: `"${titleFont}", serif`,
                      fontWeight: titleFontWeight 
                    }}
                    className="text-2xl"
                  >
                    Así se ven tus títulos
                  </h2>
                  <link 
                    rel="stylesheet" 
                    href={`https://fonts.googleapis.com/css2?family=${titleFont.replace(/ /g, '+')}:wght@${titleFontWeight}&display=swap`}
                  />
                </div>

                {/* Body Font */}
                <FormField
                  control={form.control}
                  name="body_font"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuente del Cuerpo</FormLabel>
                      <FormDescription>
                        Tipografía para el texto del cuerpo de tu sitio
                      </FormDescription>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una fuente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {bodyFonts.map((font) => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Body Preview */}
                <div className="p-4 border rounded-lg bg-background">
                  <p className="text-xs text-muted-foreground mb-2">Vista previa de texto del cuerpo:</p>
                  <p 
                    style={{ 
                      fontFamily: `"${bodyFont}", sans-serif`
                    }}
                    className="text-base"
                  >
                    Así se ve el texto del cuerpo de tu sitio web. Este es el texto que tus visitantes leerán en descripciones, párrafos y contenido general.
                  </p>
                  <link 
                    rel="stylesheet" 
                    href={`https://fonts.googleapis.com/css2?family=${bodyFont.replace(/ /g, '+')}:wght@400;600&display=swap`}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Continuar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
