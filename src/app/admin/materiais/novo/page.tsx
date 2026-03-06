"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { criarMaterialAuxiliar } from "@/actions/material-actions";

export default function NovoMaterialPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setArquivosSelecionados(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            const response = await criarMaterialAuxiliar(formData);

            if (response.success) {
                router.push("/admin/materiais");
                router.refresh();
            } else {
                setError(response.message || "Erro ao criar material.");
            }
        } catch (err) {
            console.error(err);
            setError("Erro inesperado ao conectar com o servidor.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/admin/materiais"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    ← Voltar
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Material Auxiliar</h1>
            </div>

            <div className="rounded-md border border-border bg-card text-card-foreground shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {error && (
                        <div className="p-4 bg-destructive/15 text-destructive border border-destructive/20 rounded-md text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="titulo" className="block text-sm font-medium text-foreground mb-1.5">
                            Título / Tópico *
                        </label>
                        <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            required
                            placeholder="Ex: Noções de Trânsito, Canções do Exército..."
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label htmlFor="descricao" className="block text-sm font-medium text-foreground mb-1.5">
                            Descrição (Opcional)
                        </label>
                        <textarea
                            id="descricao"
                            name="descricao"
                            rows={3}
                            placeholder="Descreva brevemente o que os alunos vão encontrar nestes arquivos."
                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Arquivos (PDF, MP3, etc) *
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md hover:bg-accent/50 transition-colors relative bg-background">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-muted-foreground" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-foreground justify-center mt-2">
                                    <label htmlFor="arquivos" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring">
                                        <span>Selecione os arquivos</span>
                                        <input
                                            id="arquivos"
                                            name="arquivos"
                                            type="file"
                                            multiple
                                            required
                                            className="sr-only"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <p className="pl-1 text-muted-foreground">ou arraste para cá</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Pode selecionar vários arquivos ao mesmo tempo.
                                </p>
                            </div>
                        </div>

                        {arquivosSelecionados.length > 0 && (
                            <div className="mt-4 border border-border rounded-md p-3 bg-muted/50">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Arquivos Selecionados ({arquivosSelecionados.length}):
                                </p>
                                <ul className="space-y-2">
                                    {arquivosSelecionados.map((file, idx) => (
                                        <li key={idx} className="flex justify-between items-center text-sm text-foreground bg-background p-2 rounded-md border border-border shadow-sm">
                                            <span className="truncate pr-4">{file.name}</span>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Salvando...
                                </>
                            ) : (
                                "Criar Material e Notificar Alunos"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}