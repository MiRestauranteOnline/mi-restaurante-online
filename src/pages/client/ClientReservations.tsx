import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReservationSchedules from "@/components/client/ReservationSchedules";
import ReservationsList from "@/components/client/ReservationsList";
import ReservationAvailability from "@/components/client/ReservationAvailability";
import TableConfigurationManager from "@/components/client/TableConfigurationManager";


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
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestión de Reservas</h1>
        <p className="text-muted-foreground">
          Administra tus horarios disponibles y las reservas recibidas de tus clientes.
        </p>
      </div>

      <Tabs defaultValue="availability" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
          <TabsTrigger value="tables">Capacidad</TabsTrigger>
          <TabsTrigger value="schedules">Horarios</TabsTrigger>
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad en Tiempo Real</CardTitle>
              <CardDescription>
                Vista rápida de la capacidad disponible y agregar reservas manualmente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReservationAvailability clientId={clientId} />
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
