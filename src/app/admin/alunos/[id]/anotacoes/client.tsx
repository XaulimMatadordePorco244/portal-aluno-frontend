"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Award, Filter, Pencil, Trash2, ArrowLeft, FileDown, 
  UserCheck, Keyboard, Clock, Calendar, Megaphone, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { deleteAnotacao } from '@/actions/anotacoes';
import { toast } from "sonner";
import { anotacoesPdfService } from '@/services/pdf/anotacoes-pdf.service';
import { Prisma } from '@prisma/client';
import { formatDate } from '@/lib/utils'; 

type AnotacaoComRelacoes = Prisma.AnotacaoGetPayload<{
  include: {
    tipo: true;
    autor: {
      include: {
        perfilAluno: { 
          include: { 
            cargo: true 
          } 
        }
      }
    };
    quemAnotou: {
      include: {
        perfilAluno: { 
          include: { 
            cargo: true 
          } 
        }
      }
    }
  }
}>;

type PerfilAlunoWithRelations = Prisma.PerfilAlunoGetPayload<{
  include: {
    usuario: true;
    cargo: true;
    companhia: true;
    funcao: true;
  }
}>;

type UsuarioWithPerfil = Prisma.UsuarioGetPayload<{
  include: {
    perfilAluno: {
      include: {
        cargo: true;
      }
    }
  }
}>;

type AnnotationFilterType = 'Todos' | 'Elogio' | 'Punição' | 'FO+' | 'FO-';

