import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArquivosList } from "./arquivos-list";

export default async function DetalhesMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const material = await prisma.materialAuxiliar.findUnique({
    where: { id },
    include: {
      arquivos: true,
    },
  });

  if (!material) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/aluno/materiais"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Voltar para a lista
      </Link>

      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                Material Auxiliar
              </span>
              <span className="text-sm text-muted-foreground">
                Adicionado em {format(new Date(material.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {material.titulo}
            </h1>
          </div>
        </div>

        {material.descricao && (
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground bg-muted/30 p-4 rounded-lg border border-border/50">
            <p className="whitespace-pre-wrap">{material.descricao}</p>
          </div>
        )}

        <ArquivosList materialId={material.id} arquivos={material.arquivos} />
      </div>
    </div>
  );
}