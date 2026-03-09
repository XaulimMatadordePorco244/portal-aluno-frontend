import { listarFeedbacksAdmin } from '@/app/actions/feedback-actions'
import PainelFeedbackAdmin from './painel-feedback-admin'

export const dynamic = 'force-dynamic';

export default async function PaginaFeedbackAdmin() {
  const feedbacks = await listarFeedbacksAdmin()

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Central de Feedback</h1>
      <PainelFeedbackAdmin feedbacksIniciais={feedbacks} />
    </div>
  )
}