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
import { useDashboardLanguage } from '@/contexts/DashboardLanguageContext';
import { ImageUpload } from "@/components/ImageUpload";
import { CustomImagesManager } from "@/components/client/CustomImagesManager";
import { AnalyticsOverview } from "@/components/client/AnalyticsOverview";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const [carouselImages, setCarouselImages] = useState<any[]>([]);
  const [adminContent, setAdminContent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();
  const { t } = useDashboardLanguage();
  const isMobile = useIsMobile();

  const tabOptions = [
    { value: "basic", label: "General" },
    { value: "hours", label: "Horario" },
    { value: "social", label: "Social" },
    { value: "delivery", label: "Delivery" },
    { value: "menu", label: "Menú" },
    { value: "team", label: "Equipo" },
    { value: "reviews", label: "Reseñas" },
    { value: "analytics", label: "Analíticas" },
    { value: "carousel", label: "Carrusel" },
    { value: "custom-images", label: "Imágenes" },
  ];

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

      // Fetch admin content
      const { data: adminData, error: adminError } = await supabase
        .from('admin_content')
        .select('*')
        .eq('client_id', selectedClientId)
        .single();

      if (adminError && adminError.code !== 'PGRST116') {
        throw adminError;
      }

      // Fetch carousel images
      const { data: carouselData, error: carouselError } = await (supabase as any)
        .from('carousel_images')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('display_order');

      if (carouselError) throw carouselError;

      setFormData({
        ...client,
        ...settings,
        other_customizations: client?.other_customizations || {},
        delivery_info: settings?.delivery_info || {},
        whatsapp_messages: settings?.whatsapp_messages || {},
        opening_hours: client?.opening_hours || {},
        social_media_links: client?.social_media_links || {},
        delivery: client?.delivery || {},
        brand_colors: client?.brand_colors || {}
      });
      setMenuCategories(categories || []);
      setMenuItems(items || []);
      setTeamMembers(team || []);
      setReviews(reviewsData || []);
      setAdminContent(adminData || {});
      setCarouselImages(carouselData || []);

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

  const handleCarouselImageUpload = async (imageUrl: string) => {
    if (!selectedClientId || !imageUrl) return;

    try {
      const maxOrder = Math.max(...carouselImages.map(img => img.display_order), -1);
      
      const { error } = await (supabase as any)
        .from('carousel_images')
        .insert({
          client_id: selectedClientId,
          image_url: imageUrl,
          display_order: maxOrder + 1,
          is_active: true
        });

      if (error) throw error;
      
      await fetchData();
      toast({
        title: "Éxito",
        description: "Imagen agregada al carousel",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo agregar la imagen al carousel",
        variant: "destructive",
      });
    }
  };

  const handleCarouselImageDelete = async (imageId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('carousel_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      
      await fetchData();
      toast({
        title: "Éxito",
        description: "Imagen eliminada del carousel",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen del carousel",
        variant: "destructive",
      });
    }
  };

  const handleAdminContentSave = async (updatedContent = adminContent) => {
    try {
      // Ensure we update the existing row when present, otherwise insert
      let targetId = updatedContent?.id as string | undefined;

      if (!targetId) {
        const { data: existing, error: findError } = await supabase
          .from('admin_content')
          .select('id')
          .eq('client_id', selectedClientId)
          .maybeSingle();
        if (findError) throw findError;
        targetId = existing?.id;
      }

      let saved;
      if (targetId) {
        const { data, error } = await supabase
          .from('admin_content')
          .update({ ...updatedContent, client_id: selectedClientId })
          .eq('id', targetId)
          .select('*')
          .single();
        if (error) throw error;
        saved = data;
      } else {
        const { data, error } = await supabase
          .from('admin_content')
          .insert([{ client_id: selectedClientId, ...updatedContent }])
          .select('*')
          .single();
        if (error) throw error;
        saved = data;
      }

      setAdminContent(saved);
      toast({
        title: 'Guardado',
        description: 'Preferencias del carousel actualizadas',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la configuración del carousel',
        variant: 'destructive',
      });
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t('general.title')}</h1>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {t('common.save')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {isMobile ? (
          <div className="mb-4">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tabOptions.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-4">
            <TabsTrigger value="basic">{t('nav.general')}</TabsTrigger>
            <TabsTrigger value="hours">{t('general.openingHours')}</TabsTrigger>
            <TabsTrigger value="social">{t('general.socialMedia')}</TabsTrigger>
            <TabsTrigger value="delivery">{t('general.deliveryInfo')}</TabsTrigger>
            <TabsTrigger value="menu">{t('nav.menu')}</TabsTrigger>
            <TabsTrigger value="team">{t('nav.team')}</TabsTrigger>
            <TabsTrigger value="reviews">{t('nav.reviews')}</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
            <TabsTrigger value="carousel">{t('nav.carousel')}</TabsTrigger>
            <TabsTrigger value="custom-images">{t('nav.images')}</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>{t('general.title')}</CardTitle>
              <CardDescription>{t('general.description')}</CardDescription>
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
                  <Label htmlFor="phone">{t('general.phone')}</Label>
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
                <Label htmlFor="address">{t('general.address')}</Label>
                <Textarea
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ingresa la dirección completa de tu restaurante"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="hide_whatsapp_button_menu">Ocultar Botón WhatsApp del Menú</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hide_whatsapp_button_menu"
                      checked={formData.hide_whatsapp_button_menu || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hide_whatsapp_button_menu: checked }))}
                    />
                    <Label htmlFor="hide_whatsapp_button_menu" className="text-sm text-muted-foreground">
                      {formData.hide_whatsapp_button_menu ? 'Oculto' : 'Visible'}
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hide_phone_button_menu">Ocultar Botón Teléfono del Menú</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hide_phone_button_menu"
                      checked={formData.hide_phone_button_menu || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hide_phone_button_menu: checked }))}
                    />
                    <Label htmlFor="hide_phone_button_menu" className="text-sm text-muted-foreground">
                      {formData.hide_phone_button_menu ? 'Oculto' : 'Visible'}
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="show_whatsapp_popup">Mostrar Popup de WhatsApp</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_whatsapp_popup"
                      checked={formData.show_whatsapp_popup || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_whatsapp_popup: checked }))}
                    />
                    <Label htmlFor="show_whatsapp_popup" className="text-sm text-muted-foreground">
                      {formData.show_whatsapp_popup ? 'Habilitado' : 'Deshabilitado'}
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="custom_cta_button_text">Texto del Botón CTA Personalizado</Label>
                  <Input
                    id="custom_cta_button_text"
                    value={formData.custom_cta_button_text || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_cta_button_text: e.target.value }))}
                    placeholder="Contactar"
                  />
                </div>
                <div>
                  <Label htmlFor="custom_cta_button_link">Enlace del Botón CTA Personalizado</Label>
                  <Input
                    id="custom_cta_button_link"
                    value={formData.custom_cta_button_link || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_cta_button_link: e.target.value }))}
                    placeholder="#contact o https://example.com"
                  />
                </div>
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
            <CardContent className="space-y-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const hours = formData.opening_hours?.[day] || { closed: true, open: '09:00', close: '17:00' };
                const dayNames = {
                  monday: 'Lunes',
                  tuesday: 'Martes', 
                  wednesday: 'Miércoles',
                  thursday: 'Jueves',
                  friday: 'Viernes',
                  saturday: 'Sábado',
                  sunday: 'Domingo'
                };
                return (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 border rounded-lg">
                  <div className="sm:w-24">
                    <Label className="text-sm font-medium">{dayNames[day as keyof typeof dayNames]}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        opening_hours: {
                          ...prev.opening_hours,
                          [day]: { ...hours, closed: !checked }
                        }
                      }))}
                    />
                    <span className="text-sm text-muted-foreground">
                      {hours.closed ? 'Cerrado' : 'Abierto'}
                    </span>
                  </div>
                  {!hours.closed && (
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm whitespace-nowrap">Abre:</Label>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            opening_hours: {
                              ...prev.opening_hours,
                              [day]: { ...hours, open: e.target.value }
                            }
                          }))}
                          className="w-full sm:w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm whitespace-nowrap">Cierra:</Label>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            opening_hours: {
                              ...prev.opening_hours,
                              [day]: { ...hours, close: e.target.value }
                            }
                          }))}
                          className="w-full sm:w-32"
                        />
                      </div>
                    </div>
                  )}
                 </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>Configura los enlaces a tus redes sociales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.social_media_links?.facebook || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      social_media_links: {
                        ...prev.social_media_links,
                        facebook: e.target.value
                      }
                    }))}
                    placeholder="https://facebook.com/tu-restaurante"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.social_media_links?.instagram || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      social_media_links: {
                        ...prev.social_media_links,
                        instagram: e.target.value
                      }
                    }))}
                    placeholder="https://instagram.com/tu-restaurante"
                  />
                </div>
                <div>
                  <Label htmlFor="x">X (Twitter)</Label>
                  <Input
                    id="x"
                    value={formData.social_media_links?.x || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      social_media_links: {
                        ...prev.social_media_links,
                        x: e.target.value
                      }
                    }))}
                    placeholder="https://x.com/tu-restaurante"
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={formData.social_media_links?.tiktok || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      social_media_links: {
                        ...prev.social_media_links,
                        tiktok: e.target.value
                      }
                    }))}
                    placeholder="https://tiktok.com/@tu-restaurante"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Delivery</CardTitle>
              <CardDescription>Gestiona la información de entrega a domicilio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rappi">Rappi</Label>
                <Input
                  id="rappi"
                  value={formData.delivery?.rappi || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev, 
                    delivery: {
                      ...prev.delivery,
                      rappi: e.target.value
                    }
                  }))}
                  placeholder="https://rappi.com/tu-restaurante"
                />
              </div>
              <div>
                <Label htmlFor="pedidos_ya">PedidosYa</Label>
                <Input
                  id="pedidos_ya"
                  value={formData.delivery?.pedidos_ya || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev, 
                    delivery: {
                      ...prev.delivery,
                      pedidos_ya: e.target.value
                    }
                  }))}
                  placeholder="https://pedidosya.com/tu-restaurante"
                />
              </div>
              <div>
                <Label htmlFor="didi_food">DiDi Food</Label>
                <Input
                  id="didi_food"
                  value={formData.delivery?.didi_food || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev, 
                    delivery: {
                      ...prev.delivery,
                      didi_food: e.target.value
                    }
                  }))}
                  placeholder="https://didifood.com/tu-restaurante"
                />
              </div>
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Categorías Activas</h4>
                      <p className="text-xl sm:text-2xl font-bold text-primary">{menuCategories.filter(c => c.is_active).length}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">de {menuCategories.length} total</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Elementos del Menú</h4>
                      <p className="text-xl sm:text-2xl font-bold text-primary">{menuItems.filter(i => i.is_active).length}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">de {menuItems.length} total</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">En Página Principal</h4>
                      <p className="text-xl sm:text-2xl font-bold text-primary">{menuItems.filter(i => i.show_on_homepage).length}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">elementos destacados</p>
                    </div>
                  </div>
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      La gestión completa del menú estará disponible próximamente.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Por ahora, contacta a soporte para hacer cambios en tu menú.
                    </p>
                  </div>
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
                {teamMembers.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {teamMembers.filter(m => m.is_active).slice(0, 6).map((member) => (
                      <div key={member.id} className="p-4 border rounded-lg text-left">
                        <div className="flex items-center gap-3 mb-2">
                          {member.image_url && (
                            <img src={member.image_url} alt={member.name} className="w-10 h-10 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm truncate">{member.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{member.title}</p>
                          </div>
                        </div>
                        {member.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{member.bio}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-center pt-4 border-t mt-6">
                  <p className="text-sm text-muted-foreground mb-4">
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
                {reviews.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {reviews.filter(r => r.is_active).slice(0, 4).map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm truncate">{review.reviewer_name}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < review.star_rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">{review.review_text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-center pt-4 border-t mt-6">
                  <p className="text-sm text-muted-foreground mb-4">
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

        <TabsContent value="carousel">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Carousel</CardTitle>
                <CardDescription>
                  Configura las opciones de visualización del carousel de imágenes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="carousel-enabled">{t('carousel.showCarousel')}</Label>
                      <p className="text-sm text-muted-foreground">
                        Activa o desactiva el carousel en la página principal
                      </p>
                    </div>
                    <Switch
                      id="carousel-enabled"
                      checked={adminContent?.carousel_enabled ?? true}
                      onCheckedChange={async (checked) => {
                        const updatedContent = { ...adminContent, carousel_enabled: checked };
                        setAdminContent(updatedContent);
                        await handleAdminContentSave(updatedContent);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carousel-order">{t('carousel.position')}</Label>
                    <Select
                      value={adminContent?.carousel_display_order ? adminContent.carousel_display_order.toString() : undefined}
                      onValueChange={async (value) => {
                        const updatedContent = { ...adminContent, carousel_display_order: parseInt(value) };
                        setAdminContent(updatedContent);
                        await handleAdminContentSave(updatedContent);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('carousel.position1')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">{t('carousel.position1')}</SelectItem>
                        <SelectItem value="4">{t('carousel.position2')}</SelectItem>
                        <SelectItem value="5">{t('carousel.position3')}</SelectItem>
                        <SelectItem value="6">{t('carousel.position4')}</SelectItem>
                        <SelectItem value="7">{t('carousel.position5')}</SelectItem>
                        <SelectItem value="8">{t('carousel.position6')}</SelectItem>
                        <SelectItem value="9">{t('carousel.position7')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Imágenes del Carousel</CardTitle>
                <CardDescription>
                  Sube y gestiona las imágenes que aparecerán en el carousel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-4 border-2 border-dashed rounded-lg">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // This would need actual file upload logic
                          toast({
                            title: "Próximamente",
                            description: "La funcionalidad de carga de imágenes estará disponible próximamente",
                          });
                        }
                      }}
                      className="hidden"
                      id="carousel-upload"
                    />
                    <label htmlFor="carousel-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Haz clic para agregar una imagen al carousel
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  {carouselImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {carouselImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.image_url}
                            alt={image.alt_text || "Imagen del carousel"}
                            className="w-full h-32 sm:h-24 object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => handleCarouselImageDelete(image.id)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center text-sm sm:text-xs opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Tienes {carouselImages.length} imágenes en el carousel
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsOverview clientId={selectedClientId} />
        </TabsContent>

        <TabsContent value="custom-images">
          <Card>
            <CardHeader>
              <CardTitle>Mis Imágenes Personalizadas</CardTitle>
              <CardDescription>
                Gestiona las imágenes que subiste durante el registro. Haz clic en cualquier imagen para copiar su URL.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomImagesManager selectedClientId={selectedClientId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}