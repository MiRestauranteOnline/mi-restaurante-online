import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Trash2, Edit, Search, GripVertical, FolderPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { useLanguage } from '@/contexts/LanguageContext';

interface ClientContext {
  selectedClientId: string;
  selectedClient: any;
}

interface Client {
  id: string;
  restaurant_name: string;
  subdomain: string;
  email?: string;
  phone?: string;
  phone_country_code?: string;
  address?: string;
  whatsapp?: string;
  whatsapp_country_code?: string;
  coordinates?: any;
  opening_hours?: any;
  social_media_links?: any;
  brand_colors?: any;
  delivery?: any;
  other_customizations?: any;
  theme?: string;
}

interface ClientSettings {
  id: string;
  client_id: string;
  primary_color: string;
  header_background_enabled: boolean;
  header_background_style: string;
  hide_whatsapp_button_menu?: boolean;
  hide_phone_button_menu?: boolean;
  custom_cta_button_text?: string;
  custom_cta_button_link?: string;
  show_whatsapp_popup?: boolean;
  delivery_info?: any;
  whatsapp_messages?: any;
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
  category?: string;
  category_id?: string | null;
  image_url?: string;
  is_active: boolean;
  client_id: string;
  show_on_homepage: boolean;
  show_image_menu: boolean;
  show_image_home: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  client_id: string;
}

interface Review {
  id: string;
  reviewer_name: string;
  review_text: string;
  star_rating: number;
  display_order: number;
  is_active: boolean;
  client_id: string;
}

// This is the same settings interface as admin, but with limited tabs
// Excluded tabs: Domain, Branding, Change Content, Briefing

export default function ClientDashboard() {
  const { selectedClientId } = useOutletContext<ClientContext>();
  const [formData, setFormData] = useState<Client & ClientSettings>({} as any);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (selectedClientId) {
      fetchData();
    }
  }, [selectedClientId]);

  const fetchData = async () => {
    try {
      // Fetch client data
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', selectedClientId)
        .single();

      if (clientError) throw clientError;

      // Fetch client settings
      const { data: settings, error: settingsError } = await supabase
        .from('client_settings')
        .select('*')
        .eq('client_id', selectedClientId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      // Fetch menu categories
      const { data: categories, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Fetch menu items
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('client_id', selectedClientId);

      if (itemsError) throw itemsError;

      // Fetch team members
      const { data: team, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('display_order');

      if (teamError) throw teamError;

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('display_order');

      if (reviewsError) throw reviewsError;

      setFormData({
        ...client,
        ...settings,
        other_customizations: client?.other_customizations || {},
        delivery_info: settings?.delivery_info || {},
        whatsapp_messages: settings?.whatsapp_messages || {}
      });
      setMenuCategories(categories || []);
      setMenuItems(items || []);
      setTeamMembers(team || []);
      setReviews(reviewsData || []);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al cargar los datos: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update clients table
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          restaurant_name: formData.restaurant_name,
          email: formData.email,
          phone: formData.phone,
          phone_country_code: formData.phone_country_code,
          address: formData.address,
          whatsapp: formData.whatsapp,
          whatsapp_country_code: formData.whatsapp_country_code,
          coordinates: formData.coordinates,
          opening_hours: formData.opening_hours,
          social_media_links: formData.social_media_links,
          delivery: formData.delivery,
          other_customizations: formData.other_customizations
        })
        .eq('id', selectedClientId);

      if (clientError) throw clientError;

      // Update or insert client_settings
      const { error: settingsError } = await supabase
        .from('client_settings')
        .upsert({
          client_id: selectedClientId,
          primary_color: formData.primary_color,
          header_background_enabled: formData.header_background_enabled,
          header_background_style: formData.header_background_style,
          hide_phone_button_menu: formData.hide_phone_button_menu,
          hide_whatsapp_button_menu: formData.hide_whatsapp_button_menu,
          custom_cta_button_text: formData.custom_cta_button_text,
          custom_cta_button_link: formData.custom_cta_button_link,
          show_whatsapp_popup: formData.show_whatsapp_popup,
          delivery_info: formData.delivery_info,
          whatsapp_messages: formData.whatsapp_messages
        });

      if (settingsError) throw settingsError;

      toast({
        title: "Guardado",
        description: "La configuración ha sido guardada exitosamente",
      });

    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Error al guardar: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuración del Restaurante</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="hours">Horarios</TabsTrigger>
          <TabsTrigger value="social">Redes Sociales</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="menu">Menú</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Configura la información principal de tu restaurante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurant_name">Nombre del Restaurante</Label>
                  <Input
                    id="restaurant_name"
                    value={formData.restaurant_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurant_name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email de Contacto</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+51 999 999 999"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+51 999 999 999"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ingresa la dirección completa de tu restaurante"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Atención</CardTitle>
              <CardDescription>Define los horarios de tu restaurante</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configuración de horarios próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>Configura los enlaces a tus redes sociales</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configuración de redes sociales próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Delivery</CardTitle>
              <CardDescription>Gestiona la información de entrega a domicilio</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configuración de delivery próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Menú</CardTitle>
              <CardDescription>Administra las categorías y elementos de tu menú</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Gestión de Menú</h3>
                <p className="text-muted-foreground mb-4">
                  Tienes {menuCategories.length} categorías y {menuItems.length} elementos en tu menú
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    La gestión completa del menú estará disponible próximamente.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Por ahora, contacta a soporte para hacer cambios en tu menú.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Miembros del Equipo</CardTitle>
              <CardDescription>Gestiona la información de tu equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Equipo del Restaurante</h3>
                <p className="text-muted-foreground mb-4">
                  Tienes {teamMembers.length} miembros en tu equipo
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    La gestión del equipo estará disponible próximamente.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Por ahora, contacta a soporte para hacer cambios en la información del equipo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reseñas</CardTitle>
              <CardDescription>Gestiona las reseñas de tu restaurante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Reseñas de Clientes</h3>
                <p className="text-muted-foreground mb-4">
                  Tienes {reviews.length} reseñas publicadas
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    La gestión de reseñas estará disponible próximamente.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Por ahora, contacta a soporte para gestionar las reseñas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}