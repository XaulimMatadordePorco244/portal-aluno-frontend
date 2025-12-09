'use client';

import React from 'react';
import { 
  Timeline, 
  Card, 
  Tag, 
  Button, 
  Tooltip, 
  Badge,
  Collapse,
  List
} from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useCargoHistory } from '@/hooks/useCargoHistory';

const { Panel } = Collapse;

interface CargoTimelineProps {
  alunoId: string;
  isAdmin?: boolean;
  onReverter?: (blocoId: string) => void;
}

const CargoTimeline: React.FC<CargoTimelineProps> = ({ 
  alunoId, 
  isAdmin = false,
  onReverter 
}) => {
  const { historico, isLoading } = useCargoHistory(alunoId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'FECHADO':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'REVERTIDO':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <HistoryOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO': return 'success';
      case 'FECHADO': return 'processing';
      case 'REVERTIDO': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return <div>Carregando histórico...</div>;
  }

  if (!historico || historico.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <HistoryOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p style={{ marginTop: 16, color: '#8c8c8c' }}>
            Nenhum histórico de cargos encontrado
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Timeline mode="left">
      {historico.map((item) => (
        <Timeline.Item
          key={item.id}
          dot={getStatusIcon(item.status)}
          color={getStatusColor(item.status)}
        >
          <Card 
            size="small"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{item.cargoNomeSnapshot}</span>
                <Tag color={getStatusColor(item.status)}>
                  {item.status}
                </Tag>
                {item.status === 'ATIVO' && (
                  <Badge status="processing" text="Atual" />
                )}
              </div>
            }
            extra={
              isAdmin && item.status === 'ATIVO' && historico.length > 1 && onReverter && (
                <Tooltip title="Reverter para cargo anterior">
                  <Button 
                    size="small" 
                    danger 
                    onClick={() => onReverter(item.id)}
                    icon={<CloseCircleOutlined />}
                  >
                    Reverter
                  </Button>
                </Tooltip>
              )
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p><strong>Início:</strong> {formatDate(item.dataInicio)}</p>
                {item.dataFim && (
                  <p><strong>Fim:</strong> {formatDate(item.dataFim)}</p>
                )}
              </div>
              <div>
                <p>
                  <strong>Conceito:</strong>{' '}
                  <Tag color="blue" icon={<StarOutlined />}>
                    {item.conceitoAtual.toFixed(1)}
                  </Tag>
                </p>
                {item.motivo && (
                  <p><strong>Motivo:</strong> {item.motivo}</p>
                )}
              </div>
            </div>

            {item.anotacoes.length > 0 && (
              <Collapse size="small" style={{ marginTop: 16 }}>
                <Panel 
                  header={`Anotações deste período (${item.anotacoes.length})`} 
                  key="anotacoes"
                >
                  <List
                    size="small"
                    dataSource={item.anotacoes}
                    renderItem={(anotacao) => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Tag color={anotacao.pontos >= 0 ? 'green' : 'red'}>
                                {anotacao.pontos > 0 ? '+' : ''}{anotacao.pontos}
                              </Tag>
                              <span>{anotacao.tipo.titulo}</span>
                            </div>
                          }
                          description={
                            <div>
                              {anotacao.detalhes && (
                                <p style={{ margin: 0 }}>{anotacao.detalhes}</p>
                              )}
                              <small style={{ color: '#8c8c8c' }}>
                                Por: {anotacao.autor.nome}
                              </small>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Panel>
              </Collapse>
            )}
          </Card>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default CargoTimeline;