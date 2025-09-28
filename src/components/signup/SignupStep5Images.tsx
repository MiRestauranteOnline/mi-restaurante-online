import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, X, Images, Camera, Info } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export interface CarouselImage {
  imageUrl: string;
  altText?: string;
}

export interface ImagesData {
  carousel_enabled: boolean;
  carousel_images: CarouselImage[];
  custom_images_enabled: boolean;
  custom_images: CarouselImage[];
}

const carouselImageSchema = z.object({
  imageUrl: z.string().min(1, "La imagen es requerida"),
  altText: z.string().optional(),
});

const imagesSchema = z.object({
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
}

export const SignupStep5Images = ({ onComplete, onBack, initialData }: SignupStep5ImagesProps) => {
  const form = useForm<ImagesFormData>({
    resolver: zodResolver(imagesSchema),
    defaultValues: {
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

  const onSubmit = (data: ImagesFormData) => {
    onComplete({
      carousel_enabled: data.carousel_enabled,
      carousel_images: data.carousel_enabled ? (data.carousel_images || []) : [],
      custom_images_enabled: data.custom_images_enabled,
      custom_images: data.custom_images_enabled ? (data.custom_images || []) : [],
    });
  };

  const handleSkip = () => {
    onComplete({
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
                                  clientId="signup"
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

          {/* Skip Option */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 text-sm">⚠️</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">¿Omitir imágenes?</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Si omites este paso, tu sitio se publicará con imágenes de stock profesionales. 
                    Puedes personalizarlas fácilmente después a través de tu panel de control.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSkip}
                    className="mt-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    Omitir por ahora
                  </Button>
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
            <Button type="submit">
              Finalizar Registro
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};