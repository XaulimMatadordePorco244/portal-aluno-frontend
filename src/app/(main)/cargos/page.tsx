import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card, Row, Col, Statistic, Alert, Typography, Space, Tag } from 'antd';
import { 
  StarOutlined, 
  HistoryOutlined, 
  RiseOutlined,
  TrophyOutlined,
  CalendarOutlined,
  TeamOutlined 
} from '@ant-design/icons';
import CargoTimeline from '@/components/cargos/CargoTimeline';
import CargoBreadcrumb from '@/components/cargos/CargoBreadcrumb';
import  prisma  from '@/lib/prisma';
import { getCurrentUserWithRelations } from '@/lib/auth';

const { Title, Text } = Typography;

export const metadata: Metadata = {
  title: 'Meu Histórico de Cargos',
  description: 'Acompanhe sua trajetória e evolução na instituição',
};

export default async function AlunoCargosPage() {
  const user = await getCurrentUserWithRelations();
  
  if (!user || !user.perfilAluno) {
    redirect('/login');
  }

  const alunoId = user.perfilAluno.id;


  const aluno = await prisma.perfilAluno.findUnique({
    where: { id: alunoId },
    include: {
      cargo: true,
      funcao: true,
      companhia: true,
      historicoCargos: {
        include: {
          cargo: true,
          anotacoes: {
            include: {
              tipo: true,
              autor: {
                select: {
                  nome: true,
                  role: true
                }
              }
            },
            orderBy: { data: 'desc' }
          }
        },
        orderBy: { dataInicio: 'desc' }
      }
    }
  });

  if (!aluno) {
    redirect('/dashboard');
  }

  const historico = aluno.historicoCargos;
  const cargoAtual = historico.find(h => h.status === 'ATIVO');
  const primeiroCargo = historico[historico.length - 1];


  const tempoNoCargoAtual = cargoAtual 
    ? Math.floor((new Date().getTime() - new Date(cargoAtual.dataInicio).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalAnotacoes = historico.reduce((total, periodo) => total + periodo.anotacoes.length, 0);
  const anotacoesPositivas = historico.reduce((total, periodo) => 
    total + periodo.anotacoes.filter(a => a.pontos > 0).length, 0
  );
  const evolucaoConceito = cargoAtual && primeiroCargo
    ? (((cargoAtual.conceitoAtual - primeiroCargo.conceitoInicial) / primeiroCargo.conceitoInicial) * 100).toFixed(1)
    : '0.0';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
      <CargoBreadcrumb />

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Space direction="vertical" size="middle">
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {user.nome}
                  {user.perfilAluno.nomeDeGuerra && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      "{user.perfilAluno.nomeDeGuerra}"
                    </Text>
                  )}
                </Title>
                <Text type="secondary">{user.perfilAluno.numero}</Text>
              </div>
              
              <Space size="large">
                <Space>
                  <TeamOutlined />
                  <Text strong>Companhia:</Text>
                  <Text>{user.perfilAluno.companhia?.nome || 'Não atribuída'}</Text>
                </Space>
                
                <Space>
                  <Text strong>Ano de Ingresso:</Text>
                  <Text>{user.perfilAluno.anoIngresso || 'Não informado'}</Text>
                </Space>
              </Space>
            </Space>
          </Col>
          
          <Col xs={24} md={12}>
            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Card size="small">
                  <Statistic
                    title="Cargo Atual"
                    value={user.perfilAluno.cargo?.nome || 'Não definido'}
                    prefix={<StarOutlined />}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Card>
              </Col>
              
              <Col xs={12}>
                <Card size="small">
                  <Statistic
                    title="Conceito"
                    value={user.perfilAluno.conceitoAtual || '7.0'}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ 
                      color: parseFloat(user.perfilAluno.conceitoAtual || '7.0') >= 7.0 ? '#3f8600' : '#cf1322',
                      fontSize: '20px' 
                    }}
                  />
                </Card>
              </Col>
              
              <Col xs={12}>
                <Card size="small">
                  <Statistic
                    title="Dias no Cargo"
                    value={tempoNoCargoAtual}
                    suffix="dias"
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
              
              <Col xs={12}>
                <Card size="small">
                  <Statistic
                    title="Evolução"
                    value={evolucaoConceito}
                    suffix="%"
                    prefix={<RiseOutlined />}
                    valueStyle={{ 
                      color: parseFloat(evolucaoConceito) > 0 ? '#3f8600' : '#cf1322',
                      fontSize: '16px' 
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Card 
        title={
          <Space>
            <HistoryOutlined />
            <span>Resumo da Sua Trajetória</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Total de Cargos"
                value={historico.filter(h => h.status !== 'REVERTIDO').length}
                prefix={<HistoryOutlined />}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Anotações Recebidas"
                value={totalAnotacoes}
                suffix={
                  <Tag color={anotacoesPositivas > 0 ? 'green' : 'default'}>
                    +{anotacoesPositivas}
                  </Tag>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Período Ativo"
                value={
                  historico.length > 0 
                    ? Math.floor((new Date().getTime() - new Date(historico[historico.length - 1].dataInicio).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
                    : 0
                }
                suffix="meses"
              />
            </Card>
          </Col>
        </Row>
      </Card>


      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>Linha do Tempo de Cargos</span>
            <Tag color="blue">{historico.length} períodos</Tag>
          </Space>
        }
      >
        <CargoTimeline
          alunoId={alunoId}
          isAdmin={false}
        />
        
        {historico.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Alert
              message="Histórico em branco"
              description="Você ainda não possui histórico de cargos registrado. Entre em contato com a administração."
              type="info"
              showIcon
            />
          </div>
        )}
      </Card>


      <Alert
        message="Sobre o Sistema de Cargos"
        description={
          <div>
            <p>Este sistema registra toda a sua trajetória na instituição:</p>
            <ul>
              <li>Cada mudança de cargo cria um novo <strong>período histórico</strong></li>
              <li>As anotações são vinculadas ao período em que foram registradas</li>
              <li>Seu conceito é redefinido para 7.0 a cada nova promoção/despromoção</li>
              <li>O histórico completo permanece <strong>auditável e seguro</strong></li>
              <li>Visualize sua evolução através da linha do tempo acima</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  );
}