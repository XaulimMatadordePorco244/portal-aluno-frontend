import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DecisionForm } from "./decision-form";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Download, ExternalLink, FileText, User, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalisePage({ params }: PageProps) {
  const { id } = await params;
  
  const parte = await prisma.parte.findUnique({
    where: { id },
    include: {
      autor: {
        include: { perfilAluno: { include: { cargo: true } } }
      }
    },
  });

  if (!parte) notFound();

  const pdfUrl = parte.urlPdf;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black/10">
      
      <header className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Link href="/comandante/partes">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-sm font-bold md:text-base">
              Análise de Processo
            </h1>
            <p className="text-xs text-muted-foreground">
              Doc: {parte.numeroDocumento || "S/N"} • {parte.tipo}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           {pdfUrl && (
             <a href={pdfUrl} target="_blank" rel="noreferrer" className="hidden md:block">
               <Button variant="outline" size="sm" className="gap-2">
                 <Download className="h-4 w-4" /> Baixar PDF
               </Button>
             </a>
           )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 md:grid-cols-12">
          
          <div className="bg-gray-200/50 p-4 md:col-span-8 md:p-6 lg:col-span-9 dark:bg-gray-900/50 overflow-y-auto h-full flex flex-col items-center justify-center">
            
            {pdfUrl ? (
              <>
                <div className="flex flex-col items-center gap-4 text-center md:hidden w-full py-10">
                  <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Documento PDF</h3>
                  <p className="text-sm text-muted-foreground px-6">
                    Para visualizar o conteúdo completo do processo, abra o arquivo.
                  </p>
                  <a href={pdfUrl} target="_blank" className="w-full px-6">
                    <Button className="w-full" variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir Documento
                    </Button>
                  </a>
                </div>

                <iframe 
                  src={pdfUrl} 
                  className="hidden md:block h-full w-full rounded-lg border bg-white shadow-sm max-w-5xl"
                  title="Visualizador de PDF"
                />
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
                <p>Nenhum PDF encontrado para este documento.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col overflow-y-auto border-l bg-white md:col-span-4 lg:col-span-3 dark:bg-gray-950 dark:border-gray-800">
            
            <div className="p-6">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Solicitante
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">{parte.autor.nome}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {parte.autor.perfilAluno?.cargo?.nome} 
                    {parte.autor.nomeDeGuerra && ` • ${parte.autor.nomeDeGuerra}`}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex-1 p-6 bg-gray-50/50 dark:bg-black/20">
               <DecisionForm id={id} />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}