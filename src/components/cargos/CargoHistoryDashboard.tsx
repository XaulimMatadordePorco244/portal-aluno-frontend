"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronDown, 
  ChevronUp, 
} from 'lucide-react';
import { Card } from "@/components/ui/card";

interface Anotacao {
  id: string;
  data: Date | string;
  pontos: number | null;
  detalhes?: string | null;
  tipo: {
    nome: string;
  };
}

interface StatItem {
  count: number;
  points: number;
}

interface Balanco {
  elogios: StatItem;
  punicoes: StatItem;
  foPos: StatItem;
  foNeg: StatItem;
  conceitoFinal: string;
  conceitoInicial: string;
}

interface HistoricoItem {
  id: string;
  dataInicio: Date | string;
  dataFim: Date | string | null;
  cargo: {
    nome: string;
    abreviacao: string;
  };
  balanco: Balanco;
  anotacoes: Anotacao[];
}

export default function CargoHistoryDashboard({ historico }: { historico: HistoricoItem[] }) {
  return (
    <div className="space-y-6">
      {historico.map((fase) => (
        <CargoCard key={fase.id} fase={fase} />
      ))}
    </div>
  );
}

function CargoCard({ fase }: { fase: HistoricoItem }) {
  const [isOpen, setIsOpen] = useState(false);

  const inicio = format(new Date(fase.dataInicio), "MMM/yyyy", { locale: ptBR });
  const fim = fase.dataFim ? format(new Date(fase.dataFim), "MMM/yyyy", { locale: ptBR }) : "Atual";
  
  const conceitoNum = parseFloat(fase.balanco.conceitoFinal);
  const corConceito = conceitoNum >= 9 ? "text-blue-600" : conceitoNum >= 7 ? "text-green-600" : "text-red-600";

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary/20">
      <div 
        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
                  <div>
            <h3 className="font-semibold text-base">{fase.cargo.nome}</h3>
            <p className="text-xs text-muted-foreground capitalize">{inicio} - {fim}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="text-right hidden sm:block">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Conceito Final</span>
              <div className={`text-xl font-bold ${corConceito}`}>{fase.balanco.conceitoFinal}</div>
           </div>
           <button className="p-2 rounded-full hover:bg-muted text-muted-foreground">
             {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
           </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 pt-0 border-t bg-muted/5 animate-in slide-in-from-top-1 duration-200">
          
          <div className="mt-4 mb-6">
            <h4 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Balanço do Período
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatMiniCard label="Elogios" data={fase.balanco.elogios} />
              <StatMiniCard label="FO Positivos" data={fase.balanco.foPos} />
              <StatMiniCard label="FO Negativos" data={fase.balanco.foNeg} />
              <StatMiniCard label="Punições" data={fase.balanco.punicoes} />
            </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
               Histórico de Registros
             </h4>

             {fase.anotacoes && fase.anotacoes.length > 0 ? (
               <div className="space-y-2">
                 {fase.anotacoes.map((anotacao) => (
                   <div key={anotacao.id} className="flex gap-3 text-sm p-3 rounded border bg-background/50 hover:bg-background transition-colors">
                     <div className={`mt-0.5 font-bold min-w-10 ${(anotacao.pontos ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(anotacao.pontos ?? 0) > 0 ? '+' : ''}{anotacao.pontos}
                     </div>
                     
                     <div className="flex-1 space-y-1">
                       <div className="flex justify-between items-baseline">
                         <span className="font-medium text-foreground">{anotacao.tipo.nome}</span>
                         <span className="text-[10px] text-muted-foreground">
                           {format(new Date(anotacao.data), "dd/MM/yy")}
                         </span>
                       </div>
                       
                       <p className="text-muted-foreground text-xs leading-relaxed">
                         {anotacao.detalhes || "Sem descrição."}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-xs text-muted-foreground italic py-2">Nenhum registro nesta fase.</p>
             )}
          </div>

        </div>
      )}
    </Card>
  );
}

function StatMiniCard({ label, data }: { label: string, data: StatItem }) {
  const pontosFormatados = data.points > 0 ? `+${data.points.toFixed(2)}` : `${data.points.toFixed(2)}`;
  
  const corTexto = data.points > 0 ? 'text-green-600' : data.points < 0 ? 'text-red-600' : 'text-muted-foreground';

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded border bg-card/40">
      <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{label}</span>
      
      <span className={`text-xl font-bold ${corTexto}`}>
        {pontosFormatados}
      </span>
      
      <span className="text-[10px] text-muted-foreground mt-1">
        {data.count} {data.count === 1 ? 'reg.' : 'regs.'}
      </span>
    </div>
  );
}