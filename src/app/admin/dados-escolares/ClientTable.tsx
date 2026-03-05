"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { salvarDadosEscolaresEmLote, criarEscola, getTodosAlunos } from "./actions"
import { Loader2, SaveAll, X } from "lucide-react"
import { StudentRow } from "./StudentRow"


export function ClientTable({ alunosIniciais, escolasIniciais, anoAtual }: any) {
    const [alunos, setAlunos] = useState(alunosIniciais)
    const [escolas, setEscolas] = useState(escolasIniciais)
    const [loading, setLoading] = useState(false)
    const [ordenacao, setOrdenacao] = useState('nome')
    const [pendentes, setPendentes] = useState<Record<string, any>>({})

    const handleRowChange = (userId: string, field: string, value: string) => {
        setPendentes(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                userId,
                [field]: value
            }
        }))
    }

    const handleCancelar = () => {
        if (Object.keys(pendentes).length > 0) {
            if (window.confirm("Tem a certeza que deseja cancelar todas as alterações não guardadas?")) {
                setPendentes({})
            }
        }
    }

    const handleNovaEscola = async (nomeDaEscola: string) => {
        const nova = await criarEscola(nomeDaEscola)
        setEscolas((prev: any) => [...prev, nova].sort((a: any, b: any) => a.nome.localeCompare(b.nome)))
        return nova.id
    }

    const handleSalvarTodos = async () => {
        const updates = Object.values(pendentes)
        if (updates.length === 0) return alert("Nenhuma alteração pendente.")

        setLoading(true)
        const res = await salvarDadosEscolaresEmLote(updates, anoAtual)
        setLoading(false)

        if (res.success) {
            alert(`${updates.length} alunos atualizados com sucesso!`)
            setPendentes({})
            window.location.reload()
        } else {
            alert("Erro ao salvar.")
        }
    }

    const handleSalvarUm = async (userId: string) => {
        const update = pendentes[userId]
        if (!update) return

        setLoading(true)
        const res = await salvarDadosEscolaresEmLote([update], anoAtual)
        setLoading(false)

        if (res.success) {
            const newPendentes = { ...pendentes }
            delete newPendentes[userId]
            setPendentes(newPendentes)
            window.location.reload()
        }
    }

    const handleOrdenarLista = async (tipo: 'nome' | 'guerra' | 'antiguidade') => {
        setOrdenacao(tipo)
        setLoading(true)
        const sortedAlunos = await getTodosAlunos(tipo)
        setAlunos(sortedAlunos)
        setLoading(false)
    }

    const hasPendentes = Object.keys(pendentes).length > 0

    return (
        <div className="space-y-4">

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-semibold text-muted-foreground mr-2">Ordenar por:</span>
                    <Select value={ordenacao} onValueChange={handleOrdenarLista} disabled={loading}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nome">Nome Completo</SelectItem>
                            <SelectItem value="guerra">Nome de Guerra</SelectItem>
                            <SelectItem value="antiguidade">Antiguidade</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {hasPendentes && (
                    <Button
                        variant="outline"
                        onClick={handleCancelar}
                        disabled={loading}
                        className="w-full md:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-900/30"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                )}

                <Button
                    onClick={handleSalvarTodos}
                    disabled={!hasPendentes || loading}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <SaveAll className="h-4 w-4 mr-2" />}
                    Salvar {Object.keys(pendentes).length} Alteração(ões)
                </Button>
            </div>

            <div className="bg-card rounded-lg shadow border overflow-hidden flex flex-col">
                {alunos.map((aluno: any) => {
                    const perfil = aluno.perfilAluno
                    const isConcluido = perfil?.serieEscolar === 'CONCLUIDO'
                    const isDesatualizado = !isConcluido && (
                        (perfil?.anoLetivoAtualizado || 0) < anoAtual ||
                        !perfil?.escolaId ||
                        !perfil?.serieEscolar ||
                        !perfil?.turno
                    )

                    const currentValues = pendentes[aluno.id] || {
                        escolaId: perfil?.escolaId || "",
                        serieEscolar: perfil?.serieEscolar || "",
                        turno: perfil?.turno || "",
                        turmaEscolar: perfil?.turmaEscolar || "",
                    }

                    return (
                        <StudentRow
                            key={aluno.id}
                            aluno={aluno}
                            escolas={escolas}
                            anoAtual={anoAtual}
                            isDesatualizado={isDesatualizado}
                            currentValues={currentValues}
                            onChange={(field: string, value: string) => handleRowChange(aluno.id, field, value)}
                            onSaveOne={() => handleSalvarUm(aluno.id)}
                            onNovaEscola={handleNovaEscola}
                            hasModifications={!!pendentes[aluno.id]}
                        />
                    )
                })}
            </div>
        </div>
    )
}