import Link from 'next/link';
import { Button, Result, Space } from 'antd';
import { HomeOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';

export default function AlunoNotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh',
      padding: '24px'
    }}>
      <Result
        status="404"
        title="Aluno Não Encontrado"
        subTitle="Desculpe, o aluno que você está procurando não existe ou foi removido."
        extra={
          <Space>
            <Link href="/admin/alunos/cargos">
              <Button type="primary" icon={<ArrowLeftOutlined />}>
                Voltar para Lista
              </Button>
            </Link>
            <Link href="/admin">
              <Button icon={<HomeOutlined />}>
                Painel Admin
              </Button>
            </Link>
            <Link href="/admin/alunos/cargos">
              <Button icon={<UserOutlined />}>
                Gerenciar Alunos
              </Button>
            </Link>
          </Space>
        }
      />
    </div>
  );
}