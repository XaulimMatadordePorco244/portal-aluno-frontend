import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); 


interface UserPayload {
  userId: string;
  nome: string;
  role: string;
  nomeDeGuerra?: string | null; 
  cargo?: string | null; 
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não está definida.");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    console.error("Falha ao verificar o token:", error);
    return null;
  }
}


import { Prisma } from '@prisma/client';


const userWithRelationsQuery = Prisma.validator<Prisma.UsuarioDefaultArgs>()({
  include: {
    perfilAluno: {
      include: {
        funcao: true,
        cargo: true,
        companhia: true,
      },
    },
  },
});


export type UserWithRelations = Prisma.UsuarioGetPayload<typeof userWithRelationsQuery>;


export async function getCurrentUserWithRelations(): Promise<UserWithRelations | null> {
  const sessionUser = await getCurrentUser();
  
  if (!sessionUser?.userId) {
    return null;
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: {
        id: sessionUser.userId,
      },
       include: userWithRelationsQuery.include, 
    });

    return user;
  } catch (error) {
    console.error("Erro ao buscar dados completos do usuário:", error);
    return null;
  }
}

export function canAccessAdminArea(user: UserWithRelations | null): boolean {
  if (!user) {
    return false;
  }


  if (user.role === 'ADMIN') {
    return true;
  }


  if (user.perfilAluno?.funcao?.nome === 'Comandante Geral') {
    return true;
  }

  return false;
}