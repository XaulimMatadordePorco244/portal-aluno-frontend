import { Html, Button, Text, Heading, Section, Head, Preview } from '@react-email/components';

interface ResetPasswordEmailProps {
  resetLink: string;
}


export default function ResetPasswordEmail({ resetLink }: ResetPasswordEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Recuperação de Senha - Portal do Aluno</Preview>
      <Section style={main}>
        <Heading style={heading}>Recuperação de Senha</Heading>
        <Text style={paragraph}>
          Você solicitou a recuperação de sua senha para o Portal do Aluno. Clique no botão abaixo para definir uma nova senha.
        </Text>
        <Text style={paragraph}>
          Este link de redefinição é válido por 1 hora.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={resetLink}>
            Redefinir Senha
          </Button>
        </Section>
        <Text style={paragraph}>
          Se você não solicitou esta alteração, por favor, ignore este e-mail com segurança.
        </Text>
      </Section>
    </Html>
  );
}


const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '24px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#555',
};

const btnContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
};