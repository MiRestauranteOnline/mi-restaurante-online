import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Trash2, Edit, Globe, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface OutletContext {
  selectedClientId: string;
}

interface DNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  priority?: number;
  proxied: boolean;
}

interface ClientData {
  id: string;
  custom_domain?: string;
  cloudflare_zone_id?: string;
}

export default function CustomDNS() {
  const { selectedClientId } = useOutletContext<OutletContext>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null);
  const [formData, setFormData] = useState({
    type: 'A',
    name: '',
    content: '',
    ttl: 1,
    priority: 10,
    proxied: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (selectedClientId) {
      fetchData();
    }
  }, [selectedClientId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch client data
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id, custom_domain, cloudflare_zone_id')
        .eq('id', selectedClientId)
        .single();

      if (clientError) throw clientError;
      setClientData(client);

      if (client.cloudflare_zone_id) {
        // Fetch DNS records
        await fetchDNSRecords();
      }

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDNSRecords = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('manage-dns-records', {
        body: {
          action: 'list',
          clientId: selectedClientId,
        },
      });

      if (response.error) throw response.error;
      setDnsRecords(response.data.records || []);

    } catch (error: any) {
      console.error('Error fetching DNS records:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los registros DNS',
        variant: 'destructive',
      });
    }
  };

  const handleOpenDialog = (record?: DNSRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        type: record.type,
        name: record.name,
        content: record.content,
        ttl: record.ttl,
        priority: record.priority || 10,
        proxied: record.proxied,
      });
    } else {
      setEditingRecord(null);
      setFormData({
        type: 'A',
        name: '',
        content: '',
        ttl: 1,
        priority: 10,
        proxied: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveRecord = async () => {
    try {
      setSaving(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const action = editingRecord ? 'update' : 'create';
      const response = await supabase.functions.invoke('manage-dns-records', {
        body: {
          action,
          clientId: selectedClientId,
          recordId: editingRecord?.id,
          recordData: formData,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: 'Éxito',
        description: `Registro DNS ${editingRecord ? 'actualizado' : 'creado'} correctamente`,
      });

      setIsDialogOpen(false);
      await fetchDNSRecords();

    } catch (error: any) {
      console.error('Error saving DNS record:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el registro DNS',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro DNS?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('manage-dns-records', {
        body: {
          action: 'delete',
          clientId: selectedClientId,
          recordId,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: 'Éxito',
        description: 'Registro DNS eliminado correctamente',
      });

      await fetchDNSRecords();

    } catch (error: any) {
      console.error('Error deleting DNS record:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el registro DNS',
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

  if (!clientData) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Cliente no encontrado</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!clientData.custom_domain || !clientData.cloudflare_zone_id) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de DNS</CardTitle>
            <CardDescription>
              Este cliente no tiene un dominio personalizado configurado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Por favor, configura primero un dominio personalizado en la pestaña "Dominio Personalizado" para poder gestionar los registros DNS.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de DNS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dominio: <span className="font-mono font-semibold">{clientData.custom_domain}</span>
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Registro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Editar Registro DNS' : 'Nuevo Registro DNS'}
              </DialogTitle>
              <DialogDescription>
                Configura los detalles del registro DNS
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="AAAA">AAAA</SelectItem>
                    <SelectItem value="CNAME">CNAME</SelectItem>
                    <SelectItem value="MX">MX</SelectItem>
                    <SelectItem value="TXT">TXT</SelectItem>
                    <SelectItem value="SRV">SRV</SelectItem>
                    <SelectItem value="NS">NS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Nombre / Host</Label>
                <Input
                  id="name"
                  placeholder="@ o subdomain"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Usa @ para el dominio raíz o especifica un subdominio
                </p>
              </div>

              <div>
                <Label htmlFor="content">Contenido / Valor</Label>
                <Input
                  id="content"
                  placeholder="IP address, domain, or value"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              {formData.type === 'MX' && (
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="ttl">TTL (segundos)</Label>
                <Select
                  value={formData.ttl.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, ttl: parseInt(value) }))}
                >
                  <SelectTrigger id="ttl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Auto</SelectItem>
                    <SelectItem value="60">1 minuto</SelectItem>
                    <SelectItem value="300">5 minutos</SelectItem>
                    <SelectItem value="3600">1 hora</SelectItem>
                    <SelectItem value="86400">1 día</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveRecord} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingRecord ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros DNS</CardTitle>
          <CardDescription>
            Gestiona los registros DNS para {clientData.custom_domain}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dnsRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros DNS configurados</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar primer registro
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contenido</TableHead>
                  <TableHead>TTL</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Proxy</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dnsRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Badge variant="outline">{record.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm max-w-xs truncate">
                      {record.content}
                    </TableCell>
                    <TableCell>{record.ttl === 1 ? 'Auto' : `${record.ttl}s`}</TableCell>
                    <TableCell>{record.priority || '-'}</TableCell>
                    <TableCell>
                      {record.proxied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
