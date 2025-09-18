// src/app/(admin)/admin/qpe/page.tsx
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CreateQPEForm from './create-form';
import QPEList from './qpe-list';

// A função de busca de dados permanece a mesma
async function getTiposDeAnotacao() {
  return await prisma.tipoDeAnotacao.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function QPEPage() {
  const tiposDeAnotacao = await getTiposDeAnotacao();

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Item ao QPE</CardTitle>
          <CardDescription>
            Preencha os dados para criar uma nova punição ou elogio no catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateQPEForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quadro de Punições e Elogios (QPE)</CardTitle>
          <CardDescription>
            Lista de todos os itens cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* A página agora simplesmente usa o componente QPEList */}
          <QPEList itens={tiposDeAnotacao} />
        </CardContent>
      </Card>
    </div>
  );
}