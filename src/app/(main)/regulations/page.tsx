import prisma from "@/lib/prisma";
import { Download } from 'lucide-react';

const RegulationItem = ({ title, date, pdfUrl }: { title: string; date: Date; pdfUrl: string }) => (
  <a 
    href={pdfUrl} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex justify-between items-center border-b p-4 hover:bg-accent transition-colors group"
  >
    <div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">
        Última atualização: {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </p>
    </div>
    <Download className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
  </a>
);

export default async function RegulationsPage() {
  const regulamentos = await prisma.regulamento.findMany({
    where: { ativo: true },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="bg-card rounded-xl shadow-lg p-8 max-w-4xl mx-auto border">
        
        <div className="flex items-center gap-4 mb-6 pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Regulamentos da Guarda Mirim
            </h1>
            <p className="text-md text-muted-foreground">
              Consulte e baixe os documentos oficiais da instituição.
            </p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          {regulamentos.length > 0 ? (
            regulamentos.map(reg => (
              <RegulationItem
                key={reg.id}
                title={reg.titulo}
                date={reg.updatedAt}
                pdfUrl={reg.arquivoUrl}
              />
            ))
          ) : (
            <p className="p-4 text-center text-muted-foreground">Nenhum regulamento encontrado no momento.</p>
          )}
        </div>
        
      </div>
    </div>
  );
}