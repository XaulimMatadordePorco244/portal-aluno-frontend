import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const revalidate = 0; 

export default async function MateriaisAdminPage() {
  const materiais = await prisma.materialAuxiliar.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      arquivos: true,
      interacoes: true,
    },
  });

  const materiaisProcessados = materiais.map((material) => {
    const usuariosQueViram = new Set(
      material.interacoes
        .filter((i) => i.tipo === "VISUALIZACAO")
        .map((i) => i.usuarioId)
    );

    const downloadsTotal = material.interacoes.filter(
      (i) => i.tipo === "DOWNLOAD"
    ).length;

    return {
      ...material,
      viewsUnicas: usuariosQueViram.size,
      downloadsTotal,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Materiais Auxiliares</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Faça a gestão de PDFs, áudios e outros arquivos de estudo.
          </p>
        </div>
        <Link 
          href="/admin/materiais/novo" 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          + Novo Material
        </Link>
      </div>

      <div className="rounded-md border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted text-muted-foreground [&_tr]:border-b [&_tr]:border-border">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium">Título / Tópico</th>
                <th className="h-12 px-4 text-center align-middle font-medium">Arquivos</th>
                <th className="h-12 px-4 text-center align-middle font-medium">👁️ Views Únicas</th>
                <th className="h-12 px-4 text-center align-middle font-medium">💾 Downloads</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Data de Criação</th>
                <th className="h-12 px-4 text-right align-middle font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {materiaisProcessados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Nenhum material cadastrado ainda.
                  </td>
                </tr>
              ) : (
                materiaisProcessados.map((material) => (
                  <tr 
                    key={material.id} 
                    className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      <p className="font-medium text-foreground">{material.titulo}</p>
                      {material.descricao && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs mt-0.5">
                          {material.descricao}
                        </p>
                      )}
                    </td>
                    <td className="p-4 align-middle text-center text-foreground font-medium">
                      {material.arquivos.length}
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                        {material.viewsUnicas}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {material.downloadsTotal}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {format(new Date(material.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Link 
                        href={`/admin/materiais/${material.id}`} 
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3"
                      >
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}