import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, X, Star } from "lucide-react";

export interface Review {
  reviewerName: string;
  reviewText: string;
  starRating: number;
}

export interface ReviewsData {
  reviews: Review[];
}

const reviewSchema = z.object({
  reviewerName: z.string().min(1, "El nombre del cliente es requerido"),
  reviewText: z.string().min(10, "La reseña debe tener al menos 10 caracteres"),
  starRating: z.number().min(1).max(5),
});

const reviewsSchema = z.object({
  reviews: z.array(reviewSchema).min(1, "Agrega al menos una reseña"),
});

type ReviewsFormData = z.infer<typeof reviewsSchema>;

interface SignupStep4Props {
  onComplete: (reviewsData: ReviewsData) => void;
  onBack: () => void;
  initialData?: ReviewsData;
}

export const SignupStep4 = ({ onComplete, onBack, initialData }: SignupStep4Props) => {
  const form = useForm<ReviewsFormData>({
    resolver: zodResolver(reviewsSchema),
    defaultValues: {
      reviews: initialData?.reviews?.length ? initialData.reviews : [{ reviewerName: "", reviewText: "", starRating: 5 }],
    },
  });

  const { fields: reviewFields, append: appendReview, remove: removeReview } = useFieldArray({
    control: form.control,
    name: "reviews"
  });

  const onSubmit = (data: ReviewsFormData) => {
    onComplete(data);
  };

  const addReview = () => {
    appendReview({ reviewerName: "", reviewText: "", starRating: 5 });
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
          <Star className="h-6 w-6" />
          <h2 className="text-2xl font-bold text-foreground">Reseñas de Clientes</h2>
        </div>
        <p className="text-muted-foreground">
          Agrega algunas reseñas para generar confianza en tus visitantes. Puedes agregar más después.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Testimonios de Clientes
              </CardTitle>
              <CardDescription>
                Agrega reseñas positivas de tus clientes para generar confianza
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviewFields.map((field, index) => (
                <Card key={field.id} className="p-4 border-dashed">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Reseña #{index + 1}</h4>
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
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addReview}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Reseña
              </Button>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button type="submit">
              Continuar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};