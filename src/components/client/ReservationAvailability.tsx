import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ReservationSchedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  capacity: number;
  duration_minutes: number;
  min_party_size: number;
  max_party_size: number;
  is_active: boolean;
}

interface Reservation {
  id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: string;
}

interface TimeSlotAvailability {
  day: number;
  time: string;
  capacity: number;
  available: number;
}

interface ReservationAvailabilityProps {
  clientId: string;
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const ReservationAvailability = ({ clientId }: ReservationAvailabilityProps) => {
  const [schedules, setSchedules] = useState<ReservationSchedule[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [availability, setAvailability] = useState<TimeSlotAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    reservation_date: "",
    reservation_time: "",
    party_size: 2,
  });

  useEffect(() => {
    fetchData();
  }, [clientId]);

  useEffect(() => {
    if (schedules.length > 0 && reservations.length >= 0) {
      calculateAvailability();
    }
  }, [schedules, reservations]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, reservationsRes] = await Promise.all([
        supabase
          .from("reservation_schedules")
          .select("*")
          .eq("client_id", clientId)
          .eq("is_active", true)
          .order("day_of_week", { ascending: true })
          .order("start_time", { ascending: true }),
        supabase
          .from("reservations")
          .select("*")
          .eq("client_id", clientId)
          .in("status", ["pending", "confirmed"])
          .gte("reservation_date", new Date().toISOString().split("T")[0]),
      ]);

      if (schedulesRes.error) throw schedulesRes.error;
      if (reservationsRes.error) throw reservationsRes.error;

      setSchedules(schedulesRes.data || []);
      setReservations(reservationsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de disponibilidad.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAvailability = () => {
    const availabilityMap: TimeSlotAvailability[] = [];

    schedules.forEach((schedule) => {
      const startTime = schedule.start_time.substring(0, 5);
      
      // Count reservations for this day/time
      const dayReservations = reservations.filter((res) => {
        const resDate = new Date(res.reservation_date);
        const resDayOfWeek = resDate.getDay();
        const resTime = res.reservation_time.substring(0, 5);
        
        return resDayOfWeek === schedule.day_of_week && resTime === startTime;
      });

      const bookedCapacity = dayReservations.reduce((sum, res) => sum + res.party_size, 0);
      const available = Math.max(0, schedule.capacity - bookedCapacity);

      availabilityMap.push({
        day: schedule.day_of_week,
        time: startTime,
        capacity: schedule.capacity,
        available,
      });
    });

    setAvailability(availabilityMap);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("reservations").insert({
        client_id: clientId,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time,
        party_size: formData.party_size,
        status: "confirmed",
      });

      if (error) throw error;

      toast({
        title: "Reserva creada",
        description: "La reserva manual se ha creado exitosamente.",
      });

      setIsDialogOpen(false);
      setFormData({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        reservation_date: "",
        reservation_time: "",
        party_size: 2,
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la reserva.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupedByDay = availability.reduce((acc, slot) => {
    if (!acc[slot.day]) acc[slot.day] = [];
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<number, TimeSlotAvailability[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Vista Rápida de Disponibilidad</h3>
          <p className="text-sm text-muted-foreground">
            Capacidad disponible por día y horario
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Reserva Manual
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Reserva Manual</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customer_name">Nombre del Cliente</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customer_phone">Teléfono</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reservation_date">Fecha</Label>
                <Input
                  id="reservation_date"
                  type="date"
                  value={formData.reservation_date}
                  onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reservation_time">Hora</Label>
                <Input
                  id="reservation_time"
                  type="time"
                  value={formData.reservation_time}
                  onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="party_size">Número de Personas</Label>
                <Input
                  id="party_size"
                  type="number"
                  min="1"
                  value={formData.party_size}
                  onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Reserva"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedByDay).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay horarios configurados. Configure horarios disponibles primero.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {Object.entries(groupedByDay)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([day, slots]) => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="text-base">{DAYS[parseInt(day)]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-center ${
                          slot.available === 0
                            ? "bg-destructive/10 border-destructive"
                            : slot.available <= slot.capacity * 0.3
                            ? "bg-yellow-500/10 border-yellow-500"
                            : "bg-green-500/10 border-green-500"
                        }`}
                      >
                        <div className="font-semibold text-sm">{slot.time}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {slot.available} / {slot.capacity} disponibles
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default ReservationAvailability;
