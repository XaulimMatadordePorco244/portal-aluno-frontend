import prisma from "@/lib/prisma";
import { Cake } from "lucide-react";
import { FotoHover } from "@/components/ui/foto-hover";

interface Props {
  mesSelecionado: number;
}

export async function AniversariantesList({ mesSelecionado }: Props) {
  const usuarios = await prisma.usuario.findMany({
    where: {
      status: 'ATIVO',
      dataNascimento: { not: null }
    },
    include: {
      perfilAluno: {
        include: { cargo: true }
      }
    }
  });

  const aniversariantes = usuarios
    .filter(u => u.dataNascimento!.getUTCMonth() === mesSelecionado)
    .sort((a, b) => a.dataNascimento!.getUTCDate() - b.dataNascimento!.getUTCDate());

  const hoje = new Date();
  const diaDeHoje = hoje.getDate(); 
  const mesDeHoje = hoje.getMonth();

  if (aniversariantes.length === 0) {
    return (
      <div className="p-12 text-center bg-card border border-dashed border-border rounded-2xl text-muted-foreground">
        <Cake className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p>Nenhum aniversariante encontrado neste mês.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {aniversariantes.map((user) => {
        const diaNascimento = user.dataNascimento!.getUTCDate();
        const mesNascimento = user.dataNascimento!.getUTCMonth();
        
        const fazHoje = diaNascimento === diaDeHoje && mesNascimento === mesDeHoje;
        
        const nomeFormatado = user.perfilAluno 
          ? `${user.perfilAluno.cargo?.abreviacao || ''} GM ${user.nomeDeGuerra}`
          : user.nome.split(" ")[0];

        const numeroAluno = user.perfilAluno?.numero 
          ? `Nº ${user.perfilAluno.numero}` 
          : "Equipe GM";

        return (
          <div 
            key={user.id} 
            // AQUI FOI A CORREÇÃO! Removido o 'hover:-translate-y-1'.
            // Agora usamos apenas sombras para dar o efeito de hover sem quebrar o CSS position: fixed!
            className={`relative rounded-2xl border transition-all duration-300 ${
              fazHoje 
                ? 'border-primary/60 shadow-md bg-primary/5 hover:shadow-lg' 
                : 'border-border/60 bg-card hover:border-primary/40 hover:shadow-md'
            } p-6 flex flex-col items-center text-center`}
          >
            {fazHoje && (
              <div className="absolute top-0 inset-x-0 h-1.5 bg-primary rounded-t-2xl animate-in fade-in duration-700" />
            )}
            
            <div className={`mb-4 rounded-full p-1.5 transition-colors ${fazHoje ? 'bg-primary/10' : 'bg-transparent'}`}>
              
              <FotoHover 
                src={user.fotoUrl} 
                alt={user.nome}
                size={96} 
                className={`w-20 h-20 sm:w-24 sm:h-24 ${fazHoje ? 'border-primary/40' : 'border-background'}`} 
              />

            </div>
            
            <h3 className={`font-bold text-lg leading-tight mb-1 ${fazHoje ? 'text-primary' : 'text-foreground'}`}>
              {nomeFormatado}
            </h3>
            
            <p className="text-sm text-muted-foreground font-mono font-medium mb-4">
              {numeroAluno}
            </p>
            
            <div className={`mt-auto w-full flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              fazHoje 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {fazHoje ? (
                <>
                  <Cake className="w-4 h-4" /> É HOJE
                </>
              ) : (
                `Dia ${String(diaNascimento).padStart(2, '0')}`
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}