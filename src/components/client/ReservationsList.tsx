import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Search, Filter, Phone, Mail, MessageSquare, Trash2, ArrowUp, Download, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useReservationRealtime } from "@/hooks/useReservationRealtime";

interface Reservation {
  id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  special_requests: string | null;
  decline_reason: string | null;
  internal_notes: string | null;
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
  const [internalNotes, setInternalNotes] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [reservationToDecline, setReservationToDecline] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [customDeclineReason, setCustomDeclineReason] = useState("");
  const [clientTimezone, setClientTimezone] = useState<string>("America/Lima");
  const isMobile = useIsMobile();

  // Use real-time hook
  useReservationRealtime(clientId, () => fetchReservations());

  useEffect(() => {
    fetchClientTimezone();
    fetchReservations();
    cleanupPastReservations();
  }, [clientId]);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, statusFilter]);

  useEffect(() => {
    if (selectedReservation) {
      setInternalNotes(selectedReservation.internal_notes || "");
    }
  }, [selectedReservation]);

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
      const { data, error} = await (supabase as any)
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

  const handleSaveNotes = async () => {
    if (!selectedReservation) return;
    
    const { error } = await supabase
      .from("reservations")
      .update({ internal_notes: internalNotes })
      .eq("id", selectedReservation.id);

    if (error) {
      toast.error("Error al guardar las notas");
    } else {
      toast.success("Notas guardadas exitosamente");
      fetchReservations();
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
          decline_reason: finalReason 
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
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", reservationToDelete)
        .eq("client_id", clientId);

      if (error) {
        console.error("Delete error:", error);
        throw error;
      }
      
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
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const exportToCSV = () => {
    const headers = ["Fecha", "Hora", "Cliente", "Email", "Teléfono", "Personas", "Estado", "Solicitudes Especiales", "Motivo de Rechazo"];
    const rows = filteredReservations.map(r => [
      r.reservation_date,
      r.reservation_time,
      r.customer_name,
      r.customer_email,
      r.customer_phone,
      r.party_size,
      STATUS_OPTIONS.find(o => o.value === r.status)?.label || r.status,
      r.special_requests || "",
      r.decline_reason || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reservas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Reservas exportadas correctamente");
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando reservas...</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {filteredReservations.length} reserva(s)
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary cursor-help">
                    <HelpCircle className="h-3 w-3 text-primary-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p><strong>Gestión de Reservas</strong></p>
                  <p className="mt-1">Aquí ves todas las reservas recibidas. Puedes confirmar, rechazar o ver detalles de cada una.</p>
                  <p className="mt-1">Las notas internas son privadas - úsalas para preferencias, alergias, o recordatorios.</p>
                </TooltipContent>
              </Tooltip>
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
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            disabled={filteredReservations.length === 0}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">No hay reservas</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all"
              ? "No se encontraron reservas con los filtros aplicados."
              : "Las reservas de tus clientes aparecerán aquí una vez que comiencen a llegar."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <p className="text-xs text-muted-foreground">
              💡 Asegúrate de configurar tus horarios y capacidad en las pestañas "Horarios" y "Capacidad"
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          {isMobile && (
            <div className="space-y-3">
              {filteredReservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">{reservation.customer_name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(reservation.reservation_date + 'T00:00:00'), "dd MMM yyyy", { locale: es })} • {reservation.reservation_time}
                          </p>
                        </div>
                        <Badge 
                          variant={STATUS_COLORS[reservation.status] || "outline"}
                          className={`text-xs ${reservation.status === "pending" ? "border-orange-500 text-orange-500" : ""}`}
                        >
                          {STATUS_OPTIONS.find(o => o.value === reservation.status)?.label}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs">
                        <a 
                          href={`tel:${reservation.customer_phone}`}
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{reservation.customer_phone}</span>
                        </a>
                        <a 
                          href={`mailto:${reservation.customer_email}`}
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{reservation.customer_email}</span>
                        </a>
                        <div className="font-medium">
                          {reservation.party_size} persona{reservation.party_size !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        {reservation.status === "pending" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleStatusChange(reservation.id, "confirmed")}
                              className="flex-1 h-8 text-xs"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Confirmar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStatusChange(reservation.id, "cancelled")}
                              className="flex-1 h-8 text-xs"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                        {reservation.status !== "pending" && (
                          <Select
                            value={reservation.status}
                            onValueChange={(value) => handleStatusChange(reservation.id, value)}
                          >
                            <SelectTrigger className="flex-1 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="confirmed">Confirmado</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                              <SelectItem value="completed">Completado</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setDetailsDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReservationToDelete(reservation.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
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
                          <span className="font-medium text-sm">
                            {format(new Date(reservation.reservation_date + 'T00:00:00'), "dd MMM yyyy", { locale: es })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {reservation.reservation_time}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{reservation.customer_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <a 
                            href={`tel:${reservation.customer_phone}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{reservation.customer_phone}</span>
                          </a>
                          <a 
                            href={`mailto:${reservation.customer_email}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{reservation.customer_email}</span>
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{reservation.party_size}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          <Badge 
                            variant={STATUS_COLORS[reservation.status] || "outline"}
                            className={`text-xs ${reservation.status === "pending" ? "border-orange-500 text-orange-500" : ""}`}
                          >
                            {STATUS_OPTIONS.find(o => o.value === reservation.status)?.label}
                          </Badge>
                          {reservation.status === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(reservation.id, "confirmed")}
                                className="h-7 w-7 p-0"
                                title="Confirmar"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(reservation.id, "cancelled")}
                                className="h-7 w-7 p-0"
                                title="Rechazar"
                              >
                                <XCircle className="w-3.5 h-3.5 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setDetailsDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReservationToDelete(reservation.id);
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
                  <h4 className="font-semibold mb-2">Solicitudes Especiales del Cliente</h4>
                  <p className="text-sm text-muted-foreground">{selectedReservation.special_requests}</p>
                </div>
              )}
              {selectedReservation.decline_reason && (
                <div>
                  <h4 className="font-semibold mb-2 text-destructive">Motivo de Rechazo</h4>
                  <p className="text-sm text-muted-foreground">{selectedReservation.decline_reason}</p>
                </div>
              )}
              <div>
                <Label htmlFor="internal_notes">Notas Internas (privadas)</Label>
                <Textarea
                  id="internal_notes"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Ej: Mesa preferida cerca de la ventana, cliente VIP, alergias..."
                  className="mt-1"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Solo para uso interno, no visible para el cliente
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveNotes} className="flex-1">
                  Guardar Notas
                </Button>
                <Button variant="outline" onClick={() => {
                  setDetailsDialogOpen(false);
                  setSelectedReservation(null);
                }}>
                  Cerrar
                </Button>
              </div>
              <div className="pt-2 border-t">
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
        className="fixed bottom-8 right-8 sm:right-24 rounded-full w-10 h-10 sm:w-12 sm:h-12 shadow-lg z-50"
        size="icon"
      >
        <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      </div>
    </TooltipProvider>
  );
};

export default ReservationsList;
