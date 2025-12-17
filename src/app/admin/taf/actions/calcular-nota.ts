'use server'

import prisma from '@/lib/prisma'

type TafGenero = 'MASCULINO' | 'FEMININO'
type TafExercicio = 'ABDOMINAL' | 'BARRA' | 'FLEXAO' | 'CORRIDA'

export async function calcularNotaIndividual(
  genero: TafGenero, 
  exercicio: TafExercicio, 
  valor: number
): Promise<number> {

  
  const criterio = await prisma.tafTabela.findFirst({
    where: {
      genero: genero,
      exercicio: exercicio,
      anoLetivo: 2025, 
      AND: [
        { valorMinimo: { lte: valor } }, 
        { valorMaximo: { gte: valor } } 
      ]
    },
    select: {
      nota: true
    }
  })


  if (criterio) {
    return criterio.nota
  }

  return 0
}

export async function calcularMediaTaf(notas: number[]) {
  if (notas.length === 0) return 0
  const soma = notas.reduce((acc, curr) => acc + curr, 0)
  return parseFloat((soma / notas.length).toFixed(2))
}