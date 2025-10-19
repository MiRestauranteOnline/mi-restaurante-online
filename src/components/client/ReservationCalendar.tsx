import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

interface Reservation {
  id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: string;
}

interface ReservationCalendarProps {
  clientId: string;
}

export const ReservationCalendar = ({ clientId }: ReservationCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
    
    // Real-time subscription
    const channel = supabase
      .channel('calendar-reservations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `client_id=eq.${clientId}`
        },
        () => {
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, currentMonth]);

  const fetchReservations = async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("client_id", clientId)
      .gte("reservation_date", format(start, 'yyyy-MM-dd'))
      .lte("reservation_date", format(end, 'yyyy-MM-dd'))
      .order("reservation_time");

    if (!error && data) {
      setReservations(data);
    }
    setLoading(false);
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getReservationsForDate = (date: Date) => {
    return reservations.filter(res => {
      // Parse the date string in local timezone context (YYYY-MM-DD)
      // The reservation_date is already stored in the client's timezone
      const resDate = new Date(res.reservation_date + 'T00:00:00');
      return isSameDay(resDate, date);
    });
  };

  const selectedReservations = selectedDate ? getReservationsForDate(selectedDate) : [];

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-green-500",
    cancelled: "bg-red-500",
    completed: "bg-blue-500"
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendario de Reservas
              </CardTitle>
              <CardDescription>Vista mensual de todas las reservas</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[200px] text-center">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando calendario...</div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="text-center font-medium text-sm py-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {daysInMonth.map(date => {
                const dayReservations = getReservationsForDate(date);
                const hasReservations = dayReservations.length > 0;
                
                return (
                  <button
                    key={date.toString()}
                    onClick={() => hasReservations && setSelectedDate(date)}
                    className={`
                      relative min-h-[80px] p-2 rounded-lg border transition-all
                      ${!isSameMonth(date, currentMonth) ? 'bg-muted/30 text-muted-foreground' : 'bg-background'}
                      ${hasReservations ? 'hover:bg-accent cursor-pointer' : 'cursor-default'}
                      ${selectedDate && isSameDay(date, selectedDate) ? 'ring-2 ring-primary' : ''}
                    `}
                  >
                    <div className="text-sm font-medium">{format(date, 'd')}</div>
                    {hasReservations && (
                      <div className="mt-1 space-y-1">
                        <Badge variant="secondary" className="text-xs w-full justify-center">
                          {dayReservations.length} reserva{dayReservations.length !== 1 ? 's' : ''}
                        </Badge>
                        <div className="flex gap-1 justify-center flex-wrap">
                          {Object.entries(
                            dayReservations.reduce((acc, res) => {
                              acc[res.status] = (acc[res.status] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([status, count]) => (
                            <div 
                              key={status}
                              className={`h-2 w-2 rounded-full ${STATUS_COLORS[status] || 'bg-gray-500'}`}
                              title={`${count} ${status}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={selectedDate !== null} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Reservas del {selectedDate && format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedReservations.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay reservas para este día</p>
            ) : (
              selectedReservations.map(res => (
                <Card key={res.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{res.customer_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {res.reservation_time} • {res.party_size} personas
                        </div>
                        <div className="text-sm">
                          📞 <a href={`tel:${res.customer_phone}`} className="hover:underline">{res.customer_phone}</a>
                        </div>
                        <div className="text-sm">
                          ✉️ <a href={`mailto:${res.customer_email}`} className="hover:underline">{res.customer_email}</a>
                        </div>
                      </div>
                      <Badge variant={
                        res.status === 'confirmed' ? 'default' :
                        res.status === 'pending' ? 'outline' :
                        res.status === 'cancelled' ? 'destructive' : 'secondary'
                      }>
                        {res.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
