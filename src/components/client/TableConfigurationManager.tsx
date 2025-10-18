import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TableConfiguration {
  id: string;
  table_name: string;
  seats: number;
  quantity: number;
  min_party_size: number;
  max_party_size: number;
  duration_minutes: number;
  is_active: boolean;
}

interface TableConfigurationManagerProps {
  clientId: string;
}

const TableConfigurationManager = ({ clientId }: TableConfigurationManagerProps) => {
  const [configs, setConfigs] = useState<TableConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<TableConfiguration | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    table_name: "",
    seats: 2,
    quantity: 1,
    min_party_size: 1,
    max_party_size: 2,
    duration_minutes: 120,
  });

  useEffect(() => {
    fetchConfigurations();
  }, [clientId]);

  const fetchConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from("table_configurations")
        .select("*")
        .eq("client_id", clientId)
        .order("seats", { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones de mesas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.min_party_size > formData.max_party_size) {
      toast({
        title: "Error",
        description: "El mínimo de personas no puede ser mayor que el máximo",
        variant: "destructive",
      });
      return;
    }

    if (formData.max_party_size > formData.seats) {
      toast({
        title: "Error",
        description: "El máximo de personas no puede exceder el número de asientos",
        variant: "destructive",
      });
      return;
    }

    try {
      if (selectedConfig) {
        const { error } = await supabase
          .from("table_configurations")
          .update(formData)
          .eq("id", selectedConfig.id);

        if (error) throw error;
        toast({ title: "Éxito", description: "Configuración actualizada correctamente" });
      } else {
        const { error } = await supabase
          .from("table_configurations")
          .insert([{ ...formData, client_id: clientId }]);

        if (error) throw error;
        toast({ title: "Éxito", description: "Configuración creada correctamente" });
      }

      fetchConfigurations();
      resetForm();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedConfig) return;

    try {
      const { error } = await supabase
        .from("table_configurations")
        .delete()
        .eq("id", selectedConfig.id);

      if (error) throw error;

      toast({ title: "Éxito", description: "Configuración eliminada correctamente" });
      fetchConfigurations();
      setDeleteDialogOpen(false);
      setSelectedConfig(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (config: TableConfiguration) => {
    try {
      const { error } = await supabase
        .from("table_configurations")
        .update({ is_active: !config.is_active })
        .eq("id", config.id);

      if (error) throw error;
      fetchConfigurations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (config: TableConfiguration) => {
    setSelectedConfig(config);
    setFormData({
      table_name: config.table_name,
      seats: config.seats,
      quantity: config.quantity,
      min_party_size: config.min_party_size,
      max_party_size: config.max_party_size,
      duration_minutes: config.duration_minutes,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (config: TableConfiguration) => {
    setSelectedConfig(config);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      table_name: "",
      seats: 2,
      quantity: 1,
      min_party_size: 1,
      max_party_size: 2,
      duration_minutes: 120,
    });
    setSelectedConfig(null);
  };

  const getTotalCapacity = () => {
    return configs
      .filter((c) => c.is_active)
      .reduce((sum, c) => sum + c.quantity * c.seats, 0);
  };

  const getTotalTables = () => {
    return configs
      .filter((c) => c.is_active)
      .reduce((sum, c) => sum + c.quantity, 0);
  };

  if (loading) {
    return <div className="text-center py-8">Cargando configuraciones...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">Configuración de Mesas</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Define los tipos de mesas disponibles en tu restaurante
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Configuración
        </Button>
      </div>

      {configs.length > 0 && (
        <div className="bg-muted p-3 sm:p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="font-medium">Total de mesas:</span> {getTotalTables()}
            </div>
            <div>
              <span className="font-medium">Capacidad total:</span> {getTotalCapacity()} personas
            </div>
          </div>
        </div>
      )}

      {configs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay configuraciones de mesas.</p>
          <p className="text-sm">Comienza agregando tus tipos de mesas.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          {isMobile && (
            <div className="space-y-3">
              {configs.map((config) => (
                <Card key={config.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{config.table_name}</h4>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Asientos:</span>
                            <span>{config.seats}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Cantidad:</span>
                            <span>{config.quantity} mesa{config.quantity > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Personas:</span>
                            <span>{config.min_party_size} - {config.max_party_size}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Duración:</span>
                            <span>{config.duration_minutes} min</span>
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={config.is_active}
                        onCheckedChange={() => handleToggleActive(config)}
                      />
                    </div>
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(config)}
                        className="flex-1"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(config)}
                        className="flex-1"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Desktop Table View */}
          {!isMobile && (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Asientos</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Min-Max Personas</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.table_name}</TableCell>
                      <TableCell>{config.seats} asientos</TableCell>
                      <TableCell>{config.quantity} mesa{config.quantity > 1 ? 's' : ''}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {config.min_party_size} - {config.max_party_size} personas
                      </TableCell>
                      <TableCell>{config.duration_minutes} min</TableCell>
                      <TableCell>
                        <Switch
                          checked={config.is_active}
                          onCheckedChange={() => handleToggleActive(config)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(config)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(config)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {selectedConfig ? "Editar" : "Agregar"} Configuración de Mesa
              </DialogTitle>
              <DialogDescription>
                Define las características de este tipo de mesa
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="table_name">Nombre</Label>
                <Input
                  id="table_name"
                  placeholder="Ej: Mesa para 2"
                  value={formData.table_name}
                  onChange={(e) =>
                    setFormData({ ...formData, table_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seats">Asientos</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    value={formData.seats}
                    onChange={(e) =>
                      setFormData({ ...formData, seats: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad de Mesas</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_party_size">Mínimo de Personas</Label>
                  <Input
                    id="min_party_size"
                    type="number"
                    min="1"
                    value={formData.min_party_size}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_party_size: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_party_size">Máximo de Personas</Label>
                  <Input
                    id="max_party_size"
                    type="number"
                    min="1"
                    value={formData.max_party_size}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_party_size: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duración Predeterminada (minutos)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="30"
                  step="30"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: parseInt(e.target.value),
                    })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Duración predeterminada de las reservas. Se puede sobrescribir en horarios específicos.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Ejemplo: Para mesas de 4 personas, puedes establecer mínimo 3 y máximo 5 si
                permites cierta flexibilidad.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {selectedConfig ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la configuración "{selectedConfig?.table_name}".
              Las reservas existentes no se verán afectadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedConfig(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TableConfigurationManager;
