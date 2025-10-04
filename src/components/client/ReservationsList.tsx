import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Search, Filter, Phone, Mail, MessageSquare, Trash2, ArrowUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, isPast, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getCurrentDateInTimezone, extractDateTimeFromUtc } from "@/lib/timezone";

interface Reservation {
  id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  special_requests: string | null;
  status: string;
  created_at: string;
}

interface ReservationsListProps {
  clientId: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "completed", label: "Completado" },
];

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "default",
  cancelled: "destructive",
  completed: "secondary",
};

const DECLINE_REASONS = [
  "No hay mesas disponibles",
  "Fuera del horario de atención",
  "Grupo muy grande",
  "Día festivo cerrado",
  "Evento privado",
  "Mantenimiento programado",
  "Otro motivo (especificar)",
];

const ReservationsList = ({ clientId }: ReservationsListProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [reservationToDecline, setReservationToDecline] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [customDeclineReason, setCustomDeclineReason] = useState("");
  const [clientTimezone, setClientTimezone] = useState<string>("America/Lima");

  useEffect(() => {
    fetchClientTimezone();
    fetchReservations();
    cleanupPastReservations();
  }, [clientId]);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, statusFilter]);

  const fetchClientTimezone = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("timezone")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      setClientTimezone(data.timezone || "America/Lima");
    } catch (error) {
      console.error("Error fetching client timezone:", error);
    }
  };

  const cleanupPastReservations = async () => {
    try {
      const today = getCurrentDateInTimezone(clientTimezone);
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("client_id", clientId)
        .lt("reservation_date", today);

      if (error) throw error;
    } catch (error) {
      console.error("Error cleaning up past reservations:", error);
    }
  };

  const fetchReservations = async () => {
    try {
      const today = getCurrentDateInTimezone(clientTimezone);
      const { data, error } = await (supabase as any)
        .from("reservations")
        .select("*")
        .eq("client_id", clientId)
        .gte("reservation_date", today)
        .order("reservation_date", { ascending: false })
        .order("reservation_time", { ascending: false });

      if (error) throw error;
      setReservations((data as any) || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customer_name.toLowerCase().includes(term) ||
          r.customer_phone.includes(term) ||
          r.customer_email.toLowerCase().includes(term)
      );
    }

    setFilteredReservations(filtered);
  };

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    if (newStatus === "cancelled") {
      setReservationToDecline(reservationId);
      setDeclineDialogOpen(true);
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from("reservations")
        .update({ status: newStatus })
        .eq("id", reservationId);

      if (error) throw error;
      toast.success("Estado actualizado correctamente");
      fetchReservations();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  const handleDeclineReservation = async () => {
    if (!reservationToDecline) return;

    const finalReason = declineReason === "Otro motivo (especificar)" ? customDeclineReason : declineReason;

    if (!finalReason) {
      toast.error("Por favor selecciona o especifica un motivo");
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from("reservations")
        .update({ 
          status: "cancelled",
          special_requests: finalReason 
        })
        .eq("id", reservationToDecline);

      if (error) throw error;
      toast.success("Reserva rechazada correctamente");
      fetchReservations();
    } catch (error) {
      console.error("Error declining reservation:", error);
      toast.error("Error al rechazar la reserva");
    } finally {
      setDeclineDialogOpen(false);
      setReservationToDecline(null);
      setDeclineReason("");
      setCustomDeclineReason("");
    }
  };

  const handleDelete = async () => {
    if (!reservationToDelete) return;

    try {
      const { error } = await (supabase as any)
        .from("reservations")
        .delete()
        .eq("id", reservationToDelete);

      if (error) throw error;
      toast.success("Reserva eliminada correctamente");
      fetchReservations();
    } catch (error) {
      console.error("Error deleting reservation:", error);
      toast.error("Error al eliminar la reserva");
    } finally {
      setDeleteDialogOpen(false);
      setReservationToDelete(null);
    }
  };

  const pendingCount = reservations.filter((r) => r.status === "pending").length;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando reservas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {filteredReservations.length} reserva(s)
          </p>
          {pendingCount > 0 && (
            <Badge variant="default">{pendingCount} pendiente(s)</Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay reservas</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "No se encontraron reservas con los filtros aplicados."
              : "Las reservas de tus clientes aparecerán aquí."}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Personas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {format(new Date(reservation.reservation_date + 'T00:00:00'), "dd MMM yyyy", { locale: es })}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {reservation.reservation_time}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{reservation.customer_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {reservation.customer_phone}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {reservation.customer_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{reservation.party_size}</TableCell>
                  <TableCell>
                    <Select
                      value={reservation.status}
                      onValueChange={(value) => handleStatusChange(reservation.id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <Badge 
                          variant={STATUS_COLORS[reservation.status] || "outline"}
                          className={reservation.status === "pending" ? "border-orange-500 text-orange-500" : ""}
                        >
                          <SelectValue />
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setDetailsDialogOpen(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReservationToDelete(reservation.id);
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

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
            <DialogDescription>Información completa del cliente y la reserva</DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Información de la Reserva</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Fecha:</span>{" "}
                    {format(new Date(selectedReservation.reservation_date + 'T00:00:00'), "dd MMMM yyyy", { locale: es })}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Hora:</span> {selectedReservation.reservation_time}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Personas:</span> {selectedReservation.party_size}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Estado:</span>{" "}
                    <Badge variant={STATUS_COLORS[selectedReservation.status]}>
                      {selectedReservation.status}
                    </Badge>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Información del Cliente</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Nombre:</span> {selectedReservation.customer_name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Teléfono:</span> {selectedReservation.customer_phone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span> {selectedReservation.customer_email}
                  </p>
                </div>
              </div>
              {selectedReservation.special_requests && (
                <div>
                  <h4 className="font-semibold mb-2">Solicitudes Especiales</h4>
                  <p className="text-sm text-muted-foreground">{selectedReservation.special_requests}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">
                  Creada el {format(new Date(selectedReservation.created_at), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente esta reserva. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Reserva</DialogTitle>
            <DialogDescription>
              Selecciona el motivo del rechazo. Este mensaje se guardará con la reserva.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="decline-reason">Motivo del rechazo</Label>
              <Select value={declineReason} onValueChange={setDeclineReason}>
                <SelectTrigger id="decline-reason">
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  {DECLINE_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {declineReason === "Otro motivo (especificar)" && (
              <div>
                <Label htmlFor="custom-reason">Especifica el motivo</Label>
                <Textarea
                  id="custom-reason"
                  value={customDeclineReason}
                  onChange={(e) => setCustomDeclineReason(e.target.value)}
                  placeholder="Escribe el motivo del rechazo..."
                  rows={3}
                />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeclineReservation}>
                Rechazar Reserva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 rounded-full w-12 h-12 shadow-lg z-50"
        size="icon"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ReservationsList;
