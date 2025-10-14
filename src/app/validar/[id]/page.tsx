import { PrismaClient } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import FormattedName from '@/components/FormattedName'; 

const prisma = new PrismaClient();

async function getAlunoPorId(validationId: string) {
  const aluno = await prisma.user.findUnique({
    where: { validationId: validationId },
    select: { 
      nome: true, 
      nomeDeGuerra: true,
      fotoUrl: true, 
      status: true, 
      cargo: true, 
      numero: true 
    }
  });
  return aluno;
}

export default async function PaginaValidacao({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
   const { id } = await params;
  
  const aluno = await getAlunoPorId(id);

  if (!aluno) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <ShieldX className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-800">Inválido</h1>
          <p className="text-gray-600 mt-2">Nenhum registro encontrado para este código.</p>
        </div>
      </div>
    );
  }

  const isAtivo = aluno.status === 'Ativo';

  const initials = aluno.nome.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        
        <div className="flex items-center justify-center mb-4">
          {isAtivo ? <ShieldCheck className="h-8 w-8 text-green-600 mr-2" /> : <ShieldX className="h-8 w-8 text-red-600 mr-2" />}
          <h1 className="text-2xl font-bold text-gray-800">Validação de Identidade</h1>
        </div>
        
        <div className="flex justify-center mb-4">
          <Avatar className="h-40 w-40 border-4 border-gray-200 shadow-md">
            <AvatarImage src={aluno.fotoUrl || ''} alt={`Foto de ${aluno.nome}`} />
            <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            <FormattedName fullName={aluno.nome} warName={aluno.nomeDeGuerra} />
          </h2>
          <p className="text-md text-gray-600">{aluno.cargo?.nome ?? 'Não informado'}</p>

          <p><strong>Cargo:</strong> </p>
          <p className="text-sm text-gray-500 mt-1">Nº: {aluno.numero || 'N/A'}</p>
        </div>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-500 mb-2">Status da Matrícula</p>
          <Badge 
            className={`w-full text-center flex items-center justify-center text-lg py-2 ${
              isAtivo ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'
            }`}
            variant="outline"
          >
            {aluno.status}
          </Badge>
        </div>
        
        <div className="text-center mt-6 text-xs text-gray-400">
            <p>Guarda Mirim de Naviraí - MS</p>
        </div>
      </div>
    </div>
  );
}