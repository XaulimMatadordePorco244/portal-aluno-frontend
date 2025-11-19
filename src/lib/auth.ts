import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface UserPayload {
  userId: string;
  nome: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não definida");
      return null;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as UserPayload;
    return decoded;
  } catch {
    return null;
  }
}

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
  return user.role === 'ADMIN';
}
