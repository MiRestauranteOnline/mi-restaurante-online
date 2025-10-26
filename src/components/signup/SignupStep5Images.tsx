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
import { useState } from "react";

export interface CarouselImage {
  imageUrl: string;
  altText?: string;
}

export interface ImagesData {
  image_preference: 'stock' | 'ai' | 'own';
  carousel_enabled: boolean;
  carousel_images: CarouselImage[];
  custom_images_enabled: boolean;
  custom_images: CarouselImage[];
}

const carouselImageSchema = z.object({
  imageUrl: z.string().optional(),
  altText: z.string().optional(),
});

const imagesSchema = z.object({
  image_preference: z.enum(['stock', 'ai', 'own']),
  carousel_enabled: z.boolean(),
  carousel_images: z.array(carouselImageSchema).optional(),
  custom_images_enabled: z.boolean(),
  custom_images: z.array(carouselImageSchema).optional(),
});

type ImagesFormData = z.infer<typeof imagesSchema>;

interface SignupStep5ImagesProps {
  onComplete: (data: ImagesData) => void;
  onBack: () => void;
  initialData?: ImagesData;
  isProcessingFinalStep?: boolean;
}

export const SignupStep5Images = ({ onComplete, onBack, initialData, isProcessingFinalStep = false }: SignupStep5ImagesProps) => {
  const form = useForm<ImagesFormData>({
    resolver: zodResolver(imagesSchema),
    defaultValues: {
      image_preference: initialData?.image_preference ?? 'stock',
      carousel_enabled: initialData?.carousel_enabled ?? false,
      carousel_images: initialData?.carousel_images?.length ? initialData.carousel_images : [{ imageUrl: "", altText: "" }],
      custom_images_enabled: initialData?.custom_images_enabled ?? false,
      custom_images: initialData?.custom_images?.length ? initialData.custom_images : [{ imageUrl: "", altText: "" }],
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

  const carouselEnabled = form.watch("carousel_enabled");
  const customImagesEnabled = form.watch("custom_images_enabled");

  const [processingCount, setProcessingCount] = useState(0);
  const handleProcessingChange = (processing: boolean) => {
    setProcessingCount((c) => (processing ? c + 1 : Math.max(0, c - 1)));
  };
  const isProcessingImages = processingCount > 0;
  const onSubmit = (data: ImagesFormData) => {
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
    });
  };

  const handleSkip = () => {
    onComplete({
      image_preference: 'stock',
      carousel_enabled: false,
      carousel_images: [],
      custom_images_enabled: false,
      custom_images: [],
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
                        <SelectItem value="stock">
                          Imágenes de stock profesionales
                        </SelectItem>
                        <SelectItem value="ai">
                          Imágenes generadas por IA personalizadas
                        </SelectItem>
                        <SelectItem value="own">
                          Usar mis propias imágenes
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground mt-2">
                      {field.value === 'stock' && "Usaremos imágenes profesionales de stock relacionadas con tu restaurante"}
                      {field.value === 'ai' && "Generaremos imágenes únicas con IA basadas en tu restaurante"}
                      {field.value === 'own' && "Sube tus propias imágenes en las secciones de abajo"}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Carousel Section */}
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

          {/* Custom Images Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Imágenes Personalizadas
              </CardTitle>
              <CardDescription>
                Sube tus propias imágenes del restaurante para personalizar completamente el diseño del sitio web.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="custom_images_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Subir mis propias imágenes</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Activa esta opción para subir imágenes específicas de tu restaurante
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

              {customImagesEnabled && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex gap-2">
                      <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-700">
                        <p className="font-medium">¿Para qué sirven las imágenes personalizadas?</p>
                        <p className="mt-1">
                          Estas imágenes se usan para personalizar diferentes secciones de tu sitio web como fondos, secciones "Acerca de", galería de platos, etc. Ayudan a que tu sitio refleje mejor la identidad y ambiente real de tu restaurante.
                        </p>
                        <p className="mt-2 font-medium">Si no las subes:</p>
                        <p className="mt-1">Usaremos imágenes de stock o generadas por IA que puedes cambiar más tarde en tu panel de control. ¡No te preocupes, tu sitio se verá profesional de todas formas!</p>
                      </div>
                    </div>
                  </div>

                  {customFields.map((field, index) => (
                    <Card key={field.id} className="p-4 border-dashed">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Imagen personalizada #{index + 1}</h4>
                        {customFields.length > 1 && (
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
                                  clientId="temp-signup-client"
                                  context="custom_upload"
                                  description="custom restaurant image for website personalization"
                                  storeInDatabase={true}
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
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendCustom({ imageUrl: "", altText: "" })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Imagen Personalizada
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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