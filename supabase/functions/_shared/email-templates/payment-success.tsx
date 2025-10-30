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

interface PaymentSuccessEmailProps {
  restaurantName: string;
  amount: string;
  planType: string;
  nextBillingDate: string;
  transactionId: string;
}

export const PaymentSuccessEmail = ({
  restaurantName,
  amount,
  planType,
  nextBillingDate,
  transactionId,
}: PaymentSuccessEmailProps) => (
  <Html>
    <Head />
    <Preview>Pago recibido - Gracias por tu suscripción</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>✅ Pago Recibido Exitosamente</Heading>
        
        <Text style={text}>
          Hola {restaurantName},
        </Text>

        <Text style={text}>
          ¡Gracias por tu pago! Tu suscripción sigue activa y tu sitio web continúa en línea.
        </Text>

        <Section style={detailsBox}>
          <Text style={detailsTitle}>Detalles del Pago</Text>
          <Hr style={hr} />
          <Text style={detailsItem}>
            <strong>Monto pagado:</strong> S/ {amount}
          </Text>
          <Text style={detailsItem}>
            <strong>Plan:</strong> {planType === 'basic' ? 'Plan Básico' : 'Plan Avanzado'}
          </Text>
          <Text style={detailsItem}>
            <strong>Próximo cobro:</strong> {nextBillingDate}
          </Text>
          <Text style={detailsItem}>
            <strong>ID de transacción:</strong> {transactionId}
          </Text>
        </Section>

        <Text style={text}>
          Tu sitio web seguirá funcionando sin interrupciones. Puedes acceder a tu panel de control 
          en cualquier momento para gestionar tu contenido.
        </Text>

        <Section style={buttonContainer}>
          <Link href="https://mirestaurante.online/login" style={button}>
            Acceder a mi Panel
          </Link>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          Si necesitas un recibo o tienes alguna pregunta sobre tu facturación, contáctanos en{' '}
          <Link href="mailto:pagos@mirestaurante.online" style={link}>
            pagos@mirestaurante.online
          </Link>
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

export default PaymentSuccessEmail;

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

const detailsBox = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  margin: '24px 0',
};

const detailsTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
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

const link = {
  color: '#e11d48',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '16px 0',
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
  textAlign: 'center' as const,
};
