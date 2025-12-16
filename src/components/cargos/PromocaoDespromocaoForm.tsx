'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { realizarTransicaoCargo } from '@/hooks/useCargoHistory';
import {
    ArrowUp,
    ArrowDown,
    CheckCircle,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    History,
    Info
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Cargo {
    id: string;
    nome: string;
    abreviacao: string;
    precedencia: number;
}

interface Aluno {
    id: string;
    usuario: {
        nome: string;
    };
    cargo?: {
        id: string;
        nome: string;
        precedencia: number;
    };
    conceitoAtual?: string;
}

interface PromocaoDespromocaoFormProps {
    aluno: Aluno;
    cargos: Cargo[];
    adminId: string;
    adminNome: string;
}

const PromocaoDespromocaoForm: React.FC<PromocaoDespromocaoFormProps> = ({
    aluno,
    cargos,
    adminId,
    adminNome
}) => {
    const router = useRouter();

    const [tipoTransicao, setTipoTransicao] = useState<'promocao' | 'despromocao'>('promocao');
    const [cargoSelecionado, setCargoSelecionado] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [novoCargoId, setNovoCargoId] = useState('');


    const cargosFiltrados = cargos.filter(cargo => {
        if (!aluno.cargo) return true;

        if (tipoTransicao === 'promocao') {
            return cargo.precedencia < aluno.cargo.precedencia;
        } else {
            return cargo.precedencia > aluno.cargo.precedencia;
        }
    });

    const cargosOrdenados = [...cargosFiltrados].sort((a, b) =>
        tipoTransicao === 'promocao'
            ? a.precedencia - b.precedencia
            : b.precedencia - a.precedencia
    );


    useEffect(() => {
        setNovoCargoId('');
        setCargoSelecionado('');
        setCurrentStep(0);
        setMotivo('');
    }, [tipoTransicao]);


    const cargoPreview = cargos.find(c => c.id === cargoSelecionado);

    const handlePreview = () => {
        if (!novoCargoId || !motivo.trim()) {
            toast.warning('Preencha todos os campos obrigatórios antes de visualizar');
            return;
        }

        if (motivo.length < 10) {
            toast.warning('Descreva o motivo com pelo menos 10 caracteres');
            return;
        }

        setPreviewVisible(true);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            await realizarTransicaoCargo({
                alunoId: aluno.id,
                novoCargoId: novoCargoId,
                tipo: tipoTransicao === 'promocao' ? 'PROMOCAO' : 'DESPROMOCAO',
                motivo: motivo
            });

            toast.success(`${tipoTransicao === 'promocao' ? 'Promoção' : 'Despromoção'} realizada com sucesso!`);


            setTimeout(() => {
                router.push(`/admin/alunos/${aluno.id}/cargos`);
                router.refresh();
            }, 1500);

        } catch (error: any) {
            toast.error(error.message || 'Erro ao realizar transição');
        } finally {
            setLoading(false);
            setPreviewVisible(false);
        }
    };

    const steps = [
        {
            title: 'Tipo de Transição',
            description: 'Escolha promoção ou despromoção',
        },
        {
            title: 'Selecionar Cargo',
            description: 'Escolha o novo cargo',
        },
        {
            title: 'Motivo e Confirmação',
            description: 'Detalhe e confirme',
        },
    ];

    const renderStepIndicator = () => (
        <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={step.title}>
                    <div
                        className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${index === currentStep ? 'scale-105' : ''
                            }`}
                        onClick={() => setCurrentStep(index)}
                    >
                        <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2
              ${index < currentStep ? 'bg-primary text-primary-foreground border-primary' :
                                index === currentStep ? 'bg-primary text-primary-foreground border-primary' :
                                    'bg-muted text-muted-foreground border-muted-foreground'}
            `}>
                            {index < currentStep ? (
                                <CheckCircle className="h-5 w-5" />
                            ) : (
                                <span className="font-medium">{index + 1}</span>
                            )}
                        </div>
                        <span className={`text-sm font-medium ${index === currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                            {step.title}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                            {step.description}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-4 mt-5 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Tipo de Transição</h3>
                <p className="text-muted-foreground mb-6">Escolha o tipo de transição que deseja realizar</p>
            </div>

            <Tabs
                value={tipoTransicao}
                onValueChange={(value) => setTipoTransicao(value as 'promocao' | 'despromocao')}
                className="w-full"
            >
                <TabsList className="grid grid-cols-2 mb-8">
                    <TabsTrigger value="promocao" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Promoção
                    </TabsTrigger>
                    <TabsTrigger value="despromocao" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                        <ArrowDown className="h-4 w-4 mr-2" />
                        Despromoção
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="promocao" className="space-y-4">
                    <Card className="border-green-200 bg-green-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <ArrowUp className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-700">Promoção</h4>
                                    <p className="text-sm text-green-600">
                                        Elevar para um cargo superior
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                A promoção reconhece o mérito e progresso do aluno, atribuindo um cargo de maior responsabilidade.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="despromocao" className="space-y-4">
                    <Card className="border-red-200 bg-red-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <ArrowDown className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-red-700">Despromoção</h4>
                                    <p className="text-sm text-red-600">
                                        Rebaixar para um cargo inferior
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                A despromoção é aplicada em casos de baixo desempenho ou infrações disciplinares.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Informação</AlertTitle>
                <AlertDescription>
                    {tipoTransicao === 'promocao'
                        ? "A promoção reconhece o mérito e progresso do aluno, atribuindo um cargo de maior responsabilidade."
                        : "A despromoção é aplicada em casos de baixo desempenho ou infrações disciplinares."}
                </AlertDescription>
            </Alert>

            <div className="flex justify-end pt-4">
                <Button onClick={() => setCurrentStep(1)}>
                    Próximo: Selecionar Cargo
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">
                    {tipoTransicao === 'promocao' ? 'Selecionar Cargo Superior' : 'Selecionar Cargo Inferior'}
                </h3>
                <p className="text-muted-foreground mb-2">
                    {aluno.cargo ? (
                        <>
                            Cargo atual: <span className="font-medium">{aluno.cargo.nome}</span>
                            <span className="mx-2">→</span>
                            {tipoTransicao === 'promocao' ? 'Cargo superior' : 'Cargo inferior'}
                        </>
                    ) : (
                        'Selecione o novo cargo'
                    )}
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="novoCargo">Novo Cargo *</Label>
                    <Select value={novoCargoId} onValueChange={(value: string) => {
                        setNovoCargoId(value);
                        setCargoSelecionado(value);
                    }}>
                        <SelectTrigger id="novoCargo">
                            <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                        <SelectContent>
                            <div className="p-2 border-b">
                                <p className="text-sm text-muted-foreground">
                                    {cargosOrdenados.length} cargos disponíveis para {tipoTransicao === 'promocao' ? 'promoção' : 'despromoção'}
                                </p>
                            </div>
                            <ScrollArea className="h-[300px]">
                                {cargosOrdenados.map((cargo) => (
                                    <SelectItem key={cargo.id} value={cargo.id}>
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-medium">{cargo.nome}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{cargo.abreviacao}</Badge>
                                                <span className="text-xs text-muted-foreground">Prec: {cargo.precedencia}</span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </ScrollArea>
                        </SelectContent>
                    </Select>
                </div>

                {cargoSelecionado && cargoPreview && (
                    <Alert className="bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-3">
                            {tipoTransicao === 'promocao' ? '🔼' : '🔽'}
                            <div>
                                <p className="font-medium">
                                    {aluno.cargo?.nome || 'Sem cargo'} → {cargoPreview.nome}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    O aluno será {tipoTransicao === 'promocao' ? 'promovido' : 'despromovido'} para {cargoPreview.nome} ({cargoPreview.abreviacao})
                                </p>
                            </div>
                        </div>
                    </Alert>
                )}
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <Button onClick={() => setCurrentStep(2)} disabled={!cargoSelecionado}>
                    Próximo: Motivo e Confirmação
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Motivo da Transição</h3>
                <p className="text-muted-foreground mb-6">
                    Este motivo será registrado nos logs de auditoria
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="motivo">
                        Descrição do Motivo *
                        <span className="text-xs font-normal text-muted-foreground ml-2">
                            (mínimo 10 caracteres)
                        </span>
                    </Label>
                    <Textarea
                        id="motivo"
                        placeholder="Descreva detalhadamente o motivo da transição. Ex: 'Promoção por mérito devido ao excelente desempenho nas atividades...'"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        rows={4}
                        maxLength={500}
                        className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {motivo.length}/500 caracteres
                    </p>
                </div>


                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Resumo da Transição</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground">Aluno</Label>
                                <p className="font-medium">{aluno.usuario.nome}</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Tipo</Label>
                                <div>
                                    <Badge variant={tipoTransicao === 'promocao' ? 'default' : 'destructive'} className={tipoTransicao === 'promocao' ? 'bg-green-500' : ''}>
                                        {tipoTransicao === 'promocao' ? 'PROMOÇÃO' : 'DESPROMOCAO'}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Cargo Atual</Label>
                                <p>{aluno.cargo?.nome || 'Não definido'}</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Novo Cargo</Label>
                                <p className="font-medium text-green-600">
                                    {cargoPreview?.nome || 'Não selecionado'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Conceito Atual</Label>
                                <p>{aluno.conceitoAtual || '7.0'}</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Novo Conceito</Label>
                                <p className="font-medium text-amber-600">7.0 (será redefinido)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Alert variant="destructive" className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>Confirmação Final</AlertTitle>
                    <AlertDescription className="space-y-2">
                        <p>Ao confirmar esta transição:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>O cargo do aluno será alterado imediatamente</li>
                            <li>O conceito será redefinido para 7.0</li>
                            <li>Um novo registro será criado no histórico</li>
                            <li>A ação será registrada em logs de auditoria</li>
                            <li><strong>Esta ação não pode ser desfeita automaticamente</strong></li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePreview} disabled={!novoCargoId || motivo.length < 10}>
                        Visualizar
                    </Button>
                    <Button onClick={handlePreview} disabled={!novoCargoId || motivo.length < 10 || loading}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirmar Transição
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderPreviewDialog = () => (
        <Dialog open={previewVisible} onOpenChange={setPreviewVisible}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Confirmação Final da Transição
                    </DialogTitle>
                    <DialogDescription>
                        Revise todas as informações antes de confirmar
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive" className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                        Esta ação não pode ser desfeita automaticamente após a confirmação.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle>Resumo da Transição</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground">Aluno</Label>
                                <p className="font-medium">{aluno.usuario.nome}</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Tipo</Label>
                                <Badge variant={tipoTransicao === 'promocao' ? 'default' : 'destructive'} className={tipoTransicao === 'promocao' ? 'bg-green-500' : ''}>
                                    {tipoTransicao === 'promocao' ? 'PROMOÇÃO' : 'DESPROMOCAO'}
                                </Badge>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">De</Label>
                                <p>{aluno.cargo?.nome || 'Não definido'}</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Para</Label>
                                <p className="font-medium text-green-600">{cargoPreview?.nome}</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Data</Label>
                                <p>{new Date().toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Responsável</Label>
                                <p>{adminNome}</p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <Label className="text-sm text-muted-foreground">Motivo</Label>
                            <div className="mt-2 p-3 bg-muted rounded-md">
                                <p className="text-sm">{motivo}</p>
                            </div>
                        </div>

                        <Separator />

                        <Alert className="bg-blue-50 border-blue-200">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertTitle>Consequências</AlertTitle>
                            <AlertDescription className="space-y-1">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Conceito redefinido de <strong>{aluno.conceitoAtual || '7.0'}</strong> para <strong>7.0</strong></li>
                                    <li>Histórico atualizado com novo período</li>
                                    <li>Log de auditoria registrado permanentemente</li>
                                    <li>Alteração visível imediatamente no sistema</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                <DialogFooter className="sm:justify-between">
                    <Button variant="outline" onClick={() => setPreviewVisible(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Executando..." : "Confirmar e Executar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        {tipoTransicao === 'promocao' ? (
                            <ArrowUp className="h-6 w-6 text-green-500" />
                        ) : (
                            <ArrowDown className="h-6 w-6 text-red-500" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {tipoTransicao === 'promocao' ? 'Promoção' : 'Despromoção'} de Cargo
                        </h1>
                        <p className="text-muted-foreground">
                            Aluno: {aluno.usuario.nome}
                        </p>
                    </div>
                </div>

                <Button variant="outline" asChild>
                    <Link href={`/admin/alunos/${aluno.id}/cargos`}>
                        <History className="mr-2 h-4 w-4" />
                        Voltar ao Histórico
                    </Link>
                </Button>
            </div>

            <Card className="border-2">
                <CardContent className="pt-6">
                    {renderStepIndicator()}

                    {currentStep === 0 && renderStep1()}
                    {currentStep === 1 && renderStep2()}
                    {currentStep === 2 && renderStep3()}
                </CardContent>
            </Card>

            {renderPreviewDialog()}
        </div>
    );
};

export default PromocaoDespromocaoForm;