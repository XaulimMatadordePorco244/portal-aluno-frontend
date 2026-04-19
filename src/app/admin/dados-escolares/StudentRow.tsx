"use client"

import { Button } from "@/components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/Input"
import { Check, Plus } from "lucide-react"
import { useState } from "react"
import { FotoHover } from "@/components/ui/foto-hover"

export interface EscolaType {
    id: string;
    nome: string;
}

export interface AlunoType {
    id: string;
    nome: string;
    fotoUrl: string | null;
    nomeDeGuerra: string | null;
    perfilAluno: {
        anoLetivoAtualizado: number;
        escolaId: string | null;
        serieEscolar: string | null;
        turno: string | null;
        turmaEscolar: string | null;
        cargo: {
            abreviacao: string | null;
            precedencia?: number | null;
        } | null;
        escola: EscolaType | null;
    } | null;
}

interface CurrentValuesType {
    escolaId: string;
    serieEscolar: string;
    turno: string;
    turmaEscolar: string;
}

interface StudentRowProps {
    aluno: AlunoType;
    escolas: EscolaType[];
    isDesatualizado: boolean;
    currentValues: CurrentValuesType;
    onChange: (field: string, value: string) => void;
    onSaveOne: () => void;
    onNovaEscola: (nome: string) => Promise<string>;
    hasModifications: boolean;
    anoAtual: number;
}

const SERIES_MAP: Record<string, string> = {
    "QUARTO_ANO_FUNDAMENTAL": "4º Ano - Fund.",
    "QUINTO_ANO_FUNDAMENTAL": "5º Ano - Fund.",
    "SEXTO_ANO_FUNDAMENTAL": "6º Ano - Fund.",
    "SETIMO_ANO_FUNDAMENTAL": "7º Ano - Fund.",
    "OITAVO_ANO_FUNDAMENTAL": "8º Ano - Fund.",
    "NONO_ANO_FUNDAMENTAL": "9º Ano - Fund.",
    "PRIMEIRO_ANO_MEDIO": "1º Ano - E.M.",
    "SEGUNDO_ANO_MEDIO": "2º Ano - E.M.",
    "TERCEIRO_ANO_MEDIO": "3º Ano - E.M.",
    "CONCLUIDO": "Concluído"
}

const SERIES_ENTRIES = Object.entries(SERIES_MAP)

const TURNOS = ["Matutino", "Vespertino", "Noturno"]

