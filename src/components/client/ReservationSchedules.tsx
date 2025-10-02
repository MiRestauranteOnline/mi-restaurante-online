import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ReservationSchedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  capacity: number;
  is_active: boolean;
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
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReservationSchedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: "12:00",
    end_time: "22:00",
    capacity: 20,
    is_active: true,
  });

  useEffect(() => {
    fetchSchedules();
  }, [clientId]);

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
      if (editingSchedule) {
        const { error } = await (supabase as any)
          .from("reservation_schedules")
          .update({
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time,
            capacity: formData.capacity,
            is_active: formData.is_active,
          })
          .eq("id", editingSchedule.id);

        if (error) throw error;
        toast.success("Horario actualizado correctamente");
      } else {
        const { error } = await (supabase as any)
          .from("reservation_schedules")
          .insert({
            client_id: clientId,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time,
            capacity: formData.capacity,
            is_active: formData.is_active,
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
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      day_of_week: 1,
      start_time: "12:00",
      end_time: "22:00",
      capacity: 20,
      is_active: true,
    });
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.label || "";
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando horarios...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {schedules.length} horario(s) configurado(s)
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSchedule(null); resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Horario
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                  <Label htmlFor="capacity">Capacidad (personas)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                  />
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
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay horarios configurados</h3>
          <p className="text-muted-foreground mb-4">
            Comienza agregando los días y horarios en los que aceptas reservas.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Día</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{getDayName(schedule.day_of_week)}</TableCell>
                  <TableCell>
                    {schedule.start_time} - {schedule.end_time}
                  </TableCell>
                  <TableCell>{schedule.capacity} personas</TableCell>
                  <TableCell>
                    <Badge variant={schedule.is_active ? "default" : "secondary"}>
                      {schedule.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(schedule)}
                      >
                        {schedule.is_active ? "Desactivar" : "Activar"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(schedule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setScheduleToDelete(schedule.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
  );
};

export default ReservationSchedules;
