import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Card, Row, Col, Alert, Space, Typography, Badge } from 'antd';
import { 
  UserOutlined, 
  StarOutlined, 
  TeamOutlined,
  IdcardOutlined 
} from '@ant-design/icons';
import CargoHistoryContainer from '@/components/cargos/CargoHistoryContainer';
import CargoBreadcrumb from '@/components/cargos/CargoBreadcrumb';
import  prisma  from '@/lib/prisma';
import { getCurrentUserWithRelations, canAccessAdminArea } from '@/lib/auth';
import AdminRoute from '@/components/auth/AdminRoute';

const { Title, Text } = Typography;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {

  const { id } = await params;
  
  const aluno = await prisma.perfilAluno.findUnique({
    where: { id },
    include: { usuario: true, cargo: true, companhia: true }
  });

  return {
    title: `Histórico de Cargos - ${aluno?.usuario.nome || 'Aluno'}`,
    description: `Gerencie o histórico de cargos de ${aluno?.usuario.nome || 'este aluno'}`,
  };
}

export default async function AdminAlunoCargosPage({ params }: PageProps) {

  const { id } = await params;
  
  const user = await getCurrentUserWithRelations();
  

  if (!user || !canAccessAdminArea(user)) {
    redirect('/dashboard');
  }


  const aluno = await prisma.perfilAluno.findUnique({
    where: { id },
    include: {
      usuario: true,
      cargo: true,
      funcao: true,
      companhia: true,
      historicoCargos: {
        where: { status: 'ATIVO' },
        take: 1
      }
    }
  });

  if (!aluno) {
    notFound();
  }


  const cargos = await prisma.cargo.findMany({
    orderBy: { precedencia: 'asc' }
  });

  const historicoCompleto = await prisma.cargoHistory.findMany({
    where: { alunoId: id },
    orderBy: { dataInicio: 'desc' }
  });

  const totalTransicoes = historicoCompleto.length;
  const totalPromocoes = historicoCompleto.filter(h => 
    h.status !== 'REVERTIDO'
  ).length - 1; 
  const cargoAtual = historicoCompleto.find(h => h.status === 'ATIVO');

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>

      <CargoBreadcrumb alunoNome={aluno.usuario.nome} />
 
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Space direction="vertical" size="small">
              <Space>
                <UserOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                <Title level={4} style={{ margin: 0 }}>
                  {aluno.usuario.nome}
                </Title>
                {aluno.nomeDeGuerra && (
                  <Badge color="blue" text={`"${aluno.nomeDeGuerra}"`} />
                )}
              </Space>
              
              <Space>
                <IdcardOutlined />
                <Text strong>Número:</Text>
                <Text>{aluno.numero || 'Não informado'}</Text>
              </Space>
              
              <Space>
                <TeamOutlined />
                <Text strong>Companhia:</Text>
                <Text>{aluno.companhia?.nome || 'Não atribuída'}</Text>
              </Space>
            </Space>
          </Col>
          
          <Col xs={24} md={8}>
            <Space direction="vertical" size="small">
              <Space>
                <StarOutlined style={{ color: '#faad14' }} />
                <Text strong>Cargo Atual:</Text>
                <Text type={aluno.cargo ? undefined : 'secondary'}>
                  {aluno.cargo?.nome || 'Não definido'}
                </Text>
              </Space>
              
              <Space>
                <Text strong>Conceito Atual:</Text>
                <Text code style={{ fontSize: '1.1em' }}>
                  {aluno.conceitoAtual || '7.0'}
                </Text>
              </Space>
              
              <Space>
                <Text strong>Função:</Text>
                <Text>{aluno.funcao?.nome || 'Não definida'}</Text>
              </Space>
            </Space>
          </Col>
          
          <Col xs={24} md={8}>
            <Space direction="vertical" size="small">
              <Space>
                <Text strong>Total de Transições:</Text>
                <Badge count={totalTransicoes} showZero />
              </Space>
              
              <Space>
                <Text strong>Promoções/Despromoções:</Text>
                <Badge 
                  count={totalPromocoes} 
                  showZero 
                  style={{ backgroundColor: totalPromocoes > 0 ? '#52c41a' : '#d9d9d9' }} 
                />
              </Space>
              
              <Space>
                <Text strong>Cargo desde:</Text>
                <Text>
                  {cargoAtual?.dataInicio 
                    ? new Date(cargoAtual.dataInicio).toLocaleDateString('pt-BR')
                    : 'Data não disponível'
                  }
                </Text>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>


      <Alert
        message="Atenção Administrador"
        description={
          <div>
            <p>Ao realizar uma transição de cargo:</p>
            <ul>
              <li>O conceito do aluno será <strong>redefinido para 7.0</strong></li>
              <li>Um novo bloco de histórico será criado</li>
              <li>As anotações permanecem vinculadas ao período anterior</li>
              <li>Todas as ações são <strong>auditáveis</strong> através dos logs</li>
              <li>É possível <strong>reverter</strong> a última transição se necessário</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <CargoHistoryContainer
        alunoId={id}
        cargos={cargos}
        alunoNome={aluno.usuario.nome}
      />


      {historicoCompleto.length > 0 && (
        <Card 
          title="Logs Detalhados de Auditoria" 
          style={{ marginTop: 24 }}
          extra={<Text type="secondary">Apenas visível para administradores</Text>}
        >
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Data</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Tipo</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Cargo</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Admin</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {historicoCompleto.map((historico) => (
                  <React.Fragment key={historico.id}>
                    <tr style={{ backgroundColor: '#fafafa' }}>
                      <td colSpan={5} style={{ padding: '8px', fontWeight: 'bold' }}>
                        Período: {new Date(historico.dataInicio).toLocaleDateString('pt-BR')} 
                        {historico.dataFim && ` até ${new Date(historico.dataFim).toLocaleDateString('pt-BR')}`}
                        <Badge 
                          status={historico.status === 'ATIVO' ? 'success' : 
                                  historico.status === 'FECHADO' ? 'default' : 'error'}
                          text={historico.status}
                          style={{ marginLeft: 8 }}
                        />
                      </td>
                    </tr>
                               </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}