export function StudentRow({
    aluno, escolas, isDesatualizado, currentValues,
    onChange, onSaveOne, onNovaEscola, hasModifications
}: StudentRowProps) {

    const [novaEscolaNome, setNovaEscolaNome] = useState("")

    const handleCriarEscola = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!novaEscolaNome.trim()) return
        const novoId = await onNovaEscola(novaEscolaNome)
        onChange("escolaId", novoId)
        setNovaEscolaNome("")
    }

    // 👇 MUDANÇA 1: Colunas com larguras FIXAS no Desktop para limitar o tamanho
    const baseStyle = "grid grid-cols-1 lg:grid-cols-[1fr_180px_140px_80px_120px_auto] gap-x-4 gap-y-6 lg:gap-y-0 items-center p-4 border-b transition-colors"
    
    const highlightStyle = isDesatualizado
        ? "bg-red-50/50 dark:bg-red-900/10 border-l-4 border-l-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        : "border-l-4 border-l-transparent hover:bg-accent/50"

    const perfil = aluno.perfilAluno
    const anoPassado = perfil?.anoLetivoAtualizado || "N/A"

    return (
        <div className={`${baseStyle} ${highlightStyle}`}>

            <div className="flex items-center overflow-hidden mr-2">
                <FotoHover src={aluno.fotoUrl} alt={aluno.nome} className="mr-3 shrink-0" />
                <div className="truncate w-full">
                    <p className="font-bold text-foreground truncate">
                        {perfil?.cargo?.abreviacao} <span className="text-primary">{aluno.nomeDeGuerra || "Sem Nome"}</span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{aluno.nome}</p>
                    {isDesatualizado && (
                        <span className="inline-block mt-1 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold">
                            Desatualizado (Ult: {anoPassado})
                        </span>
                    )}
                </div>
            </div>

            {/* 👇 MUDANÇA 2: 'relative' e o texto no 'absolute' não desalinha as caixas */}
            <div className="relative w-full">
                <Select value={currentValues.escolaId} onValueChange={(v: string) => onChange("escolaId", v)}>
                    <SelectTrigger className={`w-full ${isDesatualizado ? "border-red-300" : ""}`}><SelectValue placeholder="Escola" /></SelectTrigger>
                    <SelectContent>
                        {escolas.map((esc: EscolaType) => (
                            <SelectItem key={esc.id} value={esc.id}>{esc.nome}</SelectItem>
                        ))}
                        <div className="p-2 border-t mt-2 flex gap-2">
                            <Input
                                placeholder="Nova escola..."
                                value={novaEscolaNome}
                                onChange={(e) => setNovaEscolaNome(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 text-xs"
                            />
                            <Button size="sm" onClick={handleCriarEscola} className="h-8 shrink-0"><Plus className="w-3 h-3" /></Button>
                        </div>
                    </SelectContent>
                </Select>
                {isDesatualizado && perfil?.escola?.nome && (
                    <p className="absolute top-full left-0 mt-0.5 text-[10px] text-muted-foreground truncate w-full">Antes: {perfil.escola.nome}</p>
                )}
            </div>

            <div className="relative w-full">
                <Select value={currentValues.serieEscolar} onValueChange={(v: string) => onChange("serieEscolar", v)}>
                    <SelectTrigger className={`w-full ${isDesatualizado ? "border-red-300" : ""}`}><SelectValue placeholder="Série" /></SelectTrigger>
                    <SelectContent>
                        {SERIES_ENTRIES.map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isDesatualizado && perfil?.serieEscolar && (
                    <p className="absolute top-full left-0 mt-0.5 text-[10px] text-muted-foreground truncate w-full">Antes: {SERIES_MAP[perfil.serieEscolar] || perfil.serieEscolar}</p>
                )}
            </div>

            <div className="relative w-full">
                <Input
                    placeholder="Turma"
                    value={currentValues.turmaEscolar}
                    onChange={(e) => onChange("turmaEscolar", e.target.value)}
                    className={`w-full text-center uppercase ${isDesatualizado ? "border-red-300" : ""}`}
                    maxLength={10}
                />
                {isDesatualizado && perfil?.turmaEscolar && (
                    <p className="absolute top-full left-0 mt-0.5 text-[10px] text-muted-foreground truncate w-full">Antes: {perfil.turmaEscolar}</p>
                )}
            </div>

            <div className="relative w-full">
                <Select value={currentValues.turno} onValueChange={(v: string) => onChange("turno", v)}>
                    <SelectTrigger className={`w-full ${isDesatualizado ? "border-red-300" : ""}`}><SelectValue placeholder="Turno" /></SelectTrigger>
                    <SelectContent>
                        {TURNOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                </Select>
                {isDesatualizado && perfil?.turno && (
                    <p className="absolute top-full left-0 mt-0.5 text-[10px] text-muted-foreground truncate w-full">Antes: {perfil.turno}</p>
                )}
            </div>

            <div className="flex items-center justify-end w-full lg:w-auto">
                <Button
                    variant={hasModifications ? "default" : "outline"}
                    onClick={onSaveOne}
                    disabled={!hasModifications}
                    size="sm"
                    className="w-full lg:w-auto"
                >
                    <Check className="h-4 w-4 lg:mr-1" /> <span className="hidden lg:inline">Salvar</span>
                </Button>
            </div>

        </div>
    )
}