import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CreateQPEForm from './create-form';
import QPEList, { UnifiedQPEItem } from './qpe-list';

async function getTodosItensQPE(): Promise<UnifiedQPEItem[]> {
  // 1. Busca ambas as tabelas
  const tiposDeAnotacao = await prisma.tipoDeAnotacao.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  const tiposDeSuspensao = await prisma.tipoDeSuspensao.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // 2. Formata e unifica as duas listas
  const anotacoesFormatadas = tiposDeAnotacao.map(a => ({
    ...a,
    tipoRegisto: 'ANOTACAO' as const
  }));

  const suspensoesFormatadas = tiposDeSuspensao.map(s => ({
    id: s.id,
    titulo: s.titulo,
    descricao: s.descricao,
    pontos: null, // Suspensões não têm o campo pontos na tabela
    abertoCoordenacao: false,
    categoriaAberto: null,
    tipoRegisto: 'SUSPENSAO' as const
  }));

  // Retorna tudo junto
  return [...suspensoesFormatadas, ...anotacoesFormatadas];
}

export default async function QPEPage() {
  const todosItens = await getTodosItensQPE();

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Item ao QPE</CardTitle>
          <CardDescription>
            Preencha os dados para criar uma nova punição, elogio ou suspensão no catálogo.
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
          <QPEList itens={todosItens} />
        </CardContent>
      </Card>
    </div>
  );
}