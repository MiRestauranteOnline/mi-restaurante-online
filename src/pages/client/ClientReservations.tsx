import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ReservationSchedules from "@/components/client/ReservationSchedules";
import ReservationsList from "@/components/client/ReservationsList";
import ReservationAvailability from "@/components/client/ReservationAvailability";
import TableConfigurationManager from "@/components/client/TableConfigurationManager";
import { ReservationCalendar } from "@/components/client/ReservationCalendar";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";


const ClientReservations = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { toast } = useToast();
  const [reservationsEmail, setReservationsEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reservationFormVisible, setReservationFormVisible] = useState(false);
  const [isLoadingVisibility, setIsLoadingVisibility] = useState(false);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!clientId) return;
      
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("reservations_email")
        .eq("id", clientId)
        .single();

      if (clientError) {
        console.error("Error fetching client data:", clientError);
        return;
      }

      if (clientData?.reservations_email) {
        setReservationsEmail(clientData.reservations_email);
      }

      // Fetch admin_content for visibility toggle
      const { data: adminData, error: adminError } = await supabase
        .from("admin_content")
        .select("homepage_reservations_section_visible")
        .eq("client_id", clientId)
        .single();

      if (adminError) {
        console.error("Error fetching admin content:", adminError);
        return;
      }

      if (adminData) {
        setReservationFormVisible(adminData.homepage_reservations_section_visible ?? false);
      }
    };

    fetchClientData();
  }, [clientId]);

  const handleSaveEmail = async () => {
    if (!clientId) return;

    setIsLoading(true);
    const { error } = await supabase
      .from("clients")
      .update({ reservations_email: reservationsEmail })
      .eq("id", clientId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el email de reservas",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Guardado",
        description: "Email de reservas actualizado correctamente",
      });
    }
    setIsLoading(false);
  };

  const handleToggleVisibility = async (checked: boolean) => {
    if (!clientId) return;

    setIsLoadingVisibility(true);
    const { error } = await supabase
      .from("admin_content")
      .update({ homepage_reservations_section_visible: checked })
      .eq("client_id", clientId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la visibilidad",
        variant: "destructive",
      });
      setIsLoadingVisibility(false);
      return;
    }

    setReservationFormVisible(checked);
    toast({
      title: "Actualizado",
      description: checked 
        ? "El formulario de reservas ahora es visible en tu sitio" 
        : "El formulario de reservas está oculto en tu sitio",
    });
    setIsLoadingVisibility(false);
  };

  if (!clientId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No se pudo cargar la información de reservas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Gestión de Reservas</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Administra tus horarios disponibles y las reservas recibidas de tus clientes.
        </p>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1">
          <TabsTrigger value="calendar" className="text-xs sm:text-sm">Calendario</TabsTrigger>
          <TabsTrigger value="availability" className="text-xs sm:text-sm">Disponibilidad</TabsTrigger>
          <TabsTrigger value="tables" className="text-xs sm:text-sm">Capacidad</TabsTrigger>
          <TabsTrigger value="schedules" className="text-xs sm:text-sm">Horarios</TabsTrigger>
          <TabsTrigger value="reservations" className="text-xs sm:text-sm">Reservas</TabsTrigger>
        </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <Card className="p-6">
              <ReservationCalendar clientId={clientId} />
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad en Tiempo Real</CardTitle>
              <CardDescription>
                Vista rápida de la capacidad disponible y agregar reservas manualmente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DebugErrorBoundary>
                <ReservationAvailability clientId={clientId} />
              </DebugErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Mesas</CardTitle>
              <CardDescription>
                Define los tipos de mesas y su capacidad para gestionar reservas de forma precisa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableConfigurationManager clientId={clientId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Horarios Disponibles</CardTitle>
              <CardDescription>
                Define los días y horarios en los que tu restaurante acepta reservas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReservationSchedules clientId={clientId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Notificaciones</CardTitle>
                <CardDescription>
                  Configura el email donde recibirás las notificaciones de reservas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <Label htmlFor="reservation-visibility">Mostrar formulario de reservas</Label>
                      <p className="text-sm text-muted-foreground">
                        Una vez configurado, activa este toggle para mostrar el formulario de reservas en tu sitio
                      </p>
                    </div>
                    <Switch
                      id="reservation-visibility"
                      checked={reservationFormVisible}
                      onCheckedChange={handleToggleVisibility}
                      disabled={isLoadingVisibility}
                    />
                  </div>

                  <div>
                    <Label htmlFor="reservations_email">Email de Reservas</Label>
                    <Input
                      id="reservations_email"
                      type="email"
                      value={reservationsEmail}
                      onChange={(e) => setReservationsEmail(e.target.value)}
                      placeholder="reservas@mirestaurante.com"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Si está vacío, se usará el email general del restaurante
                    </p>
                  </div>
                  <Button onClick={handleSaveEmail} disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar Email"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reservas Recibidas</CardTitle>
                <CardDescription>
                  Visualiza y gestiona todas las reservas de tus clientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReservationsList clientId={clientId} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientReservations;
