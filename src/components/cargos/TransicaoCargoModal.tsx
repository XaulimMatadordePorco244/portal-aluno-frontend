'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, Alert } from 'antd';
import { realizarTransicaoCargo } from '@/hooks/useCargoHistory';

const { TextArea } = Input;
const { Option } = Select;

interface TransicaoCargoModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  alunoId: string;
  cargos: Array<{ id: string; nome: string; abreviacao: string }>;
  cargoAtual?: { id: string; nome: string };
  adminNome?: string;
}

const TransicaoCargoModal: React.FC<TransicaoCargoModalProps> = ({
  visible,
  onClose,
  onSuccess,
  alunoId,
  cargos,
  cargoAtual,
  adminNome
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tipoTransicao, setTipoTransicao] = useState<'PROMOCAO' | 'DESPROMOCAO'>('PROMOCAO');
  const [erroPermissao, setErroPermissao] = useState('');

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldValue('tipo', 'PROMOCAO');
      setTipoTransicao('PROMOCAO');
      setErroPermissao('');
    }
  }, [visible, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setErroPermissao('');
    
    try {
      const result = await realizarTransicaoCargo({
        alunoId,
        novoCargoId: values.novoCargoId,
        tipo: tipoTransicao,
        motivo: values.motivo
      });

      message.success(
        `Transição realizada com sucesso! ${
          result.aluno?.nome ? `${result.aluno.nome} agora é ${result.cargoNovo?.nome}` : 
          'Transição registrada'
        }`
      );
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.message.includes('Acesso negado') || error.message.includes('Não autorizado')) {
        setErroPermissao(error.message);
        message.error('Você não tem permissão para realizar esta ação');
      } else {
        message.error(error.message || 'Erro ao realizar transição');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Nova Transição de Cargo"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Confirmar
        </Button>,
      ]}
      width={600}
      maskClosable={false}
      destroyOnClose
    >
      {erroPermissao && (
        <Alert
          message="Erro de Permissão"
          description={erroPermissao}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ tipo: 'PROMOCAO' }}
      >
        <Form.Item
          name="tipo"
          label="Tipo de Transição"
          rules={[{ required: true, message: 'Selecione o tipo de transição' }]}
        >
          <Select 
            onChange={(value) => setTipoTransicao(value)}
            placeholder="Selecione o tipo"
            disabled={loading}
          >
            <Option value="PROMOCAO">Promoção</Option>
            <Option value="DESPROMOCAO">Despromoção</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="novoCargoId"
          label="Novo Cargo"
          rules={[{ required: true, message: 'Selecione o novo cargo' }]}
          help={tipoTransicao === 'PROMOCAO' ? 'Selecione um cargo superior' : 'Selecione um cargo inferior'}
        >
          <Select
            placeholder="Selecione o cargo"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              const children = option?.children;
              return String(children).toLowerCase().includes(input.toLowerCase());
            }}
            loading={loading}
            disabled={loading}
          >
            {cargos.map((cargo) => (
              <Option key={cargo.id} value={cargo.id}>
                {cargo.nome} ({cargo.abreviacao})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="motivo"
          label="Motivo (Opcional)"
          help="Descreva o motivo da transição para fins de auditoria"
        >
          <TextArea
            rows={3}
            placeholder="Ex: Mérito por desempenho excepcional, Conclusão de curso, etc."
            maxLength={500}
            showCount
            disabled={loading}
          />
        </Form.Item>

        {cargoAtual && (
          <Alert
            message="Informações Importantes"
            description={
              <div>
                <p><strong>Cargo atual:</strong> {cargoAtual.nome}</p>
                <p><strong>Responsável:</strong> {adminNome || 'Administrador'}</p>
                <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                  <li>O conceito será redefinido para 7.0</li>
                  <li>As anotações permanecerão no período anterior</li>
                  <li>Um novo bloco de histórico será criado</li>
                  <li>A ação será registrada em logs de auditoria</li>
                </ul>
              </div>
            }
            type="info"
            showIcon
          />
        )}
      </Form>
    </Modal>
  );
};

export default TransicaoCargoModal;