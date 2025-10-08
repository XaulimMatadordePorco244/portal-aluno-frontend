import AlunoForm from "./aluno-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewAlunoPage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Adicionar Novo Aluno</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para cadastrar um novo aluno no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlunoForm />
        </CardContent>
      </Card>
    </div>
  );
}