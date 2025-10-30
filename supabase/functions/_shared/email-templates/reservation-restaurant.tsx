import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ReservationRestaurantEmailProps {
  restaurantName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  specialRequests?: string;
  dashboardUrl: string;
}

export const ReservationRestaurantEmail = ({
  restaurantName,
  customerName,
  customerEmail,
  customerPhone,
  reservationDate,
  reservationTime,
  partySize,
  specialRequests,
  dashboardUrl,
}: ReservationRestaurantEmailProps) => (
  <Html>
    <Head />
    <Preview>Nueva reserva de {customerName} - {partySize} personas</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📋 Nueva Reserva Recibida</Heading>
        
        <Text style={text}>
          Hola {restaurantName},
        </Text>

        <Text style={text}>
          Has recibido una nueva solicitud de reserva. Por favor, revisa los detalles y confirma o rechaza la reserva desde tu panel.
        </Text>

        <Section style={infoBox}>
          <Text style={infoTitle}>Detalles de la Reserva</Text>
          <Text style={infoText}>
            <strong>Cliente:</strong> {customerName}<br />
            <strong>Email:</strong> <Link href={`mailto:${customerEmail}`} style={emailLink}>{customerEmail}</Link><br />
            <strong>Teléfono:</strong> <Link href={`tel:${customerPhone}`} style={emailLink}>{customerPhone}</Link><br />
            <strong>Fecha:</strong> {reservationDate}<br />
            <strong>Hora:</strong> {reservationTime}<br />
            <strong>Número de personas:</strong> {partySize}<br />
            {specialRequests && (
              <>
                <strong>Solicitudes especiales:</strong> {specialRequests}<br />
              </>
            )}
          </Text>
        </Section>

        <Section style={buttonContainer}>
          <Link href={dashboardUrl} style={button}>
            Ver y Gestionar Reserva
          </Link>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          <strong>Importante:</strong> Responde lo antes posible para confirmar o rechazar esta reserva. Una respuesta rápida mejora la experiencia de tus clientes.
        </Text>

        <Text style={text}>
          Puedes gestionar todas tus reservas desde el panel de control.
        </Text>

        <Text style={footer}>
          <Link href="https://mirestaurante.online" target="_blank" style={link}>
            MiRestaurante.online
          </Link>
          <br />
          Panel de Gestión de Reservas
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ReservationRestaurantEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 30px',
  padding: '0',
  lineHeight: '1.3',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const infoBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #93c5fd',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#1e3a8a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const infoText = {
  color: '#1e3a8a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#e11d48',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const emailLink = {
  color: '#1e3a8a',
  textDecoration: 'underline',
};

const link = {
  color: '#e11d48',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '30px 0',
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
  textAlign: 'center' as const,
};
