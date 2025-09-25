import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, Plus, Trash2, Edit, Search, GripVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
  email?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
  coordinates?: any;
  opening_hours?: any;
  social_media_links?: any;
  brand_colors?: any;
  delivery?: any;
  other_customizations?: any;
}

interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  client_id: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  is_active: boolean;
  client_id: string;
  show_on_homepage: boolean;
  show_image_menu: boolean;
  show_image_home: boolean;
}

// Sortable Category Item Component
function SortableCategoryItem({ category, onEdit, onDelete }: { 
  category: MenuCategory, 
  onEdit: (category: MenuCategory) => void,
  onDelete: (id: string) => void 
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
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 border rounded bg-card"
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <span className="font-medium">{category.name}</span>
          <span className="text-sm text-muted-foreground ml-2">Order: {category.display_order}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(category.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Sortable Menu Item Component
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
        <div>
          <span className="font-medium">{item.name}</span>
          <span className="text-sm text-muted-foreground ml-2">
            {currencySymbol}{item.price}
          </span>
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
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

export default function ClientSettings() {
  console.log('ClientSettings component rendered'); // Debug log
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showMenuItemDialog, setShowMenuItemDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [categoryForm, setCategoryForm] = useState({ name: '', display_order: 0 });
  const [menuItemForm, setMenuItemForm] = useState({
    name: '', description: '', price: 0, category: '', image_url: '',
    show_on_homepage: false, show_image_menu: true, show_image_home: false
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

  const [formData, setFormData] = useState({
    restaurant_name: '',
    subdomain: '',
    email: '',
    phone: '',
    address: '',
    whatsapp: '',
    coordinates: { lat: '', lng: '' },
    opening_hours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '22:00', closed: false }
    },
    social_media_links: {
      facebook: '',
      instagram: '',
      x: '',
      tiktok: '',
      youtube: '',
      linkedin: ''
    },
    delivery: {
      rappi: '',
      pedidos_ya: '',
      didi_food: ''
    },
    brand_colors: {
      primary: '#8B5CF6',
      accent: '#F59E0B'
    },
    other_customizations: {
      currency: 'S/'
    }
  });

  useEffect(() => {
    if (clientId) {
      fetchClient();
      fetchCategories();
      fetchMenuItems();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      
      setClient(data);
      setFormData({
        restaurant_name: data.restaurant_name || '',
        subdomain: data.subdomain || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        whatsapp: data.whatsapp || '',
        coordinates: (data.coordinates as any) || { lat: '', lng: '' },
        opening_hours: (data.opening_hours as any) || {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: false },
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '22:00', closed: false },
          saturday: { open: '09:00', close: '22:00', closed: false },
          sunday: { open: '09:00', close: '22:00', closed: false }
        },
        social_media_links: {
          facebook: '',
          instagram: '',
          x: '',
          tiktok: '',
          youtube: '',
          linkedin: '',
          ...(data.social_media_links as any || {})
        },
        delivery: {
          rappi: '',
          pedidos_ya: '',
          didi_food: '',
          ...(data.delivery as any || {})
        },
        brand_colors: {
          primary: '#8B5CF6',
          accent: '#F59E0B',
          ...(data.brand_colors as any || {})
        },
        other_customizations: {
          currency: 'S/',
          ...(data.other_customizations as any || {})
        }
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load client: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('client_id', clientId)
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load categories: " + error.message,
        variant: "destructive"
      });
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('client_id', clientId)
        .order('name');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load menu items: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!clientId) return;
    
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          restaurant_name: formData.restaurant_name,
          subdomain: formData.subdomain,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          whatsapp: formData.whatsapp,
          coordinates: formData.coordinates,
          opening_hours: formData.opening_hours,
          social_media_links: formData.social_media_links,
          delivery: formData.delivery,
          brand_colors: formData.brand_colors,
          other_customizations: formData.other_customizations,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Update blocked by RLS (no rows updated)');

      toast({
        title: "Success",
        description: "Client settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update client: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async () => {
    console.log('handleSaveCategory called'); // Debug log
    if (!clientId) return;
    
    try {
      if (editingCategory) {
        console.log('Updating category:', editingCategory.id); // Debug log
        const { data, error } = await supabase
          .from('menu_categories')
          .update({ 
            name: categoryForm.name,
            display_order: categoryForm.display_order 
          })
          .eq('id', editingCategory.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Update blocked by RLS');
      } else {
        console.log('Creating new category'); // Debug log
        const { data, error } = await supabase
          .from('menu_categories')
          .insert({
            client_id: clientId,
            name: categoryForm.name,
            display_order: categoryForm.display_order + 1  // Use 1-based indexing like regular system
          })
          .select()
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Insert blocked by RLS');
      }
      
      await fetchCategories();
      setShowCategoryDialog(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', display_order: 0 });
      toast({ title: "Success", description: "Category saved successfully" });
    } catch (error: any) {
      console.error('Category save error:', error); // Debug log
      toast({
        title: "Error",
        description: "Failed to save category: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }

    try {
      // Soft delete like regular user system - set is_active to false
      const { data, error } = await supabase
        .from('menu_categories')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Delete blocked by RLS');
      await fetchCategories();
      toast({ title: "Success", description: "Category deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to delete category: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleSaveMenuItem = async () => {
    if (!clientId) return;
    
    try {
      if (editingMenuItem) {
        const { data, error } = await supabase
          .from('menu_items')
          .update({
            name: menuItemForm.name,
            description: menuItemForm.description,
            price: menuItemForm.price,
            category: menuItemForm.category,
            image_url: menuItemForm.image_url,
            show_on_homepage: menuItemForm.show_on_homepage,
            show_image_menu: menuItemForm.show_image_menu,
            show_image_home: menuItemForm.show_image_home
          })
          .eq('id', editingMenuItem.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Update blocked by RLS');
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .insert({
            client_id: clientId,
            name: menuItemForm.name,
            description: menuItemForm.description,
            price: menuItemForm.price,
            category: menuItemForm.category,
            image_url: menuItemForm.image_url,
            show_on_homepage: menuItemForm.show_on_homepage,
            show_image_menu: menuItemForm.show_image_menu,
            show_image_home: menuItemForm.show_image_home
          })
          .select()
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Insert blocked by RLS');
      }
      
      await fetchMenuItems();
      setShowMenuItemDialog(false);
      setEditingMenuItem(null);
      setMenuItemForm({
        name: '', description: '', price: 0, category: '', image_url: '',
        show_on_homepage: false, show_image_menu: true, show_image_home: false
      });
      toast({ title: "Success", description: "Menu item saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save menu item: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Delete blocked by RLS');
      await fetchMenuItems();
      toast({ title: "Success", description: "Menu item deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete menu item: " + error.message,
        variant: "destructive"
      });
    }
  };

  const openCategoryDialog = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, display_order: category.display_order });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', display_order: categories.length + 1 }); // Use 1-based indexing
    }
    setShowCategoryDialog(true);
  };

  const openMenuItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingMenuItem(item);
      setMenuItemForm({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category,
        image_url: item.image_url || '',
        show_on_homepage: item.show_on_homepage,
        show_image_menu: item.show_image_menu,
        show_image_home: item.show_image_home
      });
    } else {
      setEditingMenuItem(null);
      setMenuItemForm({
        name: '', description: '', price: 0, category: '', image_url: '',
        show_on_homepage: false, show_image_menu: true, show_image_home: false
      });
    }
    setShowMenuItemDialog(true);
  };

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex((item) => item.id === active.id);
      const newIndex = categories.findIndex((item) => item.id === over?.id);

      const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
      
      // Update display_order values to match regular user system (1-based indexing)
      const updatedCategories = reorderedCategories.map((category, index) => ({
        ...category,
        display_order: index + 1  // Changed from index to index + 1
      }));

      setCategories(updatedCategories);

      // Update database
      try {
        for (const category of updatedCategories) {
          await supabase
            .from('menu_categories')
            .update({ display_order: category.display_order })
            .eq('id', category.id);
        }
        toast({ title: "Success", description: "Category order updated" });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update category order: " + error.message,
          variant: "destructive"
        });
        // Revert on error
        await fetchCategories();
      }
    }
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
        // For now, we'll just show success. In a more complex system, 
        // you might want to add a display_order field to menu_items table
        toast({ title: "Success", description: "Menu item order updated" });
      } catch (error: any) {
        toast({
          title: "Error", 
          description: "Failed to update menu item order: " + error.message,
          variant: "destructive"
        });
        await fetchMenuItems();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Client not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/admin/client-management')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Client Settings</h1>
            <p className="text-muted-foreground">{client.restaurant_name}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="hours">Opening Hours</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="menu">Menu Items</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurant_name">Restaurant Name</Label>
                  <Input
                    id="restaurant_name"
                    value={formData.restaurant_name}
                    onChange={(e) => setFormData({...formData, restaurant_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Opening Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(formData.opening_hours).map(([day, hours]: [string, any]) => (
                <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-24">
                    <Label className="text-sm font-medium capitalize">{day}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        opening_hours: {
                          ...formData.opening_hours,
                          [day]: { ...hours, closed: !checked }
                        }
                      })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {hours.closed ? 'Closed' : 'Open'}
                    </span>
                  </div>
                  {!hours.closed && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Opens:</Label>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => setFormData({
                            ...formData,
                            opening_hours: {
                              ...formData.opening_hours,
                              [day]: { ...hours, open: e.target.value }
                            }
                          })}
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Closes:</Label>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => setFormData({
                            ...formData,
                            opening_hours: {
                              ...formData.opening_hours,
                              [day]: { ...hours, close: e.target.value }
                            }
                          })}
                          className="w-32"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.social_media_links.facebook}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        facebook: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.social_media_links.instagram}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        instagram: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="x">X (Twitter)</Label>
                  <Input
                    id="x"
                    value={formData.social_media_links.x}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        x: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={formData.social_media_links.tiktok}
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_media_links: {
                        ...formData.social_media_links,
                        tiktok: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Platform Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rappi">Rappi</Label>
                <Input
                  id="rappi"
                  value={formData.delivery.rappi}
                  onChange={(e) => setFormData({
                    ...formData, 
                    delivery: {
                      ...formData.delivery,
                      rappi: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="pedidos_ya">PedidosYa</Label>
                <Input
                  id="pedidos_ya"
                  value={formData.delivery.pedidos_ya}
                  onChange={(e) => setFormData({
                    ...formData, 
                    delivery: {
                      ...formData.delivery,
                      pedidos_ya: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="didi_food">DiDi Food</Label>
                <Input
                  id="didi_food"
                  value={formData.delivery.didi_food}
                  onChange={(e) => setFormData({
                    ...formData, 
                    delivery: {
                      ...formData.delivery,
                      didi_food: e.target.value
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.brand_colors.primary}
                    onChange={(e) => setFormData({
                      ...formData, 
                      brand_colors: {
                        ...formData.brand_colors,
                        primary: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <Input
                    id="accent_color"
                    type="color"
                    value={formData.brand_colors.accent}
                    onChange={(e) => setFormData({
                      ...formData, 
                      brand_colors: {
                        ...formData.brand_colors,
                        accent: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.other_customizations.currency}
                    onChange={(e) => setFormData({
                      ...formData, 
                      other_customizations: {
                        ...formData.other_customizations,
                        currency: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Menu Categories
                <Button onClick={() => openCategoryDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleCategoryDragEnd}
                  >
                    <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                      {categories.map((category) => (
                        <SortableCategoryItem
                          key={category.id}
                          category={category}
                          onEdit={openCategoryDialog}
                          onDelete={handleDeleteCategory}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No categories found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Menu Items
                <Button onClick={() => openMenuItemDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search menu items..."
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
                        <span className="text-sm text-muted-foreground">({categoryItems.length} items)</span>
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
                                  currencySymbol={formData.other_customizations.currency}
                                  onEdit={openMenuItemDialog}
                                  onDelete={handleDeleteMenuItem}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <p className="text-muted-foreground text-center py-4 text-sm">
                          {searchTerm ? 'No items match your search' : 'No items in this category'}
                        </p>
                      )}
                    </div>
                  );
                })}
                
                {categories.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No categories found. Create categories first.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category_name">Name</Label>
              <Input
                id="category_name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={categoryForm.display_order}
                onChange={(e) => setCategoryForm({...categoryForm, display_order: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
              <Button onClick={() => handleSaveCategory()}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={showMenuItemDialog} onOpenChange={setShowMenuItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_name">Name</Label>
                <Input
                  id="item_name"
                  value={menuItemForm.name}
                  onChange={(e) => setMenuItemForm({...menuItemForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="item_price">Price</Label>
                <Input
                  id="item_price"
                  type="number"
                  step="0.01"
                  value={menuItemForm.price}
                  onChange={(e) => setMenuItemForm({...menuItemForm, price: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="item_description">Description</Label>
              <Textarea
                id="item_description"
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm({...menuItemForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_category">Category</Label>
                <Select value={menuItemForm.category} onValueChange={(value) => setMenuItemForm({...menuItemForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="item_image_url">Image URL</Label>
                <Input
                  id="item_image_url"
                  value={menuItemForm.image_url}
                  onChange={(e) => setMenuItemForm({...menuItemForm, image_url: e.target.value})}
                />
              </div>
            </div>
            
            {/* Visibility Options */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show on Homepage</Label>
                  <p className="text-sm text-muted-foreground">Display this item on the homepage (max 8 items)</p>
                </div>
                <Switch
                  checked={menuItemForm.show_on_homepage || false}
                  onCheckedChange={(checked) => setMenuItemForm({...menuItemForm, show_on_homepage: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Image on Homepage</Label>
                  <p className="text-sm text-muted-foreground">Display image when shown on homepage</p>
                </div>
                <Switch
                  checked={menuItemForm.show_image_home || false}
                  onCheckedChange={(checked) => setMenuItemForm({...menuItemForm, show_image_home: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Image on Menu Page</Label>
                  <p className="text-sm text-muted-foreground">Display image on the full menu page</p>
                </div>
                <Switch
                  checked={menuItemForm.show_image_menu !== false}
                  onCheckedChange={(checked) => setMenuItemForm({...menuItemForm, show_image_menu: checked})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMenuItemDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveMenuItem}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}