const InfoPill = ({ label, count, points }: { label: string; count: number; points: number }) => (
  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50 border shadow-sm">
    <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
      {label}: {count}
    </p>
    <p className={`text-base sm:text-lg font-bold ${points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
      {points > 0 ? '+' : ''}{points.toFixed(1)}
    </p>
  </div>
);

interface Props {
  perfilAluno: PerfilAlunoWithRelations;
  anotacoes: AnotacaoComRelacoes[];
  conceitoAtual: number;
}

export default function AdminStudentHistoryClient({ perfilAluno, anotacoes, conceitoAtual }: Props) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<AnnotationFilterType>('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatarNome = (usuario: UsuarioWithPerfil | null | undefined): string => {
    if (!usuario) return "Sistema";
    const perfil = usuario.perfilAluno;
    if (perfil) {
        const cargo = perfil.cargo?.abreviacao || '';
        const nome = usuario.nomeDeGuerra || usuario.nome.split(' ')[0];
        return `${cargo} GM ${nome}`.trim();
    }
    return usuario.nome;
  };

  const formatarResponsavel = (anotacao: AnotacaoComRelacoes): string => {
    if (anotacao.quemAnotouNome) return anotacao.quemAnotouNome.toUpperCase();
    if (anotacao.quemAnotou) return formatarNome(anotacao.quemAnotou);
    return formatarNome(anotacao.autor);
  };

  const filteredByDate = useMemo(() => {
    if (!startDate && !endDate) return anotacoes;
    let items = [...anotacoes];
    if (startDate) {
      const start = startOfDay(parseISO(startDate));
      items = items.filter(a => new Date(a.data) >= start);
    }
    if (endDate) {
      const end = startOfDay(parseISO(endDate));
      items = items.filter(a => new Date(a.data) <= end);
    }
    return items;
  }, [anotacoes, startDate, endDate]);

  const summaryStats = useMemo(() => {
    const stats = {
      elogio: { count: 0, points: 0 },
      punicao: { count: 0, points: 0 },
      foPositivo: { count: 0, points: 0 },
      foNegativo: { count: 0, points: 0 },
    };
    for (const anotacao of filteredByDate) {
      const pontos = Number(anotacao.pontos);
      if (pontos > 0.5) { stats.elogio.count++; stats.elogio.points += pontos; }
      if (pontos < -0.3) { stats.punicao.count++; stats.punicao.points += pontos; }
      if (pontos === 0.5) { stats.foPositivo.count++; stats.foPositivo.points += pontos; }
      if (pontos === -0.3) { stats.foNegativo.count++; stats.foNegativo.points += pontos; }
    }
    return stats;
  }, [filteredByDate]);

  const filteredAnnotations = useMemo(() => {
    switch (activeFilter) {
      case 'Elogio': return filteredByDate.filter(a => Number(a.pontos) > 0.5);
      case 'Punição': return filteredByDate.filter(a => Number(a.pontos) < -0.3);
      case 'FO+': return filteredByDate.filter(a => Number(a.pontos) === 0.5);
      case 'FO-': return filteredByDate.filter(a => Number(a.pontos) === -0.3);
      default: return filteredByDate;
    }
  }, [filteredByDate, activeFilter]);

  const handleEdit = (id: string) => {
    router.push(`/admin/anotacoes/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta anotação?")) return;
    setIsLoading(true);
    const result = await deleteAnotacao(id, perfilAluno.id); 
    setIsLoading(false);
    if (result.success) {
      toast.success("Anotação excluída com sucesso.");
    } else {
      toast.error("Erro ao excluir anotação.");
    }
  };

  const generateStatement = async () => {
      let descricaoFiltro = activeFilter;
      if (startDate || endDate) {
        const i = startDate ? format(parseISO(startDate), 'dd/MM/yy') : '...';
        const f = endDate ? format(parseISO(endDate), 'dd/MM/yy') : '...';
        descricaoFiltro += ` (${i} até ${f})`;
      }
  
      await anotacoesPdfService.generate({
        aluno: {
          nome: perfilAluno.usuario.nome,
          nomeDeGuerra: perfilAluno.usuario.nomeDeGuerra,
          cargo: perfilAluno.cargo?.abreviacao,
        },
        conceitoAtual: conceitoAtual.toFixed(2),
        filtroAplicado: descricaoFiltro,
        anotacoes: filteredAnnotations.map(a => ({
          data: formatDate(a.data) || '', 
          tipo: a.tipo.titulo,
          pontos: Number(a.pontos),
          detalhes: a.detalhes,
        })),
      });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin/alunos')}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{perfilAluno.usuario.nomeDeGuerra}</h1>
                <p className="text-muted-foreground text-sm">{perfilAluno.usuario.nome}</p>
            </div>
        </div>
        <Button onClick={generateStatement} variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Gerar Extrato (PDF)
        </Button>
      </div>

      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Award size={40} className="text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Conceito Atual</p>
            <p className="text-3xl font-bold">{conceitoAtual.toFixed(2)}</p>
          </div>
        </div>
        <div className="w-full md:w-auto grid grid-cols-2 lg:grid-cols-4 gap-3">
            <InfoPill label="Elogios" count={summaryStats.elogio.count} points={summaryStats.elogio.points} />
            <InfoPill label="Punições" count={summaryStats.punicao.count} points={summaryStats.punicao.points} />
            <InfoPill label="FO+" count={summaryStats.foPositivo.count} points={summaryStats.foPositivo.points} />
            <InfoPill label="FO-" count={summaryStats.foNegativo.count} points={summaryStats.foNegativo.points} />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border">
        <div className="p-4 sm:p-6 border-b space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Filter size={18} /> Histórico de Ocorrências</h2>
            
            <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={activeFilter === 'Todos' ? 'default' : 'outline'} onClick={() => setActiveFilter('Todos')}>Todos</Button>
                <Button size="sm" variant={activeFilter === 'Elogio' ? 'default' : 'outline'} className="text-green-600 border-green-600 hover:bg-green-100" onClick={() => setActiveFilter('Elogio')}><ThumbsUp className="mr-2 h-3 w-3" /> Elogios</Button>
                <Button size="sm" variant={activeFilter === 'Punição' ? 'default' : 'outline'} className="text-red-600 border-red-600 hover:bg-red-100" onClick={() => setActiveFilter('Punição')}><ThumbsDown className="mr-2 h-3 w-3" /> Punições</Button>
                <Button size="sm" variant={activeFilter === 'FO+' ? 'default' : 'outline'} className="text-blue-600 border-blue-600 hover:bg-blue-100" onClick={() => setActiveFilter('FO+')}><Megaphone className="mr-2 h-3 w-3" /> FO+</Button>
                <Button size="sm" variant={activeFilter === 'FO-' ? 'default' : 'outline'} className="text-orange-600 border-orange-600 hover:bg-orange-100" onClick={() => setActiveFilter('FO-')}><Megaphone className="mr-2 h-3 w-3" /> FO-</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">De</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                <div><Label className="text-xs">Até</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
            </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {filteredAnnotations.map(anotacao => {
            const autorNome = formatarNome(anotacao.autor);
            const responsavelNome = formatarResponsavel(anotacao);

            return (
              <AccordionItem value={`item-${anotacao.id}`} key={anotacao.id}>
                <AccordionTrigger className="px-4 sm:px-6 hover:bg-accent/50 py-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm sm:text-base">{anotacao.tipo.titulo}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${Number(anotacao.pontos) >= 0 ? ' text-green-700' : ' text-red-700'}`}>
                        {Number(anotacao.pontos) > 0 ? '+' : ''}{Number(anotacao.pontos)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1">
                             <Calendar className="h-3 w-3" /> {formatDate(anotacao.data)}
                        </span>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 sm:px-6 pb-4 bg-accent/5 border-t pt-4 space-y-4">
                    
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                           Detalhes do Fato
                        </p>
                            {anotacao.detalhes}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Keyboard className="h-3.5 w-3.5 opacity-70" />
                                <span>Lançado por: <strong className="text-foreground/80">{autorNome}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-3.5 w-3.5 opacity-70" />
                                <span>Anotado por: <strong className="text-foreground/80">{responsavelNome}</strong></span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:items-end">
                             <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 opacity-70" />
                                <span>Ocorrido em: {formatDate(anotacao.data)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 opacity-70" />
                                <span>Registrado em: {format(new Date(anotacao.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2 justify-end border-t border-border/40">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-2 text-xs"
                            onClick={() => handleEdit(anotacao.id)}
                            disabled={isLoading}
                        >
                            <Pencil className="h-3 w-3" /> Editar
                        </Button>
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-8 gap-2 text-xs"
                            onClick={() => handleDelete(anotacao.id)}
                            disabled={isLoading}
                        >
                            <Trash2 className="h-3 w-3" /> Excluir
                        </Button>
                    </div>

                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {filteredAnnotations.length === 0 && (
          <div className="text-center py-12 px-4 text-muted-foreground flex flex-col items-center gap-2">
            <Filter className="h-8 w-8 opacity-20" />
            <p>Nenhuma anotação encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}