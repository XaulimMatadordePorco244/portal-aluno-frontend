"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Parte {
    id: string;
    assunto: string;
    conteudo: string;
}

export default function EditarParteForm({ parte }: { parte: Parte }) {
    const router = useRouter();
    const [assunto, setAssunto] = useState(parte.assunto);
    const [conteudo, setConteudo] = useState(parte.conteudo);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`/api/partes/${parte.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assunto, conteudo }), 
            });

            if (!res.ok) throw new Error("Erro ao atualizar");

            router.push(`/partes/${parte.id}`); 
            router.refresh();
        } catch  {
            alert("Erro ao salvar alterações.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
                <Label>Assunto</Label>
                <Input 
                    value={assunto} 
                    onChange={(e) => setAssunto(e.target.value)} 
                    required 
                />
            </div>

            <div className="space-y-2">
                <Label>Conteúdo</Label>
                <Textarea 
                    value={conteudo} 
                    onChange={(e) => setConteudo(e.target.value)} 
                    className="min-h-[300px]" 
                    required 
                />
            </div>

            <div className="flex justify-between">
                <Link href={`/partes/${parte.id}`}>
                    <Button variant="ghost" type="button">
                        <ArrowLeft className="mr-2 h-4 w-4"/> 
                        Cancelar
                    </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 animate-spin"/>
                    ) : (
                        <Save className="mr-2 h-4 w-4"/>
                    )}
                    Salvar Alterações
                </Button>
            </div>
        </form>
    );
}