'use client'

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input'; 
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { processarTransicaoEmMassa, TipoTransicao } from '@/app/actions/transicoes';

interface AlunoSimples {
  id: string;
  usuario: { nome: string };
  nomeDeGuerra?: string | null; 
  conceitoAtual?: string | null;
  cargo?: { id: string; nome: string; abreviacao: string; precedencia: number; tipo: string };
}

interface CargoSimples {
  id: string;
  nome: string;
  precedencia: number;
  tipo: string;
}

const MODALIDADES_PROMOCAO = [
  "ANTIGUIDADE",
  "MERECIMENTO",
  "BRAVURA",
  "PÓS-MORTEM",
  "RESSARCIMENTO DE PRETERIÇÃO"
];

const MODALIDADES_DESPROMOCAO = [
  "DISCIPLINA",
  "INSUFICIÊNCIA TÉCNICA",
  "A PEDIDO",
  "RECLASSIFICAÇÃO",
  "DECISÃO JUDICIAL"
];

export default function NovaTransicaoForm({ 
  alunos, 
  cargos 
}: { 
  alunos: AlunoSimples[], 
  cargos: CargoSimples[] 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [tipo, setTipo] = useState<TipoTransicao>('PROMOCAO');
  const [selectedAlunos, setSelectedAlunos] = useState<string[]>([]);
  const [cargoDestinoId, setCargoDestinoId] = useState<string>('');
  
  const [modalidade, setModalidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [filtroNome, setFiltroNome] = useState('');

  const toggleAluno = (id: string) => {
    setSelectedAlunos(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const alunosFiltrados = useMemo(() => {
    return alunos.filter(a => 
      a.usuario.nome.toLowerCase().includes(filtroNome.toLowerCase()) ||
      (a.nomeDeGuerra && a.nomeDeGuerra.toLowerCase().includes(filtroNome.toLowerCase()))
    );
  }, [alunos, filtroNome]);

  const calcularNovoCargo = (aluno: AlunoSimples) => {
    if (tipo === 'CURSO') {
      const c = cargos.find(c => c.id === cargoDestinoId);
      return c ? { ...c, nome: c.nome } : null;
    }

    if (!aluno.cargo) return null;

    const cargosCarreira = cargos.filter(c => c.tipo !== 'CURSO');
    const currentPrecedencia = aluno.cargo.precedencia;

    if (tipo === 'PROMOCAO' || tipo === 'BRAVURA') {
      const target = cargosCarreira
        .filter(c => c.precedencia < currentPrecedencia)
        .sort((a, b) => b.precedencia - a.precedencia)[0]; 
      
      return target || null; 
    }

    if (tipo === 'DESPROMOCAO') {
       const target = cargosCarreira
        .filter(c => c.precedencia > currentPrecedencia)
        .sort((a, b) => a.precedencia - b.precedencia)[0]; 

       return target || null; 
    }

    return null;
  };

  const highlightWarName = (fullName: string, warName?: string | null) => {
    if (!warName) return <span className="text-sm font-medium">{fullName}</span>;

    const escapedWarName = warName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedWarName})`, 'gi');
    const parts = fullName.split(regex);

    return (
      <span className="text-sm text-muted-foreground">
        {parts.map((part, index) => 
          part.toLowerCase() === warName.toLowerCase() ? (
            <strong key={index} className="font-bold text-foreground text-sm">{part}</strong>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  const handlePreSubmit = () => {
    if (selectedAlunos.length === 0) return toast.error("Selecione pelo menos um aluno");
    if (!modalidade) return toast.error("Selecione a modalidade da transição");
    if (!descricao) return toast.error("Preencha a descrição (ex: número do boletim)");
    if (tipo === 'CURSO' && !cargoDestinoId) return toast.error("Selecione o cargo de destino para o Curso");

    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    const motivoCompleto = `[${modalidade}] ${descricao}`;

    const res = await processarTransicaoEmMassa({
      alunoIds: selectedAlunos,
      tipo,
      cargoDestinoId: tipo === 'CURSO' ? cargoDestinoId : undefined,
      motivo: motivoCompleto
    });
    
    setLoading(false);
    setIsConfirmOpen(false);

    if (res.success) {
      toast.success(res.message);
      router.push('/admin/promocoes'); 
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="grid gap-6">
      
      <Card>
        <CardHeader>
          <CardTitle>1. Dados da Movimentação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label>Tipo de Ação</Label>
              <Select value={tipo} onValueChange={(v: TipoTransicao) => {
                setTipo(v);
                setModalidade(''); 
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROMOCAO">Promoção (Carreira)</SelectItem>
                  <SelectItem value="BRAVURA">Ato de Bravura</SelectItem>
                  <SelectItem value="DESPROMOCAO">Despromoção</SelectItem>
                  <SelectItem value="CURSO">Conclusão de Curso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipo === 'CURSO' && (
              <div className="flex-1 space-y-2">
                <Label>Novo Cargo (Curso)</Label>
                <Select value={cargoDestinoId} onValueChange={setCargoDestinoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex-1 space-y-2">
              <Label>Modalidade</Label>
              <Select value={modalidade} onValueChange={setModalidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo..." />
                </SelectTrigger>
                <SelectContent>
                   {(tipo === 'DESPROMOCAO' ? MODALIDADES_DESPROMOCAO : MODALIDADES_PROMOCAO).map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                   ))}
                   {tipo === 'CURSO' && <SelectItem value="CONCLUSÃO DE CURSO">Conclusão de Curso</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Descrição / Documento (Obrigatório)</Label>
            <Textarea 
              placeholder="Ex: Conforme Boletim Interno nº 001/2025. Alunos aptos no TAF e com interstício cumprido." 
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>2. Selecionar Efetivo</CardTitle>
            <CardDescription>
              {selectedAlunos.length} aluno(s) selecionado(s)
            </CardDescription>
          </div>
          <div className="relative w-[250px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou nome de guerra..." 
              className="pl-8" 
              value={filtroNome}
              onChange={e => setFiltroNome(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="p-2 border-b bg-muted/40 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span className="pl-2">ALUNO</span>
              <span className="pr-4">PREVISÃO DO NOVO CARGO</span>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="divide-y">
                {alunosFiltrados.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Nenhum aluno encontrado.
                    </div>
                ) : (
                    alunosFiltrados.map(aluno => {
                    const isSelected = selectedAlunos.includes(aluno.id);
                    const novoCargo = isSelected ? calcularNovoCargo(aluno) : null;
                    const cargoAtualNome = aluno.cargo?.abreviacao || 'S/ Cargo';

                    return (
                        <div key={aluno.id} 
                            className={`flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                            onClick={() => toggleAluno(aluno.id)}
                        >
                        <div className="flex items-center gap-3">
                            <Checkbox checked={isSelected} />
                            <div className="flex flex-col">
                                {highlightWarName(aluno.usuario.nome, aluno.nomeDeGuerra)}
                                <span className="text-xs text-muted-foreground mt-0.5">
                                    Atual: <Badge variant="outline" className="text-[10px] h-4 px-1">{cargoAtualNome}</Badge>
                                </span>
                            </div>
                        </div>
                        
                        {isSelected && (
                            <div className="flex items-center gap-2 pr-2">
                                {novoCargo ? (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                        {novoCargo.nome}
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">Sem vaga/Topo</Badge>
                                )}
                            </div>
                        )}
                        </div>
                    )
                    })
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button onClick={handlePreSubmit} disabled={selectedAlunos.length === 0}>
          Continuar e Revisar
        </Button>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisão de Transição em Massa</DialogTitle>
            <DialogDescription>
              Verifique atentamente os dados antes de processar. Esta ação gerará registros históricos permanentes.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex gap-4 text-sm bg-muted p-3 rounded-md">
                <div>
                    <span className="font-semibold block">Tipo:</span> {tipo}
                </div>
                <div>
                    <span className="font-semibold block">Modalidade:</span> {modalidade}
                </div>
                <div>
                    <span className="font-semibold block">Descrição:</span> {descricao}
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Aluno</TableHead>
                            <TableHead>Cargo Anterior</TableHead>
                            <TableHead>Novo Cargo</TableHead>
                            <TableHead>Conceito Anterior</TableHead>
                            <TableHead>Novo Conceito</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {alunos
                            .filter(a => selectedAlunos.includes(a.id))
                            .map(aluno => {
                                const novoCargo = calcularNovoCargo(aluno);
                                const conceitoNovo = tipo === 'DESPROMOCAO' ? aluno.conceitoAtual : '7.00'; // Exemplo de regra

                                return (
                                    <TableRow key={aluno.id}>
                                        <TableCell className="font-medium">
                                            {highlightWarName(aluno.usuario.nome, aluno.nomeDeGuerra)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {aluno.cargo?.nome || 'S/ Cargo'}
                                        </TableCell>
                                        <TableCell>
                                            {novoCargo ? (
                                                <span className="text-green-600 font-bold flex items-center gap-1">
                                                    {novoCargo.nome} <Check className="h-3 w-3" />
                                                </span>
                                            ) : (
                                                <span className="text-red-500 font-bold flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> Erro
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {aluno.conceitoAtual || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-blue-600 font-bold">
                                                {conceitoNovo}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        }
                    </TableBody>
                </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Voltar e Editar</Button>
            <Button onClick={handleConfirmSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? 'Processando...' : 'Confirmar Transição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}