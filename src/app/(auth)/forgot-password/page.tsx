import { Button } from "@/components/ui/Button"; 
import { Input } from "@/components/ui/Input";   
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Recuperar Senha
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Digite e-mail cadastrado para enviarmos um link de recuperação.
          </p>
        </div>

        <form className="space-y-4">
          {}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email" type="email" required
              placeholder="Digite seu e-mail"
              className="pl-10" 
            />
          </div>

          <Button type="submit" className="w-full !mt-6 bg-blue-600 text-white hover:bg-blue-700">
            Enviar Link de Recuperação
          </Button>
        </form>

        <div className="text-center">
          <a href="/login" className="text-sm font-medium text-blue-600 hover:underline">
            Voltar para o Login
          </a>
        </div>

      </div>
    </div>
  );
}