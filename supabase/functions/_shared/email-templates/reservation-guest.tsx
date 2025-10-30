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

interface ReservationGuestEmailProps {
  restaurantName: string;
  customerName: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  specialRequests?: string;
  restaurantPhone: string;
  restaurantEmail: string;
  restaurantAddress: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  declineReason?: string;
}

export const ReservationGuestEmail = ({
  restaurantName,
  customerName,
  reservationDate,
  reservationTime,
  partySize,
  specialRequests,
  restaurantPhone,
  restaurantEmail,
  restaurantAddress,
  status,
  declineReason,
}: ReservationGuestEmailProps) => {
  const getStatusText = () => {
    if (status === 'confirmed') return 'confirmada';
    if (status === 'cancelled') return 'cancelada';
    return 'recibida';
  };

  const getStatusEmoji = () => {
    if (status === 'confirmed') return '✅';
    if (status === 'cancelled') return '❌';
    return '⏳';
  };

  return (
    <Html>
      <Head />
      <Preview>
        {status === 'confirmed' && `¡Reserva confirmada en ${restaurantName}!`}
        {status === 'cancelled' && `Reserva cancelada - ${restaurantName}`}
        {status === 'pending' && `Reserva recibida en ${restaurantName}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {getStatusEmoji()} Reserva {getStatusText()}
          </Heading>
          
          <Text style={text}>
            Hola {customerName},
          </Text>

          {status === 'confirmed' && (
            <Text style={text}>
              ¡Excelentes noticias! Tu reserva en <strong>{restaurantName}</strong> ha sido confirmada.
            </Text>
          )}

          {status === 'pending' && (
            <Text style={text}>
              Hemos recibido tu solicitud de reserva en <strong>{restaurantName}</strong>. Te confirmaremos pronto.
            </Text>
          )}

          {status === 'cancelled' && (
            <>
              <Text style={text}>
                Lamentablemente, tu reserva en <strong>{restaurantName}</strong> ha sido cancelada.
              </Text>
              {declineReason && (
                <Section style={warningBox}>
                  <Text style={warningText}>
                    <strong>Motivo:</strong> {declineReason}
                  </Text>
                </Section>
              )}
              <Text style={text}>
                Por favor, contacta con el restaurante para más información o para hacer una nueva reserva en otra fecha.
              </Text>
            </>
          )}

          {status !== 'cancelled' && (
            <Section style={infoBox}>
              <Text style={infoTitle}>Detalles de la Reserva</Text>
              <Text style={infoText}>
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
          )}

          <Hr style={hr} />

          <Text style={text}>
            <strong>Información de contacto:</strong>
          </Text>
          <Text style={text}>
            📍 {restaurantAddress}<br />
            📞 <Link href={`tel:${restaurantPhone}`} style={link}>{restaurantPhone}</Link><br />
            ✉️ <Link href={`mailto:${restaurantEmail}`} style={link}>{restaurantEmail}</Link>
          </Text>

          {status === 'confirmed' && (
            <Text style={text}>
              ¡Esperamos verte pronto! Si necesitas modificar o cancelar tu reserva, por favor contacta con nosotros.
            </Text>
          )}

          <Text style={footer}>
            <strong>{restaurantName}</strong><br />
            {restaurantAddress}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ReservationGuestEmail;

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
  backgroundColor: '#e6f7f5',
  border: '1px solid #44a79b',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#2d7a6e',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const infoText = {
  color: '#2d7a6e',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const warningText = {
  color: '#78350f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const link = {
  color: '#44a79b',
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
