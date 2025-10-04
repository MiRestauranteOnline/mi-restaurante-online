import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, ArrowUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getCurrentDateInTimezone, combineDateTimeToUtc, extractDateTimeFromUtc } from "@/lib/timezone";

interface CustomTableConfig {
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
  duration_minutes: number;
  is_active: boolean;
  custom_table_configs: CustomTableConfig[] | null;
}

interface TableConfiguration {
  id: string;
  table_name: string;
  seats: number;
  quantity: number;
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
  table_config_id: string | null;
}

interface TableAvailability {
  config_id: string;
  table_name: string;
  seats: number;
  total: number;
  available: number;
}

interface TimeSlotAvailability {
  date: string;
  time: string;
  dayOfWeek: number;
  tables: TableAvailability[];
  totalAvailable: number;
}

interface ReservationAvailabilityProps {
  clientId: string;
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const ReservationAvailability = ({ clientId }: ReservationAvailabilityProps) => {
  const [schedules, setSchedules] = useState<ReservationSchedule[]>([]);
  const [tableConfigs, setTableConfigs] = useState<TableConfiguration[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [availability, setAvailability] = useState<TimeSlotAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientTimezone, setClientTimezone] = useState<string>("America/Lima");
  const [showBackToTop, setShowBackToTop] = useState(false);
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

    // Subscribe to real-time reservation changes
    const channel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `client_id=eq.${clientId}`
        },
        () => {
          console.log('Reservation change detected, refetching data...');
          fetchData();
        }
      )
      .subscribe();

    // Handle scroll for back-to-top button
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [clientId]);

  useEffect(() => {
    if (schedules.length > 0 && tableConfigs.length > 0) {
      calculateAvailability();
    }
  }, [schedules, tableConfigs, reservations]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientRes, schedulesRes, tableConfigsRes, reservationsRes] = await Promise.all([
        supabase
          .from("clients")
          .select("timezone")
          .eq("id", clientId)
          .single(),
        supabase
          .from("reservation_schedules")
          .select("*")
          .eq("client_id", clientId)
          .eq("is_active", true)
          .order("day_of_week", { ascending: true })
          .order("start_time", { ascending: true }),
        supabase
          .from("table_configurations")
          .select("*")
          .eq("client_id", clientId)
          .eq("is_active", true)
          .order("seats", { ascending: true }),
        supabase
          .from("reservations")
          .select("*")
          .eq("client_id", clientId)
          .eq("status", "confirmed")
          .gte("reservation_date", getCurrentDateInTimezone(clientTimezone)),
      ]);

      if (clientRes.error) throw clientRes.error;
      if (schedulesRes.error) throw schedulesRes.error;
      if (tableConfigsRes.error) throw tableConfigsRes.error;
      if (reservationsRes.error) throw reservationsRes.error;

      setClientTimezone(clientRes.data.timezone || "America/Lima");
      setSchedules((schedulesRes.data as any) || []);
      setTableConfigs(tableConfigsRes.data || []);
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
    const today = new Date();
    const daysToShow = 28;
    const slotInterval = 30;

    for (let dayOffset = 0; dayOffset < daysToShow; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];

      const daySchedules = schedules.filter(s => s.day_of_week === dayOfWeek);

      daySchedules.forEach((schedule) => {
        const startHour = parseInt(schedule.start_time.substring(0, 2));
        const startMin = parseInt(schedule.start_time.substring(3, 5));
        const endHour = parseInt(schedule.end_time.substring(0, 2));
        const endMin = parseInt(schedule.end_time.substring(3, 5));
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        // Use custom configs if available, otherwise use global configs
        const activeTableConfigs = schedule.custom_table_configs && schedule.custom_table_configs.length > 0
          ? schedule.custom_table_configs.map((ct, index) => ({
              id: `custom-${schedule.id}-${index}`,
              table_name: ct.table_name,
              seats: ct.seats,
              quantity: ct.quantity,
              min_party_size: ct.min_party_size,
              max_party_size: ct.max_party_size,
              is_active: true,
            }))
          : tableConfigs;
        
        for (let slotStart = startMinutes; slotStart < endMinutes; slotStart += slotInterval) {
          const slotHour = Math.floor(slotStart / 60);
          const slotMin = slotStart % 60;
          const timeStr = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;
          
          const overlappingReservations = reservations.filter((res) => {
            if (res.reservation_date !== dateStr) return false;
            
            const resHour = parseInt(res.reservation_time.substring(0, 2));
            const resMin = parseInt(res.reservation_time.substring(3, 5));
            const resStartMinutes = resHour * 60 + resMin;
            const resEndMinutes = resStartMinutes + schedule.duration_minutes;
            
            const slotEndMinutes = slotStart + slotInterval;
            return (slotStart < resEndMinutes && slotEndMinutes > resStartMinutes);
          });

          const tableAvailability: TableAvailability[] = activeTableConfigs.map((config) => {
            // Match reservations by table characteristics (name + seats) not just ID
            // This handles both global configs and custom schedule-specific configs
            const reservationsUsingThisTable = overlappingReservations.filter((res) => {
              // First try direct ID match (for global configs)
              if (res.table_config_id === config.id) return true;
              
              // Then try matching by table characteristics (for custom configs)
              const resTableConfig = tableConfigs.find(tc => tc.id === res.table_config_id);
              return resTableConfig && 
                     resTableConfig.table_name === config.table_name && 
                     resTableConfig.seats === config.seats;
            });
            const usedTables = reservationsUsingThisTable.length;
            const available = Math.max(0, config.quantity - usedTables);

            return {
              config_id: config.id,
              table_name: config.table_name,
              seats: config.seats,
              total: config.quantity,
              available,
            };
          });

          const totalAvailable = tableAvailability.reduce((sum, t) => sum + t.available, 0);

          availabilityMap.push({
            date: dateStr,
            time: timeStr,
            dayOfWeek,
            tables: tableAvailability,
            totalAvailable,
          });
        }
      });
    }

    setAvailability(availabilityMap);
  };

  const findBestTableForPartySize = (partySize: number, date: string, time: string) => {
    const slot = availability.find(s => s.date === date && s.time === time);
    if (!slot) return null;

    const suitableTables = slot.tables.filter((table) => {
      const config = tableConfigs.find(c => c.id === table.config_id);
      return (
        config &&
        table.available > 0 &&
        partySize >= config.min_party_size &&
        partySize <= config.max_party_size
      );
    });

    if (suitableTables.length === 0) return null;

    suitableTables.sort((a, b) => a.seats - b.seats);
    return suitableTables[0].config_id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const tableConfigId = findBestTableForPartySize(
        formData.party_size,
        formData.reservation_date,
        formData.reservation_time
      );

      if (!tableConfigId) {
        toast({
          title: "No hay mesas disponibles",
          description: `No hay mesas disponibles para ${formData.party_size} personas en este horario.`,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Store date and time in client's local timezone (not UTC)
      // This keeps date/time fields consistent with the client's timezone
      const { error } = await supabase.from("reservations").insert({
        client_id: clientId,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time,
        party_size: formData.party_size,
        table_config_id: tableConfigId,
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

  const groupedByDate = availability.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlotAvailability[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const dayName = DAYS[date.getDay()];
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    return `${dayName} ${day} ${month}`;
  };

  const dateLabels = Object.keys(groupedByDate).sort();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Vista Rápida de Disponibilidad</h3>
          <p className="text-sm text-muted-foreground">
            Capacidad disponible por tipo de mesa
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

      {Object.keys(groupedByDate).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {tableConfigs.length === 0
              ? "Configure tipos de mesas primero en la pestaña Capacidad."
              : "No hay horarios configurados. Configure horarios disponibles en la pestaña Horarios."}
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-6">
          {/* Sticky Date Navigation */}
          <div className="w-48 flex-shrink-0">
            <div className="sticky top-4 space-y-2">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Índice de Fechas</h4>
              {dateLabels.map((date) => (
                <button
                  key={date}
                  onClick={() => {
                    const element = document.getElementById(`date-${date}`);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Cards */}
          <div className="flex-1 grid gap-4">
            {dateLabels.map((date) => {
              const slots = groupedByDate[date];
              return (
                <Card key={date} id={`date-${date}`} className="scroll-mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">{formatDate(date)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {slots.map((slot, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <div className="font-semibold">{slot.time}</div>
                            <div className={`text-sm font-medium ${
                              slot.totalAvailable === 0
                                ? "text-destructive"
                                : slot.totalAvailable <= 3
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}>
                              {slot.totalAvailable} mesa{slot.totalAvailable !== 1 ? 's' : ''} disponible{slot.totalAvailable !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {slot.tables.map((table) => (
                              <div
                                key={table.config_id}
                                className={`p-2 rounded text-center text-xs ${
                                  table.available === 0
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-primary/10 text-primary"
                                }`}
                              >
                                <div className="font-medium">{table.table_name}</div>
                                <div className="text-xs mt-1">
                                  {table.available}/{table.total}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full w-12 h-12 shadow-lg"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default ReservationAvailability;
