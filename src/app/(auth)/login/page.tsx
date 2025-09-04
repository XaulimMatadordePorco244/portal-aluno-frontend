import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileText, Lock, Eye } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <img className="block mx-auto h-25 w-25 mh" src="/logo.png" />
                <div className="text-center">

                    <h1 className="text-2xl font-bold text-black">
                        Mural - Guarda Mirim
                    </h1>
                </div>

                <form className="space-y-4">
                    { }
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500  " />
                        <Input
                            id="cpf" type="text" required
                            placeholder="000.000.000-00"
                            className="pl-10 "
                        />

                    </div>

                    { }
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <Input
                            id="password" type="password" required
                            placeholder="Password"
                            className="pl-10 pr-10"
                        />
                        <Eye className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5  cursor-pointer text-gray-500" />
                    </div>

                    <Button type="submit" className="w-full !mt-6">
                        Entrar
                    </Button>
                </form>

                <div className="text-center">
                    <a href="/forgot-password" className="text-sm font-medium  hover:underline">
                        Esqueceu a Senha?
                    </a>
                </div>

            </div>
        </div>
    );
}