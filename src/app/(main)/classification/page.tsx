import { BarChart3, CalendarDays } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FormattedName from "@/components/FormattedName";


type AlunoComRank = Awaited<ReturnType<typeof getAlunos>>[0] & {
    rank: number;
};


const CourseRanking = ({ courseName, students, loggedInUserId }: { courseName: string, students: AlunoComRank[], loggedInUserId?: string }) => {
 
  if (students.length === 0) {
    return null; 
  }

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-foreground mb-3">{courseName}</h2>
      <div className="bg-card rounded-xl shadow-lg border overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center border-r">Posição</TableHead>
              <TableHead className="border-r">Nome de Guerra</TableHead>
              <TableHead className="w-[150px] border-r">Nº</TableHead>
              <TableHead className="w-[200px]">Conceito</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((aluno) => {
              const isCurrentUser = aluno.id === loggedInUserId;
              return (
                <TableRow 
                  key={aluno.id} 
                  className={isCurrentUser ? "bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30" : ""}
                >
                  <TableCell className="font-bold text-lg text-center border-r">{aluno.rank}º</TableCell>
                  <TableCell className="font-medium border-r">
                    <FormattedName fullName={aluno.nome} warName={aluno.nomeDeGuerra} />
                  </TableCell>
                  <TableCell className="font-mono border-r">{aluno.numero || 'N/A'}</TableCell>
                  <TableCell>{isCurrentUser ? aluno.conceito : '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};


async function getAlunos() {
    return await prisma.usuario.findMany({
        where: {
            status: 'ATIVO',
            role: 'ALUNO',
            cargoId: { not: null } 
        },
        include: {
            cargo: true, 
        },
    });
}

export default async function ClassificationPage() {
  const [currentUser, allAlunos] = await Promise.all([
    getCurrentUser(),
    getAlunos()
  ]);
  
 
  const groupedByCargo = allAlunos.reduce((acc, aluno) => {
    const cargoNome = aluno.cargo?.nome || 'Sem Cargo';
    if (!acc[cargoNome]) {
      acc[cargoNome] = [];
    }
    acc[cargoNome].push(aluno);
    return acc;
  }, {} as Record<string, typeof allAlunos>);

 
  const rankedCourses = Object.entries(groupedByCargo)
    .sort(([, alunosA], [, alunosB]) => {
      const precedenciaA = alunosA[0].cargo?.precedencia || 999;
      const precedenciaB = alunosB[0].cargo?.precedencia || 999;
      return precedenciaA - precedenciaB; 
    })
    .map(([cargo, alunos]) => {
      
      const rankedAlunos = alunos
        .sort((a, b) => parseFloat(b.conceito || '0') - parseFloat(a.conceito || '0'))
        .map((aluno, index) => ({
          ...aluno,
          rank: index + 1,
        }));
      
      return { name: cargo, data: rankedAlunos };
    });

  const dataAtualizacao = new Date().toLocaleDateString('pt-BR');
  const loggedInUserId = currentUser?.userId; 

  return (
      <div className="container mx-auto py-10 max-w-5xl">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-foreground" />
                  <h1 className="text-3xl font-bold text-foreground">Classificação Geral</h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded-lg">
                  <CalendarDays className="h-4 w-4" />
                  <span>Última atualização: {dataAtualizacao}</span>
              </div>
          </div>
          
          {rankedCourses.map(course => (
              <CourseRanking 
                key={course.name} 
                courseName={course.name} 
                students={course.data}
                loggedInUserId={loggedInUserId}
              />
          ))}

          {rankedCourses.length === 0 && (
            <div className="bg-card rounded-xl shadow-lg border p-10 text-center text-muted-foreground">
              <p>Nenhum aluno ativo encontrado para exibir a classificação.</p>
            </div>
          )}
      </div>
  );
}