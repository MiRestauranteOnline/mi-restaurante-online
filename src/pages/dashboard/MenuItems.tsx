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
import { Plus, Edit, Trash2, Upload, Eye, Home, Save, Loader2, Image as ImageIcon } from 'lucide-react';

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
  is_active: boolean;
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

type MenuItemFormData = z.infer<typeof menuItemSchema>;

export default function MenuItems() {
  const { selectedClientId } = useOutletContext<DashboardContext>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const form = useForm<MenuItemFormData>({
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

  useEffect(() => {
    Promise.all([fetchMenuItems(), fetchCategories()]);
  }, [selectedClientId]);

  const fetchMenuItems = async () => {
    if (!selectedClientId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('menu_items')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error al cargar elementos del menú');
        return;
      }

      setMenuItems(data || []);
    } catch (error) {
      toast.error('Error al cargar elementos del menú');
    }
  };

  const fetchCategories = async () => {
    if (!selectedClientId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('menu_categories')
        .select('id, name, is_active')
        .eq('client_id', selectedClientId)
        .eq('is_active', true)
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

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fileName = `${selectedClientId}/menu-items/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('client-assets')
        .upload(fileName, file);
        
      if (error) {
        toast.error('Error al subir imagen');
        return null;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('client-assets')
        .getPublicUrl(fileName);
        
      return publicUrl;
    } catch (error) {
      toast.error('Error al subir imagen');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: MenuItemFormData) => {
    setSaving(true);
    try {
      let imageUrl = editingItem?.image_url || '';

      // Upload image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Check homepage limit
      if (data.show_on_homepage && !editingItem) {
        const homepageCount = menuItems.filter(item => item.show_on_homepage).length;
        if (homepageCount >= 8) {
          toast.error('Máximo 8 elementos pueden aparecer en la página de inicio');
          return;
        }
      }

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
          })
          .eq('id', editingItem.id);

        if (error) {
          toast.error('Error al actualizar elemento');
          return;
        }

        toast.success('Elemento actualizado exitosamente');
      } else {
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

        if (error) {
          toast.error('Error al crear elemento');
          return;
        }

        toast.success('Elemento creado exitosamente');
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      setSelectedFile(null);
      form.reset();
      fetchMenuItems();
    } catch (error) {
      toast.error('Error al guardar elemento');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      is_active: item.is_active,
      show_image_home: item.show_image_home,
      show_image_menu: item.show_image_menu,
      show_on_homepage: item.show_on_homepage,
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        toast.error('Error al eliminar elemento');
        return;
      }

      toast.success('Elemento eliminado exitosamente');
      fetchMenuItems();
    } catch (error) {
      toast.error('Error al eliminar elemento');
    }
  };

  const handleNewItem = () => {
    setEditingItem(null);
    setSelectedFile(null);
    form.reset({
      name: '',
      description: '',
      price: 0,
      category: '',
      is_active: true,
      show_image_home: false,
      show_image_menu: true,
      show_on_homepage: false,
    });
    setIsDialogOpen(true);
  };

  const filteredItems = filterCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === filterCategory);

  const homepageItemsCount = menuItems.filter(item => item.show_on_homepage).length;

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="w-full h-48 bg-muted animate-pulse"></div>
              <CardContent className="p-4 space-y-2">
                <div className="w-3/4 h-5 bg-muted animate-pulse rounded"></div>
                <div className="w-full h-4 bg-muted animate-pulse rounded"></div>
                <div className="w-1/2 h-6 bg-muted animate-pulse rounded"></div>
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
          <h1 className="text-3xl font-bold text-foreground">Elementos del Menú</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los platos y bebidas de tu menú
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewItem}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Elemento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Elemento' : 'Nuevo Elemento del Menú'}
              </DialogTitle>
              <DialogDescription>
                {editingItem 
                  ? 'Modifica los datos del elemento existente' 
                  : 'Agrega un nuevo elemento a tu menú'
                }
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Plato *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Lomo Saltado" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio *</FormLabel>
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
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
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
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe los ingredientes y preparación..."
                          className="resize-none"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Imagen del Plato</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    {(editingItem?.image_url || selectedFile) && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        {selectedFile ? (
                          <img 
                            src={URL.createObjectURL(selectedFile)} 
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : editingItem?.image_url ? (
                          <img 
                            src={editingItem.image_url} 
                            alt="Current"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Elemento Activo</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Los elementos inactivos no aparecen en el sitio web
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
                    name="show_on_homepage"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Mostrar en Página de Inicio</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Máximo 8 elementos ({homepageItemsCount}/8 usados)
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!field.value && homepageItemsCount >= 8}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="show_image_home"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Mostrar Imagen en Página de Inicio</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Solo si el elemento aparece en la página de inicio
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
                    name="show_image_menu"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Mostrar Imagen en Página de Menú</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            La imagen aparece en la página del menú completo
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
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving || uploading}>
                    {saving || uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploading ? 'Subiendo...' : 'Guardando...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {editingItem ? 'Actualizar' : 'Crear'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filtrar por categoría:</label>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Menu Items Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No hay elementos</h3>
                  <p className="text-sm mb-4">
                    {filterCategory === 'all' 
                      ? 'Crea tu primer elemento del menú'
                      : `No hay elementos en la categoría "${filterCategory}"`
                    }
                  </p>
                  <Button onClick={handleNewItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Elemento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.image_url ? (
                <div className="relative h-48 bg-muted">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {item.show_on_homepage && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        <Home className="h-3 w-3 mr-1" />
                        Inicio
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold line-clamp-1">{item.name}</h3>
                  <Badge variant={item.is_active ? "default" : "secondary"}>
                    {item.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-primary">
                    S/ {item.price.toFixed(2)}
                  </span>
                  <Badge variant="outline">{item.category}</Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    {item.show_image_home && <Eye className="h-3 w-3" />}
                    {item.show_image_menu && <ImageIcon className="h-3 w-3" />}
                  </div>
                </div>
                
                <div className="flex justify-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}