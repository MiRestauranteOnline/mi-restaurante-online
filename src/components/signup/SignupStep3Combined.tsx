import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, X, Utensils, FolderPlus, Star, Users, CalendarIcon } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface MenuCategory {
  name: string;
}

export interface MenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl?: string;
}

export interface Review {
  reviewerName: string;
  reviewText: string;
  starRating: number;
  reviewDate?: Date;
}

export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  imageUrl?: string;
}

export interface CombinedData {
  categories: MenuCategory[];
  items: MenuItem[];
  reviews: Review[];
  teamMembers: TeamMember[];
}

const menuCategorySchema = z.object({
  name: z.string().min(1, "El nombre de la categoría es requerido"),
});

const menuItemSchema = z.object({
  name: z.string().min(1, "El nombre del plato es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  price: z.string().min(1, "El precio es requerido"),
  category: z.string().min(1, "Selecciona una categoría"),
  imageUrl: z.string().optional(),
});

const reviewSchema = z.object({
  reviewerName: z.string().min(1, "El nombre del cliente es requerido"),
  reviewText: z.string().min(10, "La reseña debe tener al menos 10 caracteres"),
  starRating: z.number().min(1).max(5),
  reviewDate: z.date().optional(),
});

const teamMemberSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  title: z.string().min(1, "El cargo es requerido"),
  bio: z.string().min(10, "La biografía debe tener al menos 10 caracteres"),
  imageUrl: z.string().optional(),
});

const combinedSchema = z.object({
  categories: z.array(menuCategorySchema).optional(),
  items: z.array(menuItemSchema).optional(),
  reviews: z.array(reviewSchema).optional(),
  teamMembers: z.array(teamMemberSchema).optional(),
});

type CombinedFormData = z.infer<typeof combinedSchema>;

interface SignupStep3CombinedProps {
  onComplete: (data: CombinedData) => void;
  onBack: () => void;
  onSkip: () => void;
  initialData?: CombinedData;
}

