import { Metadata } from "next"

import { InformativoForm } from "./informativo-form"

export const metadata: Metadata = {
  title: "Novo Informativo",
  description: "Crie um novo informativo para os alunos",
}

export default function NovoInformativoPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Novo Informativo</h1>
        <p className="text-muted-foreground">
          Crie um novo informativo para compartilhar com os alunos
        </p>
      </div>

      <InformativoForm />
    </div>
  )
}