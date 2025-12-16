'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface CargoBreadcrumbProps {
  alunoNome?: string;
  alunoId?: string;
}

const CargoBreadcrumb: React.FC<CargoBreadcrumbProps> = ({ alunoNome, alunoId }) => {
  const pathname = usePathname();
  
  const isAdminPage = pathname.includes('/admin/');
  
  if (isAdminPage) {
    return (
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/alunos">Alunos</BreadcrumbLink>
          </BreadcrumbItem>
          
          {alunoId && (
            <>
              <BreadcrumbSeparator />
              
              <BreadcrumbItem>
                <BreadcrumbLink href={`/admin/alunos/${alunoId}`}>
                  {alunoNome || 'Aluno'}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          
          <BreadcrumbSeparator />
          
          <BreadcrumbItem>
            <BreadcrumbPage>Cargos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }
  
  return null;
};

export default CargoBreadcrumb;