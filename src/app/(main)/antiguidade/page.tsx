import prisma from "@/lib/prisma";
import { getAlmanaque } from "@/app/actions/antiguidade";
// Importamos o MESMO componente usado no Admin!
import TabelaAntiguidade from "@/components/admin/antiguidade/TabelaAntiguidade";

export default async function Page() {
  const [comandante, subComandante, efetivoResponse] = await Promise.all([
    prisma.perfilAluno.findFirst({
      where: {
        funcao: {
          nome: "COMANDANTE GERAL"
        }
      },
      include: {
        usuario: true,
        cargo: true
      }
    }),
    prisma.perfilAluno.findFirst({
      where: {
        funcao: {
          nome: "SUB COMANDANTE GERAL"
        }
      },
      include: {
        usuario: true,
        cargo: true
      }
    }),
    getAlmanaque()
  ]);

  const efetivo = (efetivoResponse.success && efetivoResponse.data) ? efetivoResponse.data : [];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Antiguidade</h1>
          <p className="text-muted-foreground text-sm mt-1">Lista de antiguidade atualizada</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        
        {comandante && (
          <div className="w-full border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-primary py-2 px-2 text-center text-xs sm:text-sm font-bold tracking-[0.2em] text-primary-foreground uppercase border-b border-border">
              Comandante Geral da Tropa
            </div>
            
            <div className="bg-card py-3 px-4 text-center text-xs sm:text-sm font-semibold text-card-foreground flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 uppercase">
              <span>
                {comandante.numero ? `${comandante.numero} - ` : ''} 
                {comandante.cargo?.nome || 'CARGO N/D'} {"GM"} {comandante.nomeDeGuerra || comandante.usuario?.nome}
              </span>
            </div>
          </div>
        )}

        {subComandante && (
          <div className="w-full border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-primary py-2 px-2 text-center text-xs sm:text-sm font-bold tracking-[0.2em] text-primary-foreground uppercase border-b border-border">
              Sub Comandante Geral da Tropa
            </div>
            
            <div className="bg-card py-3 px-4 text-center text-xs sm:text-sm font-semibold text-card-foreground flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 uppercase">
              <span>
                {subComandante.numero ? `${subComandante.numero} - ` : ''} 
                {subComandante.cargo?.nome || 'CARGO N/D'} {"GM"} {subComandante.nomeDeGuerra || subComandante.usuario?.nome}
              </span>
            </div>
          </div>
        )}

      </div>

      <TabelaAntiguidade dados={efetivo} />
    </div>
  );
}