import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { excluirMaterialCompleto, excluirArquivoIndividual, adicionarArquivosExtra } from "@/actions/material-actions";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

export default async function DetalhesMaterialAdminPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params;

  const material = await prisma.materialAuxiliar.findUnique({
    where: { id },
    include: {
      arquivos: true,
      interacoes: {
        include: {
          usuario: true,
        },
        orderBy: { createdAt: "desc" }
      },
    },
  });

  if (!material) return notFound();

  const visualizacoes = material.interacoes.filter((i) => i.tipo === "VISUALIZACAO");
  const downloads = material.interacoes.filter((i) => i.tipo === "DOWNLOAD");

  const usuariosQueViram = new Set(visualizacoes.map((i) => i.usuarioId));
  const totalViewsUnicas = usuariosQueViram.size;
  const totalDownloadsGerais = downloads.length;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleExcluirMaterial = async () => {
    "use server";
    await excluirMaterialCompleto(material.id);
    redirect("/admin/materiais");
  };

  const handleExcluirArquivo = async (arquivoId: string) => {
    "use server";
    await excluirArquivoIndividual(arquivoId);
    revalidatePath(`/admin/materiais/${material.id}`);
  };

  const handleAdicionarArquivo = async (formData: FormData) => {
    "use server";
    await adicionarArquivosExtra(material.id, formData);
    revalidatePath(`/admin/materiais/${material.id}`);
  };

  return (
    <div className=" space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/admin/materiais" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center text-sm font-medium mb-2">
            ← Voltar para lista
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{material.titulo}</h1>
        </div>
        
        <form action={handleExcluirMaterial}>
          <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground h-10 px-4 py-2">
            Excluir Todo o Material
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="rounded-xl border border-border bg-card shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <span className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">Arquivos</span>
          <span className="text-4xl font-bold text-foreground">{material.arquivos.length}</span>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <span className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">Views Únicas</span>
          <span className="text-4xl font-bold text-blue-500">{totalViewsUnicas}</span>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <span className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">Total Downloads</span>
          <span className="text-4xl font-bold text-emerald-500">{totalDownloadsGerais}</span>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-lg font-semibold text-foreground">Gestão de Arquivos</h2>
          
          <form action={handleAdicionarArquivo} className="flex items-center gap-2">
            <input 
              type="file" 
              name="arquivos" 
              multiple 
              required
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
              Adicionar
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted text-muted-foreground [&_tr]:border-b [&_tr]:border-border">
              <tr>
                <th className="h-12 px-6 font-medium">Nome</th>
                <th className="h-12 px-6 text-center font-medium">Tamanho</th>
                <th className="h-12 px-6 text-center font-medium">Downloads</th>
                <th className="h-12 px-6 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {material.arquivos.map((arquivo) => {
                const downloadsDesteArquivo = downloads.filter(i => i.arquivoId === arquivo.id).length;
                return (
                  <tr key={arquivo.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-6 font-medium text-foreground max-w-[250px] truncate">{arquivo.nome}</td>
                    <td className="p-6 text-center text-muted-foreground">{formatBytes(arquivo.tamanho)}</td>
                    <td className="p-6 text-center text-primary font-bold">{downloadsDesteArquivo}</td>
                    <td className="p-6 text-right flex justify-end gap-2">
                      <a href={arquivo.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-border bg-background hover:bg-accent h-9 px-3">
                        Abrir
                      </a>
                      <form action={handleExcluirArquivo.bind(null, arquivo.id)}>
                        <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground h-9 px-3">
                          Remover
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden flex flex-col h-96">
          <div className="px-6 py-4 border-b border-border bg-muted/20 sticky top-0">
            <h2 className="text-lg font-semibold text-foreground">Alunos que Visualizaram</h2>
          </div>
          <div className="overflow-y-auto flex-1 p-0">
            {visualizacoes.length === 0 ? (
              <p className="p-6 text-center text-muted-foreground text-sm">Nenhuma visualização ainda.</p>
            ) : (
              <ul className="divide-y divide-border">
                {visualizacoes.map((vis) => (
                  <li key={vis.id} className="p-4 flex justify-between items-center hover:bg-muted/30">
                    <span className="text-sm font-medium text-foreground">{vis.usuario?.nome || 'Aluno Desconhecido'}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(vis.createdAt), "dd/MM/yyyy HH:mm")}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden flex flex-col h-96">
          <div className="px-6 py-4 border-b border-border bg-muted/20 sticky top-0">
            <h2 className="text-lg font-semibold text-foreground">Relatório de Downloads</h2>
          </div>
          <div className="overflow-y-auto flex-1 p-0">
            {downloads.length === 0 ? (
              <p className="p-6 text-center text-muted-foreground text-sm">Nenhum download registrado.</p>
            ) : (
              <ul className="divide-y divide-border">
                {downloads.map((dl) => {
                  const arquivoBaixado = material.arquivos.find(a => a.id === dl.arquivoId);
                  
                  return (
                    <li key={dl.id} className="p-4 flex flex-col gap-1 hover:bg-muted/30">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">{dl.usuario?.nome || 'Aluno Desconhecido'}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(dl.createdAt), "dd/MM/yyyy HH:mm")}</span>
                      </div>
                      <span className="text-xs text-primary truncate">
                        Baixou: {arquivoBaixado?.nome || 'Arquivo Removido'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}