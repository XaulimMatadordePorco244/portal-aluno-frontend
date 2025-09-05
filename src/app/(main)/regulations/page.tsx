// src/app/(main)/regulations/page.tsx

import { Button } from '@/components/ui/Button'; 
import { Download, FileText } from 'lucide-react';


const RegulationItem = ({ title, date }: { title: string; date: string }) => (
 
  <a href="#" className="flex justify-between items-center border-b p-4 hover:bg-gray-100 transition-colors group">
    <div>
      <p className="font-semibold text-gray-800">{title}</p>
      <p className="text-xs text-gray-500">Publicado em: {date}</p>
    </div>
    <Download className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
  </a>
);

export default function RegulationsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto border border-gray-200">
        
        {}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b">
         
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Regulamentos da Guarda Mirim
            </h1>
            <p className="text-md text-gray-500">
              Consulte e baixe os documentos oficiais da instituição.
            </p>
          </div>
        </div>

        {}
        <div className="border rounded-lg overflow-hidden">
          <RegulationItem title="RDGM - Regulamento Disciplinar da Guarda Mirim" date="01/01/2025" />
          <RegulationItem title="Regulamento de Uniformes e Apresentação Pessoal" date="15/02/2025" />
          <RegulationItem title="Normas para Participação em Eventos Externos" date="03/03/2025" />
        </div>

        {}
        <div className="mt-6 flex justify-center">
            <Button variant="ghost">Carregar mais...</Button>
        </div>

      </div>
    </div>
  );
}