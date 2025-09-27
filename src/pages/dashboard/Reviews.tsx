import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  Star,
  MessageSquare,
  CalendarIcon
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DashboardContext {
  selectedClientId: string;
  selectedClient: {
    id: string;
    restaurant_name: string;
    subdomain: string;
  };
}

interface Review {
  id: string;
  reviewer_name: string;
  review_text: string;
  star_rating: number;
  display_order: number;
  is_active: boolean;
  review_date?: string;
  created_at: string;
  updated_at: string;
}

const reviewSchema = z.object({
  reviewer_name: z.string().min(1, 'El nombre del reseñador es requerido'),
  review_text: z.string().min(1, 'El texto de la reseña es requerido'),
  star_rating: z.number().min(0.5).max(5),
  is_active: z.boolean().default(true),
  review_date: z.date().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const STAR_OPTIONS = [
  { value: 0.5, label: '0.5 estrellas' },
  { value: 1, label: '1 estrella' },
  { value: 1.5, label: '1.5 estrellas' },
  { value: 2, label: '2 estrellas' },
  { value: 2.5, label: '2.5 estrellas' },
  { value: 3, label: '3 estrellas' },
  { value: 3.5, label: '3.5 estrellas' },
  { value: 4, label: '4 estrellas' },
  { value: 4.5, label: '4.5 estrellas' },
  { value: 5, label: '5 estrellas' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starNumber = index + 1;
        const isFilled = rating >= starNumber;
        const isHalfFilled = rating >= starNumber - 0.5 && rating < starNumber;
        
        return (
          <div key={index} className="relative">
            <Star className="h-4 w-4 text-gray-300" />
            {isFilled && (
              <Star className="absolute inset-0 h-4 w-4 text-yellow-400 fill-current" />
            )}
            {isHalfFilled && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
              </div>
            )}
          </div>
        );
      })}
      <span className="text-sm text-muted-foreground ml-1">({rating})</span>
    </div>
  );
}

function SortableReviewItem({ review, onEdit, onDelete, onToggleStatus }: {
  review: Review;
  onEdit: (review: Review) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: review.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing mt-1"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-foreground">
                  {review.reviewer_name}
                </h3>
                <StarRating rating={review.star_rating} />
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                "{review.review_text}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Switch
              checked={review.is_active}
              onCheckedChange={(checked) => onToggleStatus(review.id, checked)}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(review)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(review.id)}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Reviews() {
  const { selectedClientId, selectedClient } = useOutletContext<DashboardContext>();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema) as any,
    defaultValues: {
      reviewer_name: '',
      review_text: '',
      star_rating: 5,
      is_active: true,
    },
  });

  useEffect(() => {
    if (selectedClientId) {
      fetchReviews();
    }
  }, [selectedClientId]);

  const fetchReviews = async () => {
    if (!selectedClientId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('display_order', { ascending: true });

      if (error) {
        toast.error('Error al cargar reseñas');
        return;
      }

      setReviews(data || []);
    } catch (error) {
      toast.error('Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = reviews.findIndex(review => review.id === active.id);
    const newIndex = reviews.findIndex(review => review.id === over.id);

    const newReviews = arrayMove(reviews, oldIndex, newIndex);
    setReviews(newReviews);

    // Update display_order in database
    try {
      const updates = newReviews.map((review, index) => ({
        id: review.id,
        display_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from('reviews')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast.success('Orden actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el orden');
      fetchReviews(); // Reload on error
    }
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!selectedClientId) return;

    try {
      setSaving(true);

      if (editing) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            reviewer_name: data.reviewer_name,
            review_text: data.review_text,
            star_rating: data.star_rating,
            is_active: data.is_active,
            review_date: data.review_date ? format(data.review_date, 'yyyy-MM-dd') : null,
          })
          .eq('id', editing.id);

        if (error) throw error;
        
        toast.success('Reseña actualizada correctamente');
      } else {
        // Create new review
        const maxOrder = Math.max(...reviews.map(r => r.display_order), -1);
        
        const { error } = await supabase
          .from('reviews')
          .insert({
            client_id: selectedClientId,
            reviewer_name: data.reviewer_name,
            review_text: data.review_text,
            star_rating: data.star_rating,
            display_order: maxOrder + 1,
            is_active: data.is_active,
            review_date: data.review_date ? format(data.review_date, 'yyyy-MM-dd') : null,
          });

        if (error) throw error;
        
        toast.success('Reseña creada correctamente');
      }

      setShowDialog(false);
      setEditing(null);
      form.reset();
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar reseña');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditing(review);
    form.reset({
      reviewer_name: review.reviewer_name,
      review_text: review.review_text,
      star_rating: review.star_rating,
      is_active: review.is_active,
      review_date: review.review_date ? new Date(review.review_date) : undefined,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Reseña eliminada correctamente');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar reseña');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      
      fetchReviews();
      toast.success(isActive ? 'Reseña activada' : 'Reseña desactivada');
    } catch (error: any) {
      toast.error('Error al cambiar estado de la reseña');
    }
  };

  const handleNewReview = () => {
    setEditing(null);
    form.reset({
      reviewer_name: '',
      review_text: '',
      star_rating: 5,
      is_active: true,
    });
    setShowDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Reseñas</h2>
            <p className="text-muted-foreground">Gestiona las reseñas de tus clientes</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reseñas</h2>
          <p className="text-muted-foreground">
            Gestiona las reseñas de tus clientes. Puedes arrastrar para reordenar.
          </p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleNewReview}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Reseña
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Editar Reseña' : 'Nueva Reseña'}
              </DialogTitle>
              <DialogDescription>
                {editing 
                  ? 'Modifica la información de la reseña'
                  : 'Agrega una nueva reseña de cliente'
                }
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="reviewer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Cliente *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del cliente que deja la reseña" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="star_rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calificación *</FormLabel>
                      <Select 
                        value={field.value?.toString()} 
                        onValueChange={(value) => field.onChange(parseFloat(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona la calificación" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STAR_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              <div className="flex items-center gap-2">
                                <StarRating rating={option.value} />
                              </div>
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
                  name="review_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto de la Reseña *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Escribe el comentario o reseña del cliente..."
                          className="resize-none"
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel>Estado Activo</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          La reseña aparecerá en el sitio web
                        </p>
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

                <FormField
                  control={form.control}
                  name="review_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de la Reseña</FormLabel>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="use-current-date"
                            checked={field.value && format(field.value, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange(new Date());
                              }
                            }}
                          />
                          <label
                            htmlFor="use-current-date"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Usar fecha actual ({format(new Date(), 'dd/MM/yyyy')})
                          </label>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Guardando...
                      </>
                    ) : (
                      editing ? 'Actualizar' : 'Crear'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay reseñas
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Comienza agregando reseñas de tus clientes para mostrar en el sitio web
            </p>
            <Button onClick={handleNewReview}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primera Reseña
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={reviews} strategy={verticalListSortingStrategy}>
              {reviews.map((review) => (
                <SortableReviewItem
                  key={review.id}
                  review={review}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}