import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
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
import { GripVertical } from 'lucide-react';

interface DashboardContext {
  selectedClientId: string;
  selectedClient: {
    id: string;
    restaurant_name: string;
    subdomain: string;
  };
}

interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre de la categoría es requerido'),
  is_active: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// SortableItem component for drag and drop
function SortableItem({ category, onEdit, onDelete, onToggleStatus }: {
  category: MenuCategory;
  onEdit: (category: MenuCategory) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Orden: {category.display_order}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge 
              variant={category.is_active ? "default" : "secondary"}
              className={category.is_active ? "bg-green-600" : ""}
            >
              {category.is_active ? 'Activa' : 'Inactiva'}
            </Badge>

            <Switch
              checked={category.is_active}
              onCheckedChange={(checked) => onToggleStatus(category.id, checked)}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category.id)}
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

export default function MenuCategories() {
  const { selectedClientId } = useOutletContext<DashboardContext>();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      is_active: true,
    },
  });

  useEffect(() => {
    fetchCategories();
  }, [selectedClientId]);

  const fetchCategories = async () => {
    if (!selectedClientId) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('menu_categories')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('display_order', { ascending: true });

      if (error) {
        toast.error('Error al cargar categorías');
        return;
      }

      setCategories(data || []);
    } catch (error) {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setSaving(true);
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await (supabase as any)
          .from('menu_categories')
          .update({
            name: data.name,
            is_active: data.is_active,
          })
          .eq('id', editingCategory.id);

        if (error) {
          toast.error('Error al actualizar categoría');
          return;
        }

        toast.success('Categoría actualizada exitosamente');
      } else {
        // Create new category
        const maxOrder = Math.max(...categories.map(cat => cat.display_order || 0), 0);
        
        const { error } = await (supabase as any)
          .from('menu_categories')
          .insert({
            client_id: selectedClientId,
            name: data.name,
            is_active: data.is_active,
            display_order: maxOrder + 1,
          });

        if (error) {
          toast.error('Error al crear categoría');
          return;
        }

        toast.success('Categoría creada exitosamente');
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      form.reset();
      fetchCategories();
    } catch (error) {
      toast.error('Error al guardar categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('menu_categories')
        .update({ is_active: false })
        .eq('id', categoryId);

      if (error) {
        toast.error('Error al eliminar categoría');
        return;
      }

      toast.success('Categoría eliminada exitosamente');
      fetchCategories();
    } catch (error) {
      toast.error('Error al eliminar categoría');
    }
  };

  const toggleCategoryStatus = async (categoryId: string, isActive: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('menu_categories')
        .update({ is_active: isActive })
        .eq('id', categoryId);

      if (error) {
        toast.error('Error al actualizar estado');
        return;
      }

      toast.success(isActive ? 'Categoría activada' : 'Categoría desactivada');
      fetchCategories();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    form.reset({
      name: '',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex((item) => item.id === active.id);
      const newIndex = categories.findIndex((item) => item.id === over?.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);

      // Update display_order in database
      try {
        const updates = newCategories.map((category, index) => ({
          id: category.id,
          display_order: index + 1,
        }));

        for (const update of updates) {
          await (supabase as any)
            .from('menu_categories')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        toast.success('Orden actualizado exitosamente');
      } catch (error) {
        toast.error('Error al actualizar el orden');
        // Revert changes on error
        fetchCategories();
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="w-48 h-6 bg-muted animate-pulse rounded mb-2"></div>
            <div className="w-64 h-4 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="w-32 h-10 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-muted animate-pulse rounded"></div>
                    <div className="w-32 h-5 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-6 bg-muted animate-pulse rounded"></div>
                    <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                    <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categorías del Menú</h1>
          <p className="text-muted-foreground mt-2">
            Organiza y gestiona las categorías de tu menú
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Modifica los datos de la categoría existente' 
                  : 'Crea una nueva categoría para organizar tu menú'
                }
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Categoría *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Platos principales, Bebidas..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Categoría activa</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {editingCategory ? 'Actualizar' : 'Crear'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay categorías</h3>
                <p className="text-sm mb-4">
                  Crea tu primera categoría para empezar a organizar tu menú
                </p>
                <Button onClick={handleNewCategory}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Categoría
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {categories.map((category) => (
                  <SortableItem
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={toggleCategoryStatus}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Información</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Puedes reordenar las categorías arrastrando el ícono ⋮⋮</p>
              <p>• Las categorías inactivas no aparecerán en tu sitio web</p>
              <p>• El orden aquí determina cómo aparecen en tu menú</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}