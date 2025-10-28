import { useOutletContext } from 'react-router-dom';
import { ImageUpload } from '@/components/ImageUpload';
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { MultiLocationInput } from '@/components/MultiLocationInput';
import { 
  Save, 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Eye, 
  Home, 
  Image as ImageIcon, 
  GripVertical,
  Search,
  Store,
  UtensilsCrossed,
  Users,
  Calendar
} from 'lucide-react';
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
import TeamMembers from './TeamMembers';
import Reviews from './Reviews';

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

interface Stats {
  totalMenuItems: number;
  activeMenuItems: number;
  totalCategories: number;
  activeCategories: number;
  homepageItems: number;
}

// Schemas
const settingsSchema = z.object({
  restaurant_name: z.string().min(1, 'El nombre del restaurante es requerido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  address: z.array(z.string()).optional(),
  coordinates_lat: z.string().optional(),
  coordinates_lng: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  x: z.string().optional(),
  linkedin: z.string().optional(),
  youtube: z.string().optional(),
  tiktok: z.string().optional(),
  rappi: z.string().optional(),
  pedidos_ya: z.string().optional(),
  didi_food: z.string().optional(),
  primary_color: z.string().optional(),
  currency: z.string().optional(),
  // Opening hours
  monday_open: z.string().optional(),
  monday_close: z.string().optional(),
  monday_closed: z.boolean().default(false),
  tuesday_open: z.string().optional(),
  tuesday_close: z.string().optional(),
  tuesday_closed: z.boolean().default(false),
  wednesday_open: z.string().optional(),
  wednesday_close: z.string().optional(),
  wednesday_closed: z.boolean().default(false),
  thursday_open: z.string().optional(),
  thursday_close: z.string().optional(),
  thursday_closed: z.boolean().default(false),
  friday_open: z.string().optional(),
  friday_close: z.string().optional(),
  friday_closed: z.boolean().default(false),
  saturday_open: z.string().optional(),
  saturday_close: z.string().optional(),
  saturday_closed: z.boolean().default(false),
  sunday_open: z.string().optional(),
  sunday_close: z.string().optional(),
  sunday_closed: z.boolean().default(false),
});

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre de la categoría es requerido'),
  is_active: z.boolean().default(true),
});

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

type SettingsFormData = z.infer<typeof settingsSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;
type MenuItemFormData = z.infer<typeof menuItemSchema>;

