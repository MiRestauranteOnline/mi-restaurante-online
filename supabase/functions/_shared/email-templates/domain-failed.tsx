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

interface DomainFailedEmailProps {
  restaurantName: string;
  domain: string;
  errors: string[];
  supportUrl: string;
}

export const DomainFailedEmail = ({
  restaurantName,
  domain,
  errors,
  supportUrl,
}: DomainFailedEmailProps) => (
  <Html>
    <Head />
    <Preview>Acción requerida: Verificación de dominio pendiente</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verificación de Dominio Pendiente</Heading>
        
        <Text style={text}>
          Hola {restaurantName},
        </Text>

        <Text style={text}>
          Hemos detectado que tu dominio personalizado <strong>{domain}</strong> aún no ha sido verificado completamente. Esto es normal y generalmente se soluciona esperando unas horas más.
        </Text>

        {errors.length > 0 && (
          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>⚠️ Detalles técnicos:</strong><br />
              {errors.map((error, index) => (
                <span key={index}>• {error}<br /></span>
              ))}
            </Text>
          </Section>
        )}

        <Text style={text}>
          <strong>¿Qué hacer ahora?</strong>
        </Text>

        <Text style={text}>
          1. <strong>Espera 24-48 horas:</strong> La propagación DNS puede tardar hasta 48 horas. En la mayoría de casos se resuelve en pocas horas.<br /><br />
          2. <strong>Verifica tu configuración DNS:</strong> Asegúrate de que los registros DNS apunten correctamente a: <code style={code}>185.158.133.1</code><br /><br />
          3. <strong>Contacta con soporte:</strong> Si después de 48 horas el problema persiste, contáctanos.
        </Text>

        <Section style={buttonContainer}>
          <Link href={supportUrl} style={button}>
            Contactar Soporte
          </Link>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          Mientras tanto, tu sitio sigue disponible en: <Link href={`https://${domain.split('.')[0]}.mirestaurante.online`} style={link}>{domain.split('.')[0]}.mirestaurante.online</Link>
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

export default DomainFailedEmail;

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

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0',
};

const warningText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '22px',
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

const code = {
  backgroundColor: '#f4f4f4',
  padding: '2px 6px',
  borderRadius: '3px',
  fontSize: '14px',
  fontFamily: 'monospace',
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
