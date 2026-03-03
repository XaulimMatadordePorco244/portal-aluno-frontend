"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createTurma } from "./actions";

type AlunoSemTurma = {
  id: string; 
  nome: string;
  perfilAluno: { id: string; anoIngresso: number | null } | null;
};

export function FormTurma({ alunosSemTurma }: { alunosSemTurma: AlunoSemTurma[] }) {
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [anoTurma, setAnoTurma] = useState<number>(new Date().getFullYear());
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const alunosDoAno = alunosSemTurma.filter(
      (aluno) => aluno.perfilAluno?.anoIngresso === anoTurma
    );
    const idsPreSelecionados = alunosDoAno.map((a) => a.perfilAluno!.id);
    
    setSelectedIds(idsPreSelecionados);
  }, [anoTurma, alunosSemTurma]);

  const handleCheckboxChange = (perfilId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, perfilId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== perfilId));
    }
  };

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    selectedIds.forEach(id => formData.append("alunosIds", id));
    
    const res = await createTurma(formData);
    setIsPending(false);

    if (res.success) {
      toast.success(`Turma criada com ${selectedIds.length} alunos vinculados!`);
      formRef.current?.reset();
      setSelectedIds([]); 
    } else {
      toast.error(res.error || "Erro ao criar turma");
    }
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-medium">Nome da Turma</label>
        <Input id="nome" name="nome" placeholder="Ex: Turma Águia" required />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="ano" className="text-sm font-medium">Ano de Ingresso</label>
        <Input 
          id="ano" 
          name="ano" 
          type="number" 
          value={anoTurma}
          onChange={(e) => setAnoTurma(parseInt(e.target.value) || new Date().getFullYear())}
          required 
        />
      </div>

      <div className="space-y-2 pt-2 border-t">
        <div className="flex justify-between items-end">
          <label className="text-sm font-medium">Vincular Alunos ({selectedIds.length})</label>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">Pré-seleção automática ativada</span>
        </div>
        
        <div className="h-[200px] overflow-y-auto border rounded-md p-3 space-y-3 bg-muted/10">
          {alunosSemTurma.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum aluno sem turma disponível.</p>
          ) : (
            alunosSemTurma.map((aluno) => {
              const perfilId = aluno.perfilAluno?.id;
              if (!perfilId) return null;

              const isChecked = selectedIds.includes(perfilId);

              return (
                <div key={perfilId} className="flex items-center space-x-2">
                  <Checkbox 
                    id={perfilId} 
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckboxChange(perfilId, checked as boolean)}
                  />
                  <label htmlFor={perfilId} className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex flex-col">
                    <span className="font-medium">{aluno.nome}</span>
                    <span className="text-[10px] text-muted-foreground">Ano de Ingresso: {aluno.perfilAluno?.anoIngresso || 'Não informado'}</span>
                  </label>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Criando..." : "Salvar Turma"}
      </Button>
    </form>
  );
}