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

interface RegistrationCompleteEmailProps {
  restaurantName: string;
  subdomain: string;
}

export const RegistrationCompleteEmail = ({
  restaurantName,
  subdomain,
}: RegistrationCompleteEmailProps) => (
  <Html>
    <Head />
    <Preview>¡Registro completo! Tu sitio web estará listo pronto</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>¡Gracias por registrarte, {restaurantName}! 🎊</Heading>
        
        <Text style={text}>
          Hemos recibido toda tu información y nuestro equipo está trabajando para tener tu sitio web 
          profesional listo y en línea.
        </Text>

        <Section style={highlightBox}>
          <Text style={highlightText}>
            <strong>⏱️ Tu sitio estará listo dentro de 72 horas</strong>
          </Text>
        </Section>

        <Hr style={hr} />

        <Heading style={h2}>📍 ¿Prefieres tu propio dominio?</Heading>
        
        <Text style={text}>
          Por defecto, tu sitio estará disponible en: <strong>{subdomain}.mirestaurante.online</strong>
        </Text>

        <Text style={text}>
          Si prefieres usar tu propio dominio (ej: www.turestaurante.com), necesitas configurar 
          los nameservers en tu proveedor de hosting:
        </Text>

        <Section style={codeBox}>
          <Text style={codeText}>ns1.lovableproject.com</Text>
          <Text style={codeText}>ns2.lovableproject.com</Text>
        </Section>

        <Section style={buttonContainer}>
          <Link href="https://mirestaurante.online/panel/guias/configurar-dominio" style={button}>
            Ver Guía de Configuración (NameCheap)
          </Link>
        </Section>

        <Text style={text}>
          <strong>¿No tienes un dominio todavía?</strong> Recomendamos configurarlo en{' '}
          <Link href="https://www.namecheap.com" style={link}>NameCheap</Link> - 
          es rápido, confiable y asequible.
        </Text>

        <Text style={smallText}>
          <em>
            ℹ️ No compramos dominios por nuestros clientes porque los dominios son propiedad personal 
            y requieren información de contacto específica. Queremos que tú mantengas el control total 
            de tu dominio.
          </em>
        </Text>

        <Hr style={hr} />

        <Heading style={h2}>📧 Configuración de Email (Opcional)</Heading>
        
        <Text style={text}>
          ¿Quieres emails profesionales con tu dominio? (ej: contacto@turestaurante.com)
        </Text>

        <Section style={buttonContainer}>
          <Link href="https://mirestaurante.online/panel/guias/configurar-email" style={buttonSecondary}>
            Ver Guía de Email
          </Link>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          <strong>Una vez que hayas configurado tus nameservers</strong>, simplemente responde a este email 
          para notificarnos. Si prefieres que nosotros lo hagamos por ti, puedes enviarnos tus credenciales 
          de acceso a tu proveedor de dominios y lo configuraremos sin costo adicional.
        </Text>

        <Text style={text}>
          ¿Preguntas? Contáctanos en{' '}
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

export default RegistrationCompleteEmail;

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

const h2 = {
  color: '#1a1a1a',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
  padding: '0',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const smallText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 0',
};

const highlightBox = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const highlightText = {
  color: '#92400e',
  fontSize: '18px',
  margin: '0',
};

const codeBox = {
  backgroundColor: '#f4f4f4',
  padding: '16px',
  borderRadius: '6px',
  border: '1px solid #e6e6e6',
  margin: '16px 0',
};

const codeText = {
  color: '#333',
  fontSize: '16px',
  fontFamily: 'monospace',
  margin: '4px 0',
};

const buttonContainer = {
  margin: '24px 0',
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

const buttonSecondary = {
  backgroundColor: '#64748b',
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
