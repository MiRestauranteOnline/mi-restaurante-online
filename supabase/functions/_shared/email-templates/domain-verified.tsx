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

interface DomainVerifiedEmailProps {
  restaurantName: string;
  domain: string;
  dashboardUrl: string;
}

export const DomainVerifiedEmail = ({
  restaurantName,
  domain,
  dashboardUrl,
}: DomainVerifiedEmailProps) => (
  <Html>
    <Head />
    <Preview>¡Tu dominio personalizado está activo! 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>¡Tu Dominio Está Listo! 🎉</Heading>
        
        <Text style={text}>
          Hola {restaurantName},
        </Text>

        <Text style={text}>
          ¡Excelentes noticias! Tu dominio personalizado <strong>{domain}</strong> ha sido verificado exitosamente y ahora está activo con certificado SSL.
        </Text>

        <Section style={infoBox}>
          <Text style={infoText}>
            <strong>🌐 Tu sitio web está disponible en:</strong><br />
            <Link href={`https://${domain}`} style={link}>{domain}</Link>
          </Text>
        </Section>

        <Text style={text}>
          Tu sitio web ahora es completamente profesional con tu propio dominio. Puedes compartir esta dirección con confianza en tus redes sociales, tarjetas de presentación y materiales de marketing.
        </Text>

        <Section style={buttonContainer}>
          <Link href={dashboardUrl} style={button}>
            Ver mi Panel
          </Link>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          <strong>Próximos pasos recomendados:</strong>
        </Text>
        <Text style={text}>
          • Actualiza tu información de contacto en redes sociales<br />
          • Comparte tu nuevo sitio web con tus clientes<br />
          • Configura tu email profesional (opcional)
        </Text>

        <Text style={text}>
          Si tienes alguna pregunta, contáctanos en{' '}
          <Link href="mailto:soporte@mirestaurante.online" style={link}>
            soporte@mirestaurante.online
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

export default DomainVerifiedEmail;

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
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0',
};

const infoText = {
  color: '#166534',
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