// Sortable Components
function SortableCategoryItem({ category, onEdit, onDelete, onToggleStatus }: {
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

function SortableMenuItem({ item, currencySymbol, onEdit, onDelete }: { 
  item: MenuItem, 
  currencySymbol: string,
  onEdit: (item: MenuItem) => void,
  onDelete: (id: string) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 border rounded bg-card"
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            {item.image_url && (
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <span className="font-medium">{item.name}</span>
              <span className="text-sm text-muted-foreground ml-2">
                {currencySymbol}{item.price}
              </span>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
              <div className="flex gap-1 mt-1">
                {item.show_on_homepage && (
                  <Badge variant="secondary" className="text-xs">Inicio</Badge>
                )}
                {item.show_image_home && (
                  <Badge variant="secondary" className="text-xs">Img Inicio</Badge>
                )}
                {!item.is_active && (
                  <Badge variant="destructive" className="text-xs">Inactivo</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function UnifiedDashboard() {
  const { selectedClientId, selectedClient } = useOutletContext<DashboardContext>();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMenuItems: 0,
    activeMenuItems: 0,
    totalCategories: 0,
    activeCategories: 0,
    homepageItems: 0,
  });
  
  // Dialog states
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showMenuItemDialog, setShowMenuItemDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuItemImageUrl, setMenuItemImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Forms
  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      restaurant_name: '',
      phone: '',
      email: '',
      whatsapp: '',
      address: [''],
      coordinates_lat: '',
      coordinates_lng: '',
      facebook: '',
      instagram: '',
      x: '',
      linkedin: '',
      youtube: '',
      tiktok: '',
      rappi: '',
      pedidos_ya: '',
      didi_food: '',
      primary_color: '#22c55e',
      currency: 'S/',
      monday_closed: false,
      tuesday_closed: false,
      wednesday_closed: false,
      thursday_closed: false,
      friday_closed: false,
      saturday_closed: false,
      sunday_closed: false,
    },
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      is_active: true,
    },
  });

  const menuItemForm = useForm<MenuItemFormData>({
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

  // Filter and group menu items by category
  const filteredAndGroupedMenuItems = useMemo(() => {
    const filtered = menuItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = categories.reduce((acc, category) => {
      acc[category.name] = filtered.filter(item => item.category === category.name);
      return acc;
    }, {} as Record<string, MenuItem[]>);

    return grouped;
  }, [menuItems, categories, searchTerm]);

  useEffect(() => {
    if (selectedClientId) {
      Promise.all([fetchRestaurantData(), fetchCategories(), fetchMenuItems(), fetchStats()]);
    }
  }, [selectedClientId]);

  const fetchRestaurantData = async () => {
    if (!selectedClientId) return;

    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', selectedClientId)
        .single();

      if (error) {
        toast.error('Error al cargar datos del restaurante');
        return;
      }

      if (client) {
        // Parse JSON fields
        const coordinates = (client.coordinates as any) || {};
        const socialMedia = (client.social_media_links as any) || {};
        const delivery = (client.delivery as any) || {};
        const brandColors = (client.brand_colors as any) || {};
        const openingHours = (client.opening_hours as any) || {};
        const customizations = (client.other_customizations as any) || {};

        settingsForm.reset({
          restaurant_name: client.restaurant_name || '',
          phone: client.phone || '',
          email: client.email || '',
          whatsapp: client.whatsapp || '',
          address: (() => {
            if (Array.isArray(client.address)) {
              return client.address.length > 0 ? client.address : [''];
            }
            if (client.address) {
              if (typeof client.address === 'string' && client.address.toString().trim().startsWith('[')) {
                try {
                  const parsed = JSON.parse(client.address);
                  return Array.isArray(parsed) && parsed.length > 0 ? parsed : [''];
                } catch {
                  return [client.address];
                }
              }
              return [client.address];
            }
            return [''];
          })(),
          coordinates_lat: coordinates.lat?.toString() || '',
          coordinates_lng: coordinates.lng?.toString() || '',
          facebook: socialMedia.facebook || '',
          instagram: socialMedia.instagram || '',
          x: socialMedia.x || socialMedia.twitter || '',
          linkedin: socialMedia.linkedin || '',
          youtube: socialMedia.youtube || '',
          tiktok: socialMedia.tiktok || '',
          rappi: delivery.rappi || '',
          pedidos_ya: delivery.pedidos_ya || '',
          didi_food: delivery.didi_food || '',
          primary_color: brandColors.primary || '#22c55e',
          currency: customizations.currency || 'S/',
          // Opening hours
          monday_open: openingHours.monday?.open || '09:00',
          monday_close: openingHours.monday?.close || '22:00',
          monday_closed: openingHours.monday?.closed || false,
          tuesday_open: openingHours.tuesday?.open || '09:00',
          tuesday_close: openingHours.tuesday?.close || '22:00',
          tuesday_closed: openingHours.tuesday?.closed || false,
          wednesday_open: openingHours.wednesday?.open || '09:00',
          wednesday_close: openingHours.wednesday?.close || '22:00',
          wednesday_closed: openingHours.wednesday?.closed || false,
          thursday_open: openingHours.thursday?.open || '09:00',
          thursday_close: openingHours.thursday?.close || '22:00',
          thursday_closed: openingHours.thursday?.closed || false,
          friday_open: openingHours.friday?.open || '09:00',
          friday_close: openingHours.friday?.close || '22:00',
          friday_closed: openingHours.friday?.closed || false,
          saturday_open: openingHours.saturday?.open || '09:00',
          saturday_close: openingHours.saturday?.close || '22:00',
          saturday_closed: openingHours.saturday?.closed || false,
          sunday_open: openingHours.sunday?.open || '09:00',
          sunday_close: openingHours.sunday?.close || '22:00',
          sunday_closed: openingHours.sunday?.closed || false,
        });
      }
    } catch (error) {
      toast.error('Error al cargar configuración');
    }
  };

  const fetchCategories = async () => {
    if (!selectedClientId) return;

    try {
      const { data, error } = await supabase
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
    }
  };

  const fetchMenuItems = async () => {
    if (!selectedClientId) return;

    try {
      const { data, error } = await supabase
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

  const fetchStats = async () => {
    if (!selectedClientId) return;

    try {
      // Fetch menu items stats
      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('is_active, show_on_homepage')
        .eq('client_id', selectedClientId);

      // Fetch categories stats  
      const { data: categories } = await supabase
        .from('menu_categories')
        .select('is_active')
        .eq('client_id', selectedClientId);

      const menuItemsData = menuItems || [];
      const categoriesData = categories || [];

      setStats({
        totalMenuItems: menuItemsData.length,
        activeMenuItems: menuItemsData.filter(item => item.is_active).length,
        totalCategories: categoriesData.length,
        activeCategories: categoriesData.filter(cat => cat.is_active).length,
        homepageItems: menuItemsData.filter(item => item.show_on_homepage).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Settings handlers
  const onSettingsSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    try {
      // Prepare data for update
      const coordinates = data.coordinates_lat && data.coordinates_lng ? {
        lat: parseFloat(data.coordinates_lat),
        lng: parseFloat(data.coordinates_lng)
      } : null;

      const socialMediaLinks = {
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        x: data.x || '',
        linkedin: data.linkedin || '',
        youtube: data.youtube || '',
        tiktok: data.tiktok || '',
      };

      const deliveryLinks = {
        rappi: data.rappi || '',
        pedidos_ya: data.pedidos_ya || '',
        didi_food: data.didi_food || '',
      };

      const brandColors = {
        primary: data.primary_color || '#22c55e',
      };

      const openingHours = {
        monday: { open: data.monday_open || '09:00', close: data.monday_close || '22:00', closed: data.monday_closed },
        tuesday: { open: data.tuesday_open || '09:00', close: data.tuesday_close || '22:00', closed: data.tuesday_closed },
        wednesday: { open: data.wednesday_open || '09:00', close: data.wednesday_close || '22:00', closed: data.wednesday_closed },
        thursday: { open: data.thursday_open || '09:00', close: data.thursday_close || '22:00', closed: data.thursday_closed },
        friday: { open: data.friday_open || '09:00', close: data.friday_close || '22:00', closed: data.friday_closed },
        saturday: { open: data.saturday_open || '09:00', close: data.saturday_close || '22:00', closed: data.saturday_closed },
        sunday: { open: data.sunday_open || '09:00', close: data.sunday_close || '22:00', closed: data.sunday_closed },
      };

      const otherCustomizations = {
        currency: data.currency || 'S/',
      };

      const { error } = await supabase
        .from('clients')
        .update({
          restaurant_name: data.restaurant_name,
          phone: data.phone,
          email: data.email,
          whatsapp: data.whatsapp,
          address: Array.isArray(data.address) ? JSON.stringify(data.address) : (data.address || null),
          coordinates,
          social_media_links: socialMediaLinks,
          delivery: deliveryLinks,
          brand_colors: brandColors,
          opening_hours: openingHours,
          other_customizations: otherCustomizations,
        })
        .eq('id', selectedClientId);

      if (error) {
        toast.error('Error al guardar configuración');
        return;
      }

      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  // Category handlers
  const onCategorySubmit = async (data: CategoryFormData) => {
    setSaving(true);
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
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
        
        const { error } = await supabase
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

      setShowCategoryDialog(false);
      setEditingCategory(null);
      categoryForm.reset();
      fetchCategories();
      fetchStats();
    } catch (error) {
      toast.error('Error al guardar categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      is_active: category.is_active,
    });
    setShowCategoryDialog(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('menu_categories')
        .update({ is_active: false })
        .eq('id', categoryId);

      if (error) {
        toast.error('Error al eliminar categoría');
        return;
      }

      toast.success('Categoría eliminada exitosamente');
      fetchCategories();
      fetchStats();
    } catch (error) {
      toast.error('Error al eliminar categoría');
    }
  };

  const toggleCategoryStatus = async (categoryId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_categories')
        .update({ is_active: isActive })
        .eq('id', categoryId);

      if (error) {
        toast.error('Error al actualizar estado');
        return;
      }

      toast.success(isActive ? 'Categoría activada' : 'Categoría desactivada');
      fetchCategories();
      fetchStats();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    categoryForm.reset({
      name: '',
      is_active: true,
    });
    setShowCategoryDialog(true);
  };

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
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
          await supabase
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


  const onMenuItemSubmit = async (data: MenuItemFormData) => {
    setSaving(true);
    try {
      const imageUrl = menuItemImageUrl || editingMenuItem?.image_url || '';

      // Check homepage limit
      if (data.show_on_homepage && !editingMenuItem) {
        const homepageCount = menuItems.filter(item => item.show_on_homepage).length;
        if (homepageCount >= 8) {
          toast.error('Máximo 8 elementos pueden aparecer en la página de inicio');
          return;
        }
      }

      if (editingMenuItem) {
        // Update existing item
        const { error } = await supabase
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
          .eq('id', editingMenuItem.id);

        if (error) {
          toast.error('Error al actualizar elemento');
          return;
        }

        toast.success('Elemento actualizado exitosamente');
      } else {
        // Create new item
        const { error } = await supabase
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

      setShowMenuItemDialog(false);
      setEditingMenuItem(null);
      setMenuItemImageUrl('');
      menuItemForm.reset();
      fetchMenuItems();
      fetchStats();
    } catch (error) {
      toast.error('Error al guardar elemento');
    } finally {
      setSaving(false);
    }
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    menuItemForm.reset({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      is_active: item.is_active,
      show_image_home: item.show_image_home,
      show_image_menu: item.show_image_menu,
      show_on_homepage: item.show_on_homepage,
    });
    setMenuItemImageUrl(item.image_url || '');
    setShowMenuItemDialog(true);
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        toast.error('Error al eliminar elemento');
        return;
      }

      toast.success('Elemento eliminado exitosamente');
      fetchMenuItems();
      fetchStats();
    } catch (error) {
      toast.error('Error al eliminar elemento');
    }
  };

  const handleNewMenuItem = () => {
    setEditingMenuItem(null);
    setMenuItemImageUrl('');
    menuItemForm.reset({
      name: '',
      description: '',
      price: 0,
      category: '',
      is_active: true,
      show_image_home: false,
      show_image_menu: true,
      show_on_homepage: false,
    });
    setShowMenuItemDialog(true);
  };

  const handleMenuItemDragEnd = async (event: DragEndEvent, categoryName: string) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const categoryItems = filteredAndGroupedMenuItems[categoryName];
      const oldIndex = categoryItems.findIndex((item) => item.id === active.id);
      const newIndex = categoryItems.findIndex((item) => item.id === over?.id);

      const reorderedItems = arrayMove(categoryItems, oldIndex, newIndex);
      
      // Update the menuItems state
      const updatedMenuItems = menuItems.map(item => {
        if (item.category === categoryName) {
          const newIndex = reorderedItems.findIndex(reorderedItem => reorderedItem.id === item.id);
          return newIndex !== -1 ? { ...item } : item;
        }
        return item;
      });

      setMenuItems(updatedMenuItems);

      try {
        toast.success('Orden de elementos actualizado');
      } catch (error: any) {
        toast.error('Error al actualizar orden de elementos');
        fetchMenuItems();
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="w-48 h-6 bg-muted animate-pulse rounded mb-2"></div>
            <div className="w-64 h-4 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="w-32 h-5 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-full h-10 bg-muted animate-pulse rounded"></div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const currencySymbol = settingsForm.getValues('currency') || 'S/';

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Control</h1>
          <p className="text-muted-foreground">{selectedClient?.restaurant_name}</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => window.open(`https://${selectedClient?.subdomain}.mirestaurante.online`, '_blank')}
        >
          <Store className="h-4 w-4 mr-2" />
          Ver Sitio Web
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
          <TabsTrigger value="menu">Menú</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          <TabsTrigger value="social">Redes Sociales</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Elementos del Menú</CardTitle>
                  <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeMenuItems}</div>
                  <p className="text-xs text-muted-foreground">
                    de {stats.totalMenuItems} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeCategories}</div>
                  <p className="text-xs text-muted-foreground">
                    de {stats.totalCategories} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En Página de Inicio</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.homepageItems}</div>
                  <p className="text-xs text-muted-foreground">
                    máximo 8 elementos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sitio Web</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Activo
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedClient?.subdomain}.mirestaurante.online
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay actividad reciente</p>
                  <p className="text-sm">Los cambios en tu restaurante aparecerán aquí</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Form {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                  <CardDescription>
                    Datos principales de tu restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={settingsForm.control}
                    name="restaurant_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Restaurante *</FormLabel>
                        <FormControl>
                          <Input placeholder="Mi Restaurante" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={settingsForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="+51 123 456 789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={settingsForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="info@mirestaurante.online" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={settingsForm.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="+51 987 654 321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <MultiLocationInput
                            locations={Array.isArray(field.value) ? field.value : ['']}
                            onChange={field.onChange}
                            placeholder="Av. Principal 123, Distrito, Ciudad"
                            useTextarea={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Opening Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>Horarios de Atención</CardTitle>
                  <CardDescription>
                    Define los horarios de funcionamiento de tu restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {days.map((day, index) => (
                    <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="font-medium">{dayNames[index]}</div>
                      
                      <FormField
                        control={settingsForm.control}
                        name={`${day}_closed` as any}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={!field.value}
                                onCheckedChange={(checked) => field.onChange(!checked)}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">
                              {field.value ? 'Cerrado' : 'Abierto'}
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      {!settingsForm.watch(`${day}_closed` as any) && (
                        <>
                          <FormField
                            control={settingsForm.control}
                            name={`${day}_open` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={settingsForm.control}
                            name={`${day}_close` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Branding */}
              <Card>
                <CardHeader>
                  <CardTitle>Personalización</CardTitle>
                  <CardDescription>
                    Configura los colores y moneda de tu restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={settingsForm.control}
                      name="primary_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Principal</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" {...field} className="w-16" />
                              <Input {...field} placeholder="#22c55e" className="flex-1" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                    <FormField
                      control={settingsForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moneda</FormLabel>
                          <FormControl>
                            <Input placeholder="S/" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Configuración
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="social">
          <Form {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociales</CardTitle>
                  <CardDescription>
                    Enlaces a tus perfiles sociales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={settingsForm.control}
                      name="facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/mirestaurante" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={settingsForm.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/mirestaurante" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={settingsForm.control}
                      name="x"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>X (Twitter)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://x.com/mirestaurante" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={settingsForm.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/company/mirestaurante" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={settingsForm.control}
                      name="youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/@mirestaurante" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={settingsForm.control}
                      name="tiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TikTok</FormLabel>
                          <FormControl>
                            <Input placeholder="https://tiktok.com/@mirestaurante" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery */}
              <Card>
                <CardHeader>
                  <CardTitle>Plataformas de Delivery</CardTitle>
                  <CardDescription>
                    Enlaces a tus perfiles de delivery
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={settingsForm.control}
                      name="rappi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rappi</FormLabel>
                          <FormControl>
                            <Input placeholder="https://rappi.com/restaurantes/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={settingsForm.control}
                      name="pedidos_ya"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PedidosYa</FormLabel>
                          <FormControl>
                            <Input placeholder="https://pedidosya.com/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={settingsForm.control}
                      name="didi_food"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DiDi Food</FormLabel>
                          <FormControl>
                            <Input placeholder="https://web.didiglobal.com/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Enlaces
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Elementos del Menú
                <Button onClick={handleNewMenuItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Elemento
                </Button>
              </CardTitle>
              <CardDescription>
                Gestiona los platos y bebidas de tu menú
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar elementos del menú..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Menu Items by Category */}
              <div className="space-y-6">
                {categories.map((category) => {
                  const categoryItems = filteredAndGroupedMenuItems[category.name] || [];
                  
                  if (categoryItems.length === 0 && searchTerm) return null;

                  return (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-center gap-2 py-2 border-b">
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <span className="text-sm text-muted-foreground">({categoryItems.length} elementos)</span>
                      </div>
                      
                      {categoryItems.length > 0 ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleMenuItemDragEnd(event, category.name)}
                        >
                          <SortableContext items={categoryItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                              {categoryItems.map((item) => (
                                <SortableMenuItem
                                  key={item.id}
                                  item={item}
                                  currencySymbol={currencySymbol}
                                  onEdit={handleEditMenuItem}
                                  onDelete={handleDeleteMenuItem}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <p className="text-muted-foreground text-center py-4 text-sm">
                          {searchTerm ? 'No hay elementos que coincidan con la búsqueda' : 'No hay elementos en esta categoría'}
                        </p>
                      )}
                    </div>
                  );
                })}
                
                {categories.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No hay categorías. Crea categorías primero.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <TeamMembers />
        </TabsContent>

        <TabsContent value="reviews">
          <Reviews />
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
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

          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
              <FormField
                control={categoryForm.control}
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
                control={categoryForm.control}
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
                  onClick={() => setShowCategoryDialog(false)}
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

      {/* Menu Item Dialog */}
      <Dialog open={showMenuItemDialog} onOpenChange={setShowMenuItemDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMenuItem ? 'Editar Elemento' : 'Nuevo Elemento del Menú'}
            </DialogTitle>
            <DialogDescription>
              {editingMenuItem 
                ? 'Modifica los datos del elemento existente' 
                : 'Agrega un nuevo elemento a tu menú'
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...menuItemForm}>
            <form onSubmit={menuItemForm.handleSubmit(onMenuItemSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={menuItemForm.control}
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
                  control={menuItemForm.control}
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
                control={menuItemForm.control}
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
                        {categories.filter(cat => cat.is_active).map((category) => (
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
                control={menuItemForm.control}
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
              <div>
                <ImageUpload
                  label="Imagen del Plato (Opcional)"
                  value={menuItemImageUrl}
                  onChange={setMenuItemImageUrl}
                  clientId={selectedClientId}
                  context="menu-item"
                  description={menuItemForm.watch('name') || ''}
                  onProcessingChange={setUploading}
                />
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-4 border-t">
                <FormField
                  control={menuItemForm.control}
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
                  control={menuItemForm.control}
                  name="show_on_homepage"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Mostrar en Página de Inicio</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Máximo 8 elementos pueden aparecer en la página de inicio
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
                  control={menuItemForm.control}
                  name="show_image_menu"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Mostrar Imagen en Menú</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          La imagen aparece en la página del menú
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
                  control={menuItemForm.control}
                  name="show_image_home"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Mostrar Imagen en Inicio</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          La imagen aparece en la página de inicio
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
                  onClick={() => setShowMenuItemDialog(false)}
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
                      {editingMenuItem ? 'Actualizar' : 'Crear'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}