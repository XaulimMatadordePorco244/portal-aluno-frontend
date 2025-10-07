import { ProcessoCompleto } from "@/lib/types";

export function AtoDeBravuraProcessView({ processo }: { processo: ProcessoCompleto }) {
    return (
        <div className="border-l-4 border-primary p-4 bg-muted rounded-md">
            <h2 className="font-bold text-lg">Processo de Ato de Bravura</h2>
            <p className="text-muted-foreground">Componente de análise para Ato de Bravura em construção...</p>
        </div>
    );
}