import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Clock, Copy, HelpCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

interface TableConfig {
  table_name: string;
  seats: number;
  quantity: number;
  min_party_size: number;
  max_party_size: number;
}

interface ReservationSchedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  capacity: number;
  is_active: boolean;
  duration_minutes: number;
  min_party_size: number;
  max_party_size: number;
  special_groups_enabled: boolean;
  special_groups_condition: string | null;
  special_groups_contact_method: string | null;
  custom_table_configs: TableConfig[] | null;
}

interface ReservationSchedulesProps {
  clientId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

const ReservationSchedules = ({ clientId }: ReservationSchedulesProps) => {
  const [schedules, setSchedules] = useState<ReservationSchedule[]>([]);
  const [globalTableConfigs, setGlobalTableConfigs] = useState<TableConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReservationSchedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [useCustomCapacity, setUseCustomCapacity] = useState(false);
  const [customTables, setCustomTables] = useState<TableConfig[]>([]);
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: "12:00",
    end_time: "22:00",
    capacity: 20,
    is_active: true,
    duration_minutes: 120,
    min_party_size: 1,
    max_party_size: 10,
    special_groups_enabled: false,
    special_groups_condition: "both",
    special_groups_contact_method: "whatsapp",
  });

  useEffect(() => {
    fetchSchedules();
    fetchGlobalTableConfigs();
  }, [clientId]);

  const fetchGlobalTableConfigs = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("table_configurations")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_active", true)
        .order("seats", { ascending: true });

      if (error) throw error;
      setGlobalTableConfigs((data as any) || []);
    } catch (error) {
      console.error("Error fetching table configs:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("reservation_schedules")
        .select("*")
        .eq("client_id", clientId)
        .order("day_of_week", { ascending: true });

      if (error) throw error;
      setSchedules((data as any) || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Error al cargar los horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const scheduleData = {
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
        capacity: formData.capacity,
        is_active: formData.is_active,
        duration_minutes: formData.duration_minutes,
        min_party_size: formData.min_party_size,
        max_party_size: formData.max_party_size,
        special_groups_enabled: formData.special_groups_enabled,
        special_groups_condition: formData.special_groups_enabled ? formData.special_groups_condition : null,
        special_groups_contact_method: formData.special_groups_enabled ? formData.special_groups_contact_method : null,
        custom_table_configs: useCustomCapacity ? customTables : null,
      };

      if (editingSchedule) {
        const { error } = await (supabase as any)
          .from("reservation_schedules")
          .update(scheduleData)
          .eq("id", editingSchedule.id);

        if (error) throw error;
        toast.success("Horario actualizado correctamente");
      } else {
        const { error } = await (supabase as any)
          .from("reservation_schedules")
          .insert({
            client_id: clientId,
            ...scheduleData,
          });

        if (error) throw error;
        toast.success("Horario creado correctamente");
      }

      setDialogOpen(false);
      setEditingSchedule(null);
      resetForm();
      fetchSchedules();
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Error al guardar el horario");
    }
  };

  const handleDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      const { error } = await (supabase as any)
        .from("reservation_schedules")
        .delete()
        .eq("id", scheduleToDelete);

      if (error) throw error;
      toast.success("Horario eliminado correctamente");
      fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Error al eliminar el horario");
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  const handleToggleActive = async (schedule: ReservationSchedule) => {
    try {
      const { error } = await (supabase as any)
        .from("reservation_schedules")
        .update({ is_active: !schedule.is_active })
        .eq("id", schedule.id);

      if (error) throw error;
      toast.success(schedule.is_active ? "Horario desactivado" : "Horario activado");
      fetchSchedules();
    } catch (error) {
      console.error("Error toggling schedule:", error);
      toast.error("Error al cambiar el estado del horario");
    }
  };

  const openEditDialog = (schedule: ReservationSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      capacity: schedule.capacity,
      is_active: schedule.is_active,
      duration_minutes: schedule.duration_minutes,
      min_party_size: schedule.min_party_size,
      max_party_size: schedule.max_party_size,
      special_groups_enabled: schedule.special_groups_enabled,
      special_groups_condition: schedule.special_groups_condition || "both",
      special_groups_contact_method: schedule.special_groups_contact_method || "whatsapp",
    });
    const hasCustomConfigs = schedule.custom_table_configs && schedule.custom_table_configs.length > 0;
    setUseCustomCapacity(hasCustomConfigs);
    setCustomTables(hasCustomConfigs ? schedule.custom_table_configs! : []);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      day_of_week: 1,
      start_time: "12:00",
      end_time: "22:00",
      capacity: 20,
      is_active: true,
      duration_minutes: 120,
      min_party_size: 1,
      max_party_size: 10,
      special_groups_enabled: false,
      special_groups_condition: "both",
      special_groups_contact_method: "whatsapp",
    });
    setUseCustomCapacity(false);
    setCustomTables([]);
  };

  const calculateTotalCapacity = (configs: TableConfig[] | null): number => {
    if (!configs || configs.length === 0) {
      return globalTableConfigs.reduce((sum, config) => sum + config.quantity, 0);
    }
    return configs.reduce((sum, config) => sum + config.quantity, 0);
  };

  const addCustomTable = () => {
    setCustomTables([...customTables, {
      table_name: `Mesas ${customTables.length + 1}`,
      seats: 2,
      quantity: 1,
      min_party_size: 1,
      max_party_size: 2,
    }]);
  };

  const updateCustomTable = (index: number, field: keyof TableConfig, value: any) => {
    const updated = [...customTables];
    updated[index] = { ...updated[index], [field]: value };
    setCustomTables(updated);
  };

  const removeCustomTable = (index: number) => {
    setCustomTables(customTables.filter((_, i) => i !== index));
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.label || "";
  };

  const duplicateSchedule = async (schedule: ReservationSchedule) => {
    try {
      const { error } = await (supabase as any)
        .from("reservation_schedules")
        .insert({
          client_id: clientId,
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          capacity: schedule.capacity,
          is_active: true,
          duration_minutes: schedule.duration_minutes,
          min_party_size: schedule.min_party_size,
          max_party_size: schedule.max_party_size,
          special_groups_enabled: schedule.special_groups_enabled,
          special_groups_condition: schedule.special_groups_condition,
          special_groups_contact_method: schedule.special_groups_contact_method,
          custom_table_configs: schedule.custom_table_configs,
        });

      if (error) throw error;
      toast.success("Horario duplicado correctamente");
      fetchSchedules();
    } catch (error) {
      console.error("Error duplicating schedule:", error);
      toast.error("Error al duplicar el horario");
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando horarios...</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
              {schedules.length} horario(s) configurado(s)
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary cursor-help">
                    <HelpCircle className="h-3 w-3 text-primary-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p><strong>¿Para qué sirve esto?</strong></p>
                  <p className="mt-1">Los horarios definen cuándo aceptas reservas (ej: Lunes a Viernes 12:00-15:00, Sábados 19:00-23:00).</p>
                  <p className="mt-1">Puedes personalizar la capacidad y tipos de mesa para cada horario.</p>
                </TooltipContent>
              </Tooltip>
            </p>
          </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSchedule(null); resetForm(); }} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Horario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSchedule ? "Editar Horario" : "Nuevo Horario"}</DialogTitle>
              <DialogDescription>
                Define el día, horario y capacidad para aceptar reservas.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">Día de la Semana</Label>
                  <Select
                    value={formData.day_of_week.toString()}
                    onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Hora de Inicio</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Hora de Cierre</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duración por Reserva (minutos)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Ej: 120 = 2 horas, 180 = 3 horas
                  </p>
                </div>

                {/* Capacity Configuration */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Configuración de Capacidad</Label>
                      <p className="text-sm text-muted-foreground">
                        {useCustomCapacity ? "Configuración personalizada para este horario" : "Usando capacidad estándar global"}
                      </p>
                    </div>
                    <Switch
                      checked={useCustomCapacity}
                      onCheckedChange={(checked) => {
                        setUseCustomCapacity(checked);
                        if (checked && customTables.length === 0) {
                          setCustomTables([...globalTableConfigs]);
                        }
                      }}
                    />
                  </div>

                  {useCustomCapacity && (
                    <div className="space-y-3 pl-4 border-l-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Tipos de Mesa</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addCustomTable}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Agregar Mesa
                        </Button>
                      </div>

                      {customTables.map((table, index) => (
                        <div key={index} className="space-y-3 p-4 border rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">Mesa #{index + 1}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomTable(index)}
                              className="h-8"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <Label htmlFor={`table_name_${index}`} className="text-sm font-medium">
                                Nombre del Tipo de Mesa
                              </Label>
                              <Input
                                id={`table_name_${index}`}
                                placeholder="ej. Mesas para 2"
                                value={table.table_name}
                                onChange={(e) => updateCustomTable(index, "table_name", e.target.value)}
                                className="h-10"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label htmlFor={`seats_${index}`} className="text-sm font-medium">
                                  Asientos por Mesa
                                </Label>
                                <Input
                                  id={`seats_${index}`}
                                  type="number"
                                  placeholder="2"
                                  min="1"
                                  value={table.seats}
                                  onChange={(e) => updateCustomTable(index, "seats", parseInt(e.target.value))}
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor={`quantity_${index}`} className="text-sm font-medium">
                                  Cantidad de Mesas
                                </Label>
                                <Input
                                  id={`quantity_${index}`}
                                  type="number"
                                  placeholder="5"
                                  min="1"
                                  value={table.quantity}
                                  onChange={(e) => updateCustomTable(index, "quantity", parseInt(e.target.value))}
                                  className="h-10"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label htmlFor={`min_party_${index}`} className="text-sm font-medium">
                                  Mín. Personas
                                </Label>
                                <Input
                                  id={`min_party_${index}`}
                                  type="number"
                                  placeholder="1"
                                  min="1"
                                  value={table.min_party_size}
                                  onChange={(e) => updateCustomTable(index, "min_party_size", parseInt(e.target.value))}
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor={`max_party_${index}`} className="text-sm font-medium">
                                  Máx. Personas
                                </Label>
                                <Input
                                  id={`max_party_${index}`}
                                  type="number"
                                  placeholder="2"
                                  min="1"
                                  value={table.max_party_size}
                                  onChange={(e) => updateCustomTable(index, "max_party_size", parseInt(e.target.value))}
                                  className="h-10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {customTables.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay mesas configuradas. Haz clic en "Agregar" para empezar.
                        </p>
                      )}

                      <div className="bg-primary/10 p-3 rounded-lg">
                        <p className="text-sm font-medium">
                          Capacidad Total: {calculateTotalCapacity(customTables)} mesas
                        </p>
                      </div>
                    </div>
                  )}

                  {!useCustomCapacity && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Capacidad estándar: {calculateTotalCapacity(null)} mesas
                        {globalTableConfigs.length === 0 && (
                          <span className="text-destructive block mt-1">
                            ⚠️ No hay configuración de mesas global. Por favor, configúrala en la pestaña "Capacidad".
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_party_size">Mínimo de Personas</Label>
                    <Input
                      id="min_party_size"
                      type="number"
                      min="1"
                      value={formData.min_party_size}
                      onChange={(e) => setFormData({ ...formData, min_party_size: parseInt(e.target.value) })}
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
                      onChange={(e) => setFormData({ ...formData, max_party_size: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="special_groups_enabled"
                      checked={formData.special_groups_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, special_groups_enabled: checked })}
                    />
                    <Label htmlFor="special_groups_enabled">Mensaje para grupos especiales</Label>
                  </div>

                  {formData.special_groups_enabled && (
                    <div className="grid grid-cols-2 gap-4 pl-6">
                      <div className="space-y-2">
                        <Label htmlFor="special_groups_condition">Para grupos</Label>
                        <Select
                          value={formData.special_groups_condition}
                          onValueChange={(value) => setFormData({ ...formData, special_groups_condition: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bigger">Más grandes</SelectItem>
                            <SelectItem value="smaller">Más pequeños</SelectItem>
                            <SelectItem value="both">Más grandes y más pequeños</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="special_groups_contact_method">Contactar por</Label>
                        <Select
                          value={formData.special_groups_contact_method}
                          onValueChange={(value) => setFormData({ ...formData, special_groups_contact_method: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phone">Teléfono</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="both">Teléfono o WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Activo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingSchedule ? "Actualizar" : "Crear"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay horarios configurados</h3>
          <p className="text-muted-foreground mb-4">
            Comienza agregando los días y horarios en los que aceptas reservas.
          </p>
          <p className="text-sm text-muted-foreground">
            💡 Define horarios para cada día de la semana, personaliza la duración de reservas y capacidad.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          {isMobile && (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">{getDayName(schedule.day_of_week)}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {schedule.start_time} - {schedule.end_time}
                          </p>
                        </div>
                        <Badge variant={schedule.is_active ? "default" : "secondary"} className="text-xs">
                          {schedule.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Duración:</span>
                          <p className="font-medium">
                            {schedule.duration_minutes >= 60 
                              ? `${Math.floor(schedule.duration_minutes / 60)}h ${schedule.duration_minutes % 60 > 0 ? `${schedule.duration_minutes % 60}m` : ''}`.trim()
                              : `${schedule.duration_minutes}m`
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Personas:</span>
                          <p className="font-medium">{schedule.min_party_size} - {schedule.max_party_size}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">Capacidad:</span>
                        {schedule.custom_table_configs ? (
                          <Badge variant="secondary" className="text-xs">
                            Personalizada ({calculateTotalCapacity(schedule.custom_table_configs)} mesas)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Estándar ({calculateTotalCapacity(null)} mesas)
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(schedule)}
                          className="flex-1 text-xs"
                        >
                          {schedule.is_active ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateSchedule(schedule)}
                          className="flex-1 text-xs"
                          title="Duplicar horario"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Duplicar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(schedule)}
                          className="flex-1 text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setScheduleToDelete(schedule.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="flex-1 text-xs"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
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
                    <TableHead>Día</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead>Personas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{getDayName(schedule.day_of_week)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {schedule.start_time} - {schedule.end_time}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {schedule.duration_minutes >= 60 
                          ? `${Math.floor(schedule.duration_minutes / 60)}h ${schedule.duration_minutes % 60 > 0 ? `${schedule.duration_minutes % 60}m` : ''}`.trim()
                          : `${schedule.duration_minutes}m`
                        }
                      </TableCell>
                      <TableCell>
                        {schedule.custom_table_configs ? (
                          <div className="flex flex-col">
                            <Badge variant="secondary" className="text-xs">Personalizada</Badge>
                            <span className="text-xs text-muted-foreground mt-1">
                              {calculateTotalCapacity(schedule.custom_table_configs)} mesas
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <Badge variant="outline" className="text-xs">Estándar</Badge>
                            <span className="text-xs text-muted-foreground mt-1">
                              {calculateTotalCapacity(null)} mesas
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{schedule.min_party_size} - {schedule.max_party_size}</TableCell>
                      <TableCell>
                        <Badge variant={schedule.is_active ? "default" : "secondary"} className="text-xs">
                          {schedule.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(schedule)}
                            className="h-8 text-xs"
                          >
                            {schedule.is_active ? "Desactivar" : "Activar"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateSchedule(schedule)}
                            className="h-8 w-8 p-0"
                            title="Duplicar horario"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(schedule)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setScheduleToDelete(schedule.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente este horario. Las reservas existentes no se verán afectadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default ReservationSchedules;
