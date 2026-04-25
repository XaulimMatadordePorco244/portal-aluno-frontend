import { Prisma } from '@prisma/client'

export const ORDEM_ANTIGUIDADE: Prisma.PerfilAlunoOrderByWithRelationInput[] = [
  { cargo: { precedencia: 'asc' } },
  { dataUltimaPromocao: 'asc' },
  { notaDesempatePromocao: 'desc' },
  { usuario: { dataNascimento: 'asc' } }
];