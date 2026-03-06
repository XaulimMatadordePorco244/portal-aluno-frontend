import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const revalidate = 60; 

export default async function MateriaisAlunoPage() {
  const materiais = await prisma.materialAuxiliar.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      arquivos: {
        select: { id: true }, 
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Materiais de Estudo</h1>
        <p className="text-muted-foreground mt-2">
          Acesse apostilas, áudios, PDFs e outros conteúdos auxiliares disponibilizados para você.
        </p>
      </div>

      {materiais.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-border rounded-lg bg-card border-dashed">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-lg font-medium text-foreground">Nenhum material disponível</h3>
          <p className="text-muted-foreground mt-1">Ainda não foram adicionados materiais de estudo. Volte mais tarde!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materiais.map((material) => (
            <Link 
              key={material.id} 
              href={`/aluno/materiais/${material.id}`}
              className="group flex flex-col justify-between rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all hover:border-primary/50 overflow-hidden h-full"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary p-2.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {material.arquivos.length} {material.arquivos.length === 1 ? 'arquivo' : 'arquivos'}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {material.titulo}
                </h3>
                
                {material.descricao && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {material.descricao}
                  </p>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between mt-auto">
                <span className="text-xs text-muted-foreground">
                  Adicionado em {format(new Date(material.createdAt), "dd MMM, yyyy", { locale: ptBR })}
                </span>
                <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Acessar
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}