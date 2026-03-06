"use client";

import { useEffect, useState } from "react";
import { registrarInteracaoMaterial } from "@/actions/material-actions";

type Arquivo = {
  id: string;
  nome: string;
  url: string;
  tipo: string;
  tamanho: number;
};

export function ArquivosList({ 
  materialId, 
  arquivos 
}: { 
  materialId: string; 
  arquivos: Arquivo[] 
}) {
  const [baixandoId, setBaixandoId] = useState<string | null>(null);

  useEffect(() => {
    registrarInteracaoMaterial(materialId, "VISUALIZACAO").catch(console.error);
  }, [materialId]);

  const handleDownload = async (arquivo: Arquivo) => {
    setBaixandoId(arquivo.id);
    
    try {
      await registrarInteracaoMaterial(materialId, "DOWNLOAD", arquivo.id);
      
      window.open(arquivo.url, "_blank");
    } catch (error) {
      console.error("Erro ao registrar download:", error);
    } finally {
      setBaixandoId(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
        Arquivos Disponíveis ({arquivos.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {arquivos.map((arquivo) => (
          <div 
            key={arquivo.id} 
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="shrink-0 text-primary bg-primary/10 p-3 rounded-lg">
                {arquivo.tipo.includes('audio') ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate" title={arquivo.nome}>
                  {arquivo.nome}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatBytes(arquivo.tamanho)}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownload(arquivo)}
              disabled={baixandoId === arquivo.id}
              className="ml-4 shrink-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 disabled:opacity-50"
            >
              {baixandoId === arquivo.id ? (
                 <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Baixar
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}