import prisma from "@/lib/prisma";
import { Cake, Sparkles } from "lucide-react";
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
  const diaDeHoje = hoje.getUTCDate();
  const mesDeHoje = hoje.getUTCMonth();

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
        const fazHoje = user.dataNascimento!.getUTCDate() === diaDeHoje && mesSelecionado === mesDeHoje;
        
        const nomeFormatado = user.perfilAluno 
          ? `${user.perfilAluno.cargo?.abreviacao || ''} GM ${user.nomeDeGuerra}`
          : user.nome.split(" ")[0];

        const numeroAluno = user.perfilAluno?.numero 
          ? `Nº ${user.perfilAluno.numero}` 
          : "Equipe GM";

        return (
          <div 
            key={user.id} 
            className={`relative top-0 rounded-2xl border ${
              fazHoje 
                ? 'border-primary shadow-lg shadow-primary/20 bg-card hover:-top-1 hover:shadow-xl hover:shadow-primary/30' 
                : 'border-border/60 bg-card hover:border-border hover:-top-1 hover:shadow-lg'
            } p-6 flex flex-col items-center text-center transition-all duration-300`}
          >
            {fazHoje && (
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-orange-400 via-pink-500 to-primary rounded-t-2xl" />
            )}
            
            <div className={`mb-4 rounded-full p-1 transition-colors ${fazHoje ? 'bg-primary/20' : 'bg-transparent'}`}>
              <FotoHover 
                src={user.fotoUrl} 
                alt={user.nome}
                size={96} 
                className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-background shadow-md" 
              />
            </div>
            
            <h3 className="font-bold text-lg leading-tight mb-1 text-foreground">
              {nomeFormatado}
              {fazHoje && <Sparkles className="inline-block ml-1 h-4 w-4 text-yellow-500 animate-pulse" />}
            </h3>
            
            <p className="text-sm text-muted-foreground font-mono font-medium mb-4">
              {numeroAluno}
            </p>
            
            <div className={`mt-auto w-full py-2 rounded-lg text-sm font-bold transition-colors ${
              fazHoje 
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {fazHoje ? "É HOJE!" : `Dia ${user.dataNascimento!.getUTCDate()}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}