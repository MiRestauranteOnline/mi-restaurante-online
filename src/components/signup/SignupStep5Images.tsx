import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, X, Images, Camera, Info } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CarouselImage {
  imageUrl: string;
  altText?: string;
}

export interface ImagesData {
  image_preference: 'custom_only' | 'custom_plus_ai' | 'ai_only';
  carousel_enabled: boolean;
  carousel_images: CarouselImage[];
  custom_images_enabled: boolean;
  custom_images: CarouselImage[];
  ai_image_style?: string;
  ai_color_palette?: string;
  ai_image_mood?: string;
  detected_image_style?: any;
}

const carouselImageSchema = z.object({
  imageUrl: z.string().optional(),
  altText: z.string().optional(),
});

const imagesSchema = z.object({
  image_preference: z.enum(['custom_only', 'custom_plus_ai', 'ai_only']),
  carousel_enabled: z.boolean(),
  carousel_images: z.array(carouselImageSchema).optional(),
  custom_images_enabled: z.boolean(),
  custom_images: z.array(carouselImageSchema).optional(),
  ai_image_style: z.string().optional(),
  ai_color_palette: z.string().optional(),
  ai_image_mood: z.string().optional(),
});

type ImagesFormData = z.infer<typeof imagesSchema>;

interface SignupStep5ImagesProps {
  onComplete: (data: ImagesData) => void;
  onBack: () => void;
  initialData?: ImagesData;
  isProcessingFinalStep?: boolean;
}

