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

interface SiteLiveEmailProps {
  restaurantName: string;
  siteUrl: string;
  dashboardUrl: string;
  subdomain: string;
}

export const SiteLiveEmail = ({
  restaurantName,
  siteUrl,
  dashboardUrl,
  subdomain,
}: SiteLiveEmailProps) => (
  <Html>
    <Head />
    <Preview>¡Tu sitio web está en vivo! 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 ¡Tu Sitio Web Está en Vivo!</Heading>
        
        <Text style={text}>
          Hola {restaurantName},
        </Text>

        <Text style={text}>
          ¡Excelentes noticias! Tu sitio web profesional está ahora en vivo y accesible para todos.
        </Text>

        <Section style={highlightBox}>
          <Text style={highlightTitle}>Tu sitio web:</Text>
          <Link href={siteUrl} style={siteLink}>{siteUrl}</Link>
        </Section>

        <Section style={buttonContainer}>
          <Link href={siteUrl} style={button}>
            Ver Mi Sitio Web
          </Link>
        </Section>

        <Hr style={hr} />

        <Heading style={h2}>📊 Accede a tu Panel de Control</Heading>
        
        <Text style={text}>
          Gestiona tu contenido, menú, reservas y más desde tu panel de control:
        </Text>

        <Section style={dashboardBox}>
          <Link href={dashboardUrl} style={dashboardLink}>
            {dashboardUrl}
          </Link>
        </Section>

        <Section style={buttonContainer}>
          <Link href={dashboardUrl} style={buttonSecondary}>
            Ir a mi Panel
          </Link>
        </Section>

        <Hr style={hr} />

        <Heading style={h2}>🎥 Tutoriales del Panel de Control</Heading>
        
        <Text style={text}>
          Hemos preparado videos tutoriales para ayudarte a sacar el máximo provecho de tu nuevo sitio:
        </Text>

        <Section style={tutorialList}>
          <Text style={tutorialItem}>
            📹 <Link href="https://www.youtube.com/watch?v=ejemplo1" style={link}>Cómo actualizar tu menú</Link>
          </Text>
          <Text style={tutorialItem}>
            📹 <Link href="https://www.youtube.com/watch?v=ejemplo2" style={link}>Gestionar reservas</Link>
          </Text>
          <Text style={tutorialItem}>
            📹 <Link href="https://www.youtube.com/watch?v=ejemplo3" style={link}>Subir imágenes y contenido</Link>
          </Text>
          <Text style={tutorialItem}>
            📹 <Link href="https://www.youtube.com/watch?v=ejemplo4" style={link}>Configuración y personalización</Link>
          </Text>
        </Section>

        <Section style={buttonContainer}>
          <Link href="https://mirestaurante.online/guias/primeros-pasos/introduccion" style={buttonTertiary}>
            Ver Todas las Guías
          </Link>
        </Section>

        <Hr style={hr} />

        <Heading style={h2}>💡 Próximos Pasos Recomendados</Heading>
        
        <Section style={tipsList}>
          <Text style={tipsItem}>
            ✅ Revisa todo el contenido de tu sitio para asegurar que esté correcto
          </Text>
          <Text style={tipsItem}>
            ✅ Comparte el enlace en tus redes sociales
          </Text>
          <Text style={tipsItem}>
            ✅ Añade el enlace a tu perfil de Google My Business
          </Text>
          <Text style={tipsItem}>
            ✅ Actualiza tus tarjetas de presentación con tu nueva URL
          </Text>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          Si tienes alguna pregunta o necesitas ayuda, nuestro equipo está aquí para ti:
        </Text>

        <Text style={contactText}>
          📧 Email: <Link href="mailto:soporte@mirestaurante.online" style={link}>soporte@mirestaurante.online</Link>
          <br />
          💬 WhatsApp: <Link href="https://wa.me/51123456789" style={link}>+51 123 456 789</Link>
        </Text>

        <Text style={text}>
          ¡Gracias por confiar en MiRestaurante para tu presencia digital!
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

export default SiteLiveEmail;

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

const contactText = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '16px 0',
};

const highlightBox = {
  backgroundColor: '#e6f7f5',
  padding: '24px',
  borderRadius: '8px',
  border: '2px solid #44a79b',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const highlightTitle = {
  color: '#2d7a6e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const siteLink = {
  color: '#2d7a6e',
  fontSize: '20px',
  fontWeight: 'bold',
  textDecoration: 'none',
};

const dashboardBox = {
  backgroundColor: '#f1f5f9',
  padding: '16px',
  borderRadius: '6px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const dashboardLink = {
  color: '#475569',
  fontSize: '16px',
  textDecoration: 'none',
  fontFamily: 'monospace',
};

const tutorialList = {
  margin: '16px 0',
};

const tutorialItem = {
  color: '#484848',
  fontSize: '16px',
  margin: '12px 0',
  lineHeight: '24px',
};

const tipsList = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '8px',
  margin: '16px 0',
};

const tipsItem = {
  color: '#484848',
  fontSize: '16px',
  margin: '10px 0',
  lineHeight: '24px',
};

const buttonContainer = {
  margin: '24px 0',
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

const buttonSecondary = {
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

const buttonTertiary = {
  backgroundColor: '#44a79b',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
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
