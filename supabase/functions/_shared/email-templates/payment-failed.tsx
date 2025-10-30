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

interface PaymentFailedEmailProps {
  restaurantName: string;
  amount: string;
  planType: string;
  failureCount: number;
  retryDate?: string;
}

export const PaymentFailedEmail = ({
  restaurantName,
  amount,
  planType,
  failureCount,
  retryDate,
}: PaymentFailedEmailProps) => (
  <Html>
    <Head />
    <Preview>Problema con tu pago - Acción requerida</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>⚠️ Problema con tu Pago</Heading>
        
        <Text style={text}>
          Hola {restaurantName},
        </Text>

        <Text style={text}>
          No pudimos procesar tu pago mensual. Esto puede deberse a fondos insuficientes, 
          una tarjeta vencida, o un problema temporal con tu banco.
        </Text>

        <Section style={warningBox}>
          <Text style={warningText}>
            <strong>Intento {failureCount} de 3</strong>
          </Text>
          <Text style={warningSubtext}>
            {failureCount >= 3 
              ? 'Tu suscripción ha sido suspendida. Por favor actualiza tu método de pago.'
              : retryDate 
                ? `Reintentaremos el cobro automáticamente el ${retryDate}`
                : 'Reintentaremos el cobro en los próximos días'
            }
          </Text>
        </Section>

        <Section style={detailsBox}>
          <Text style={detailsItem}>
            <strong>Monto pendiente:</strong> S/ {amount}
          </Text>
          <Text style={detailsItem}>
            <strong>Plan:</strong> {planType === 'basic' ? 'Plan Básico' : 'Plan Avanzado'}
          </Text>
        </Section>

        {failureCount >= 3 ? (
          <>
            <Section style={alertBox}>
              <Text style={alertText}>
                ⚠️ Tu sitio web ha sido desactivado temporalmente
              </Text>
            </Section>
            <Text style={text}>
              Para reactivar tu sitio y evitar perder tu contenido, por favor actualiza tu método 
              de pago lo antes posible.
            </Text>
          </>
        ) : (
          <Text style={text}>
            No necesitas hacer nada si ya actualizaste tu método de pago. Si el problema persiste, 
            tu sitio será desactivado después de 3 intentos fallidos.
          </Text>
        )}

        <Section style={buttonContainer}>
          <Link href="https://mirestaurante.online/login" style={button}>
            Actualizar Método de Pago
          </Link>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          Si necesitas ayuda o tienes preguntas sobre tu facturación, no dudes en contactarnos:
        </Text>

        <Text style={contactText}>
          📧 Email: <Link href="mailto:pagos@mirestaurante.online" style={link}>pagos@mirestaurante.online</Link>
          <br />
          💬 WhatsApp: <Link href="https://wa.me/51123456789" style={link}>+51 123 456 789</Link>
        </Text>

        <Text style={footer}>
          <Link href="https://mirestaurante.online" target="_blank" style={link}>
            MiRestaurante.online
          </Link>
          <br />
          Sitios web profesionales para restaurantes en Perú
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PaymentFailedEmail;

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

const contactText = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '16px 0',
};

const warningBox = {
  backgroundColor: '#fef3c7',
  padding: '24px',
  borderRadius: '8px',
  border: '2px solid #fbbf24',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const warningText = {
  color: '#92400e',
  fontSize: '20px',
  margin: '0 0 8px',
};

const warningSubtext = {
  color: '#92400e',
  fontSize: '16px',
  margin: '0',
};

const alertBox = {
  backgroundColor: '#fee2e2',
  padding: '20px',
  borderRadius: '8px',
  border: '2px solid #ef4444',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const alertText = {
  color: '#991b1b',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
};

const detailsBox = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  margin: '24px 0',
};

const detailsItem = {
  color: '#484848',
  fontSize: '15px',
  margin: '8px 0',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#44a79b',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
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
