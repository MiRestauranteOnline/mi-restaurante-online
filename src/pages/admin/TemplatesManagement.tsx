import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Eye, EyeOff, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Template {
  id: string;
  name: string;
  slug: string;
  status: 'development' | 'production';
  description: string | null;
  folder_path: string;
  is_active: boolean;
  client_count: number;
  created_at: string;
  updated_at: string;
}

const SUPABASE_URL = 'https://ptzcetvcccnojdbzzlyt.supabase.co';

export default function TemplatesManagement() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [statusWarningOpen, setStatusWarningOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateSlug, setNewTemplateSlug] = useState("");
  const [duplicating, setDuplicating] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ template: Template; newStatus: 'development' | 'production' } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('templates' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data as any) || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (template: Template, newStatus: 'development' | 'production') => {
    if (template.status === 'production' && newStatus === 'development') {
      setPendingStatusChange({ template, newStatus });
      setStatusWarningOpen(true);
      return;
    }
    
    await updateStatus(template.id, newStatus);
  };

  const updateStatus = async (templateId: string, newStatus: 'development' | 'production') => {
    try {
      const { error } = await supabase
        .from('templates' as any)
        .update({ status: newStatus })
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, status: newStatus } : t
      ));

      toast({
        title: "Estado actualizado",
        description: `Plantilla cambiada a ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  const handleIsActiveToggle = async (templateId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('templates' as any)
        .update({ is_active: !currentValue })
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, is_active: !currentValue } : t
      ));

      toast({
        title: "Visibilidad actualizada",
        description: `Plantilla ${!currentValue ? 'activada' : 'desactivada'}`,
      });
    } catch (error) {
      console.error('Error toggling is_active:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la visibilidad",
        variant: "destructive",
      });
    }
  };

  const openDuplicateDialog = (template: Template) => {
    setSelectedTemplate(template);
    setNewTemplateName(`${template.name} (Copia)`);
    setNewTemplateSlug(`${template.slug}-copy`);
    setDuplicateDialogOpen(true);
  };

  const handleDuplicate = async () => {
    if (!selectedTemplate || !newTemplateName.trim() || !newTemplateSlug.trim()) {
      toast({
        title: "Error",
        description: "Nombre y slug son requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      setDuplicating(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "No estás autenticado",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/duplicate-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          new_name: newTemplateName.trim(),
          new_slug: newTemplateSlug.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error duplicando plantilla');
      }

      toast({
        title: "Plantilla duplicada",
        description: result.message || "La plantilla se ha duplicado correctamente",
      });

      // Show manual steps if provided
      if (result.manual_steps) {
        console.log('Manual steps required:', result.manual_steps);
        toast({
          title: "Pasos manuales requeridos",
          description: result.manual_steps.join(', '),
          duration: 10000,
        });
      }

      setDuplicateDialogOpen(false);
      fetchTemplates();
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo duplicar la plantilla",
        variant: "destructive",
      });
    } finally {
      setDuplicating(false);
    }
  };

  const autoGenerateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Plantillas</h1>
        <p className="text-muted-foreground mt-2">
          Administra las plantillas de sitios web para tus clientes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <CardDescription className="mt-1 font-mono text-xs">
                    {template.slug}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={template.status === 'production' ? 'destructive' : 'default'}
                    className={template.status === 'development' ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    {template.status === 'production' ? 'Producción' : 'Desarrollo'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.description && (
                <p className="text-sm text-muted-foreground">{template.description}</p>
              )}

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {template.client_count} {template.client_count === 1 ? 'cliente' : 'clientes'}
                </span>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`status-${template.id}`} className="text-sm">
                    Estado
                  </Label>
                  <Select
                    value={template.status}
                    onValueChange={(value: 'development' | 'production') => 
                      handleStatusChange(template, value)
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Desarrollo</SelectItem>
                      <SelectItem value="production">Producción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor={`active-${template.id}`} className="text-sm">
                    Visible
                  </Label>
                  <div className="flex items-center gap-2">
                    {template.is_active ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      id={`active-${template.id}`}
                      checked={template.is_active}
                      onCheckedChange={() => handleIsActiveToggle(template.id, template.is_active)}
                    />
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => openDuplicateDialog(template)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicar Plantilla
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Duplicate Template Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Plantilla</DialogTitle>
            <DialogDescription>
              Crea una copia de "{selectedTemplate?.name}" con un nuevo nombre y slug
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nombre de la nueva plantilla</Label>
              <Input
                id="new-name"
                value={newTemplateName}
                onChange={(e) => {
                  setNewTemplateName(e.target.value);
                  setNewTemplateSlug(autoGenerateSlug(e.target.value));
                }}
                placeholder="Mi Nueva Plantilla"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-slug">Slug (identificador único)</Label>
              <Input
                id="new-slug"
                value={newTemplateSlug}
                onChange={(e) => setNewTemplateSlug(e.target.value)}
                placeholder="mi-nueva-plantilla"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                El slug se genera automáticamente pero puedes editarlo
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicateDialogOpen(false)}
              disabled={duplicating}
            >
              Cancelar
            </Button>
            <Button onClick={handleDuplicate} disabled={duplicating}>
              {duplicating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Duplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Warning */}
      <AlertDialog open={statusWarningOpen} onOpenChange={setStatusWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar plantilla de producción?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de cambiar una plantilla de producción a desarrollo. 
              Esto puede afectar a los {pendingStatusChange?.template.client_count} clientes que la están usando.
              ¿Estás seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatusChange(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingStatusChange) {
                  updateStatus(pendingStatusChange.template.id, pendingStatusChange.newStatus);
                  setPendingStatusChange(null);
                }
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
