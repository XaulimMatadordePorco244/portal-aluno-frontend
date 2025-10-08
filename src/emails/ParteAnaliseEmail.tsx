import { Html, Button, Text, Heading, Section, Head, Preview, Hr } from '@react-email/components';
import { ResultadoAnalise } from '@prisma/client';

interface ParteAnaliseEmailProps {
  alunoNome: string;
  parteAssunto: string;
  resultado: ResultadoAnalise;
  observacoes?: string | null;
  parteLink: string;
}

export default function ParteAnaliseEmail({
  alunoNome,
  parteAssunto,
  resultado,
  observacoes,
  parteLink,
}: ParteAnaliseEmailProps) {
  
  const getResultadoText = (res: ResultadoAnalise) => {
    const map = {
        APROVADA: "Aprovada",
        NEGADA: "Negada",
        ARQUIVADA: "Arquivada",
        ENCAMINHADA: "Encaminhada"
    };
    return map[res] || "Analisada";
  }

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Sua parte foi analisada - Portal do Aluno</Preview>
      <Section style={main}>
        <Heading style={heading}>Sua Parte Foi Analisada</Heading>
        <Text style={paragraph}>
          Olá, {alunoNome}.
        </Text>
        <Text style={paragraph}>
          A sua parte com o assunto "{parteAssunto}" foi analisada. Veja os detalhes abaixo:
        </Text>
        
        <Section style={detailsContainer}>
            <Text style={detailItem}>
                <strong>Resultado:</strong> {getResultadoText(resultado)}
            </Text>
            <Text style={detailItem}>
                <strong>Observações do Comandante:</strong>
            </Text>
            <Text style={observationText}>
                {observacoes || "Nenhuma observação foi adicionada."}
            </Text>
        </Section>
        
        <Section style={btnContainer}>
          <Button style={button} href={parteLink}>
            Ver Parte no Portal
          </Button>
        </Section>
        
        <Hr style={{ borderColor: '#cccccc', margin: '20px 0' }} />
        
        <Text style={{ color: '#8898aa', fontSize: '12px' }}>
          Este é um e-mail automático. Por favor, não responda.
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
const heading = { fontSize: '24px', fontWeight: 'bold', color: '#333' };
const paragraph = { fontSize: '16px', lineHeight: '26px', color: '#555' };
const detailsContainer = { padding: '16px', backgroundColor: '#f2f3f3', borderRadius: '4px', margin: '16px 0' };
const detailItem = { margin: '0 0 10px 0', fontSize: '16px' };
const observationText = { fontStyle: 'italic', color: '#555' };
const btnContainer = { textAlign: 'center' as const, margin: '24px 0' };
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