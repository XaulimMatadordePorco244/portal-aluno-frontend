"use client"

import { Button } from "@/components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/Input"
import { Check, Plus } from "lucide-react"
import { useState } from "react"
import { FotoHover } from "@/components/ui/foto-hover"

const SERIES_MAP: Record<string, string> = {
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

const TURNOS = ["Matutino", "Vespertino"]

export function StudentRow({
    aluno, escolas, isDesatualizado, currentValues,
    onChange, onSaveOne, onNovaEscola, hasModifications, anoAtual
}: any) {

    const [novaEscolaNome, setNovaEscolaNome] = useState("")

    const handleCriarEscola = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!novaEscolaNome.trim()) return
        const novoId = await onNovaEscola(novaEscolaNome)
        onChange("escolaId", novoId)
        setNovaEscolaNome("")
    }

    const baseStyle = "grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_0.5fr_1fr_auto] gap-4 items-center p-4 border-b transition-colors"
    const highlightStyle = isDesatualizado
        ? "bg-red-50/50 dark:bg-red-900/10 border-l-4 border-l-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        : "border-l-4 border-l-transparent hover:bg-accent/50"

    const perfil = aluno.perfilAluno
    const anoPassado = perfil?.anoLetivoAtualizado || "N/A"

    return (
        <div className={`${baseStyle} ${highlightStyle}`}>

            <div className="flex items-center overflow-hidden mr-2">
                <FotoHover src={aluno.fotoUrl} alt={aluno.nome} className="mr-3" />
                <div className="truncate">
                    <p className="font-bold text-foreground truncate">
                        {perfil?.cargo?.abreviacao} <span className="text-primary">{perfil?.nomeDeGuerra || "Sem Nome"}</span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{aluno.nome}</p>
                    {isDesatualizado && (
                        <span className="inline-block mt-1 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold">
                            Desatualizado (Ult: {anoPassado})
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <Select value={currentValues.escolaId} onValueChange={(v) => onChange("escolaId", v)}>
                    <SelectTrigger className={isDesatualizado ? "border-red-300" : ""}><SelectValue placeholder="Escola" /></SelectTrigger>
                    <SelectContent>
                        {escolas.map((esc: any) => (
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
                    <p className="text-[10px] text-muted-foreground">Antes: {perfil.escola.nome}</p>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Select value={currentValues.serieEscolar} onValueChange={(v) => onChange("serieEscolar", v)}>
                    <SelectTrigger className={isDesatualizado ? "border-red-300" : ""}><SelectValue placeholder="Série" /></SelectTrigger>
                    <SelectContent>
                        {SERIES_ENTRIES.map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isDesatualizado && perfil?.serieEscolar && (
                    <p className="text-[10px] text-muted-foreground">Antes: {SERIES_MAP[perfil.serieEscolar] || perfil.serieEscolar}</p>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Input
                    placeholder="Turma (Ex: A)"
                    value={currentValues.turmaEscolar}
                    onChange={(e) => onChange("turmaEscolar", e.target.value)}
                    className={isDesatualizado ? "border-red-300 uppercase" : "uppercase"}
                    maxLength={10}
                />
                {isDesatualizado && perfil?.turmaEscolar && (
                    <p className="text-[10px] text-muted-foreground">Antes: {perfil.turmaEscolar}</p>
                )}
            </div>
            <div className="flex flex-col gap-1">
                <Select value={currentValues.turno} onValueChange={(v) => onChange("turno", v)}>
                    <SelectTrigger className={isDesatualizado ? "border-red-300" : ""}><SelectValue placeholder="Turno" /></SelectTrigger>
                    <SelectContent>
                        {TURNOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                </Select>
                {isDesatualizado && perfil?.turno && (
                    <p className="text-[10px] text-muted-foreground">Antes: {perfil.turno}</p>
                )}
            </div>

            <div className="flex items-center justify-end">
                <Button
                    variant={hasModifications ? "default" : "outline"}
                    onClick={onSaveOne}
                    disabled={!hasModifications}
                    size="sm"
                >
                    <Check className="h-4 w-4 lg:mr-1" /> <span className="hidden lg:inline">Salvar</span>
                </Button>
            </div>

        </div>
    )
}