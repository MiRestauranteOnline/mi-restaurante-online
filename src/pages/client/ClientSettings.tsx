import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save } from 'lucide-react';
import { AnalyticsOverview } from '@/components/client/AnalyticsOverview';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { timezones } from '@/data/timezones';
import { countries } from '@/data/countries';

import { useLanguage } from '@/contexts/LanguageContext';

interface ClientContext {
  selectedClientId: string;
  selectedClient: any;
}

export default function ClientSettings() {
  const { selectedClientId } = useOutletContext<ClientContext>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [premiumFeatures, setPremiumFeatures] = useState<any>(null);
  const [planType, setPlanType] = useState<string>('basic');
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (selectedClientId) {
      fetchClientData();
      fetchPremiumFeatures();
    }
  }, [selectedClientId]);

  const fetchPremiumFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_features')
        .select('*')
        .eq('client_id', selectedClientId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPremiumFeatures(data);
        setFormData((prev: any) => ({
          ...prev,
          google_analytics_id: data.google_analytics_id || '',
          google_search_console_verification: data.google_search_console_verification || '',
          analytics_enabled: data.analytics_enabled || false,
        }));
      }
    } catch (error: any) {
      console.error('Error fetching premium features:', error);
    }
  };

  const fetchClientData = async () => {
    try {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', selectedClientId)
        .single();

      if (clientError) throw clientError;
      
      // Set plan type for conditional rendering
      setPlanType(client.plan_type || 'basic');

      const { data: settings, error: settingsError } = await supabase
        .from('client_settings')
        .select('*')
        .eq('client_id', selectedClientId)
        .single();

      setFormData({
        ...client,
        ...settings,
        other_customizations: client?.other_customizations || {},
        delivery_info: settings?.delivery_info || {},
        whatsapp_messages: settings?.whatsapp_messages || {}
      });

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
          other_customizations: formData.other_customizations,
          timezone: formData.timezone,
          country_code: formData.country_code,
          locale: formData.locale
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
        }, {
          onConflict: 'client_id'
        });

      if (settingsError) throw settingsError;

      // Update premium features if analytics fields are present
      if (formData.google_analytics_id !== undefined || 
          formData.google_search_console_verification !== undefined ||
          formData.analytics_enabled !== undefined) {
        const { error: premiumError } = await supabase
          .from('premium_features')
          .upsert({
            client_id: selectedClientId,
            google_analytics_id: formData.google_analytics_id || null,
            google_search_console_verification: formData.google_search_console_verification || null,
            analytics_enabled: formData.analytics_enabled || false,
            analytics_setup_date: formData.analytics_enabled && formData.google_analytics_id 
              ? new Date().toISOString() 
              : null,
          }, {
            onConflict: 'client_id'
          });

        if (premiumError) throw premiumError;
      }

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
        <h1 className="text-2xl font-bold">{t('nav.settings')}</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {t('common.save')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="general">{t('settings.general')}</SelectItem>
              <SelectItem value="appearance">{t('settings.appearance')}</SelectItem>
              <SelectItem value="contact">{t('settings.contact')}</SelectItem>
              {planType === 'advanced' && <SelectItem value="analytics">Analíticas</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="restaurant_name">Nombre del Restaurante</Label>
                <Input
                  id="restaurant_name"
                  value={formData.restaurant_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, restaurant_name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="country_code">País</Label>
                <Select
                  value={formData.country_code || 'PE'}
                  onValueChange={(value) => {
                    const selectedCountry = countries.find(c => c.code === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      country_code: value,
                      locale: selectedCountry?.locale || 'es-PE'
                    }));
                  }}
                >
                  <SelectTrigger id="country_code">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Usado para SEO y configuración regional del sitio
                </p>
              </div>

              <div>
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Select
                  value={formData.timezone || 'America/Lima'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Asegura que las reservas y horarios se muestren correctamente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary_color">Color Primario</Label>
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color || '#FFD700'}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="hide_phone_button_menu"
                  checked={formData.hide_phone_button_menu || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hide_phone_button_menu: checked }))}
                />
                <Label htmlFor="hide_phone_button_menu">Ocultar Botón de Teléfono en Menú</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hide_whatsapp_button_menu"
                  checked={formData.hide_whatsapp_button_menu || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hide_whatsapp_button_menu: checked }))}
                />
                <Label htmlFor="hide_whatsapp_button_menu">Ocultar Botón de WhatsApp en Menú</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
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
                      social_media_links: { ...prev.social_media_links, facebook: e.target.value }
                    }))}
                    placeholder="https://facebook.com/mirestaurante"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.social_media_links?.instagram || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      social_media_links: { ...prev.social_media_links, instagram: e.target.value }
                    }))}
                    placeholder="https://instagram.com/mirestaurante"
                  />
                </div>

                <div>
                  <Label htmlFor="x">X (Twitter)</Label>
                  <Input
                    id="x"
                    value={formData.social_media_links?.x || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      social_media_links: { ...prev.social_media_links, x: e.target.value }
                    }))}
                    placeholder="https://x.com/mirestaurante"
                  />
                </div>

                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={formData.social_media_links?.tiktok || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      social_media_links: { ...prev.social_media_links, tiktok: e.target.value }
                    }))}
                    placeholder="https://tiktok.com/@mirestaurante"
                  />
                </div>

                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={formData.social_media_links?.youtube || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      social_media_links: { ...prev.social_media_links, youtube: e.target.value }
                    }))}
                    placeholder="https://youtube.com/@mirestaurante"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.social_media_links?.linkedin || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      social_media_links: { ...prev.social_media_links, linkedin: e.target.value }
                    }))}
                    placeholder="https://linkedin.com/company/mirestaurante"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {planType === 'advanced' && <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Analíticas</CardTitle>
              <CardDescription>
                Conecta Google Analytics y Search Console para rastrear el rendimiento de tu sitio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Analytics Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Google Analytics (GA4)</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="analytics_enabled"
                    checked={formData.analytics_enabled || false}
                    onCheckedChange={(checked) => setFormData({...formData, analytics_enabled: checked})}
                  />
                  <Label htmlFor="analytics_enabled">Habilitar Analíticas</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="google_analytics_id">ID de Google Analytics (GA4)</Label>
                  <Input
                    id="google_analytics_id"
                    value={formData.google_analytics_id || ''}
                    onChange={(e) => setFormData({...formData, google_analytics_id: e.target.value})}
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa tu ID de medición de Google Analytics 4. Formato: G-XXXXXXXXXX
                  </p>
                </div>
              </div>

              <Separator />

              {/* Google Search Console Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Google Search Console</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="google_search_console_verification">Código de Verificación GSC</Label>
                  <Input
                    id="google_search_console_verification"
                    value={formData.google_search_console_verification || ''}
                    onChange={(e) => setFormData({...formData, google_search_console_verification: e.target.value})}
                    placeholder="código de verificación"
                  />
                  <p className="text-xs text-muted-foreground">
                    Pega solo el contenido del atributo "content" de la etiqueta meta de verificación
                  </p>
                </div>
              </div>

              <Separator />

              {/* Link to Guides */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100 mb-3">
                  ¿Necesitas ayuda? Consulta nuestras guías paso a paso:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/guias/analiticas/configurar-google-analytics" target="_blank" rel="noopener noreferrer">
                      Guía de Google Analytics
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/guias/analiticas/configurar-google-search-console" target="_blank" rel="noopener noreferrer">
                      Guía de Google Search Console
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Uso</CardTitle>
              <CardDescription>Métricas y analíticas de tu sitio web</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsOverview clientId={selectedClientId} />
            </CardContent>
          </Card>
        </TabsContent>}
      </Tabs>
    </div>
  );
}