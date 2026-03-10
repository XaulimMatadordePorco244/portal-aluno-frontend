import prisma from "@/lib/prisma";
import Carteirinha from "@/components/aluno/Carteirinha";
import { getCurrentUser } from "@/lib/auth"; 
import { redirect } from "next/navigation";

export default async function CarteirinhaPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ALUNO') {
    redirect('/login');
  }

  const aluno = await prisma.usuario.findUnique({
    where: { id: user.userId },
    include: {
      perfilAluno: {
        include: {
          cargo: true 
        }
      }
    }
  });

  if (!aluno || !aluno.perfilAluno) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="p-8 text-center bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <h2 className="font-bold text-lg mb-2">Perfil Incompleto</h2>
            <p>Seu cadastro de aluno ainda não foi totalmente vinculado. Por favor, contate a coordenação.</p>
          </div>
        </div>
    );
  }

  const validadeCarteirinha = new Date();
  validadeCarteirinha.setFullYear(validadeCarteirinha.getFullYear() + 1); 
  validadeCarteirinha.setMonth(11);
  validadeCarteirinha.setDate(31);

  const dadosCarteirinha = {
    nome: aluno.nome,
    nomeDeGuerra: aluno.nomeDeGuerra ?? "ALUNO", 
    fotoUrl: aluno.fotoUrl,
    cpf: aluno.cpf,
    dataNascimento: aluno.dataNascimento ?? new Date(), 
    codigoValidacao: aluno.perfilAluno.id,
    numero: aluno.perfilAluno.numero,
    
    cargo: aluno.perfilAluno.cargo?.nome ?? "ALUNO",          
    cargoTipo: aluno.perfilAluno.cargo?.tipo ?? "GRADUACAO", 
    
    validade: validadeCarteirinha,
  };

  return (
    <div >
      <Carteirinha aluno={dadosCarteirinha} />
    </div>
  );
}