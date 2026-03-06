import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const revalidate = 0; 

export default async function DetalhesMaterialAdminPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const material = await prisma.materialAuxiliar.findUnique({
    where: { id: params.id },
    include: {
      arquivos: true,
      interacoes: true, 
    },
  });

  if (!material) {
    return notFound();
  }

  const usuariosQueViram = new Set(
    material.interacoes
      .filter((i) => i.tipo === "VISUALIZACAO")
      .map((i) => i.usuarioId)
  );
  const totalViewsUnicas = usuariosQueViram.size;
  const totalDownloadsGerais = material.interacoes.filter((i) => i.tipo === "DOWNLOAD").length;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Link 
          href="/admin/materiais" 
          className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
          Voltar
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{material.titulo}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Criado em {format(new Date(material.createdAt), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-destructive hover:border-destructive/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            Excluir Material
          </button>
        </div>
      </div>

      {material.descricao && (
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-1">Descrição:</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{material.descricao}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <span className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">Arquivos</span>
          <span className="text-4xl font-bold text-foreground">{material.arquivos.length}</span>
        </div>
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <span className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider flex items-center gap-2">
            👁️ Views Únicas
          </span>
          <span className="text-4xl font-bold text-blue-500">{totalViewsUnicas}</span>
        </div>
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <span className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider flex items-center gap-2">
            💾 Total Downloads
          </span>
          <span className="text-4xl font-bold text-emerald-500">{totalDownloadsGerais}</span>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card text-card-foreground shadow-sm mt-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h2 className="text-lg font-semibold text-foreground">Arquivos e Engajamento</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted text-muted-foreground [&_tr]:border-b [&_tr]:border-border">
              <tr>
                <th className="h-12 px-6 text-left align-middle font-medium">Nome do Arquivo</th>
                <th className="h-12 px-6 text-center align-middle font-medium">Tipo</th>
                <th className="h-12 px-6 text-center align-middle font-medium">Tamanho</th>
                <th className="h-12 px-6 text-center align-middle font-medium">Downloads Deste Ficheiro</th>
                <th className="h-12 px-6 text-right align-middle font-medium">Link Direto</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {material.arquivos.map((arquivo) => {
                const downloadsDesteArquivo = material.interacoes.filter(
                  (i) => i.tipo === "DOWNLOAD" && i.arquivoId === arquivo.id
                ).length;

                return (
                  <tr key={arquivo.id} className="border-b border-border transition-colors hover:bg-muted/50">
                    <td className="p-6 align-middle font-medium text-foreground max-w-[250px] truncate" title={arquivo.nome}>
                      {arquivo.nome}
                    </td>
                    <td className="p-6 align-middle text-center text-muted-foreground">
                      <span className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 text-xs font-semibold">
                        {arquivo.tipo.split('/')[1]?.toUpperCase() || 'ARQUIVO'}
                      </span>
                    </td>
                    <td className="p-6 align-middle text-center text-muted-foreground">
                      {formatBytes(arquivo.tamanho)}
                    </td>
                    <td className="p-6 align-middle text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {downloadsDesteArquivo}
                      </span>
                    </td>
                    <td className="p-6 align-middle text-right">
                      <a 
                        href={arquivo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-9 px-3 text-blue-500"
                      >
                        Abrir
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}