export const SignupStep5Images = ({ onComplete, onBack, initialData, isProcessingFinalStep = false }: SignupStep5ImagesProps) => {
  const [detectedStyle, setDetectedStyle] = useState<any>(null);
  const [isAnalyzingStyle, setIsAnalyzingStyle] = useState(false);
  
  const form = useForm<ImagesFormData>({
    resolver: zodResolver(imagesSchema),
    defaultValues: {
      image_preference: initialData?.image_preference ?? 'ai_only',
      carousel_enabled: initialData?.carousel_enabled ?? false,
      carousel_images: initialData?.carousel_images?.length ? initialData.carousel_images : [{ imageUrl: "", altText: "" }],
      custom_images_enabled: initialData?.custom_images_enabled ?? false,
      custom_images: initialData?.custom_images?.length ? initialData.custom_images : [{ imageUrl: "", altText: "" }],
      ai_image_style: initialData?.ai_image_style ?? 'realistic_photo',
      ai_color_palette: initialData?.ai_color_palette ?? 'warm_tones',
      ai_image_mood: initialData?.ai_image_mood ?? 'cozy_intimate',
    },
  });

  const { fields: carouselFields, append: appendCarousel, remove: removeCarousel } = useFieldArray({
    control: form.control,
    name: "carousel_images"
  });

  const { fields: customFields, append: appendCustom, remove: removeCustom } = useFieldArray({
    control: form.control,
    name: "custom_images"
  });

  const imagePreference = form.watch("image_preference");
  const carouselEnabled = form.watch("carousel_enabled");
  const customImagesEnabled = form.watch("custom_images_enabled");
  const customImages = form.watch("custom_images");

  const [processingCount, setProcessingCount] = useState(0);
  const handleProcessingChange = (processing: boolean) => {
    setProcessingCount((c) => (processing ? c + 1 : Math.max(0, c - 1)));
  };
  const isProcessingImages = processingCount > 0;

  // Calculate required image count (7 slots for content)
  const REQUIRED_IMAGE_COUNT = 7;
  
  // Auto-analyze style when 2+ custom images are uploaded
  useEffect(() => {
    const analyzeStyle = async () => {
      if ((imagePreference === 'custom_plus_ai') && customImages && customImages.length >= 2) {
        const validUrls = customImages
          .filter(img => img.imageUrl && img.imageUrl.trim() !== '')
          .map(img => img.imageUrl)
          .slice(0, 2);
        
        if (validUrls.length >= 2 && !detectedStyle) {
          setIsAnalyzingStyle(true);
          try {
            const { data, error } = await supabase.functions.invoke('analyze-image-style', {
              body: { imageUrls: validUrls }
            });
            
            if (!error && data) {
              setDetectedStyle(data);
              form.setValue('ai_image_style', data.style);
              form.setValue('ai_color_palette', data.colorPalette);
              form.setValue('ai_image_mood', data.mood);
            }
          } catch (error) {
            console.error('Error analyzing image style:', error);
          } finally {
            setIsAnalyzingStyle(false);
          }
        }
      }
    };
    
    analyzeStyle();
  }, [imagePreference, customImages]);
  const onSubmit = (data: ImagesFormData) => {
    // Validate custom_only mode
    if (data.image_preference === 'custom_only') {
      const validCount = (data.custom_images?.filter(img => img.imageUrl && img.imageUrl.trim() !== '') || []).length;
      if (validCount !== REQUIRED_IMAGE_COUNT) {
        form.setError('custom_images', {
          message: `Debes subir exactamente ${REQUIRED_IMAGE_COUNT} imágenes para el modo "Solo Imágenes Personalizadas"`
        });
        return;
      }
    }

    // Validate custom_plus_ai mode
    if (data.image_preference === 'custom_plus_ai') {
      const validCount = (data.custom_images?.filter(img => img.imageUrl && img.imageUrl.trim() !== '') || []).length;
      if (validCount < 1) {
        form.setError('custom_images', {
          message: 'Debes subir al menos 1 imagen para el modo "Imágenes Personalizadas + IA"'
        });
        return;
      }
    }

    // Filter out empty images and ensure valid imageUrl
    const validCarouselImages = (data.carousel_images?.filter(img => img.imageUrl && img.imageUrl.trim() !== '') || [])
      .map(img => ({ imageUrl: img.imageUrl!, altText: img.altText }));
    const validCustomImages = (data.custom_images?.filter(img => img.imageUrl && img.imageUrl.trim() !== '') || [])
      .map(img => ({ imageUrl: img.imageUrl!, altText: img.altText }));
    
    onComplete({
      image_preference: data.image_preference,
      carousel_enabled: data.carousel_enabled,
      carousel_images: data.carousel_enabled ? validCarouselImages : [],
      custom_images_enabled: data.custom_images_enabled,
      custom_images: data.custom_images_enabled ? validCustomImages : [],
      ai_image_style: data.ai_image_style,
      ai_color_palette: data.ai_color_palette,
      ai_image_mood: data.ai_image_mood,
      detected_image_style: detectedStyle,
    });
  };

  const handleSkip = () => {
    onComplete({
      image_preference: 'ai_only',
      carousel_enabled: false,
      carousel_images: [],
      custom_images_enabled: false,
      custom_images: [],
      ai_image_style: 'realistic_photo',
      ai_color_palette: 'warm_tones',
      ai_image_mood: 'cozy_intimate',
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Images className="h-6 w-6" />
          <h2 className="text-2xl font-bold text-foreground">Imágenes del Restaurante</h2>
        </div>
        <p className="text-muted-foreground">
          Personaliza tu sitio web con imágenes de tu restaurante para crear una experiencia más auténtica.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Preference Section */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Images className="h-5 w-5" />
                Preferencia de Imágenes
              </CardTitle>
              <CardDescription>
                Elige qué tipo de imágenes quieres usar en tu sitio web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="image_preference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Qué tipo de imágenes prefieres?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una opción" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="custom_only">
                          Solo Imágenes Personalizadas (exactamente {REQUIRED_IMAGE_COUNT} imágenes)
                        </SelectItem>
                        <SelectItem value="custom_plus_ai">
                          Imágenes Personalizadas + IA (mínimo 1, máximo {REQUIRED_IMAGE_COUNT})
                        </SelectItem>
                        <SelectItem value="ai_only">
                          Solo Imágenes IA
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground mt-2">
                      {field.value === 'custom_only' && `Debes subir exactamente ${REQUIRED_IMAGE_COUNT} imágenes de tu restaurante`}
                      {field.value === 'custom_plus_ai' && `Sube mínimo 1 imagen (máx ${REQUIRED_IMAGE_COUNT}). La IA analizará tu estilo y generará las restantes`}
                      {field.value === 'ai_only' && "La IA generará todas las imágenes según el estilo que selecciones"}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AI Style Options - only show for ai_only */}
              {imagePreference === 'ai_only' && (
                <div className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium text-sm">Personaliza el estilo de las imágenes IA</h4>
                  
                  <FormField
                    control={form.control}
                    name="ai_image_style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estilo de Imagen</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="realistic_photo">Fotografía Realista</SelectItem>
                            <SelectItem value="elegant_fine_dining">Elegante Fine Dining</SelectItem>
                            <SelectItem value="casual_cozy">Casual y Acogedor</SelectItem>
                            <SelectItem value="modern_minimalist">Moderno Minimalista</SelectItem>
                            <SelectItem value="rustic_traditional">Rústico Tradicional</SelectItem>
                            <SelectItem value="vibrant_colorful">Vibrante y Colorido</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ai_color_palette"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paleta de Colores</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="warm_tones">Tonos Cálidos</SelectItem>
                            <SelectItem value="cool_tones">Tonos Fríos</SelectItem>
                            <SelectItem value="neutral_earth">Neutros y Tierra</SelectItem>
                            <SelectItem value="vibrant_saturated">Vibrantes Saturados</SelectItem>
                            <SelectItem value="muted_pastel">Pastel Suaves</SelectItem>
                            <SelectItem value="high_contrast">Alto Contraste</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ai_image_mood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Atmósfera</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cozy_intimate">Acogedor e Íntimo</SelectItem>
                            <SelectItem value="elegant_sophisticated">Elegante y Sofisticado</SelectItem>
                            <SelectItem value="bright_energetic">Brillante y Energético</SelectItem>
                            <SelectItem value="calm_peaceful">Tranquilo y Pacífico</SelectItem>
                            <SelectItem value="rustic_authentic">Rústico y Auténtico</SelectItem>
                            <SelectItem value="modern_sleek">Moderno y Elegante</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Show detected style for custom_plus_ai */}
              {imagePreference === 'custom_plus_ai' && detectedStyle && (
                <div className="mt-4 p-4 border rounded-lg bg-green-50">
                  <p className="text-sm font-medium text-green-800">✓ Estilo detectado de tus imágenes</p>
                  <p className="text-xs text-green-700 mt-1">
                    Las imágenes generadas por IA seguirán el mismo estilo visual de tus fotos
                  </p>
                </div>
              )}

              {imagePreference === 'custom_plus_ai' && isAnalyzingStyle && (
                <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-800">🔍 Analizando el estilo de tus imágenes...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Images Section - only show for custom_only or custom_plus_ai */}
          {(imagePreference === 'custom_only' || imagePreference === 'custom_plus_ai') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Imágenes Personalizadas
                </CardTitle>
                <CardDescription>
                  {imagePreference === 'custom_only' 
                    ? `Sube exactamente ${REQUIRED_IMAGE_COUNT} imágenes para tu sitio web`
                    : `Sube entre 1 y ${REQUIRED_IMAGE_COUNT} imágenes. La IA generará el resto siguiendo tu estilo`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className={`border rounded-lg p-4 ${imagePreference === 'custom_only' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex gap-2">
                      <Info className={`h-5 w-5 flex-shrink-0 mt-0.5 ${imagePreference === 'custom_only' ? 'text-blue-600' : 'text-green-600'}`} />
                      <div className={`text-sm ${imagePreference === 'custom_only' ? 'text-blue-700' : 'text-green-700'}`}>
                        {imagePreference === 'custom_only' ? (
                          <>
                            <p className="font-medium">Imágenes requeridas: {REQUIRED_IMAGE_COUNT}</p>
                            <p className="mt-1">Sube imágenes de: Hero principal, sección About, especialidades (3 fotos), equipo/chef, y ambiente del local</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">La IA analizará tus primeras 2 imágenes</p>
                            <p className="mt-1">Una vez subas 2 imágenes, detectaremos automáticamente el estilo, colores y atmósfera para generar el resto de imágenes consistentes con las tuyas</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="custom_images_enabled"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <input type="hidden" {...field} value="true" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {customFields.map((field, index) => (
                    <Card key={field.id} className="p-4 border-dashed">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Imagen personalizada #{index + 1}</h4>
                        {(imagePreference === 'custom_plus_ai' || customFields.length > 1) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCustom(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`custom_images.${index}.imageUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Imagen</FormLabel>
                              <FormControl>
                                <ImageUpload
                                  label=""
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  clientId="signup"
                                  context="signup_custom_upload"
                                  description="custom restaurant image for website personalization"
                                  storeInDatabase={false}
                                  onProcessingChange={handleProcessingChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`custom_images.${index}.altText`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descripción de la imagen (opcional)</FormLabel>
                              <FormControl>
                                <input
                                  type="text"
                                  placeholder="Ej: Equipo de cocina, ambiente nocturno..."
                                  className="w-full p-2 border rounded-md"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                  
                  {customFields.length < REQUIRED_IMAGE_COUNT && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendCustom({ imageUrl: "", altText: "" })}
                      className="w-full"
                      disabled={imagePreference === 'custom_only' && customFields.length >= REQUIRED_IMAGE_COUNT}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Imagen ({customFields.filter(f => form.getValues(`custom_images.${customFields.indexOf(f)}.imageUrl`)).length}/{imagePreference === 'custom_only' ? REQUIRED_IMAGE_COUNT : `1-${REQUIRED_IMAGE_COUNT}`})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Carousel Section */}
          {imagePreference !== 'ai_only' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Images className="h-5 w-5" />
                  Carousel de Imágenes
                </CardTitle>
                <CardDescription>
                  Un carousel muestra múltiples imágenes de tu restaurante en la página principal, rotando automáticamente para destacar diferentes aspectos de tu negocio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="carousel_enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mostrar carousel de imágenes</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Activa esta opción para mostrar un carousel con imágenes de tu restaurante
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {carouselEnabled && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-2">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-medium">¿Qué son las imágenes del carousel?</p>
                          <p className="mt-1">Las imágenes del carousel aparecen en la página principal de tu sitio web, mostrando fotos atractivas de tu restaurante, platos, ambiente o eventos especiales. Se recomienda usar 3-5 imágenes de alta calidad.</p>
                        </div>
                      </div>
                    </div>

                    {carouselFields.map((field, index) => (
                      <Card key={field.id} className="p-4 border-dashed">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Imagen #{index + 1}</h4>
                          {carouselFields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCarousel(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`carousel_images.${index}.imageUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Imagen</FormLabel>
                                <FormControl>
                                  <ImageUpload
                                    label=""
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    clientId="signup"
                                    context="carousel"
                                    description="carousel showcase image for restaurant"
                                    onProcessingChange={handleProcessingChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`carousel_images.${index}.altText`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descripción de la imagen (opcional)</FormLabel>
                                <FormControl>
                                  <input
                                    type="text"
                                    placeholder="Ej: Interior del restaurante, plato especial..."
                                    className="w-full p-2 border rounded-md"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Card>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendCarousel({ imageUrl: "", altText: "" })}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Imagen al Carousel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Information Note */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Puedes actualizar las imágenes en cualquier momento</p>
                  <p className="mt-1">
                    No te preocupes si no tienes las imágenes perfectas ahora. Puedes subir, cambiar o eliminar imágenes fácilmente desde tu panel de control después de que tu sitio esté listo. 
                    Tu sitio se publicará con imágenes profesionales de stock mientras tanto.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button type="submit" disabled={isProcessingImages || isProcessingFinalStep}>
              {isProcessingFinalStep ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Finalizando registro...
                </div>
              ) : isProcessingImages ? 'Procesando imágenes...' : 'Finalizar Registro'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};