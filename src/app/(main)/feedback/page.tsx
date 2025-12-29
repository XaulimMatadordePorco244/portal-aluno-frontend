import { listarAdminsParaDestinatario, listarFeedbacksDoAluno } from '@/app/actions/feedback-actions'
import FormularioFeedback from './formulario-feedback'
import { getCurrentUserWithRelations } from '@/lib/auth' 

export default async function PaginaFeedbackAluno() {
  const user = await getCurrentUserWithRelations()

  if (!user || !user.perfilAluno) {
    return (
        <div className="p-10 text-center text-muted-foreground">
            Apenas alunos matriculados podem enviar feedback.
        </div>
    )
  }

  const alunoId = user.perfilAluno.id 

  const [listaAdmins, historico] = await Promise.all([
    listarAdminsParaDestinatario(),
    listarFeedbacksDoAluno(alunoId)
  ])

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Fale com a Coordenação</h1>
        <p className="text-gray-500 mt-2">Envie mensagens, dúvidas ou denúncias.</p>
      </div>

      <FormularioFeedback 
        admins={listaAdmins} 
        alunoId={alunoId} 
        historicoInicial={historico} 
      />
    </div>
  )
}