// src/app/(main)/dashboard/page.tsx

import { Button } from "@/components/ui/Button";


const ListItem = ({ title, date }: { title: string; date: string }) => (
  <div className="border-b p-3 hover:bg-gray-50">
    <p className="font-semibold text-gray-800">{title}</p>
    <p className="text-xs text-gray-500">Publicado em: {date}</p>
  </div>
);

export default function DashboardPage() {
  const nomeDoAluno = "Michael"; 

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Mural do Aluno - Bem-vindo, {nomeDoAluno}!
      </h1>
      
      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-lg font-bold text-center text-white bg-gray-600 p-3 rounded-t-lg">
            Informativos
          </h2>
          <div className="flex flex-col">
            <ListItem title="Atualização do Regulamento de Uniformes" date="03/09/2025" />
            <ListItem title="Inscrições para o Desfile de 7 de Setembro" date="01/09/2025" />
            <ListItem title="Alteração de Horário - Aula de Sábado" date="30/08/2025" />
            <Button variant="ghost" className="m-2">Ver todos...</Button>
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-lg font-bold text-center text-white bg-gray-600 p-3 rounded-t-lg">
            Escala
          </h2>
          <div className="flex flex-col">
            <ListItem title="EVENTO: Desfile Cívico" date="07/09/2025 - 08:00h" />
            <ListItem title="AULA: Ordem Unida" date="13/09/2025 - 14:00h" />
            <ListItem title="SERVIÇO: Guarda do Quartel" date="14/09/2025 - 07:00h" />
            <Button variant="ghost" className="m-2">Ver escala completa...</Button>
          </div>
        </div>
        
        {}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-lg font-bold text-center text-white bg-gray-600 p-3 rounded-t-lg">
            Comunicações Internas
          </h2>
          <div className="flex flex-col">
            <ListItem title="CI Nº 12/2025 - Apresentação de Documentos" date="02/09/2025" />
            <ListItem title="CI Nº 11/2025 - Vacinação" date="28/08/2025" />
            <Button variant="ghost" className="m-2">Ver todas...</Button>
          </div>
        </div>

      </div>
    </div>
  );
}