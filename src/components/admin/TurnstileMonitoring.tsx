import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClientTurnstileStatus {
  id: string;
  restaurant_name: string;
  subdomain: string;
  turnstile_site_key: string | null;
  turnstile_secret_key: string | null;
  turnstile_widget_id: string | null;
  subscription_status: string;
  created_at: string;
}

export function TurnstileMonitoring() {
  const [clients, setClients] = useState<ClientTurnstileStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, restaurant_name, subdomain, turnstile_site_key, turnstile_secret_key, turnstile_widget_id, subscription_status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type assertion needed until Supabase types are regenerated
      setClients(data as any[] || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const retryTurnstileCreation = async (clientId: string) => {
    setRetrying(clientId);
    try {
      const { error } = await supabase.functions.invoke('create-turnstile-widget', {
        body: { client_id: clientId },
      });

      if (error) throw error;

      toast.success('Widget Turnstile creado exitosamente');
      await fetchClients(); // Refresh the list
    } catch (error) {
      console.error('Error creating Turnstile widget:', error);
      toast.error('Error al crear el widget Turnstile');
    } finally {
      setRetrying(null);
    }
  };

  const successfulClients = clients.filter(c => c.turnstile_site_key && c.turnstile_secret_key);
  const failedClients = clients.filter(c => !c.turnstile_site_key || !c.turnstile_secret_key);
  const successRate = clients.length > 0 ? (successfulClients.length / clients.length) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Total de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Configurados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successfulClients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Con Turnstile activo ({successRate.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Requieren Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{failedClients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sin configuración Turnstile
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Failed Clients Alert */}
      {failedClients.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{failedClients.length} cliente{failedClients.length !== 1 ? 's' : ''}</strong> no tiene{failedClients.length !== 1 ? 'n' : ''} protección Turnstile configurada.
            Revisa la tabla abajo y usa el botón "Reintentar" para crear los widgets automáticamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Clients Without Turnstile */}
      {failedClients.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Clientes Sin Turnstile
                </CardTitle>
                <CardDescription>
                  Estos clientes requieren configuración manual de widgets Turnstile
                </CardDescription>
              </div>
              <Button onClick={fetchClients} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurante</TableHead>
                    <TableHead>Subdominio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.restaurant_name}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://${client.subdomain}.mirestaurante.online`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          {client.subdomain}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          Sin Protección
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(client.created_at).toLocaleDateString('es-PE')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => retryTurnstileCreation(client.id)}
                          disabled={retrying === client.id}
                          size="sm"
                          variant="outline"
                        >
                          {retrying === client.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Creando...
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Reintentar
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Successfully Configured Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Clientes con Turnstile Activo
          </CardTitle>
          <CardDescription>
            Estos clientes tienen protección Turnstile correctamente configurada
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successfulClients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay clientes con Turnstile configurado aún
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurante</TableHead>
                    <TableHead>Subdominio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Site Key</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {successfulClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.restaurant_name}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://${client.subdomain}.mirestaurante.online`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          {client.subdomain}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Protegido
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {client.turnstile_site_key?.substring(0, 20)}...
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(client.created_at).toLocaleDateString('es-PE')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Shield className="h-5 w-5" />
            Guía de Implementación Turnstile
          </CardTitle>
          <CardDescription className="text-blue-700">
            Para implementar la protección Turnstile en formularios de clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-blue-900">
          <div>
            <h4 className="font-semibold mb-2">📋 Instrucciones para Desarrolladores</h4>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Importa el componente ClientTurnstileWidget en tu formulario</li>
              <li>Agrega el widget antes del botón de envío del formulario</li>
              <li>Guarda el token de verificación en el estado</li>
              <li>Envía el token junto con los datos del formulario al backend</li>
              <li>Valida el token en el servidor usando la Secret Key del cliente</li>
            </ol>
          </div>

          <div className="bg-white p-4 rounded-md border border-blue-200">
            <h4 className="font-semibold mb-2">💻 Ejemplo de Código (Frontend)</h4>
            <pre className="text-xs overflow-x-auto">
{`import { ClientTurnstileWidget } from '@/components/ClientTurnstileWidget';

function ContactForm() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!captchaToken) {
      toast.error('Por favor completa la verificación de seguridad');
      return;
    }
    
    // Enviar formulario con token
    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        turnstile_token: captchaToken
      })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      
      <ClientTurnstileWidget
        clientId={clientId}
        onVerify={(token) => setCaptchaToken(token)}
        onError={() => toast.error('Error en verificación')}
      />
      
      <Button type="submit" disabled={!captchaToken}>
        Enviar
      </Button>
    </form>
  );
}`}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-md border border-blue-200">
            <h4 className="font-semibold mb-2">🔒 Validación del Token (Backend)</h4>
            <pre className="text-xs overflow-x-auto">
{`// En tu Edge Function o API endpoint
const validateTurnstile = async (token: string, secretKey: string) => {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: token
      })
    }
  );
  
  const data = await response.json();
  return data.success === true;
};

// Uso en tu endpoint
const { turnstile_token } = await req.json();
const { data: client } = await supabase
  .from('clients')
  .select('turnstile_secret_key')
  .eq('id', clientId)
  .single();

const isValid = await validateTurnstile(
  turnstile_token, 
  client.turnstile_secret_key
);

if (!isValid) {
  return new Response('Verificación fallida', { status: 400 });
}`}
            </pre>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Siempre valida el token en el servidor. Nunca confíes solo en la validación del cliente.
              Cada cliente tiene su propio Site Key y Secret Key únicos almacenados en la tabla <code className="bg-blue-100 px-1 rounded">clients</code>.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
