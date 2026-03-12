import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditAlunoForm from "./edit-aluno-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAlunoPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const [alunoRaw, cargosData, companhiasData, escolasData] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id },
      include: { 
        perfilAluno: {
          include: {
            companhia: true,
            cargo: true,
            escola: true 
          }
        },
        responsaveis: {
          include: {
            responsavel: true
          }
        }
      },
    }),
    prisma.cargo.findMany({
      orderBy: { precedencia: 'asc' }
    }),
    prisma.companhia.findMany({
      orderBy: { nome: 'asc' }
    }),
    prisma.escola.findMany({
      orderBy: { nome: 'asc' }
    })
  ]);

  if (!alunoRaw) {
    notFound();
  }

  const relacaoResponsavel = alunoRaw.responsaveis?.[0];
  const dadosResponsavel = relacaoResponsavel?.responsavel;

  const alunoMapeado = {
    id: alunoRaw.id,
    nome: alunoRaw.nome,
    nomeDeGuerra: alunoRaw.nomeDeGuerra,
    cpf: alunoRaw.cpf,
    email: alunoRaw.email,
    telefone: alunoRaw.telefone,
    rg: alunoRaw.rg,
    rgEstadoEmissor: alunoRaw.rgEstadoEmissor,
    fotoUrl: alunoRaw.fotoUrl,
    dataNascimento: alunoRaw.dataNascimento,
    genero: alunoRaw.genero as 'MASCULINO' | 'FEMININO' | null,
    
    perfilAluno: alunoRaw.perfilAluno ? {
      numero: alunoRaw.perfilAluno.numero,
      cargoId: alunoRaw.perfilAluno.cargoId,
      companhiaId: alunoRaw.perfilAluno.companhiaId,
      foraDeData: alunoRaw.perfilAluno.foraDeData,
      tipagemSanguinea: alunoRaw.perfilAluno.tipagemSanguinea,
      aptidaoFisicaStatus: alunoRaw.perfilAluno.aptidaoFisicaStatus,
      aptidaoFisicaLaudo: alunoRaw.perfilAluno.aptidaoFisicaLaudo,
      aptidaoFisicaObs: alunoRaw.perfilAluno.aptidaoFisicaObs,
      endereco: alunoRaw.perfilAluno.endereco,
      escolaId: alunoRaw.perfilAluno.escolaId,
      serieEscolar: alunoRaw.perfilAluno.serieEscolar,
      turno: alunoRaw.perfilAluno.turno,
      turmaEscolar: alunoRaw.perfilAluno.turmaEscolar,
      fazCursoExterno: alunoRaw.perfilAluno.fazCursoExterno,
      cursoExternoDescricao: alunoRaw.perfilAluno.cursoExternoDescricao,
      termoResponsabilidadeAssinado: alunoRaw.perfilAluno.termoResponsabilidadeAssinado,
 
      responsavelNome: dadosResponsavel?.nome || null,
      responsavelCpf: dadosResponsavel?.cpf || null,
      responsavelParentesco: relacaoResponsavel?.tipoParentesco || null,
      responsavelTelefone: dadosResponsavel?.telefone || null,
      responsavelEmail: dadosResponsavel?.email || null,
    } : null
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Editar Aluno</CardTitle>
          <CardDescription>
            Altere os dados de {alunoMapeado.nomeDeGuerra || alunoMapeado.nome}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditAlunoForm 
            aluno={alunoMapeado}
            cargos={cargosData} 
            companhias={companhiasData} 
            escolas={escolasData} 
          />
        </CardContent>
      </Card>
    </div>
  );
}