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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Upload, Eye, Home, Save, Loader2, Image as ImageIcon, GripVertical, ChevronDown, ChevronRight, FolderPlus, Trash, Power, PowerOff, ArrowUp, ArrowDown } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  rectIntersection,
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
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardContext {
  selectedClientId: string;
  selectedClient: {
    id: string;
    restaurant_name: string;
    subdomain: string;
  };
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_active: boolean;
  show_image_home: boolean;
  show_image_menu: boolean;
  show_on_homepage: boolean;
  created_at: string;
  updated_at: string;
}

interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryWithItems extends MenuCategory {
  items: MenuItem[];
}

const menuItemSchema = z.object({
  name: z.string().min(1, 'El nombre del plato es requerido'),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
  category: z.string().min(1, 'La categoría es requerida'),
  is_active: z.boolean().default(true),
  show_image_home: z.boolean().default(false),
  show_image_menu: z.boolean().default(true),
  show_on_homepage: z.boolean().default(false),
});

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre de la categoría es requerido'),
  is_active: z.boolean().default(true),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;

// Sortable Item Component
function SortableItem({ 
  item, 
  onEdit, 
  onDelete,
  onToggleStatus,
  isMobile,
}: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  isMobile: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
      <div className="aspect-video bg-muted flex items-center justify-center relative">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        )}
        <div className="absolute top-2 left-2">
          <div className="hidden lg:block">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 bg-background/80 rounded"
            >
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {item.show_on_homepage && (
            <Badge variant="secondary" className="text-xs">
              <Home className="h-3 w-3 mr-1" />
              Inicio
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-sm leading-tight mb-1">
              {item.name}
            </h3>
            <p className="text-lg font-bold text-primary">
              S/ {item.price.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Switch
              checked={item.is_active}
              onCheckedChange={(checked) => onToggleStatus(item.id, checked)}
            />
            <Badge variant={item.is_active ? "default" : "secondary"}>
              {item.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {item.show_image_home && (
              <Badge variant="outline" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                IMG-Inicio
              </Badge>
            )}
            {item.show_image_menu && (
              <Badge variant="outline" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                IMG-Menú
              </Badge>
            )}
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sortable Category Component
function SortableCategory({ 
  category, 
  onEditCategory, 
  onDeleteCategory,
  onCompleteDeleteCategory,
  onToggleCategoryStatus,
  onEditItem, 
  onDeleteItem,
  onToggleItemStatus, 
  onNewItem,
  isOpen,
  onToggleOpen,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isMobile
}: {
  category: CategoryWithItems;
  onEditCategory: (category: MenuCategory) => void;
  onDeleteCategory: (id: string) => void;
  onCompleteDeleteCategory: (id: string) => void;
  onToggleCategoryStatus: (id: string, isActive: boolean) => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleItemStatus: (id: string, isActive: boolean) => void;
  onNewItem: (categoryName: string) => void;
  isOpen: boolean;
  onToggleOpen: (categoryId: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
  isMobile: boolean;
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
    <Card ref={setNodeRef} style={style} className="mb-4">
      <Collapsible open={isOpen} onOpenChange={() => onToggleOpen(category.id)}>
        <CollapsibleTrigger asChild>
           <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="hidden lg:block" onClick={(e) => e.stopPropagation()}>
                     <div
                       {...attributes}
                       {...listeners}
                       className="cursor-grab active:cursor-grabbing p-1"
                     >
                       <GripVertical className="h-4 w-4 text-muted-foreground" />
                     </div>
                   </div>
                   <div className="flex flex-col gap-1 lg:hidden">
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={(e) => {
                         e.stopPropagation();
                         onMoveUp(category.id);
                       }}
                       disabled={isFirst}
                       className="h-6 w-6 p-0"
                     >
                       <ArrowUp className="h-3 w-3" />
                     </Button>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={(e) => {
                         e.stopPropagation();
                         onMoveDown(category.id);
                       }}
                       disabled={isLast}
                       className="h-6 w-6 p-0"
                     >
                       <ArrowDown className="h-3 w-3" />
                     </Button>
                   </div>
                   <div className="flex items-center gap-2">
                   {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                   <CardTitle className="text-lg">{category.name}</CardTitle>
                   <Badge variant={category.is_active ? "default" : "secondary"}>
                     {category.is_active ? 'Activo' : 'Inactivo'}
                   </Badge>
                   <Badge variant="outline">
                     {category.items.length} platos
                   </Badge>
                 </div>
               </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={category.is_active}
                  onCheckedChange={(checked) => onToggleCategoryStatus(category.id, checked)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNewItem(category.name)}
                >
                  <Plus className="h-4 w-4" />
                  Agregar Plato
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditCategory(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteCategory(category.id)}
                  title="Desactivar categoría"
                >
                  <PowerOff className="h-4 w-4" />
                </Button>
                {category.items.length === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCompleteDeleteCategory(category.id)}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                    title="Eliminar categoría completamente"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {category.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay platos en esta categoría</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => onNewItem(category.name)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primer plato
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item) => (
                  <SortableItem 
                    key={item.id} 
                    item={item} 
                    onEdit={onEditItem} 
                    onDelete={onDeleteItem}
                    onToggleStatus={onToggleItemStatus}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function MenuItems() {
  const { selectedClientId } = useOutletContext<DashboardContext>();
  const [categoriesWithItems, setCategoriesWithItems] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [itemImageUrl, setItemImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const desktopSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const sensors = isMobile ? useSensors() : desktopSensors;

  const itemForm = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      is_active: true,
      show_image_home: false,
      show_image_menu: true,
      show_on_homepage: false,
    },
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      is_active: true,
    },
  });

  useEffect(() => {
    fetchData();
  }, [selectedClientId]);

  const fetchData = async () => {
    if (!selectedClientId) return;

    try {
      // Fetch categories
      const { data: categories, error: categoriesError } = await (supabase as any)
        .from('menu_categories')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch menu items
      const { data: menuItems, error: itemsError } = await (supabase as any)
        .from('menu_items')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Group items by category
      const categoriesWithItems: CategoryWithItems[] = (categories || []).map((category: MenuCategory) => ({
        ...category,
        items: (menuItems || []).filter((item: MenuItem) => item.category === category.name)
      }));

      setCategoriesWithItems(categoriesWithItems);
      
      // Open first few categories by default
      const initialOpenCategories = new Set(
        categoriesWithItems.slice(0, 2).map(cat => cat.id)
      );
      setOpenCategories(initialOpenCategories);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };


  const onSubmitItem = async (data: MenuItemFormData) => {
    setSaving(true);
    try {
      const imageUrl = itemImageUrl || editingItem?.image_url || '';

      if (editingItem) {
        // Update existing item
        const { error } = await (supabase as any)
          .from('menu_items')
          .update({
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            image_url: imageUrl,
            is_active: data.is_active,
            show_image_home: data.show_image_home,
            show_image_menu: data.show_image_menu,
            show_on_homepage: data.show_on_homepage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Plato actualizado exitosamente');
      } else {
        // Check homepage item limit
        if (data.show_on_homepage) {
          const { data: homepageItems } = await (supabase as any)
            .from('menu_items')
            .select('id')
            .eq('client_id', selectedClientId)
            .eq('show_on_homepage', true);

          if (homepageItems && homepageItems.length >= 6) {
            toast.error('Solo puedes mostrar máximo 6 platos en la página de inicio');
            return;
          }
        }

        // Create new item
        const { error } = await (supabase as any)
          .from('menu_items')
          .insert({
            client_id: selectedClientId,
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            image_url: imageUrl,
            is_active: data.is_active,
            show_image_home: data.show_image_home,
            show_image_menu: data.show_image_menu,
            show_on_homepage: data.show_on_homepage,
          });

        if (error) throw error;
        toast.success('Plato creado exitosamente');
      }

      setIsItemDialogOpen(false);
      setEditingItem(null);
      setItemImageUrl('');
      itemForm.reset();
      fetchData();
    } catch (error) {
      toast.error('Error al guardar plato');
    } finally {
      setSaving(false);
    }
  };

  const onSubmitCategory = async (data: CategoryFormData) => {
    setSaving(true);
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await (supabase as any)
          .from('menu_categories')
          .update({
            name: data.name,
            is_active: data.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCategory.id);

        if (error) throw error;

        // Update category name in menu items
        const { error: itemsError } = await (supabase as any)
          .from('menu_items')
          .update({ category: data.name })
          .eq('client_id', selectedClientId)
          .eq('category', editingCategory.name);

        if (itemsError) throw itemsError;

        toast.success('Categoría actualizada exitosamente');
      } else {
        // Create new category
        const { data: categories } = await (supabase as any)
          .from('menu_categories')
          .select('display_order')
          .eq('client_id', selectedClientId)
          .order('display_order', { ascending: false })
          .limit(1);

        const nextDisplayOrder = categories && categories.length > 0 
          ? categories[0].display_order + 1 
          : 0;

        const { error } = await (supabase as any)
          .from('menu_categories')
          .insert({
            client_id: selectedClientId,
            name: data.name,
            is_active: data.is_active,
            display_order: nextDisplayOrder,
          });

        if (error) throw error;
        toast.success('Categoría creada exitosamente');
      }

      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
      fetchData();
    } catch (error) {
      toast.error('Error al guardar categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    itemForm.reset({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      is_active: item.is_active,
      show_image_home: item.show_image_home,
      show_image_menu: item.show_image_menu,
      show_on_homepage: item.show_on_homepage,
    });
    setItemImageUrl(item.image_url || '');
    setIsItemDialogOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plato?')) return;

    try {
      const { error } = await (supabase as any)
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Plato eliminado exitosamente');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar plato');
    }
  };

  const handleNewItem = (categoryName?: string) => {
    setEditingItem(null);
    setItemImageUrl('');
    itemForm.reset({
      name: '',
      description: '',
      price: 0,
      category: categoryName || '',
      is_active: true,
      show_image_home: false,
      show_image_menu: true,
      show_on_homepage: false,
    });
    setIsItemDialogOpen(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      is_active: category.is_active,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres desactivar esta categoría?')) return;

    try {
      const { error } = await (supabase as any)
        .from('menu_categories')
        .update({ is_active: false })
        .eq('id', categoryId);

      if (error) throw error;

      // Also deactivate all items in this category
      const { error: itemsError } = await (supabase as any)
        .from('menu_items')
        .update({ is_active: false })
        .eq('client_id', selectedClientId)
        .eq('category', categoriesWithItems.find(c => c.id === categoryId)?.name);

      if (itemsError) throw itemsError;

      toast.success('Categoría y sus platos desactivados exitosamente');
      fetchData();
    } catch (error) {
      toast.error('Error al desactivar categoría');
    }
  };

  const handleCompleteDeleteCategory = async (categoryId: string) => {
    const category = categoriesWithItems.find(c => c.id === categoryId);
    if (!category) return;

    if (category.items.length > 0) {
      toast.error('No puedes eliminar una categoría que tiene platos. Elimina o mueve los platos primero.');
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría permanentemente?')) return;

    try {
      const { error } = await (supabase as any)
        .from('menu_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      toast.success('Categoría eliminada permanentemente');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar categoría');
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string, isActive: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('menu_categories')
        .update({ is_active: isActive })
        .eq('id', categoryId);

      if (error) throw error;

      // Update all items in this category
      const categoryName = categoriesWithItems.find(c => c.id === categoryId)?.name;
      if (categoryName) {
        const { error: itemsError } = await (supabase as any)
          .from('menu_items')
          .update({ is_active: isActive })
          .eq('client_id', selectedClientId)
          .eq('category', categoryName);

        if (itemsError) throw itemsError;
      }

      toast.success(isActive ? 'Categoría y sus platos activados' : 'Categoría y sus platos desactivados');
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleToggleItemStatus = async (itemId: string, isActive: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('menu_items')
        .update({ is_active: isActive })
        .eq('id', itemId);

      if (error) throw error;
      toast.success(isActive ? 'Plato activado' : 'Plato desactivado');
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar estado del plato');
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    categoryForm.reset({
      name: '',
      is_active: true,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItemId(null);

    if (!over || active.id === over.id) return;

    // Check if dragging a category
    const draggedCategory = categoriesWithItems.find(cat => cat.id === active.id);
    if (draggedCategory) {
      const oldIndex = categoriesWithItems.findIndex(cat => cat.id === active.id);
      const newIndex = categoriesWithItems.findIndex(cat => cat.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newCategories = arrayMove(categoriesWithItems, oldIndex, newIndex);
      setCategoriesWithItems(newCategories);

      // Update display_order in database
      try {
        const updates = newCategories.map((category, index) => ({
          id: category.id,
          display_order: index,
        }));

        for (const update of updates) {
          await (supabase as any)
            .from('menu_categories')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        toast.success('Orden de categorías actualizado');
      } catch (error) {
        toast.error('Error al actualizar orden');
        fetchData();
      }
      return;
    }

    // Check if dragging an item to a category
    const draggedItem = categoriesWithItems
      .flatMap(cat => cat.items)
      .find(item => item.id === active.id);

    const targetCategory = categoriesWithItems.find(cat => cat.id === over.id);

    if (draggedItem && targetCategory) {
      try {
        const { error } = await (supabase as any)
          .from('menu_items')
          .update({ category: targetCategory.name })
          .eq('id', draggedItem.id);

        if (error) throw error;
        toast.success(`Plato movido a ${targetCategory.name}`);
        fetchData();
      } catch (error) {
        toast.error('Error al mover plato');
      }
    }
  };

  const handleDragStart = (event: any) => {
    setActiveItemId(event.active.id);
  };

  const toggleCategoryOpen = (categoryId: string) => {
    const newOpenCategories = new Set(openCategories);
    if (newOpenCategories.has(categoryId)) {
      newOpenCategories.delete(categoryId);
    } else {
      newOpenCategories.add(categoryId);
    }
    setOpenCategories(newOpenCategories);
  };

  const handleMoveCategoryUp = async (categoryId: string) => {
    const index = categoriesWithItems.findIndex(cat => cat.id === categoryId);
    if (index > 0) {
      const newCategories = arrayMove(categoriesWithItems, index, index - 1);
      setCategoriesWithItems(newCategories);

      try {
        const updates = newCategories.map((category, idx) => ({
          id: category.id,
          display_order: idx,
        }));

        for (const update of updates) {
          await (supabase as any)
            .from('menu_categories')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        toast.success('Orden actualizado');
      } catch (error) {
        toast.error('Error al actualizar orden');
        fetchData();
      }
    }
  };

  const handleMoveCategoryDown = async (categoryId: string) => {
    const index = categoriesWithItems.findIndex(cat => cat.id === categoryId);
    if (index < categoriesWithItems.length - 1) {
      const newCategories = arrayMove(categoriesWithItems, index, index + 1);
      setCategoriesWithItems(newCategories);

      try {
        const updates = newCategories.map((category, idx) => ({
          id: category.id,
          display_order: idx,
        }));

        for (const update of updates) {
          await (supabase as any)
            .from('menu_categories')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        toast.success('Orden actualizado');
      } catch (error) {
        toast.error('Error al actualizar orden');
        fetchData();
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Menú</h1>
            <p className="text-muted-foreground">Organiza tu menú por categorías y platos</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-40 bg-muted rounded"></div>
                  ))}
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
          <h1 className="text-3xl font-bold text-foreground">Gestión de Menú</h1>
          <p className="text-muted-foreground">
            Organiza tu menú por categorías y platos. Arrastra las categorías para cambiar su orden.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewCategory}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
          <Button onClick={() => handleNewItem()}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Plato
          </Button>
        </div>
      </div>

      {categoriesWithItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No hay categorías creadas</p>
            <Button onClick={handleNewCategory}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Crear primera categoría
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={[
              ...categoriesWithItems.map(c => c.id),
              ...categoriesWithItems.flatMap(c => c.items.map(item => item.id))
            ]} 
            strategy={verticalListSortingStrategy}
          >
            {categoriesWithItems.map((category, index) => (
              <SortableCategory
                key={category.id}
                category={category}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                onCompleteDeleteCategory={handleCompleteDeleteCategory}
                onToggleCategoryStatus={handleToggleCategoryStatus}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                onToggleItemStatus={handleToggleItemStatus}
                onNewItem={handleNewItem}
                isOpen={openCategories.has(category.id)}
                onToggleOpen={toggleCategoryOpen}
                onMoveUp={handleMoveCategoryUp}
                onMoveDown={handleMoveCategoryDown}
                isFirst={index === 0}
                isLast={index === categoriesWithItems.length - 1}
                isMobile={isMobile}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85svh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {editingItem ? 'Editar Plato' : 'Nuevo Plato'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Modifica los detalles del plato' : 'Agrega un nuevo plato al menú'}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            <Form {...itemForm}>
              <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Plato</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ceviche de pescado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={itemForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio (S/)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={itemForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriesWithItems.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={itemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el plato..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <ImageUpload
                  label="Imagen del Plato (Opcional)"
                  value={itemImageUrl}
                  onChange={setItemImageUrl}
                  clientId={selectedClientId}
                  context="menu-item"
                  description={itemForm.watch('name') || ''}
                  onProcessingChange={setUploading}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={itemForm.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Plato Activo</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          El plato aparecerá en el menú público
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

                <FormField
                  control={itemForm.control}
                  name="show_on_homepage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Mostrar en Página de Inicio</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          El plato aparecerá en la sección de platos destacados (máximo 6)
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={itemForm.control}
                    name="show_image_home"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Imagen en Inicio</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Mostrar imagen en página de inicio
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

                  <FormField
                    control={itemForm.control}
                    name="show_image_menu"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Imagen en Menú</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Mostrar imagen en página de menú
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
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsItemDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving || uploading}>
                  {saving || uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {uploading ? 'Subiendo...' : 'Guardando...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingItem ? 'Actualizar' : 'Crear'} Plato
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md max-h-[85svh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Modifica los detalles de la categoría' : 'Agrega una nueva categoría al menú'}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            <Form {...categoryForm}>
              <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4 py-4">
                <FormField
                  control={categoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Categoría</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Entradas, Platos Principales, Postres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={categoryForm.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Categoría Activa</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          La categoría aparecerá en el menú público
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

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCategoryDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingCategory ? 'Actualizar' : 'Crear'} Categoría
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}