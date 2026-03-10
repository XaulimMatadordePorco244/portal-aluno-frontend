import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BotaoExcluirAtividade } from "./botao-excluir";
import { LinhaAlunoAtividade } from "./linha-aluno-atividade";
import { ModalAcoesPrazo } from "./modal-acoes-prazo";

export const dynamic = 'force-dynamic';

async function getDetalhesAtividade(id: string) {
  const atividade = await prisma.atividade.findUnique({
    where: { id },
    include: {
      destinatarios: {
        include: {
          aluno: {
            select: {
              nome: true,
              nomeDeGuerra: true,
              perfilAluno: {
                include: { cargo: true }
              }
            }
          }
        },
        orderBy: [
          { status: 'asc' }, 
          { aluno: { nome: 'asc' } }
        ]
      }
    }
  });
  return atividade;
}

export default async function RelatorioAtividadePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const atividade = await getDetalhesAtividade(id);

  if (!atividade) return notFound();

  const total = atividade.destinatarios.length;
  const pendentes = atividade.destinatarios.filter(d => d.status === 'PENDENTE').length;
  const visualizados = atividade.destinatarios.filter(d => d.status === 'VISUALIZADO').length;
  const realizados = atividade.destinatarios.filter(d => d.status === 'REALIZADO').length;
  const naoRealizados = atividade.destinatarios.filter(d => d.status === 'NAO_REALIZADO').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/atividades">
            <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{atividade.titulo}</h1>
            <p className="text-sm text-muted-foreground">Relatório de Leitura e Engajamento</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModalAcoesPrazo atividadeId={atividade.id} prazoAtual={atividade.prazoEntrega} />
          <BotaoExcluirAtividade id={atividade.id} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 border rounded-lg bg-card text-card-foreground flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold">{total}</span>
          <span className="text-xs text-muted-foreground uppercase mt-1">Alunos</span>
        </div>
        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/10 text-destructive flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold">{pendentes}</span>
          <span className="text-xs uppercase mt-1">Não Abriram</span>
        </div>
        <div className="p-4 border border-secondary/20 rounded-lg bg-secondary text-secondary-foreground flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold">{visualizados}</span>
          <span className="text-xs uppercase mt-1">Em Andamento</span>
        </div>
        <div className="p-4 border border-primary/20 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold">{realizados}</span>
          <span className="text-xs uppercase mt-1">Realizadas</span>
        </div>
        <div className="p-4 border border-destructive/50 rounded-lg bg-destructive text-destructive-foreground flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold">{naoRealizados}</span>
          <span className="text-xs uppercase mt-1">Não Realizadas</span>
        </div>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden mt-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Aluno</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Visualização</TableHead>
              <TableHead className="text-right">Ação / Avaliação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atividade.destinatarios.map((vinculo) => (
              <LinhaAlunoAtividade key={vinculo.id} vinculo={vinculo} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}