export const SignupStep3Combined = ({ onComplete, onBack, onSkip, initialData }: SignupStep3CombinedProps) => {
  const form = useForm<CombinedFormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      categories: initialData?.categories?.length ? initialData.categories : [{ name: "" }],
      items: initialData?.items?.length ? initialData.items : [{ name: "", description: "", price: "", category: "", imageUrl: "" }],
      reviews: initialData?.reviews?.length ? initialData.reviews : [{ reviewerName: "", reviewText: "", starRating: 5, reviewDate: new Date() }],
      teamMembers: initialData?.teamMembers?.length ? initialData.teamMembers : [{ name: "", title: "", bio: "", imageUrl: "" }],
    },
  });

  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: "categories"
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const { fields: reviewFields, append: appendReview, remove: removeReview } = useFieldArray({
    control: form.control,
    name: "reviews"
  });

  const { fields: teamFields, append: appendTeamMember, remove: removeTeamMember } = useFieldArray({
    control: form.control,
    name: "teamMembers"
  });

  const categories = form.watch("categories");
  const items = form.watch("items");
  const reviews = form.watch("reviews");
  const teamMembers = form.watch("teamMembers");

  // Calculate counts of filled items (more lenient filtering)
  const filledItemsCount = items?.filter(item => 
    item.name?.trim() && (item.description?.trim() || item.price?.trim())
  ).length || 0;
  const filledReviewsCount = reviews?.filter(review => 
    review.reviewerName?.trim() && review.reviewText?.trim()
  ).length || 0;
  const filledTeamMembersCount = teamMembers?.filter(member => 
    member.name?.trim() && (member.title?.trim() || member.bio?.trim())
  ).length || 0;

  // Target counts
  const targetItems = 4;
  const targetReviews = 3;
  const targetTeamMembers = 2;

  // Calculate remaining counts
  const remainingItems = Math.max(0, targetItems - filledItemsCount);
  const remainingReviews = Math.max(0, targetReviews - filledReviewsCount);
  const remainingTeamMembers = Math.max(0, targetTeamMembers - filledTeamMembersCount);

  const shouldShowRecommendation = remainingItems > 0 || remainingReviews > 0 || remainingTeamMembers > 0;

  const onSubmit = (data: CombinedFormData) => {
    onComplete({
      categories: data.categories || [],
      items: data.items || [],
      reviews: data.reviews || [],
      teamMembers: data.teamMembers || []
    });
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="p-1"
          >
            <Star
              className={`h-5 w-5 ${
                rating <= value 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Utensils className="h-6 w-6" />
          <h2 className="text-2xl font-bold text-foreground">Contenido del Restaurante</h2>
        </div>
        <p className="text-muted-foreground">
          Configura el menú, reseñas y equipo de tu restaurante. Puedes omitir cualquier sección y completarla después.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Menu Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Menú del Restaurante
              </CardTitle>
              <CardDescription>
                Configura las categorías y platos de tu menú
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categories */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <FolderPlus className="h-4 w-4" />
                  Categorías
                </h4>
                {categoryFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`categories.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              placeholder="Ej: Platos Principales, Entradas, Bebidas..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {categoryFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCategory(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendCategory({ name: "" })}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Categoría
                </Button>
              </div>

              {/* Menu Items */}
              <div className="space-y-4">
                <h4 className="font-medium">Platos del Menú</h4>
                {itemFields.map((field, index) => (
                  <Card key={field.id} className="p-4 border-dashed">
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="font-medium">Plato #{index + 1}</h5>
                      {itemFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Plato</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Ceviche de Pescado" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: 25.90" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.category`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <FormControl>
                              <select 
                                {...field} 
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="">Selecciona una categoría</option>
                                {categories?.map((cat, catIndex) => (
                                  cat?.name && (
                                    <option key={catIndex} value={cat.name}>
                                      {cat.name}
                                    </option>
                                  )
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.imageUrl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Imagen (Opcional)</FormLabel>
                            <FormControl>
                              <ImageUpload
                                label=""
                                value={field.value || ""}
                                onChange={field.onChange}
                                clientId="signup"
                                context="menu-item"
                                description={`menu item photo - ${form.watch(`items.${index}.name`) || 'dish'}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe los ingredientes y preparación del plato..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendItem({ name: "", description: "", price: "", category: "", imageUrl: "" })}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Plato
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Reseñas de Clientes
              </CardTitle>
              <CardDescription>
                Agrega testimonios positivos para generar confianza
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewFields.map((field, index) => (
                <Card key={field.id} className="p-4 border-dashed">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium">Reseña #{index + 1}</h5>
                    {reviewFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeReview(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`reviews.${index}.reviewerName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Cliente</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: María González" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`reviews.${index}.starRating`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calificación</FormLabel>
                          <FormControl>
                            <div>
                              <StarRating 
                                value={field.value} 
                                onChange={field.onChange}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`reviews.${index}.reviewText`}
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Comentario</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Excelente comida y servicio. Definitivamente regresaré..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`reviews.${index}.reviewDate`}
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Fecha de la Reseña</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => appendReview({ reviewerName: "", reviewText: "", starRating: 5, reviewDate: new Date() })}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Reseña
              </Button>
            </CardContent>
          </Card>

          {/* Team Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipo del Restaurante
              </CardTitle>
              <CardDescription>
                Presenta a tu equipo para generar confianza
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamFields.map((field, index) => (
                <Card key={field.id} className="p-4 border-dashed">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium">Miembro #{index + 1}</h5>
                    {teamFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTeamMember(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Carlos Mendoza" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Chef Ejecutivo, Gerente" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.imageUrl`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Foto del Miembro (Opcional)</FormLabel>
                          <FormControl>
                            <ImageUpload
                              label=""
                              value={field.value || ""}
                              onChange={field.onChange}
                              clientId="signup"
                              context="team-member"
                              description={`team member profile photo - ${form.watch(`teamMembers.${index}.name`) || 'staff member'}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`teamMembers.${index}.bio`}
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Biografía</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cuéntanos sobre su experiencia, especialidades, años en el rubro..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => appendTeamMember({ name: "", title: "", bio: "", imageUrl: "" })}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Miembro del Equipo
              </Button>
            </CardContent>
          </Card>

          {/* Recommendation Message */}
          {shouldShowRecommendation && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-sm">💡</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">Recomendación</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Te recomendamos agregar 
                      {remainingItems > 0 && ` ${remainingItems} ${remainingItems === 1 ? 'plato más' : 'platos más'} al menú`}
                      {remainingItems > 0 && (remainingReviews > 0 || remainingTeamMembers > 0) && ','}
                      {remainingReviews > 0 && ` ${remainingReviews} ${remainingReviews === 1 ? 'reseña más' : 'reseñas más'}`}
                      {remainingReviews > 0 && remainingTeamMembers > 0 && ' y'}
                      {remainingTeamMembers > 0 && ` ${remainingTeamMembers} ${remainingTeamMembers === 1 ? 'miembro más del equipo' : 'miembros más del equipo'}`}
                      {' '}antes de continuar para tener un sitio web más completo y atractivo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onSkip} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                Omitir por ahora
              </Button>
              <Button type="submit">
                Continuar
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};