import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Shield, Cookie, FileCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { generatePrivacyPolicy, generateCookiesPolicy, generateTermsOfService } from '@/lib/policyTemplates';

interface ClientPoliciesData {
  id?: string;
  client_id: string;
  reclamaciones_enabled: boolean;
  reclamaciones_email: string | null;
  privacy_policy_enabled: boolean;
  privacy_policy_content: string | null;
  cookies_policy_enabled: boolean;
  cookies_policy_content: string | null;
  terms_of_service_enabled: boolean;
  terms_of_service_content: string | null;
}

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link'];

export default function ClientPolicies() {
  const { selectedClientId, selectedClient } = useOutletContext<any>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ClientPoliciesData>({
    client_id: selectedClientId,
    reclamaciones_enabled: true,
    reclamaciones_email: null,
    privacy_policy_enabled: false,
    privacy_policy_content: null,
    cookies_policy_enabled: false,
    cookies_policy_content: null,
    terms_of_service_enabled: false,
    terms_of_service_content: null,
  });

  useEffect(() => {
    if (selectedClientId) {
      loadPoliciesData();
    }
  }, [selectedClientId]);

  const loadPoliciesData = async () => {
    try {
      setLoading(true);
      
      const { data: policiesData, error } = await supabase
        .from('client_policies')
        .select('*')
        .eq('client_id', selectedClientId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (policiesData) {
        setFormData(policiesData);
      } else {
        // Generate initial policies from templates and persist immediately
        const { data: clientData } = await supabase
          .from('clients')
          .select('restaurant_name, razon_social, ruc, email, phone, address')
          .eq('id', selectedClientId)
          .single();

        if (clientData) {
          const policyData = {
            restaurantName: clientData.restaurant_name,
            razonSocial: clientData.razon_social,
            ruc: clientData.ruc,
            email: clientData.email || 'info@ejemplo.com',
            phone: clientData.phone || '+51 999 999 999',
            address: clientData.address || 'Lima, Perú',
          };

          const dataToInsert = {
            client_id: selectedClientId,
            reclamaciones_enabled: true,
            reclamaciones_email: selectedClient?.email || clientData.email || null,
            privacy_policy_enabled: false,
            privacy_policy_content: generatePrivacyPolicy(policyData),
            cookies_policy_enabled: false,
            cookies_policy_content: generateCookiesPolicy(policyData),
            terms_of_service_enabled: false,
            terms_of_service_content: generateTermsOfService(policyData),
          };

          const { data: inserted, error: insertError } = await supabase
            .from('client_policies')
            .insert(dataToInsert)
            .select('*')
            .single();

          if (insertError) throw insertError;

          setFormData(inserted as ClientPoliciesData);
        }
      }
    } catch (error: any) {
      console.error('Error loading policies:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar la configuración de políticas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const dataToSave = {
        client_id: selectedClientId,
        reclamaciones_enabled: formData.reclamaciones_enabled,
        reclamaciones_email: formData.reclamaciones_email || selectedClient?.email,
        privacy_policy_enabled: formData.privacy_policy_enabled,
        privacy_policy_content: formData.privacy_policy_content,
        cookies_policy_enabled: formData.cookies_policy_enabled,
        cookies_policy_content: formData.cookies_policy_content,
        terms_of_service_enabled: formData.terms_of_service_enabled,
        terms_of_service_content: formData.terms_of_service_content,
      };

      // Check if record exists
      const { data: existing } = await supabase
        .from('client_policies')
        .select('id')
        .eq('client_id', selectedClientId)
        .single();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('client_policies')
          .update(dataToSave)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('client_policies')
          .insert(dataToSave);
        if (error) throw error;
      }

      toast({
        title: 'Éxito',
        description: 'Configuración guardada correctamente',
      });

      await loadPoliciesData();
    } catch (error: any) {
      console.error('Error saving policies:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al guardar la configuración',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Políticas</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las políticas y páginas legales de tu restaurante
        </p>
      </div>

      <Tabs defaultValue="reclamaciones" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reclamaciones" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Libro de Reclamaciones</span>
            <span className="sm:hidden">Reclamaciones</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacidad</span>
            <span className="sm:hidden">Privacidad</span>
          </TabsTrigger>
          <TabsTrigger value="cookies" className="gap-2">
            <Cookie className="h-4 w-4" />
            <span className="hidden sm:inline">Cookies</span>
            <span className="sm:hidden">Cookies</span>
          </TabsTrigger>
          <TabsTrigger value="terms" className="gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Términos</span>
            <span className="sm:hidden">Términos</span>
          </TabsTrigger>
        </TabsList>

        {/* Libro de Reclamaciones Tab */}
        <TabsContent value="reclamaciones">
          <Card>
            <CardHeader>
              <CardTitle>Libro de Reclamaciones</CardTitle>
              <CardDescription>
                Configura el formulario del Libro de Reclamaciones para tu restaurante.
                Cuando está habilitado, aparecerá un enlace en el footer de tu sitio web.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  El Libro de Reclamaciones es obligatorio en Perú según la Ley N.º 29571.
                  Los clientes podrán enviar sus reclamos y quejas a través de un formulario web.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reclamaciones-enabled">Mostrar Libro de Reclamaciones</Label>
                    <p className="text-sm text-muted-foreground">
                      Activa o desactiva el enlace al Libro de Reclamaciones en tu sitio
                    </p>
                  </div>
                  <Switch
                    id="reclamaciones-enabled"
                    checked={formData.reclamaciones_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, reclamaciones_enabled: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reclamaciones-email">
                    Email para Recibir Reclamaciones
                  </Label>
                  <Input
                    id="reclamaciones-email"
                    type="email"
                    placeholder={selectedClient?.email || 'restaurante@ejemplo.com'}
                    value={formData.reclamaciones_email || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, reclamaciones_email: e.target.value })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.reclamaciones_email
                      ? 'Se enviará una copia del reclamo a este email'
                      : `Por defecto se usará: ${selectedClient?.email || 'tu email de cuenta'}`}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Policy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Política de Privacidad</CardTitle>
              <CardDescription>
                Personaliza tu política de privacidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="privacy-enabled">Habilitar Política de Privacidad</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar en el footer de tu sitio web
                  </p>
                </div>
                <Switch
                  id="privacy-enabled"
                  checked={formData.privacy_policy_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, privacy_policy_enabled: checked })}
                />
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Los datos dinámicos (nombre, RUC, Razón Social) se actualizan desde <strong>Información General</strong>.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Contenido</Label>
                <ReactQuill
                  theme="snow"
                  value={formData.privacy_policy_content || ''}
                  onChange={(content) => setFormData({ ...formData, privacy_policy_content: content })}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ minHeight: '300px' }}
                />
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cookies Policy Tab */}
        <TabsContent value="cookies">
          <Card>
            <CardHeader>
              <CardTitle>Política de Cookies</CardTitle>
              <CardDescription>
                Personaliza tu política de cookies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cookies-enabled">Habilitar Política de Cookies</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar en el footer de tu sitio web
                  </p>
                </div>
                <Switch
                  id="cookies-enabled"
                  checked={formData.cookies_policy_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, cookies_policy_enabled: checked })}
                />
              </div>

              <Alert>
                <Cookie className="h-4 w-4" />
                <AlertDescription>
                  Los datos dinámicos (nombre, RUC, Razón Social) se actualizan desde <strong>Información General</strong>.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Contenido</Label>
                <ReactQuill
                  theme="snow"
                  value={formData.cookies_policy_content || ''}
                  onChange={(content) => setFormData({ ...formData, cookies_policy_content: content })}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ minHeight: '300px' }}
                />
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Terms of Service Tab */}
        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle>Términos de Servicio</CardTitle>
              <CardDescription>
                Personaliza tus términos de servicio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="terms-enabled">Habilitar Términos de Servicio</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar en el footer de tu sitio web
                  </p>
                </div>
                <Switch
                  id="terms-enabled"
                  checked={formData.terms_of_service_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, terms_of_service_enabled: checked })}
                />
              </div>

              <Alert>
                <FileCheck className="h-4 w-4" />
                <AlertDescription>
                  Los datos dinámicos (nombre, RUC, Razón Social) se actualizan desde <strong>Información General</strong>.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Contenido</Label>
                <ReactQuill
                  theme="snow"
                  value={formData.terms_of_service_content || ''}
                  onChange={(content) => setFormData({ ...formData, terms_of_service_content: content })}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ minHeight: '300px' }}
                />
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
