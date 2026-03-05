import { getTodosAlunos, getEscolas } from "./actions"
import { ClientTable } from "./ClientTable"
import { GraduationCap } from "lucide-react"


export default async function DadosEscolaresPage() {
  const anoAtual = new Date().getFullYear() 
  
  const alunos = await getTodosAlunos('nome')
  const escolas = await getEscolas()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Gestão Escolar  - {anoAtual}
        </h1>
        <p className="text-muted-foreground">
          Atualize as informações escolares dos alunos. Linhas destacadas indicam dados de anos anteriores.
        </p>
      </div>

      <ClientTable 
        alunosIniciais={alunos} 
        escolasIniciais={escolas} 
        anoAtual={anoAtual} 
      />
    </div>
  )
}