"use client";

import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChartProps {
  data: {
    data: string;
    ocorrencias: number;
    faltas: number;
  }[];
}

export function HistoricoSemanalChart({ data }: ChartProps) {
  // Formata a data de 'YYYY-MM-DD' para 'qui', 'sex', etc.
  const formattedData = data.map(item => ({
    ...item,
    dia: format(parseISO(item.data), "EEE", { locale: ptBR }).toUpperCase()
  }));

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis dataKey="dia" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <RechartsTooltip 
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="ocorrencias" name="Ocorrências" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="faltas" name="Faltas" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}