'use client';

import React, { useState } from 'react';
import { Card, Button, Row, Col, Alert, Space, Tooltip, Modal } from 'antd';
import { PlusOutlined, SyncOutlined, HistoryOutlined } from '@ant-design/icons';
import CargoTimeline from './CargoTimeline';
import TransicaoCargoModal from './TransicaoCargoModal';
import { useCargoHistory, reverterCargo, inicializarHistorico } from '@/hooks/useCargoHistory';


interface CargoHistoryContainerProps {
  alunoId: string;
  cargos: Array<{ id: string; nome: string; abreviacao: string }>;
  alunoNome?: string;
}

const CargoHistoryContainer: React.FC<CargoHistoryContainerProps> = ({
  alunoId,
  cargos,
  alunoNome
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isInicializando, setIsInicializando] = useState(false);
  const { historico, isLoading, mutate } = useCargoHistory(alunoId);
  

  const isAdmin = true; 

  const handleReverter = async (blocoId: string) => {
    Modal.confirm({
      title: 'Confirmar Reversão',
      content: (
        <div>
          <p>Tem certeza que deseja reverter esta transição?</p>
          <Alert
            message="Atenção"
            description={
              <ul>
                <li>O cargo anterior será restaurado</li>
                <li>As anotações deste período serão movidas para o período anterior</li>
                <li>Esta ação será registrada em logs de auditoria</li>
                <li>A reversão não pode ser desfeita automaticamente</li>
              </ul>
            }
            type="warning"
            showIcon
          />
        </div>
      ),
      okText: 'Confirmar Reversão',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await reverterCargo({
            alunoId,
            motivo: 'Reversão solicitada pelo administrador'
          });
          mutate();
        } catch (error: any) {
          Modal.error({
            title: 'Erro',
            content: error.message || 'Não foi possível reverter a transição'
          });
        }
      }
    });
  };

  const handleInicializar = async () => {
    setIsInicializando(true);
    try {
      await inicializarHistorico(alunoId);
      mutate();
    } catch (error: any) {
      Modal.error({
        title: 'Erro',
        content: error.message || 'Não foi possível inicializar o histórico'
      });
    } finally {
      setIsInicializando(false);
    }
  };

  const cargoAtual = historico?.find(item => item.status === 'ATIVO')?.cargo;

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <HistoryOutlined style={{ fontSize: 24 }} />
            <h2 style={{ margin: 0 }}>
              Histórico de Cargos
              {alunoNome && <span style={{ fontWeight: 'normal', marginLeft: 8 }}>• {alunoNome}</span>}
            </h2>
          </Space>
        </Col>
        <Col>
          <Space>
            {isAdmin && !historico?.length && (
              <Tooltip title="Criar histórico inicial para este aluno">
                <Button
                  icon={<SyncOutlined />}
                  loading={isInicializando}
                  onClick={handleInicializar}
                >
                  Inicializar Histórico
                </Button>
              </Tooltip>
            )}
            
            {isAdmin && cargos.length > 0 && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Nova Transição
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {!historico?.length && isAdmin && (
        <Alert
          message="Histórico não inicializado"
          description="Este aluno ainda não possui histórico de cargos. Clique em 'Inicializar Histórico' para criar o registro inicial."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card loading={isLoading}>
        <CargoTimeline
          alunoId={alunoId}
          isAdmin={isAdmin}
          onReverter={handleReverter}
          showReverter={!!historico?.length && historico.length > 1}
        />
      </Card>

      {isAdmin && cargos.length > 0 && (
        <TransicaoCargoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={() => mutate()}
          alunoId={alunoId}
          cargos={cargos}
          cargoAtual={cargoAtual}
        />
      )}
    </div>
  );
};

export default CargoHistoryContainer;