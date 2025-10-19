import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReservationSchedules from "@/components/client/ReservationSchedules";
import ReservationsList from "@/components/client/ReservationsList";
import ReservationAvailability from "@/components/client/ReservationAvailability";
import TableConfigurationManager from "@/components/client/TableConfigurationManager";
import { ReservationCalendar } from "@/components/client/ReservationCalendar";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";


const ClientReservations = () => {
  const { clientId } = useParams<{ clientId: string }>();

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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientReservations;
