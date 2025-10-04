import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (selectedClientId) {
      fetchClientData();
    }
  }, [selectedClientId]);

  const fetchClientData = async () => {
    try {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', selectedClientId)
        .single();

      if (clientError) throw clientError;

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
        <h1 className="text-2xl font-bold">{t('nav.settings')}</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {t('common.save')}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('settings.appearance')}</TabsTrigger>
          <TabsTrigger value="contact">{t('settings.contact')}</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

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

              <div className="flex items-center space-x-2">
                <Switch
                  id="header_background_enabled"
                  checked={formData.header_background_enabled || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, header_background_enabled: checked }))}
                />
                <Label htmlFor="header_background_enabled">Fondo del Header Habilitado</Label>
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
        </TabsContent>
      <TabsContent value="analytics" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Analíticas</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsOverview clientId={selectedClientId} />
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </div>
  );
}