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

interface AccountCreatedEmailProps {
  restaurantName: string;
  email: string;
  loginUrl: string;
}

export const AccountCreatedEmail = ({
  restaurantName,
  email,
  loginUrl,
}: AccountCreatedEmailProps) => (
  <Html>
    <Head />
    <Preview>¡Bienvenido a MiRestaurante! Tu cuenta ha sido creada</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>¡Bienvenido a MiRestaurante! 🎉</Heading>
        
        <Text style={text}>
          Hola {restaurantName},
        </Text>

        <Text style={text}>
          Tu cuenta ha sido creada exitosamente. Puedes iniciar sesión en cualquier momento para continuar donde lo dejaste.
        </Text>

        <Section style={buttonContainer}>
          <Link href={loginUrl} style={button}>
            Continuar con mi registro
          </Link>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          <strong>Tus datos de acceso:</strong>
        </Text>
        <Text style={text}>
          Email: {email}
        </Text>

        <Text style={text}>
          Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos en{' '}
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

export default AccountCreatedEmail;

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
