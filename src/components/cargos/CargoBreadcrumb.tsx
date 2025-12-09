'use client';

import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined, UserOutlined, HistoryOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CargoBreadcrumbProps {
  alunoNome?: string;
}

const CargoBreadcrumb: React.FC<CargoBreadcrumbProps> = ({ alunoNome }) => {
  const pathname = usePathname();
  
  const isAdminPage = pathname.includes('/admin/');
  const isAlunoPage = pathname.includes('/aluno/cargos');
  
  const breadcrumbItems = [];
  
  if (isAdminPage) {
    breadcrumbItems.push(
      {
        title: (
          <Link href="/admin">
            <HomeOutlined />
            <span>Admin</span>
          </Link>
        ),
      },
      {
        title: (
          <Link href="/admin/alunos/cargos">
            <UserOutlined />
            <span>Alunos</span>
          </Link>
        ),
      }
    );
    
    if (alunoNome) {
      breadcrumbItems.push({
        title: (
          <>
            <HistoryOutlined />
            <span>{alunoNome}</span>
          </>
        ),
      });
    }
  } else if (isAlunoPage) {
    breadcrumbItems.push(
      {
        title: (
          <Link href="/dashboard">
            <HomeOutlined />
            <span>Dashboard</span>
          </Link>
        ),
      },
      {
        title: (
          <>
            <HistoryOutlined />
            <span>Minha Trajetória</span>
          </>
        ),
      }
    );
  }
  
  return <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />;
};

export default CargoBreadcrumb;